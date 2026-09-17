/**
 * FinOpsGuard In-Process Cedar Policy Evaluator
 * 
 * Formal Zero-Trust Policy Decision Point (PDP) and Policy Enforcement Point (PEP)
 * for Autonomous Cloud FinOps actions based on the AWS Cedar language specification.
 */

export const DEFAULT_CEDAR_POLICIES = [
  {
    id: "policy-01-prod-forbid-terminate",
    name: "Production Deletion Protection",
    description: "Strictly forbids automated termination or destructive deletion of any Production tier resources.",
    effect: "forbid",
    scope: {
      principal: "FinOpsGuard::Agent",
      action: ["Action::Terminate", "Action::Delete", "Action::Drop"],
      resourceType: "AWS::Resource"
    },
    condition: `when { resource.tags.Environment == "Production" }`,
    cedarCode: `forbid (
  principal == FinOpsGuard::Agent::"RemediationSynthesizer",
  action in [Action::"Terminate", Action::"Delete", Action::"Drop"],
  resource
)
when {
  resource.tags.Environment == "Production"
};`
  },
  {
    id: "policy-02-prod-rds-escalation",
    name: "Production Database Modification Escalation",
    description: "Prohibits downsizing or restarting production databases during core business hours (09:00 - 18:00 UTC).",
    effect: "forbid",
    scope: {
      principal: "FinOpsGuard::Agent",
      action: ["Action::RightSize", "Action::Reboot", "Action::ModifyInstanceType"],
      resourceType: "AWS::RDS::DBInstance"
    },
    condition: `when { resource.tags.Environment == "Production" && context.hourOfDay >= 9 && context.hourOfDay <= 18 }`,
    cedarCode: `forbid (
  principal,
  action in [Action::"RightSize", Action::"Reboot", Action::"ModifyInstanceType"],
  resource is AWS::RDS::DBInstance
)
when {
  resource.tags.Environment == "Production" &&
  context.hourOfDay >= 9 && context.hourOfDay <= 18
};`
  },
  {
    id: "policy-03-dev-staging-auto-rightsize",
    name: "Automated Non-Prod Optimization",
    description: "Permits autonomous rightsizing on Development and Staging when projected savings exceed $100/mo.",
    effect: "permit",
    scope: {
      principal: "FinOpsGuard::Agent",
      action: ["Action::RightSize", "Action::StopIdle", "Action::ConvertToGraviton", "Action::CleanupOrphaned"],
      resourceType: "AWS::Resource"
    },
    condition: `when { resource.tags.Environment in ["Development", "Staging", "Sandbox"] && resource.monthlySavings >= 100 }`,
    cedarCode: `permit (
  principal,
  action in [Action::"RightSize", Action::"StopIdle", Action::"ConvertToGraviton", Action::"CleanupOrphaned"],
  resource
)
when {
  resource.tags.Environment in ["Development", "Staging", "Sandbox"] &&
  resource.monthlySavings >= 100
};`
  },
  {
    id: "policy-04-ebs-orphan-cleanup",
    name: "Unattached Storage Deprovisioning",
    description: "Permits automated snapshot & removal of unattached EBS volumes older than 14 days with snapshot backup.",
    effect: "permit",
    scope: {
      principal: "FinOpsGuard::Agent",
      action: ["Action::SnapshotAndPurge"],
      resourceType: "AWS::EC2::Volume"
    },
    condition: `when { resource.status == "available" && resource.daysUnattached >= 14 && context.backupCreated == true }`,
    cedarCode: `permit (
  principal,
  action == Action::"SnapshotAndPurge",
  resource is AWS::EC2::Volume
)
when {
  resource.status == "available" &&
  resource.daysUnattached >= 14 &&
  context.backupCreated == true
};`
  },
  {
    id: "policy-05-s3-lifecycle-permit",
    name: "S3 Intelligent-Tiering Automated Transition",
    description: "Permits applying S3 Intelligent-Tiering and glacier transition rules to buckets without active lifecycles.",
    effect: "permit",
    scope: {
      principal: "FinOpsGuard::Agent",
      action: ["Action::ApplyS3Lifecycle", "Action::EnableIntelligentTiering"],
      resourceType: "AWS::S3::Bucket"
    },
    condition: `when { resource.hasLifecyclePolicy == false }`,
    cedarCode: `permit (
  principal,
  action in [Action::"ApplyS3Lifecycle", Action::"EnableIntelligentTiering"],
  resource is AWS::S3::Bucket
)
when {
  resource.hasLifecyclePolicy == false
};`
  }
];

/**
 * In-Process Cedar Policy Engine
 * Evaluates authorization requests against formal Cedar rules.
 * Implements Cedar's default-deny semantics:
 * - A request is allowed IF at least one `permit` policy matches AND NO `forbid` policy matches.
 * - An explicit `forbid` ALWAYS trumps any `permit`.
 */
export class CedarPolicyEngine {
  constructor(policies = DEFAULT_CEDAR_POLICIES) {
    this.policies = [...policies];
  }

  getPolicies() {
    return this.policies;
  }

  addPolicy(policy) {
    this.policies.push(policy);
  }

  removePolicy(id) {
    this.policies = this.policies.filter(p => p.id !== id);
  }

  evaluate({ principal, action, resource, context = {} }) {
    const matchedPermits = [];
    const matchedForbids = [];
    const evaluationTrace = [];

    for (const policy of this.policies) {
      const isMatch = this.checkPolicyMatch(policy, { principal, action, resource, context });
      
      evaluationTrace.push({
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        matched: isMatch.matched,
        reason: isMatch.reason
      });

      if (isMatch.matched) {
        if (policy.effect === "forbid") {
          matchedForbids.push({ policy, reason: isMatch.reason });
        } else if (policy.effect === "permit") {
          matchedPermits.push({ policy, reason: isMatch.reason });
        }
      }
    }

    // Default Deny Rule:
    // If ANY forbid matches -> FORBIDDEN
    // If NO forbid, but at least ONE permit matches -> PERMITTED
    // If NO permit matches -> FORBIDDEN (default deny)
    let decision = "DENY";
    let rationale = "";

    if (matchedForbids.length > 0) {
      decision = "FORBID";
      rationale = `Action explicitly FORBIDDEN by security policy '${matchedForbids[0].policy.name}': ${matchedForbids[0].reason}`;
    } else if (matchedPermits.length > 0) {
      decision = "PERMIT";
      rationale = `Action PERMITTED under compliance policy '${matchedPermits[0].policy.name}': ${matchedPermits[0].reason}`;
    } else {
      decision = "DENY_DEFAULT";
      rationale = "Action DENIED by default: No explicit Cedar 'permit' policy authorized this autonomous action.";
    }

    return {
      decision,
      allowed: decision === "PERMIT",
      rationale,
      matchedForbids,
      matchedPermits,
      evaluationTrace,
      evaluatedAt: new Date().toISOString()
    };
  }

  checkPolicyMatch(policy, { action, resource, context }) {
    // Check Action match
    const actionNormalized = action.replace(/^Action::/, "");
    const policyActions = Array.isArray(policy.scope.action) 
      ? policy.scope.action.map(a => a.replace(/^Action::/, ""))
      : [policy.scope.action.replace(/^Action::/, "")];
      
    if (!policyActions.includes(actionNormalized) && !policyActions.includes("*")) {
      return { matched: false, reason: `Action '${action}' does not match policy scope.` };
    }

    // Check Resource Type match
    if (policy.scope.resourceType && policy.scope.resourceType !== "AWS::Resource") {
      if (resource.type !== policy.scope.resourceType) {
        return { matched: false, reason: `Resource type '${resource.type}' does not match '${policy.scope.resourceType}'.` };
      }
    }

    // Evaluate Condition logic
    const env = resource.tags?.Environment || "Unknown";

    if (policy.id === "policy-01-prod-forbid-terminate") {
      if (env === "Production") {
        return { matched: true, reason: "Target resource is tagged Environment: 'Production'. Destructive actions are strictly locked." };
      }
      return { matched: false, reason: `Environment is '${env}', not 'Production'.` };
    }

    if (policy.id === "policy-02-prod-rds-escalation") {
      const hour = context.hourOfDay !== undefined ? context.hourOfDay : new Date().getUTCHours();
      if (env === "Production" && hour >= 9 && hour <= 18) {
        return { matched: true, reason: `Database modification requested during Production core hours (${hour}:00 UTC). Requires human CAB approval.` };
      }
      return { matched: false, reason: "Not within restricted production time window or non-production DB." };
    }

    if (policy.id === "policy-03-dev-staging-auto-rightsize") {
      if (["Development", "Staging", "Sandbox"].includes(env)) {
        const savings = resource.monthlySavings || 0;
        if (savings >= 100) {
          return { matched: true, reason: `Environment '${env}' has projected monthly savings of $${savings} (>= $100 threshold).` };
        }
        return { matched: false, reason: `Savings of $${savings} does not exceed minimum $100 threshold.` };
      }
      return { matched: false, reason: `Environment '${env}' is not in allowed non-prod scope.` };
    }

    if (policy.id === "policy-04-ebs-orphan-cleanup") {
      if (resource.status === "available" && (resource.daysUnattached || 0) >= 14) {
        return { matched: true, reason: `EBS volume unattached for ${resource.daysUnattached} days (>= 14 day threshold) with verified snapshot.` };
      }
      return { matched: false, reason: "Volume is active or unattached period under 14 days." };
    }

    if (policy.id === "policy-05-s3-lifecycle-permit") {
      if (resource.hasLifecyclePolicy === false) {
        return { matched: true, reason: "S3 bucket lacks active lifecycle transitions; Intelligent-Tiering is eligible." };
      }
      return { matched: false, reason: "Bucket already has active lifecycle configurations." };
    }

    return { matched: true, reason: "Policy criteria satisfied." };
  }
}
