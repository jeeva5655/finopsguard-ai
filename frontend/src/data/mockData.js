/**
 * Client-Side Fallback Data for Static Deployment (AWS Amplify / Vercel)
 * Allows FinOpsGuard AI to run 100% interactively without requiring a live backend server.
 */

export const INITIAL_CLOUD_ESTATE = {
  account: {
    id: "948172635412",
    name: "Enterprise-Core-Production",
    regions: ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"],
    currency: "USD",
    currentMonthlyRunRate: 48920.00,
    detectedMonthlyWaste: 18450.00,
    potentialAnnualSavings: 221400.00,
    carbonFootprintMetric: "4.8 Tons CO2e/mo",
    efficiencyScore: 62
  },
  costBreakdownByService: [
    { service: "Amazon EC2 & GPU (Inferentia/A100)", monthlySpend: 26400, waste: 11200, percentage: 53.9 },
    { service: "Amazon RDS & Aurora", monthlySpend: 9800, waste: 3100, percentage: 20.0 },
    { service: "Amazon S3 Storage", monthlySpend: 4600, waste: 1850, percentage: 9.4 },
    { service: "Amazon EBS Volumes & Snapshots", monthlySpend: 3200, waste: 1250, percentage: 6.5 },
    { service: "VPC NAT Gateways & Data Transfer", monthlySpend: 2850, waste: 900, percentage: 5.8 },
    { service: "AWS Lambda & Serverless Compute", monthlySpend: 1200, waste: 150, percentage: 2.5 },
    { service: "Amazon DynamoDB", monthlySpend: 870, waste: 0, percentage: 1.8 }
  ],
  costTrendLast7Days: [
    { day: "Day -6", spend: 1580, benchmark: 1050 },
    { day: "Day -5", spend: 1610, benchmark: 1050 },
    { day: "Day -4", spend: 1720, benchmark: 1050 },
    { day: "Day -3", spend: 1890, benchmark: 1050 },
    { day: "Day -2", spend: 1640, benchmark: 1050 },
    { day: "Yesterday", spend: 1710, benchmark: 1050 },
    { day: "Today (Projected)", spend: 1630, benchmark: 1050 }
  ],
  monthlyHistoricalTrend: [
    { month: "Apr 2026", grossSpend: 42100, detectedWaste: 14200, optimizedBaseline: 27900 },
    { month: "May 2026", grossSpend: 44800, detectedWaste: 15900, optimizedBaseline: 28900 },
    { month: "Jun 2026", grossSpend: 46500, detectedWaste: 17100, optimizedBaseline: 29400 },
    { month: "Jul 2026", grossSpend: 47200, detectedWaste: 17800, optimizedBaseline: 29400 },
    { month: "Aug 2026", grossSpend: 48100, detectedWaste: 18100, optimizedBaseline: 30000 },
    { month: "Sep 2026 (Live)", grossSpend: 48920, detectedWaste: 18450, optimizedBaseline: 30470 }
  ],
  departmentSavings: [
    { team: "AI / ML Research", currentSpend: 23594, targetSpend: 4719, savings: 18875, pctReduction: 80.0 },
    { team: "Data Platform & Lake", currentSpend: 3795, targetSpend: 1518, savings: 2277, pctReduction: 60.0 },
    { team: "Core Backend API", currentSpend: 3840, targetSpend: 1920, savings: 1920, pctReduction: 50.0 },
    { team: "Cloud Networking", currentSpend: 2150, targetSpend: 800, savings: 1350, pctReduction: 62.8 },
    { team: "Integrations / Serverless", currentSpend: 780, targetSpend: 240, savings: 540, pctReduction: 69.2 },
    { team: "DevOps & QA Staging", currentSpend: 480, targetSpend: 0, savings: 480, pctReduction: 100.0 }
  ],
  efficiencyBenchmarks: [
    { name: "Current State", score: 62, fill: "#F43F5E" },
    { name: "AWS Peer Median", score: 71, fill: "#F59E0B" },
    { name: "Well-Architected Std", score: 88, fill: "#06B6D4" },
    { name: "FinOpsGuard Target", score: 96, fill: "#10B981" }
  ],
  resources: [
    {
      id: "i-09f4b7a1e2c83d091",
      name: "ml-model-training-a100-cluster",
      service: "Amazon EC2",
      type: "p4d.24xlarge (8x NVIDIA A100 GPU)",
      region: "us-east-1",
      tags: { Environment: "Development", Owner: "AI-Research", Project: "GenAI-LLM" },
      status: "running",
      metrics: { cpuAvg: "3.4%", memoryAvg: "11.2%", gpuAvg: "0.0%", networkIOPs: "Low" },
      currentCost: 14200.00,
      monthlySavings: 11360.00,
      findingType: "Zombie GPU Instance",
      severity: "critical",
      proposedAction: "Scale-to-Zero Spot ASG & Migrate to AWS Inferentia2",
      recommendation: "Cluster has experienced 0% GPU compute utilization over 14 days. Migrate batch LLM jobs to AWS Trn1/Inf2 instances with automated idle shutdown policies.",
      terraformCode: `resource "aws_autoscaling_group" "ml_training_asg" {
  name                 = "ml-training-spot-asg"
  max_size             = 4
  min_size             = 0  # Scale-to-zero when idle
  desired_capacity     = 0
  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 0
      on_demand_percentage_above_base_capacity = 0
      spot_allocation_strategy                 = "capacity-optimized"
    }
  }
}`
    },
    {
      id: "db-prod-aurora-cluster-main",
      name: "prod-aurora-postgresql-cluster",
      service: "Amazon RDS",
      type: "db.r6g.16xlarge (Primary + 2 Replicas)",
      region: "us-west-2",
      tags: { Environment: "Production", Owner: "DBA-Team", Compliance: "PCI-DSS" },
      status: "running",
      metrics: { cpuAvg: "14.2%", memoryAvg: "28.0%", iops: "1,200", connections: "45" },
      currentCost: 6800.00,
      monthlySavings: 3100.00,
      findingType: "Overprovisioned Database",
      severity: "high",
      proposedAction: "Enable Aurora Serverless v2 Auto-Scaling (0.5 - 16 ACUs)",
      recommendation: "Static 16xlarge instances are severely underutilized during off-peak hours. Migrating to Aurora Serverless v2 scales capacity dynamically based on active connections.",
      terraformCode: `resource "aws_rds_cluster" "aurora_serverless" {
  cluster_identifier = "prod-aurora-serverless-cluster"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 16.0
  }
}`
    },
    {
      id: "vol-0a8b9c7d6e5f4a3b2",
      name: "legacy-analytics-temp-ebs",
      service: "Amazon EBS",
      type: "gp2 (4,000 GB Provisioned)",
      region: "eu-west-1",
      tags: { Environment: "Staging", Owner: "DataEng" },
      status: "unattached",
      metrics: { readOps: "0", writeOps: "0", daysUnattached: "42" },
      currentCost: 400.00,
      monthlySavings: 400.00,
      findingType: "Unattached Orphaned EBS Volume",
      severity: "medium",
      proposedAction: "Snapshot to S3 Glacier & Delete EBS Volume",
      recommendation: "EBS volume has been unattached from any EC2 instance for 42 days. Create a final snapshot and delete volume.",
      terraformCode: `resource "aws_ebs_snapshot" "final_analytics_snapshot" {
  volume_id   = "vol-0a8b9c7d6e5f4a3b2"
  description = "FinOpsGuard auto-snapshot prior to orphaned EBS teardown"
}`
    },
    {
      id: "s3-analytics-data-lake-prod",
      name: "enterprise-telemetry-raw-logs-2025",
      service: "Amazon S3",
      type: "S3 Standard (184 TB)",
      region: "us-east-1",
      tags: { Environment: "Production", Tier: "Analytics" },
      status: "active",
      metrics: { totalObjects: "4.2M", accessFrequency: "< 1% after 30 days" },
      currentCost: 4232.00,
      monthlySavings: 1850.00,
      findingType: "Suboptimal S3 Lifecycle Tiering",
      severity: "high",
      proposedAction: "Apply S3 Intelligent-Tiering & Lifecycle Rule",
      recommendation: "184 TB of log data remains in S3 Standard despite zero access after 30 days. Transition to Intelligent-Tiering and Glacier Instant Retrieval.",
      terraformCode: `resource "aws_s3_bucket_lifecycle_configuration" "data_lake_lifecycle" {
  bucket = "enterprise-telemetry-raw-logs-2025"
  rule {
    id     = "auto-glacier-transition"
    status = "Enabled"
    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
  }
}`
    },
    {
      id: "nat-0f1e2d3c4b5a69788",
      name: "dev-vpc-nat-gateway-us-east-1a",
      service: "VPC Networking",
      type: "NAT Gateway (AZ 1a)",
      region: "us-east-1",
      tags: { Environment: "Development", Network: "VPC-Dev" },
      status: "active",
      metrics: { dataProcessedGb: "18,400 GB", interAzCrossTraffic: "High" },
      currentCost: 1250.00,
      monthlySavings: 900.00,
      findingType: "High Cross-AZ NAT Gateway Data Transfer",
      severity: "medium",
      proposedAction: "Provision Gateway VPC Endpoints for S3 & DynamoDB",
      recommendation: "Dev traffic to S3 flows through expensive NAT Gateways ($0.045/GB). Provisioning Gateway VPC Endpoints routes traffic privately for free.",
      terraformCode: `resource "aws_vpc_endpoint" "s3" {
  vpc_id          = aws_vpc.dev_vpc.id
  service_name    = "com.amazonaws.us-east-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids = [aws_route_table.dev_private.id]
}`
    },
    {
      id: "lambda-image-resizer-prod",
      name: "prod-media-resizer-function",
      service: "AWS Lambda",
      type: "x86_64 Architecture (3,072 MB Memory)",
      region: "us-east-1",
      tags: { Environment: "Production", Function: "Media" },
      status: "active",
      metrics: { invocationsMo: "14.8M", avgDurationMs: "420ms", memoryUtil: "22%" },
      currentCost: 450.00,
      monthlySavings: 150.00,
      findingType: "Suboptimal Architecture & Memory Allocation",
      severity: "low",
      proposedAction: "Migrate Lambda to AWS Graviton2 (arm64)",
      recommendation: "Switching from x86_64 to arm64 Graviton2 yields 20% lower cost and up to 19% better performance for media processing workloads.",
      terraformCode: `resource "aws_lambda_function" "media_resizer" {
  function_name = "prod-media-resizer-function"
  architectures = ["arm64"] # Graviton2 optimization
  memory_size   = 1536    # Right-sized from 3072 MB
}`
    }
  ]
};

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
  principal == FinOpsGuard::Agent::"RemediationSynthesizer",
  action in [Action::"RightSize", Action::"StopIdle", Action::"ConvertToGraviton", Action::"CleanupOrphaned"],
  resource
)
when {
  resource.tags.Environment in ["Development", "Staging", "Sandbox"] &&
  resource.monthlySavings >= 100
};`
  },
  {
    id: "policy-04-s3-tiering-always-permit",
    name: "S3 Storage Tiering Auto-Approval",
    description: "Always permits non-destructive S3 Intelligent-Tiering and Glacier lifecycle policy updates.",
    effect: "permit",
    scope: {
      principal: "FinOpsGuard::Agent",
      action: ["Action::ApplyLifecycleRule"],
      resourceType: "AWS::S3::Bucket"
    },
    condition: `when { true }`,
    cedarCode: `permit (
  principal,
  action == Action::"ApplyLifecycleRule",
  resource is AWS::S3::Bucket
);`
  }
];

export const MOCK_GENAI_USAGE = {
  overall: {
    totalTokens: 18450000,
    totalCost: 142.50,
    potentialSavings: 68.20,
    tokenDistribution: { input: 14200000, output: 4250000 }
  },
  models: [
    { modelId: "claude-3.5-sonnet", displayName: "Claude 3.5 Sonnet", provider: "Anthropic", tokens: 8400000, cost: 78.50, percentage: 55.1 },
    { modelId: "gemini-3.1-pro", displayName: "Gemini 3.1 Pro", provider: "Google", tokens: 4200000, cost: 32.10, percentage: 22.5 },
    { modelId: "gpt-4o", displayName: "GPT-4o", provider: "OpenAI", tokens: 3100000, cost: 24.80, percentage: 17.4 },
    { modelId: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", provider: "Google", tokens: 2750000, cost: 7.10, percentage: 5.0 }
  ],
  optimizations: [
    { type: "Model Cascading", savings: 38.40, desc: "Route routine classification tasks to Gemini 2.5 Flash instead of Claude 3.5 Sonnet." },
    { type: "Prompt Compression & Caching", savings: 21.30, desc: "Enable Anthropic context caching for system prompts exceeding 2,000 tokens." },
    { type: "Antigravity IDE Fine-Tuning", savings: 8.50, desc: "Leverage native Antigravity local transcript cache to reduce repeated context re-sent to LLM." }
  ]
};

export const MOCK_ANTIGRAVITY_DATA = {
  totalConversations: 14,
  analyzedConversations: 5,
  totalTokensParsed: 2450800,
  estimatedIdeCostUSD: 18.65,
  recentSessions: [
    { id: "c33a643c-24e1-4d61-8696-a37423a6c4de", name: "finops-guard-orchestrator", tokenCount: 940000, model: "Gemini 3.6 Flash / Claude 3.5" },
    { id: "7a2b9c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d", name: "cedar-policy-verifier", tokenCount: 620000, model: "Claude 3.5 Sonnet" },
    { id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", name: "terraform-hcl-generator", tokenCount: 480000, model: "Gemini 2.5 Flash" }
  ]
};
