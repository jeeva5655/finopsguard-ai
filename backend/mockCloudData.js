/**
 * High-Fidelity Realistic AWS Telemetry & Resource Inventory
 * Mimics AWS Cost Explorer, CloudWatch Metrics, and AWS Config
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
    efficiencyScore: 62 // 62/100
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
  resources: [
    {
      id: "i-09f4b7a1e2c83d091",
      name: "ml-training-cluster-gpu-p4d",
      service: "Amazon EC2",
      type: "AWS::EC2::Instance",
      instanceType: "p4d.24xlarge",
      region: "us-east-1",
      currentCost: 23594.00,
      monthlySavings: 18875.00,
      efficiencyMetric: "4.1% avg GPU utilization over 14 days",
      status: "running",
      tags: {
        Environment: "Development",
        Team: "AI-Research",
        Owner: "ml-platform@enterprise.com",
        CostCenter: "CC-8821"
      },
      findingType: "Zombie GPU Overprovisioning",
      severity: "CRITICAL",
      recommendation: "Stop idle P4d instances or migrate batch training to Spot / AWS Trainium (trn1.32xlarge) or SageMaker Managed Training Jobs.",
      proposedAction: "Action::RightSize",
      terraformRemediation: `# FinOpsGuard AI Automated Remediation
# Migrate idle p4d.24xlarge to scheduled AWS Trainium or on-demand scale-to-zero
resource "aws_autoscaling_group" "ai_training_asg" {
  min_size         = 0 # Scale to zero when idle
  max_size         = 2
  desired_capacity = 0
  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 0
      on_demand_percentage_above_base_capacity = 20 # 80% Spot instances
      spot_allocation_strategy                 = "price-capacity-optimized"
    }
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.trn1_cluster.id
        version            = "$Latest"
      }
      override {
        instance_type = "trn1.2xlarge"
      }
    }
  }
}`
    },
    {
      id: "vol-0a38d72e659b8c104",
      name: "orphaned-legacy-vol-chain-01",
      service: "Amazon EBS",
      type: "AWS::EC2::Volume",
      volumeType: "gp2",
      sizeGb: 4000,
      region: "us-east-1",
      currentCost: 480.00,
      monthlySavings: 480.00,
      daysUnattached: 28,
      status: "available",
      tags: {
        Environment: "Staging",
        Team: "DevOps",
        CostCenter: "CC-1090"
      },
      findingType: "Unattached Orphaned EBS Volume",
      severity: "HIGH",
      recommendation: "Create final recovery snapshot tag 'FinOpsGuard-Snapshot' and purge 4TB orphaned gp2 volume.",
      proposedAction: "Action::SnapshotAndPurge",
      terraformRemediation: `# Create final backup snapshot before automated unattached volume purge
resource "aws_ebs_snapshot" "orphan_vol_backup" {
  volume_id   = "vol-0a38d72e659b8c104"
  description = "FinOpsGuard AI automated pre-purge backup"
  tags = {
    CreatedBy = "FinOpsGuard-AI"
    PurgeReason = "OrphanedFor28Days"
  }
}`
    },
    {
      id: "db-aurora-prod-cluster-01",
      name: "aurora-pg-prod-core",
      service: "Amazon RDS",
      type: "AWS::RDS::DBInstance",
      instanceType: "db.r6g.4xlarge",
      region: "us-east-1",
      currentCost: 3840.00,
      monthlySavings: 1920.00,
      efficiencyMetric: "8.5% avg CPU utilization, read replicas idle",
      status: "available",
      tags: {
        Environment: "Production",
        Team: "CoreBackend",
        Criticality: "Tier-1"
      },
      findingType: "Overprovisioned Database Cluster",
      severity: "MEDIUM",
      recommendation: "Right-size db.r6g.4xlarge to Aurora Serverless v2 (0.5 to 8 ACU scaling) to eliminate off-peak idle compute.",
      proposedAction: "Action::RightSize",
      terraformRemediation: `# Aurora Serverless v2 Auto-scaling configuration
resource "aws_rds_cluster" "aurora_pg_core" {
  cluster_identifier = "aurora-pg-prod-core"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 8.0
  }
}`
    },
    {
      id: "s3-lake-uncompressed-raw",
      name: "enterprise-datalake-raw-archive",
      service: "Amazon S3",
      type: "AWS::S3::Bucket",
      sizeTb: 165,
      region: "us-west-2",
      currentCost: 3795.00,
      monthlySavings: 2277.00,
      hasLifecyclePolicy: false,
      status: "active",
      tags: {
        Environment: "Production",
        Team: "DataEng",
        Compliance: "SOC2"
      },
      findingType: "Missing S3 Intelligent-Tiering & Glacier Transition",
      severity: "HIGH",
      recommendation: "Apply S3 Intelligent-Tiering lifecycle rule to automatically move objects untouched after 90 days to Archive Instant Access and Deep Archive.",
      proposedAction: "Action::EnableIntelligentTiering",
      terraformRemediation: `resource "aws_s3_bucket_intelligent_tiering_configuration" "datalake_tiering" {
  bucket = "enterprise-datalake-raw-archive"
  name   = "FinOpsIntelligentTieringRule"
  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }
  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}`
    },
    {
      id: "nat-gw-08b2910fc332b1a",
      name: "natgw-us-east-1a-vpc-private",
      service: "VPC NAT Gateway",
      type: "AWS::EC2::NatGateway",
      region: "us-east-1",
      currentCost: 2150.00,
      monthlySavings: 1350.00,
      efficiencyMetric: "42 TB/mo cross-AZ data transfer to S3 & DynamoDB endpoints",
      status: "active",
      tags: {
        Environment: "Production",
        Team: "Networking"
      },
      findingType: "Avoidable Cross-AZ NAT Gateway Data Egress",
      severity: "MEDIUM",
      recommendation: "Deploy free AWS Gateway VPC Endpoints for S3 and DynamoDB to route traffic internally, bypassing NAT Gateway data processing charges ($0.045/GB).",
      proposedAction: "Action::ApplyS3Lifecycle",
      terraformRemediation: `resource "aws_vpc_endpoint" "s3_gateway_endpoint" {
  vpc_id            = "vpc-098a123f456b"
  service_name      = "com.amazonaws.us-east-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = ["rtb-private-app-01", "rtb-private-app-02"]
  tags = {
    Name        = "FinOpsGuard-S3-VPC-Endpoint"
    CostSavings = "Zero-Fee-Egress"
  }
}`
    },
    {
      id: "fn-event-stream-ingestor",
      name: "lambda-stream-ingestor-node",
      service: "AWS Lambda",
      type: "AWS::Lambda::Function",
      allocatedMemoryMb: 5120,
      avgMemoryUsedMb: 182,
      runtime: "nodejs20.x (x86_64)",
      region: "us-east-1",
      currentCost: 780.00,
      monthlySavings: 540.00,
      status: "active",
      tags: {
        Environment: "Development",
        Team: "Integrations"
      },
      findingType: "Overprovisioned Lambda Memory & x86 Architecture",
      severity: "LOW",
      recommendation: "Right-size memory from 5120MB to 512MB and migrate to AWS Graviton2 (arm64) architecture for instant 20% price-performance gain.",
      proposedAction: "Action::ConvertToGraviton",
      terraformRemediation: `resource "aws_lambda_function" "stream_ingestor" {
  function_name = "lambda-stream-ingestor-node"
  memory_size   = 512 # Scaled down from 5120MB
  architectures = ["arm64"] # Switched to AWS Graviton
}`
    }
  ]
};
