# FinOpsGuard AI — 3-Minute Video Pitch & Demo Script
**WeMakeDevs & AWS "First Commit" Hackathon (Bharat Builds Tour)**
**Target Track**: Ship It (1st Prize) + Best UI Prize
**Team**: Jeeva N (@jeeva5655)

---

## ⏱️ Video Breakdown (Total: 3 Minutes)

### Part 1: The Problem & Vision (0:00 - 0:40)
* **Visual**: Show FinOpsGuard AI Dashboard Overview (`http://localhost:5173`) with `$48,920` monthly spend and `$18,450` detected waste banner.
* **Narration**:
  > *"Every year, organizations waste over 32% of their cloud expenditure. With the surge in Generative AI workloads, unattached EBS volumes, zombie GPU clusters, and overprovisioned databases, cloud bills are silently spiraling out of control.*
  >
  > *Existing FinOps tools only give you passive alerts. But automated scripts are too dangerous to run autonomously because an unconstrained AI might terminate a production database and cause catastrophic outages.*
  >
  > *Meet **FinOpsGuard AI**: the first autonomous multi-agent cloud cost optimization platform governed by **AWS Cedar Zero-Trust Policy-as-Code**."*

---

### Part 2: The Multi-Agent Architecture on AWS (0:40 - 1:30)
* **Visual**: Click on the **Multi-Agent Loop** tab. Click **"Run Multi-Agent Scan"**. Show the 5 agents lighting up with the live streaming terminal.
* **Narration**:
  > *"FinOpsGuard deploys a 5-tier autonomous loop built on AWS:*
  > 1. *Agent 1 (Telemetry Scanner) ingests Cost Explorer CUR and CloudWatch metrics across multiple regions.*
  > 2. *Agent 2 (Cognitive Core powered by Amazon Bedrock Claude 3.5 Sonnet) formulates architectural rightsizing proposals—such as migrating batch training to Spot Trainium instances and converting x86 Lambdas to Graviton.*
  > 3. *Agent 3 (Zero-Trust Cedar Guard) intercepts every action at the wire. Powered by AWS Cedar, it mathematically verifies permissions before any infrastructure change is allowed.*
  > 4. *Agent 4 (IaC Synthesizer) compiles production-ready Terraform HCL and compensating Saga rollback plans.*
  > 5. *Agent 5 (Executive FinOps Reporter) calculates EBITDA payback and carbon reductions.*
  >
  > *Notice our Pattern-Aware Speculative execution (PASTE), which reduces tool latency by over 46%!"*

---

### Part 3: Live Cedar Zero-Trust & Remediation Demo (1:20 - 2:00)
* **Visual 1**: Switch to **Cedar Policy Guard** tab. Select `aurora-pg-prod-core` (Production) and action `Action::Terminate`. Click **"Evaluate Cedar Policy Gate"**. Show the red `FORBID` badge with mathematical explanation.
* **Narration**:
  > *"Here is our core innovation: Zero-Trust Safety. If an agent tries to execute a destructive termination on our Production Aurora cluster, AWS Cedar immediately forbids it in sub-milliseconds because Policy 01 strictly locks production workloads."*
* **Visual 2**: Switch to **IaC Remediation** tab. Select `ml-training-cluster-gpu-p4d` (Development GPU cluster wasting $18,875/mo). Click **"Execute Safe Remediation"**.
* **Narration**:
  > *"Conversely, on Development resources, Cedar permits automated right-sizing. With one click, FinOpsGuard applies the Terraform scale-to-zero Spot policy, instantly slashing $18,875/month from our AWS bill!"*

---

### Part 4: GenAI & LLM Cost Optimizer with Antigravity (2:00 - 2:35)
* **Visual**: Click on the **GenAI Optimizer** tab. Show the Model Cost Breakdown stacked bars, the Context Caching & Compression recommendations, and the live Antigravity sessions table.
* **Narration**:
  > *"Cloud waste isn't just compute and storage anymore—GenAI tokens are the fastest-growing enterprise expense. FinOpsGuard features a dedicated GenAI Optimizer with native Google Antigravity integration.*
  >
  > *It ingests developer session transcripts in real time, breaks down token spend across Claude, Gemini, and Bedrock models, identifies prompt caching opportunities to slash 90% off input tokens, and detects redundant agent tool calls to compress prompt payloads by up to 40%."*

---

### Part 5: Bedrock Copilot & Executive Impact (2:35 - 3:00)
* **Visual**: Briefly show **Bedrock Copilot** querying spend anomalies, then switch to the **Executive Briefing** tab with the 12-month net savings ($221,400), EBITDA improvements, and ESG carbon stats.
* **Narration**:
  > *"FinOpsGuard includes an Amazon Bedrock Copilot for natural language FinOps queries and generates C-Suite Executive Briefings.*
  >
  > *In under 3 minutes, FinOpsGuard delivers $221,400 in annual recurring savings, cuts 4.8 tons of carbon footprint, and optimizes GenAI token workloads—with mathematical zero-trust guarantees.*
  >
  > *Built on AWS Bedrock, AWS Cedar, Serverless, and React 19. Thank you!"*

---

## 🚀 Key Links for Submission Form
- **GitHub Repository**: [https://github.com/jeeva5655/finopsguard-ai](https://github.com/jeeva5655/finopsguard-ai)
- **Live Deployed App (Amplify/App Runner)**: Deployed URL
- **Architecture**: Amazon Bedrock + AWS Cedar + AWS Lambda + DynamoDB + S3 + React (Amplify Hosting)
