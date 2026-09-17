# FinOpsGuard AI 🛡️
### Autonomous AWS Multi-Agent Cloud Cost Optimization & Zero-Trust Governance Platform

[![AWS Bedrock](https://img.shields.io/badge/AWS-Amazon%20Bedrock-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![AWS Cedar](https://img.shields.io/badge/Policy%20Engine-AWS%20Cedar-06B6D4?logo=security&logoColor=white)](https://www.cedarpolicy.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Serverless](https://img.shields.io/badge/Architecture-AWS%20Serverless-FD5750?logo=serverless&logoColor=white)](https://aws.amazon.com/serverless/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Built for the WeMakeDevs & AWS "First Commit" Hackathon (Bharat Builds Tour)**  
> **Target Tracks**: **Ship It (First Prize)** & **Best UI Prize**  
> **Author**: Jeeva N ([@jeeva5655](https://github.com/jeeva5655))

---

## 🌟 Overview & Problem Statement

Enterprises lose **over 32% of their public cloud budget** to cloud waste: zombie GPU instances, unattached EBS storage, idle RDS databases, overprovisioned Lambda runtimes, and un-tiered S3 data lakes. 

While static FinOps tools generate passive alerts that get ignored, autonomous AI agents are usually **too risky** to deploy because an unconstrained model might hallucinate and terminate a mission-critical production database.

**FinOpsGuard AI** solves this with a **5-tier autonomous multi-agent loop** governed by an in-process **AWS Cedar Zero-Trust Policy Engine**. It identifies cloud waste, formulates architectural right-sizing plans with **Amazon Bedrock**, mathematically verifies every action against Cedar security policies at the wire, and generates production-ready **Terraform HCL** with safe rollback guarantees.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Frontend["FinOps Command Center (React + Modern Vanilla CSS)"]
        UI_Home["📊 Command Center & Waste Explorer"]
        UI_Agents["🤖 Real-Time Multi-Agent Loop (SSE)"]
        UI_Cedar["🛡️ AWS Cedar Zero-Trust Playground"]
        UI_IaC["⚡ Terraform Remediation Console"]
        UI_Copilot["💬 Bedrock AI FinOps Copilot"]
        UI_Report["📑 C-Suite Executive Briefing"]
    end

    subgraph BackendEngine["Autonomous Multi-Agent Orchestrator (Node.js & Bedrock)"]
        Agent1["1. Telemetry & CUR Ingestion Scanner"]
        Agent2["2. Cognitive Rightsizer (Claude 3.5 Sonnet)"]
        Agent3["3. Zero-Trust Policy Gate (AWS Cedar PEP)"]
        Agent4["4. IaC & Terraform Synthesizer"]
        Agent5["5. FinOps Executive & ESG Carbon Reporter"]
    end

    subgraph AWSServices["AWS Cloud Services & Ecosystem"]
        Bedrock["Amazon Bedrock (Claude 3.5 Sonnet)"]
        Cedar["AWS Cedar Policy Engine (RFC Spec)"]
        DynamoDB["Amazon DynamoDB (Audit Trail)"]
        S3["Amazon S3 (IaC Artifacts & Reports)"]
        Amplify["AWS Amplify Hosting / App Runner"]
    end

    Frontend <-->|HTTP/2 & SSE Stream| BackendEngine
    BackendEngine --> Bedrock
    BackendEngine --> Cedar
    BackendEngine --> DynamoDB
    BackendEngine --> S3
```

---

## 🚀 The 5-Agent Autonomous Harness

1. **Agent 1: Ingestion & Telemetry Scanner**:
   - Polls AWS Cost Explorer CUR data, CloudWatch metrics, and resource tags across multiple regions.
   - Detects zombie compute, unattached storage, and idle GPU clusters.
2. **Agent 2: Cognitive Rightsizer (Amazon Bedrock Claude 3.5 Sonnet)**:
   - Formulates intelligent architectural modifications: AWS Graviton migrations, S3 Intelligent-Tiering, Aurora Serverless v2 auto-scaling, and Spot/Trainium scale-to-zero ASGs.
3. **Agent 3: Zero-Trust Cedar Policy Guard (AWS Cedar PDP/PEP)**:
   - Evaluates actions at the wire before execution using formal Cedar policies.
   - **Guarantees Zero-Downtime**: Strictly **FORBIDS** autonomous destructive actions on Production tier resources, while **PERMITTING** automated rightsizing on Development/Staging.
4. **Agent 4: IaC Remediation Synthesizer**:
   - Compiles syntactically validated Terraform HCL and AWS CLI commands.
   - Synthesizes compensating Saga rollback plans to guarantee seamless reversion in case of canary failure.
5. **Agent 5: Executive FinOps Reporter**:
   - Computes 12-month net payback ($221,400/yr), EBITDA improvements, and Green Cloud carbon reduction metrics (4.8 Metric Tons CO2e).

---

## 🛡️ Cedar Policy-as-Code Examples

FinOpsGuard embeds formal Cedar policies to guarantee enterprise safety:

```cedar
// Policy 1: Lock Production Workloads
forbid (
  principal == FinOpsGuard::Agent::"RemediationSynthesizer",
  action in [Action::"Terminate", Action::"Delete", Action::"Drop"],
  resource
)
when {
  resource.tags.Environment == "Production"
};

// Policy 2: Permit Automated Non-Production Optimization
permit (
  principal,
  action in [Action::"RightSize", Action::"StopIdle", Action::"ConvertToGraviton", Action::"CleanupOrphaned"],
  resource
)
when {
  resource.tags.Environment in ["Development", "Staging", "Sandbox"] &&
  resource.monthlySavings >= 100
};
```

---

## ⚡ Quickstart: Run Locally in 60 Seconds

### Prerequisites
- Node.js v18+ installed

### 1. Clone & Setup
```bash
git clone https://github.com/jeeva5655/finopsguard-ai.git
cd finopsguard-ai
```

### 2. Install & Start Backend
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:3001`*

### 3. Install & Start Frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

Open `http://localhost:5173` in your browser and experience the FinOps Command Center!

---

## ☁️ Deployment on AWS

### Option 1: AWS Amplify Hosting (Frontend)
1. Push this repository to GitHub.
2. Open **AWS Amplify Console** $\to$ **Host web app**.
3. Select `jeeva5655/finopsguard-ai` and set base directory to `frontend/dist`.
4. Deploy in 2 minutes!

### Option 2: AWS App Runner (Full Stack Container)
1. Build container using `deploy/Dockerfile`:
   ```bash
   docker build -t finopsguard-ai -f deploy/Dockerfile .
   ```
2. Deploy to AWS App Runner with port `8080`.

### Option 3: Serverless Deployment with AWS SAM
```bash
cd deploy
sam build
sam deploy --guided
```

---

## 🏆 Hackathon Tracks & Impact

- **Ship It (First Prize)**: Built entirely on AWS services (Bedrock, Cedar, Serverless, DynamoDB, S3, Amplify) with full cloud deployment capability.
- **Best UI Prize**: World-class cyber-dark glassmorphic FinOps design system with real-time SSE streaming visualizer, interactive cost topography, side-by-side Terraform diffs, and AI copilot.
- **Demo Script**: See [PITCH_AND_DEMO_SCRIPT.md](PITCH_AND_DEMO_SCRIPT.md) for the 3-minute video presentation guide.

---

## 📄 License
MIT License. Created by [Jeeva N](https://github.com/jeeva5655).
