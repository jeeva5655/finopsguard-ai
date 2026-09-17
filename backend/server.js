/**
 * FinOpsGuard AI Backend Server
 * Node.js / Express Server with SSE agent streaming, Cedar Policy Engine, and FinOps Copilot
 */

import express from "express";
import cors from "cors";
import { FinOpsMultiAgentHarness } from "./agents.js";
import { CedarPolicyEngine, DEFAULT_CEDAR_POLICIES } from "./cedarEngine.js";
import { INITIAL_CLOUD_ESTATE } from "./mockCloudData.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Global state
let activeEstate = JSON.parse(JSON.stringify(INITIAL_CLOUD_ESTATE));
const cedarEngine = new CedarPolicyEngine(DEFAULT_CEDAR_POLICIES);
const agentHarness = new FinOpsMultiAgentHarness();

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "FinOpsGuard AI Multi-Agent API",
    version: "1.0.0",
    cloudProvider: "AWS",
    activeAgents: 5,
    cedarEngineActive: true,
    timestamp: new Date().toISOString()
  });
});

// 2. Cloud Estate & Telemetry
app.get("/api/estate", (req, res) => {
  res.json(activeEstate);
});

// 3. Cedar Policies
app.get("/api/cedar/policies", (req, res) => {
  res.json(cedarEngine.getPolicies());
});

// 4. Custom Cedar Evaluation
app.post("/api/cedar/evaluate", (req, res) => {
  const { principal, action, resource, context } = req.body;
  
  if (!action || !resource) {
    return res.status(400).json({ error: "Missing required fields: action, resource" });
  }

  const result = cedarEngine.evaluate({
    principal: principal || "FinOpsGuard::Agent::RemediationSynthesizer",
    action,
    resource,
    context: context || {}
  });

  res.json(result);
});

// 5. Real-time Multi-Agent SSE Execution Stream
app.get("/api/agents/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (eventType, data) => {
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("connected", { message: "Connected to FinOpsGuard Multi-Agent Engine" });

  try {
    const harness = new FinOpsMultiAgentHarness();
    const result = await harness.runMultiAgentLoop(sendEvent);
    sendEvent("finished", result);
  } catch (err) {
    sendEvent("error", { error: err.message });
  } finally {
    res.end();
  }
});

// 6. Apply Approved Remediation (Simulate Execution & Update Cloud State)
app.post("/api/remediate", (req, res) => {
  const { resourceId } = req.body;
  const resource = activeEstate.resources.find(r => r.id === resourceId);

  if (!resource) {
    return res.status(404).json({ error: "Resource not found" });
  }

  // Check Cedar authorization before allowing remediation side-effect!
  const evalResult = cedarEngine.evaluate({
    principal: "FinOpsGuard::Agent::RemediationSynthesizer",
    action: resource.proposedAction,
    resource,
    context: { hourOfDay: 14, backupCreated: true }
  });

  if (!evalResult.allowed) {
    return res.status(403).json({
      error: "Cedar Zero-Trust Policy Blocked This Action",
      decision: evalResult.decision,
      rationale: evalResult.rationale
    });
  }

  // Update estate state
  resource.status = "optimized";
  const savedAmount = resource.monthlySavings;
  activeEstate.account.currentMonthlyRunRate -= savedAmount;
  activeEstate.account.detectedMonthlyWaste -= savedAmount;
  activeEstate.account.potentialAnnualSavings -= (savedAmount * 12);
  activeEstate.account.efficiencyScore = Math.min(98, activeEstate.account.efficiencyScore + 6);

  res.json({
    success: true,
    message: `Successfully remediated ${resource.name}! Saved $${savedAmount.toLocaleString()}/month.`,
    updatedResource: resource,
    newEfficiencyScore: activeEstate.account.efficiencyScore,
    currentMonthlyRunRate: activeEstate.account.currentMonthlyRunRate
  });
});

// 7. Reset Estate to Default
app.post("/api/estate/reset", (req, res) => {
  activeEstate = JSON.parse(JSON.stringify(INITIAL_CLOUD_ESTATE));
  res.json({ success: true, message: "Cloud estate reset to initial test baseline", estate: activeEstate });
});

// 8. FinOps Copilot (Interactive AI Assistance powered by Bedrock Prompting Architecture)
app.post("/api/copilot/chat", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const query = message.toLowerCase();
  let reply = "";
  let actions = [];

  if (query.includes("gpu") || query.includes("p4d") || query.includes("ai")) {
    reply = `Based on current CloudWatch metrics, your **ml-training-cluster-gpu-p4d** (8x NVIDIA A100 GPUs) in us-east-1 is running at only 4.1% average utilization, generating **$18,875/month in wasted spend**. \n\nI recommend switching to AWS Trainium (trn1.2xlarge) or configuring an Auto Scaling Group with scale-to-zero Spot instances. Because this instance is tagged 'Development', our Cedar Policy Guard permits immediate automated remediation!`;
    actions = ["Run Cedar Policy Check on GPU", "Generate Spot ASG Terraform", "Stop Idle Instance"];
  } else if (query.includes("ebs") || query.includes("volume") || query.includes("storage")) {
    reply = `I discovered **vol-0a38d72e659b8c104** (4,000 GB gp2) that has been unattached for 28 days in us-east-1, costing $480/month. \n\nUnder Cedar Policy **'policy-04-ebs-orphan-cleanup'**, we can automatically take a final safety recovery snapshot and purge the volume to reclaim $5,760/year immediately.`;
    actions = ["Snapshot & Purge Volume", "Convert all remaining gp2 to gp3"];
  } else if (query.includes("cedar") || query.includes("policy") || query.includes("zero trust")) {
    reply = `FinOpsGuard uses AWS's open-source **Cedar Policy Engine** to enforce formal Zero-Trust boundaries. For instance, even if an AI agent recommends downsizing **aurora-pg-prod-core**, Cedar explicitly blocks it because **policy-01** and **policy-02** forbid autonomous modifications to Production tier databases during business hours without CAB approval.`;
    actions = ["Open Cedar Policy Playground", "View Production Guardrails"];
  } else if (query.includes("s3") || query.includes("lake") || query.includes("tiering")) {
    reply = `Your **enterprise-datalake-raw-archive** contains 165 TB of uncompressed data with zero lifecycle rules, running at $3,795/month. By enabling **S3 Intelligent-Tiering** with Deep Archive transition at 90 days, you will save **$2,277/month ($27,324/year)** with zero application code changes.`;
    actions = ["Apply S3 Intelligent-Tiering HCL", "Analyze Bucket Access Patterns"];
  } else if (query.includes("total") || query.includes("save") || query.includes("savings")) {
    reply = `Across your AWS estate, FinOpsGuard detected **$18,450/month ($221,400/year)** in unoptimized spend. \n- **$15,180/mo** is immediately actionable on Dev/Staging without human approval.\n- **$3,270/mo** requires human CAB approval due to Production Cedar guardrails.`;
    actions = ["Run Full 5-Agent Scan", "Download Executive Briefing"];
  } else {
    reply = `I am your **FinOpsGuard AI Copilot**, continuously analyzing your AWS infrastructure against FinOps Foundation best practices and AWS Well-Architected Cost Optimization Pillars. You can ask me about GPU waste, unattached EBS storage, S3 tiering, Cedar Zero-Trust policies, or Graviton migrations.`;
    actions = ["Analyze GPU Waste", "Check EBS Volumes", "Inspect Cedar Policies"];
  }

  res.json({
    reply,
    suggestedActions: actions,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[FinOpsGuard API] Server running on http://localhost:${PORT}`);
});
