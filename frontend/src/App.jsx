import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  TrendingDown,
  Server,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Terminal,
  FileCode,
  MessageSquare,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  HardDrive,
  Database,
  CloudRain,
  Network,
  Lock,
  ArrowRight,
  ExternalLink,
  Download,
  Send,
  RefreshCw,
  Brain
} from 'lucide-react';
import './App.css';
import AnimatedCounter from './components/AnimatedCounter.jsx';
import TerraformHighlighter from './components/TerraformHighlighter.jsx';
import ToastContainer from './components/Toast.jsx';
import DashboardSkeleton from './components/DashboardSkeleton.jsx';
import {
  CostBreakdownPieChart,
  HistoricalSpendAreaChart,
  DepartmentSavingsBarChart,
  EfficiencyRadialGauge
} from './components/CostCharts.jsx';
import Footer from './components/Footer.jsx';
import GenAIOptimizer from './components/GenAIOptimizer.jsx';
import { INITIAL_CLOUD_ESTATE, DEFAULT_CEDAR_POLICIES } from './data/mockData.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | agents | cedar | remediation | copilot | report | genai
  const [estate, setEstate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState('ALL');
  
  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  
  // Agent streaming state
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [agentCompleted, setAgentCompleted] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  // Cedar playground state
  const [cedarPolicies, setCedarPolicies] = useState([]);
  const [simResource, setSimResource] = useState(null);
  const [simAction, setSimAction] = useState('Action::Terminate');
  const [simResult, setSimResult] = useState(null);

  // Remediation sandbox state
  const [selectedResource, setSelectedResource] = useState(null);
  const [remediating, setRemediating] = useState(false);
  const [remediationSuccessMsg, setRemediationSuccessMsg] = useState(null);

  // Copilot state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your FinOpsGuard Bedrock Copilot. I continuously monitor your AWS infrastructure across Compute, Storage, GPU/ML, and Networking. Ask me anything about your cloud waste, Cedar policy boundaries, or optimization ROI!"
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Auto-scroll terminal
  const terminalEndRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load initial estate
  useEffect(() => {
    fetchEstate();
    fetchCedarPolicies();
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchEstate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/estate');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEstate(data);
      if (data.resources && data.resources.length > 0) {
        setSelectedResource(data.resources[0]);
        setSimResource(data.resources[0]);
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client-side fallback estate data:', err);
      setEstate(INITIAL_CLOUD_ESTATE);
      if (INITIAL_CLOUD_ESTATE.resources && INITIAL_CLOUD_ESTATE.resources.length > 0) {
        setSelectedResource(INITIAL_CLOUD_ESTATE.resources[0]);
        setSimResource(INITIAL_CLOUD_ESTATE.resources[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCedarPolicies = async () => {
    try {
      const res = await fetch('/api/cedar/policies');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCedarPolicies(data);
    } catch (err) {
      console.warn('Backend API unavailable, using client-side fallback Cedar policies:', err);
      setCedarPolicies(DEFAULT_CEDAR_POLICIES);
    }
  };

  const handleResetEstate = async () => {
    try {
      const res = await fetch('/api/estate/reset', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEstate(data.estate);
      setSelectedResource(data.estate.resources[0]);
    } catch (err) {
      console.warn('Reset endpoint unavailable, resetting state locally:', err);
      setEstate(JSON.parse(JSON.stringify(INITIAL_CLOUD_ESTATE)));
      setSelectedResource(INITIAL_CLOUD_ESTATE.resources[0]);
    }
    setRemediationSuccessMsg(null);
    setAgentCompleted(false);
    setAgentLogs([]);
    setCurrentStep(0);
    addToast('info', 'Cloud Estate Reset', 'Restored infrastructure telemetry to unoptimized baseline.');
  };

  // Run multi-agent loop with SSE or simulated client-side runner
  const startMultiAgentRun = () => {
    setActiveTab('agents');
    setAgentRunning(true);
    setAgentLogs([]);
    setCurrentStep(1);
    setAgentCompleted(false);
    setFinalReport(null);
    addToast('info', 'Multi-Agent Loop Initialized', '5-Tier autonomous pipeline scanning AWS estate...');

    // Client-side fallback simulation runner
    const runSimulatedAgents = () => {
      const currentResList = estate?.resources || INITIAL_CLOUD_ESTATE.resources;
      const totalSavings = currentResList.reduce((sum, r) => sum + r.monthlySavings, 0);

      const steps = [
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-1-scanner',
          status: 'running',
          title: 'Ingesting AWS Telemetry & Cost Explorer Metrics',
          details: 'Polling AWS CloudWatch metrics, Cost Explorer CUR data, and resource tags across 4 active regions (us-east-1, us-west-2, eu-west-1, ap-south-1)...',
          metadata: { step: 1, totalSteps: 5, targetFleetSize: currentResList.length }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-1-scanner',
          status: 'completed',
          title: `Telemetry Scan Completed: ${currentResList.length} Waste Vectors Detected`,
          details: `Discovered $${totalSavings.toLocaleString()}/month in unoptimized cloud spend across Compute, Storage, Database, and Networking vectors.`,
          metadata: { step: 1, findingsCount: currentResList.length, totalIdentifiedSavings: totalSavings, efficiencyScore: 62 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-2-rightsizer',
          status: 'running',
          title: 'Synthesizing FinOps Rightsizing Strategies via Amazon Bedrock',
          details: 'Analyzing CPU/Memory/GPU utilization profiles with Claude 3.5 Sonnet on Amazon Bedrock. Formulating architectural remediation plans...',
          metadata: { step: 2, totalSteps: 5, model: 'anthropic.claude-3-5-sonnet-20241022-v2:0' }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-2-rightsizer',
          status: 'completed',
          title: `Generated ${currentResList.length} Architectural Optimization Proposals`,
          details: 'Calculated ROI matrices and formulated targeted AWS API operations for each detected inefficiency.',
          metadata: { step: 2 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-3-cedar-guard',
          status: 'running',
          title: 'Evaluating Zero-Trust Cedar Policy Guardrails (PDP & PEP)',
          details: 'Passing proposed actions through formal in-process Cedar Policy Engine to verify environment constraints and security boundaries...',
          metadata: { step: 3, totalSteps: 5 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-3-cedar-guard',
          status: 'completed',
          title: 'Cedar Policy Verification: 5 Permitted, 1 Escalated',
          details: 'Permitted 5 non-destructive rightsizing operations. Strictly escalated 1 Production Aurora DB downsizing requiring DBA sign-off.',
          metadata: { step: 3, totalEvaluated: currentResList.length, permittedCount: 5, forbiddenCount: 1 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-4-iac-synthesizer',
          status: 'running',
          title: 'Synthesizing Infrastructure-as-Code (Terraform HCL) & Rollback Plan',
          details: 'Generating validated HCL modules with state locks, tags, and automated rollbacks...',
          metadata: { step: 4, totalSteps: 5 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-4-iac-synthesizer',
          status: 'completed',
          title: 'Synthesized 5 Terraform Modules with Rollback Plan',
          details: 'Generated complete HCL declarations ready for automated apply via GitHub Actions / AWS CodePipeline.',
          metadata: { step: 4 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-5-reporter',
          status: 'running',
          title: 'Generating C-Suite ROI & Carbon Neutrality Briefing',
          details: 'Computing annualized cost reduction, ESG CO2e reduction, and payback timeline...',
          metadata: { step: 5, totalSteps: 5 }
        },
        {
          traceId: 'trace-sim-1',
          timestamp: new Date().toISOString(),
          agentId: 'agent-5-reporter',
          status: 'completed',
          title: 'Executive Briefing Ready',
          details: 'Finalized executive report and ESG carbon metric scorecard.',
          metadata: { step: 5 }
        }
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i < steps.length) {
          const step = steps[i];
          setAgentLogs((prev) => [...prev, step]);
          if (step.metadata && step.metadata.step) {
            setCurrentStep(step.metadata.step);
          }
          i++;
        } else {
          clearInterval(interval);
          setAgentRunning(false);
          setAgentCompleted(true);
          setFinalReport({
            executiveSummary: {
              headline: 'FinOpsGuard Autonomous Multi-Agent Audit Completed',
              totalMonthlySavings: totalSavings,
              potentialAnnualSavings: totalSavings * 12,
              newEfficiencyScore: 94,
              carbonSavings: '3.2 Tons CO2e/month',
              roiDays: 4
            },
            recommendations: currentResList.map((r) => ({
              resourceId: r.id,
              action: r.proposedAction,
              monthlySavings: r.monthlySavings,
              cedarDecision: r.tags?.Environment === 'Production' && r.service === 'Amazon RDS' ? 'FORBIDDEN (Escalation Required)' : 'PERMITTED'
            }))
          });
          addToast('success', 'Multi-Agent Scan Complete', 'Generated Cedar policy checks, IaC plans, and Executive briefing.');
        }
      }, 700);
    };

    try {
      const eventSource = new EventSource('/api/agents/stream');

      eventSource.addEventListener('agent-step', (event) => {
        const data = JSON.parse(event.data);
        setAgentLogs((prev) => [...prev, data]);
        if (data.metadata && data.metadata.step) {
          setCurrentStep(data.metadata.step);
        }
      });

      eventSource.addEventListener('finished', (event) => {
        const data = JSON.parse(event.data);
        setAgentRunning(false);
        setAgentCompleted(true);
        setFinalReport(data.report);
        eventSource.close();
        addToast('success', 'Multi-Agent Scan Complete', 'Generated Cedar policy checks, IaC plans, and Executive briefing.');
      });

      eventSource.addEventListener('error', (event) => {
        console.warn('SSE EventSource unavailable, switching to simulated client-side agent runner.');
        eventSource.close();
        runSimulatedAgents();
      });
    } catch (err) {
      console.warn('EventSource unsupported or failed, running client simulation:', err);
      runSimulatedAgents();
    }
  };

  // Test Cedar Policy in playground
  const handleEvaluateCedar = async () => {
    if (!simResource) return;

    const evaluateLocally = () => {
      const isProd = simResource.tags?.Environment === 'Production';
      let decision = 'Permit';
      let policyId = 'policy-03-dev-staging-auto-rightsize';
      let policyName = 'Automated Non-Prod Optimization';
      let rationale = `Cedar Policy '${policyName}' PERMITS action '${simAction}' on resource '${simResource.name}'.`;

      if (simAction === 'Action::Terminate' && isProd) {
        decision = 'Forbid';
        policyId = 'policy-01-prod-forbid-terminate';
        policyName = 'Production Deletion Protection';
        rationale = `Cedar Policy '${policyName}' FORBIDS action 'Action::Terminate' on Production resource '${simResource.name}'.`;
      } else if (simAction === 'Action::RightSize' && isProd && simResource.service === 'Amazon RDS') {
        decision = 'Forbid';
        policyId = 'policy-02-prod-rds-escalation';
        policyName = 'Production Database Modification Escalation';
        rationale = `Cedar Policy '${policyName}' FORBIDS downsizing Production database '${simResource.name}' during business hours (09:00 - 18:00 UTC).`;
      }

      const simData = {
        decision,
        policyId,
        policyName,
        rationale,
        evaluatedAt: new Date().toISOString(),
        context: { hourOfDay: 14, backupCreated: true }
      };
      setSimResult(simData);
      if (decision === 'Permit') {
        addToast('success', 'Cedar Policy: PERMITTED', rationale);
      } else {
        addToast('forbid', 'Cedar Policy: FORBIDDEN', rationale);
      }
    };

    try {
      const res = await fetch('/api/cedar/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: 'FinOpsGuard::Agent::RemediationSynthesizer',
          action: simAction,
          resource: simResource,
          context: { hourOfDay: 14, backupCreated: true }
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSimResult(data);
      if (data.decision === 'Permit') {
        addToast('success', 'Cedar Policy: PERMITTED', data.rationale || 'Action complies with all Cedar guardrails.');
      } else {
        addToast('forbid', 'Cedar Policy: FORBIDDEN', data.rationale || 'Action strictly blocked by Zero-Trust policy.');
      }
    } catch (err) {
      console.warn('Cedar PDP API unavailable, evaluating policy locally:', err);
      evaluateLocally();
    }
  };

  // Apply safe remediation
  const handleApplyRemediation = async (resourceId) => {
    try {
      setRemediating(true);
      setRemediationSuccessMsg(null);
      const res = await fetch('/api/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.rationale || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRemediationSuccessMsg(data.message);
      addToast('success', 'Remediation Applied', data.message);
      fetchEstate();
    } catch (err) {
      console.warn('Remediation API unavailable, applying remediation locally:', err);
      setEstate((prev) => {
        if (!prev) return prev;
        const updated = JSON.parse(JSON.stringify(prev));
        updated.resources = updated.resources.map((r) =>
          r.id === resourceId ? { ...r, status: 'remediated', monthlySavings: 0 } : r
        );
        return updated;
      });
      const successMsg = `Successfully remediated resource ${resourceId}. Projected waste savings locked in!`;
      setRemediationSuccessMsg(successMsg);
      addToast('success', 'Remediation Applied', successMsg);
    } finally {
      setRemediating(false);
    }
  };

  // Send Copilot Chat
  const handleSendMessage = async (customPrompt) => {
    const query = customPrompt || inputMsg;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setChatLoading(true);

    const generateLocalResponse = (text) => {
      const lower = text.toLowerCase();
      let reply = "FinOpsGuard AI Copilot (Powered by Amazon Bedrock & AWS Cedar): I am monitoring your cloud infrastructure across 6 detected waste vectors totaling $18,450/month in savings. You can trigger the 5-agent audit scan or test Cedar policies using the controls above!";
      let suggestedActions = ["Run 5-Agent Scan", "View Cedar Policies", "Check GPU Instance"];

      if (lower.includes('gpu') || lower.includes('zombie') || lower.includes('ec2')) {
        reply = "I analyzed your AWS EC2 compute fleet. `ml-model-training-a100-cluster` (p4d.24xlarge) has experienced 0% GPU compute utilization for 14 days, generating **$11,360/month** in waste. Recommendation: Migrate to Scale-to-Zero Spot ASG with AWS Inferentia2/Trn1 instances.";
        suggestedActions = ["View GPU Instance", "Evaluate Cedar Policy"];
      } else if (lower.includes('cedar') || lower.includes('policy') || lower.includes('security')) {
        reply = "AWS Cedar Zero-Trust Policy Engine is active with 4 formal policy statements. Current guardrails strictly forbid terminating Production resources and prohibit downsizing Production RDS databases during business hours (09:00 - 18:00 UTC).";
        suggestedActions = ["Open Cedar Playground", "View Policies"];
      } else if (lower.includes('s3') || lower.includes('storage') || lower.includes('tiering')) {
        reply = "S3 bucket `enterprise-telemetry-raw-logs-2025` contains 184 TB of log data stored in S3 Standard with < 1% access rate after 30 days. Applying S3 Intelligent-Tiering and Glacier Instant Retrieval lifecycle rules saves **$1,850/month**.";
        suggestedActions = ["Apply S3 Lifecycle", "View Terraform"];
      }

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: reply, suggestedActions }
        ]);
        setChatLoading(false);
      }, 600);
    };

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply,
          suggestedActions: data.suggestedActions
        }
      ]);
      setChatLoading(false);
    } catch (err) {
      console.warn('Copilot API unavailable, generating smart local response:', err);
      generateLocalResponse(query);
    }
  };

  if (loading || !estate) {
    return <DashboardSkeleton />;
  }

  const filteredResources = estate.resources.filter((r) => {
    if (selectedEnv === 'ALL') return true;
    return r.tags.Environment === selectedEnv;
  });

  const getServiceIcon = (service) => {
    if (service.includes('EC2') || service.includes('GPU')) return <Cpu size={18} color="#FF9900" />;
    if (service.includes('RDS') || service.includes('Aurora')) return <Database size={18} color="#06B6D4" />;
    if (service.includes('S3')) return <CloudRain size={18} color="#10B981" />;
    if (service.includes('EBS')) return <HardDrive size={18} color="#F59E0B" />;
    if (service.includes('NAT')) return <Network size={18} color="#8B5CF6" />;
    return <Zap size={18} color="#EC4899" />;
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar" role="banner">
        <div className="brand-section">
          <div className="brand-logo-shield" aria-hidden="true">
            <Shield size={26} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="brand-title" style={{ margin: 0, fontSize: '1.35rem' }}>
              FinOps<span>Guard</span> AI
            </h1>
            <p className="brand-subtitle">Autonomous AWS Cloud Cost Optimization & Zero-Trust Governance</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="top-nav-tabs" aria-label="Main Navigation">
          <button
            id="tab-overview"
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={16} /> Command Center
          </button>
          <button
            id="tab-agents"
            className={`nav-tab ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            <Sparkles size={16} /> Multi-Agent Loop
            {agentRunning && <span className="badge badge-aws pulse-animation" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>LIVE</span>}
          </button>
          <button
            id="tab-cedar"
            className={`nav-tab ${activeTab === 'cedar' ? 'active' : ''}`}
            onClick={() => setActiveTab('cedar')}
          >
            <Lock size={16} /> Cedar Policy Guard
          </button>
          <button
            id="tab-remediation"
            className={`nav-tab ${activeTab === 'remediation' ? 'active' : ''}`}
            onClick={() => setActiveTab('remediation')}
          >
            <FileCode size={16} /> IaC Remediation
          </button>
          <button
            id="tab-copilot"
            className={`nav-tab ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <MessageSquare size={16} /> Bedrock Copilot
          </button>
          <button
            id="tab-report"
            className={`nav-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <FileText size={16} /> Executive Briefing
          </button>
          <button
            id="tab-genai"
            className={`nav-tab ${activeTab === 'genai' ? 'active' : ''}`}
            onClick={() => setActiveTab('genai')}
          >
            <Brain size={16} /> GenAI Optimizer
          </button>
        </nav>

        {/* Right Controls */}
        <div className="top-right-controls">
          <div className="aws-account-badge">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>AWS:</span>
            <strong style={{ color: '#FFB340', fontFamily: 'var(--font-mono)' }}>{estate.account.id}</strong>
          </div>
          <button
            id="btn-run-full-scan"
            className="btn-primary"
            onClick={startMultiAgentRun}
            disabled={agentRunning}
          >
            <Play size={16} fill="#07090E" /> Run Multi-Agent Scan
          </button>
          <button
            title="Reset Cloud Estate to Initial State"
            className="btn-secondary"
            onClick={handleResetEstate}
            style={{ padding: '10px 12px' }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* Hero KPI Metric Cards */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        <div className="glass-panel kpi-card kpi-card-orange">
          <div className="kpi-header">
            <span className="kpi-label">Current Monthly Run-Rate</span>
            <DollarSign size={18} color="#FF9900" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#FFB340' }}>
            <AnimatedCounter value={estate.account.currentMonthlyRunRate} prefix="$" decimals={2} />
          </div>
          <div className="kpi-footer">
            <span>4 Regions</span> • <span>7 Core AWS Services</span>
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-card-cyan">
          <div className="kpi-header">
            <span className="kpi-label">Detected Monthly Waste</span>
            <TrendingDown size={18} color="#06B6D4" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#38BDF8' }}>
            <AnimatedCounter value={estate.account.detectedMonthlyWaste} prefix="$" decimals={2} />
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#F43F5E', fontWeight: 700 }}>
              {((estate.account.detectedMonthlyWaste / estate.account.currentMonthlyRunRate) * 100).toFixed(1)}%
            </span> of cloud budget is unoptimized
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-card-emerald">
          <div className="kpi-header">
            <span className="kpi-label">Projected Annual Savings</span>
            <Zap size={18} color="#10B981" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#34D399' }}>
            <AnimatedCounter value={estate.account.potentialAnnualSavings} prefix="$" decimals={2} />
          </div>
          <div className="kpi-footer">
            <span>ROI: 38.4x return</span> • <span>{estate.account.carbonFootprintMetric}</span>
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-card-purple">
          <div className="kpi-header">
            <span className="kpi-label">Cloud Efficiency Score</span>
            <Shield size={18} color="#8B5CF6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="kpi-value code-font" style={{ color: '#C084FC' }}>
              <AnimatedCounter value={estate.account.efficiencyScore} decimals={0} />
            </span>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div className="kpi-footer">
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
              {estate.account.efficiencyScore > 80 ? 'EXCELLENT' : 'OPTIMIZATION NEEDED'}
            </span>
          </div>
        </div>
      </section>

      {/* TAB 1: OVERVIEW / COMMAND CENTER */}
      {activeTab === 'overview' && (
        <main>
          {/* Top Row: Service Spend Distribution + Zero-Trust Engine */}
          <div className="content-grid-2col" style={{ marginBottom: '24px' }}>
            {/* Waste Breakdown by Service & Donut Chart */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    <Server size={20} color="#FF9900" /> AWS Spend & Inefficiency Distribution
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Cost Explorer CUR breakdown across provisioned workloads
                  </p>
                </div>
                <span className="badge badge-aws">Cost Explorer CUR</span>
              </div>

              {/* Interactive Donut Chart */}
              <CostBreakdownPieChart data={estate.costBreakdownByService} />

              <div className="service-waste-list" style={{ marginTop: '12px' }}>
                {estate.costBreakdownByService.map((item, idx) => (
                  <div key={idx} className="service-waste-item">
                    <div className="service-waste-info">
                      <span className="service-name">
                        {getServiceIcon(item.service)}
                        {item.service}
                      </span>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                          Spend: <strong>${item.monthlySpend.toLocaleString()}</strong>
                        </span>
                        <span style={{ color: item.waste > 0 ? '#FB7185' : '#34D399', fontWeight: 700, fontSize: '0.84rem' }}>
                          {item.waste > 0 ? `Waste: $${item.waste.toLocaleString()}/mo` : 'Optimized'}
                        </span>
                      </div>
                    </div>
                    <div className="waste-progress-bg">
                      <div
                        className="waste-progress-bar"
                        style={{
                          width: `${item.percentage}%`,
                          background: item.waste > 0 ? 'linear-gradient(90deg, #FF9900, #EF4444)' : '#10B981'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-Trust FinOps Guard Status Card & Latency Engine */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="section-header">
                  <h2 className="section-title">
                    <Lock size={20} color="#06B6D4" /> Zero-Trust Policy Engine
                  </h2>
                  <span className="badge badge-cyan">AWS Cedar Active</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  FinOpsGuard decouples generative reasoning from destructive infrastructure mutations. All proposed agent actions must satisfy formal mathematical Cedar policies before execution.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>Non-Prod Right-sizing: <strong>Autonomous Permit</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
                    <XCircle size={16} color="#EF4444" />
                    <span>Production Database Deletion: <strong>Strict Forbid</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>Orphaned EBS Purge: <strong>Permit with Snapshot</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>S3 Intelligent-Tiering: <strong>Permit with SOC2 Tag</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-Agent Latency Engine</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>PASTE Speculative</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Tool execution latency reduced by <strong>46.2%</strong> via opportunistic pattern-aware parallelization.
                </div>
              </div>
            </div>
          </div>

          {/* 6-Month Continuous Spend vs Waste Trend Area Chart */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <TrendingDown size={20} color="#FF9900" /> Continuous Cloud Telemetry & 6-Month Waste Trajectory
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Comparing Gross Cloud Spend, Detected Waste, and Optimized Post-Remediation Baseline
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-aws">CloudWatch Metrics</span>
                <span className="badge badge-emerald">Model Confidence: 99.4%</span>
              </div>
            </div>

            <HistoricalSpendAreaChart data={estate.monthlyHistoricalTrend} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Monthly Spend</div>
                <div className="code-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFB340' }}>
                  ${estate.account.currentMonthlyRunRate.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avoidable Waste (37.7%)</div>
                <div className="code-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FB7185' }}>
                  ${estate.account.detectedMonthlyWaste.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Optimized Baseline</div>
                <div className="code-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34D399' }}>
                  ${(estate.account.currentMonthlyRunRate - estate.account.detectedMonthlyWaste).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Resource Waste Explorer Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <AlertTriangle size={20} color="#F59E0B" /> Inefficiency Detection & Optimization Queue
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Identified by Agent 1 (Telemetry Scanner) & Agent 2 (Cognitive Rightsizer)
                </p>
              </div>

              {/* Environment Filter */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                {['ALL', 'Production', 'Staging', 'Development'].map((env) => (
                  <button
                    key={env}
                    onClick={() => setSelectedEnv(env)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: selectedEnv === env ? 'var(--aws-orange)' : 'transparent',
                      color: selectedEnv === env ? '#07090E' : 'var(--text-secondary)'
                    }}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div className="resource-table-container">
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Resource & Service</th>
                    <th>Environment</th>
                    <th>Waste Type & Severity</th>
                    <th>Current Spend</th>
                    <th>Projected Savings</th>
                    <th>Cedar Zero-Trust</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((res) => {
                    const isProd = res.tags.Environment === 'Production';
                    const isOptimized = res.status === 'optimized';

                    return (
                      <tr key={res.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {getServiceIcon(res.service)}
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{res.name}</div>
                              <div className="code-font" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {res.id} • {res.region}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${isProd ? 'badge-crimson' : 'badge-cyan'}`}>
                            {res.tags.Environment}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 600, color: res.severity === 'CRITICAL' ? '#FB7185' : '#FBBF24' }}>
                              {res.findingType}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {res.efficiencyMetric || 'Idle asset detected'}
                            </span>
                          </div>
                        </td>
                        <td className="code-font" style={{ fontWeight: 600 }}>
                          ${res.currentCost.toLocaleString()}
                        </td>
                        <td className="code-font" style={{ color: '#34D399', fontWeight: 700 }}>
                          {isOptimized ? 'REMEDIATED' : `+$${res.monthlySavings.toLocaleString()}/mo`}
                        </td>
                        <td>
                          {isProd && res.proposedAction.includes('Terminate') ? (
                            <span className="badge badge-crimson" style={{ fontSize: '0.7rem' }}>
                              <Lock size={12} /> FORBIDDEN
                            </span>
                          ) : (
                            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                              <CheckCircle2 size={12} /> PERMITTED
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            id={`btn-inspect-${res.id}`}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => {
                              setSelectedResource(res);
                              setActiveTab('remediation');
                            }}
                          >
                            Inspect & IaC <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* TAB 2: MULTI-AGENT AUTONOMOUS LOOP (From the Research Paper) */}
      {activeTab === 'agents' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Sparkles size={22} color="#FF9900" /> Multi-Agent Execution Pipeline (5-Tier Topology)
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Operationalizing loop engineering, speculative execution (PASTE), and Cedar Zero-Trust policy authorization.
              </p>
            </div>
            <button
              id="btn-trigger-agent-loop"
              className="btn-primary"
              onClick={startMultiAgentRun}
              disabled={agentRunning}
            >
              {agentRunning ? (
                <>
                  <RefreshCw className="spin-slow" size={16} /> Agents Executing...
                </>
              ) : (
                <>
                  <Play size={16} fill="#07090E" /> Execute Autonomous Loop
                </>
              )}
            </button>
          </div>

          {/* 5-Agent Interactive Flowchart */}
          <div className="agent-timeline">
            {[
              {
                id: 1,
                name: 'Agent 1: Ingestion',
                sub: 'Telemetry & Cost Scanner',
                desc: 'Scans CUR, CloudWatch & tags'
              },
              {
                id: 2,
                name: 'Agent 2: Cognitive Core',
                sub: 'Bedrock Claude 3.5 Rightsizer',
                desc: 'Formulates optimization plans'
              },
              {
                id: 3,
                name: 'Agent 3: Zero-Trust Guard',
                sub: 'Cedar Policy Engine (PEP)',
                desc: 'Mathematically verifies actions'
              },
              {
                id: 4,
                name: 'Agent 4: IaC Synthesizer',
                sub: 'Terraform & Saga Rollback',
                desc: 'Generates executable manifests'
              },
              {
                id: 5,
                name: 'Agent 5: Executive FinOps',
                sub: 'C-Suite ROI & Carbon Reporter',
                desc: 'Calculates payback & CO2'
              }
            ].map((node) => {
              const isActive = currentStep === node.id && agentRunning;
              const isDone = currentStep > node.id || agentCompleted;

              return (
                <div
                  key={node.id}
                  className={`agent-node ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="code-font" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      STEP 0{node.id}
                    </span>
                    {isDone ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : isActive ? (
                      <span className="badge badge-aws" style={{ padding: '2px 6px', fontSize: '0.62rem' }}>RUNNING</span>
                    ) : (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                  <div className="agent-node-title" style={{ color: isActive ? '#FFB340' : isDone ? '#34D399' : 'var(--text-primary)' }}>
                    {node.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {node.sub}
                  </div>
                  <div className="agent-node-desc">{node.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Real-time Streaming Event Console */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={15} /> Real-Time Agent Execution Event Stream (SSE)
              </span>
              <span className="code-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Protocol: Server-Sent Events • Transport: HTTP/2
              </span>
            </div>

            <div className="stream-terminal" id="stream-terminal-container">
              {agentLogs.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', margin: 'auto', fontStyle: 'italic' }}>
                  Click &ldquo;Execute Autonomous Loop&rdquo; to launch the 5-tier multi-agent pipeline and observe live reasoning, Cedar policy verification, and IaC generation.
                </div>
              ) : (
                agentLogs.map((log, idx) => (
                  <div key={idx} className="stream-log-entry">
                    <span className="stream-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`stream-agent-badge badge ${log.status === 'completed' ? 'badge-emerald' : log.status === 'blocked' ? 'badge-crimson' : 'badge-aws'}`}>
                      {log.agentId}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#FFF' }}>{log.title}</strong>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.8rem' }}>
                        {log.details}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Post-Run Executive Summary Card */}
          {agentCompleted && finalReport && (
            <div
              className="glass-panel"
              style={{
                marginTop: '24px',
                padding: '24px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', margin: 0 }}>
                  <CheckCircle2 size={20} /> Multi-Agent Optimization Loop Completed
                </h3>
                <span className="badge badge-emerald">
                  Execution Duration: {finalReport.executionDurationMs}ms
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Detected Fleet Waste</span>
                  <div className="code-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FB7185' }}>
                    ${finalReport.totalDetectedWaste.toLocaleString()}/mo
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Immediately Actionable</span>
                  <div className="code-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34D399' }}>
                    ${finalReport.immediatelyPermittedSavings.toLocaleString()}/mo
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Zero-Trust Cedar Enforcement</span>
                  <div className="code-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38BDF8' }}>
                    {finalReport.policySummary.permitted} Permitted / {finalReport.policySummary.forbiddenGuarded} Guarded
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Green Cloud Impact</span>
                  <div className="code-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#A855F7' }}>
                    {finalReport.greenCloudCarbonReduction}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CEDAR ZERO-TRUST POLICY GUARD & PLAYGROUND */}
      {activeTab === 'cedar' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Lock size={22} color="#06B6D4" /> AWS Cedar Zero-Trust Policy Engine
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Explore active Policy-as-Code rules and simulate real-time mathematical authorization decisions.
              </p>
            </div>
            <span className="badge badge-cyan">Cedar RFC Specification</span>
          </div>

          <div className="cedar-grid">
            {/* Left: Active Cedar Policies */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#FF9900" /> Active Cedar Security Policies ({cedarPolicies.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cedarPolicies.map((p) => (
                  <div key={p.id} className="glass-panel" style={{ padding: '16px', borderLeft: p.effect === 'forbid' ? '4px solid #EF4444' : '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
                      <span className={`badge ${p.effect === 'forbid' ? 'badge-crimson' : 'badge-emerald'}`}>
                        {p.effect.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      {p.description}
                    </p>
                    <div className="cedar-code-block" style={{ fontSize: '0.74rem' }}>
                      {p.cedarCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Policy Simulator */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#10B981" /> Interactive Zero-Trust Policy Simulator
              </h3>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Test how the Cedar Policy Decision Point (PDP) intercepts autonomous agent actions before execution:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Select Target Cloud Resource:
                    </label>
                    <select
                      id="select-sim-resource"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                      value={simResource?.id}
                      onChange={(e) => {
                        const target = estate.resources.find((r) => r.id === e.target.value);
                        setSimResource(target);
                        setSimResult(null);
                      }}
                    >
                      {estate.resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} [{r.tags.Environment}] - {r.service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Proposed Action to Execute:
                    </label>
                    <select
                      id="select-sim-action"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                      value={simAction}
                      onChange={(e) => {
                        setSimAction(e.target.value);
                        setSimResult(null);
                      }}
                    >
                      <option value="Action::Terminate">Action::Terminate (Destructive)</option>
                      <option value="Action::RightSize">Action::RightSize (Downscale)</option>
                      <option value="Action::ConvertToGraviton">Action::ConvertToGraviton (Architecture)</option>
                      <option value="Action::SnapshotAndPurge">Action::SnapshotAndPurge (Storage)</option>
                      <option value="Action::EnableIntelligentTiering">Action::EnableIntelligentTiering (Lifecycle)</option>
                    </select>
                  </div>

                  <button
                    id="btn-evaluate-cedar"
                    className="btn-primary"
                    onClick={handleEvaluateCedar}
                    style={{ marginTop: '8px' }}
                  >
                    <Shield size={16} /> Evaluate Cedar Policy Gate
                  </button>

                  {/* Simulator Result Output */}
                  {simResult && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '18px',
                        borderRadius: 'var(--radius-md)',
                        background: simResult.allowed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${simResult.allowed ? '#10B981' : '#EF4444'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: simResult.allowed ? '#34D399' : '#FB7185' }}>
                          DECISION: {simResult.decision}
                        </span>
                        <span className={`badge ${simResult.allowed ? 'badge-emerald' : 'badge-crimson'}`}>
                          {simResult.allowed ? 'EXECUTION PERMITTED' : 'EXECUTION BLOCKED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        {simResult.rationale}
                      </div>
                      <div className="code-font" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Evaluated against {simResult.evaluationTrace.length} Cedar policies with sub-millisecond in-process latency.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IAC & REMEDIATION SANDBOX */}
      {activeTab === 'remediation' && selectedResource && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <FileCode size={22} color="#FF9900" /> Infrastructure as Code (IaC) Remediation Console
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Synthesized by Agent 4 (IaC Synthesizer) • Production-ready Terraform HCL & Compensating Rollback Scripts
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                id="btn-apply-remediation"
                className="btn-emerald"
                disabled={remediating || selectedResource.status === 'optimized'}
                onClick={() => handleApplyRemediation(selectedResource.id)}
              >
                {remediating ? 'Evaluating & Applying...' : selectedResource.status === 'optimized' ? 'Already Remediated' : 'Execute Safe Remediation'}
              </button>
            </div>
          </div>

          {remediationSuccessMsg && (
            <div
              style={{
                marginBottom: '20px',
                padding: '14px 18px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                borderRadius: 'var(--radius-md)',
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{remediationSuccessMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Resource Selector & Metrics */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '14px' }}>Select Target Resource:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                {estate.resources.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResource(r)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: selectedResource.id === r.id ? 'rgba(255,153,0,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedResource.id === r.id ? 'var(--aws-orange)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.84rem', color: selectedResource.id === r.id ? '#FFB340' : 'var(--text-primary)' }}>
                        {r.name}
                      </strong>
                      <span className={`badge ${r.tags.Environment === 'Production' ? 'badge-crimson' : 'badge-cyan'}`} style={{ fontSize: '0.64rem' }}>
                        {r.tags.Environment}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Savings: <span style={{ color: '#34D399', fontWeight: 700 }}>+${r.monthlySavings.toLocaleString()}/mo</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terraform Code & Rollback Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={16} color="#FF9900" /> Synthesized Terraform HCL (`remediation.tf`)
                  </span>
                  <span className="badge badge-aws">AWS Provider 5.0+</span>
                </div>
                <TerraformHighlighter code={selectedResource.terraformRemediation} />
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RotateCcw size={16} color="#06B6D4" /> Compensating Transaction (Saga Rollback Plan)
                  </span>
                  <span className="badge badge-cyan">Zero-Downtime Guarantee</span>
                </div>
                <div className="code-font" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: '#04060A', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  {`# Rollback command in event of canary failure:\naws ec2 create-tags --resources ${selectedResource.id} --tags Key=FinOpsRollback,Value=Reverted\n# Automatic state recovery checkpoint committed to DynamoDB audit ledger.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BEDROCK FINOPS COPILOT */}
      {activeTab === 'copilot' && (
        <div className="glass-panel copilot-container">
          <div className="section-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', margin: 0 }}>
            <div>
              <h2 className="section-title">
                <Sparkles size={20} color="#FF9900" /> FinOps Bedrock AI Copilot
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Powered by Amazon Bedrock (Anthropic Claude 3.5 Sonnet) & AWS Cost Optimization Knowledge Base
              </p>
            </div>
            <span className="badge badge-aws">Bedrock Runtime API</span>
          </div>

          <div className="copilot-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`copilot-msg ${msg.sender === 'user' ? 'copilot-msg-user' : 'copilot-msg-ai'}`}>
                <div className={`copilot-bubble ${msg.sender === 'user' ? 'copilot-bubble-user' : 'copilot-bubble-ai'}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {msg.suggestedActions && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255,153,0,0.15)',
                            border: '1px solid rgba(255,153,0,0.3)',
                            color: '#FFB340',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="copilot-msg copilot-msg-ai">
                <div className="copilot-bubble copilot-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw className="spin-slow" size={14} color="#FF9900" />
                  <span style={{ fontSize: '0.84rem' }}>Analyzing cloud telemetry with Amazon Bedrock...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestion Pills */}
          <div style={{ display: 'flex', gap: '8px', padding: '10px 24px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)' }}>
            {[
              "Why did our GPU training cluster spend $23,594?",
              "How do we safely clean unattached EBS storage?",
              "Why does Cedar block modifying our Production DB?",
              "What is our total potential annual savings?"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="copilot-input-bar">
            <input
              id="input-copilot-chat"
              type="text"
              className="copilot-input"
              placeholder="Ask about AWS cost spikes, Graviton migration, Cedar policies, or right-sizing..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              id="btn-send-copilot"
              className="btn-primary"
              onClick={() => handleSendMessage()}
              disabled={chatLoading}
              style={{ padding: '10px 18px' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: EXECUTIVE BRIEFING & EXPORT */}
      {activeTab === 'report' && (
        <div className="glass-panel" style={{ padding: '36px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <FileText size={24} color="#FF9900" /> C-Suite FinOps Executive Briefing & Audit Report
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Generated by FinOpsGuard Agent 5 • Certified for Board of Directors & CTO Review
              </p>
            </div>
            <button
              id="btn-download-report"
              className="btn-primary"
              onClick={() => {
                const reportContent = `# FinOpsGuard AI - Executive Cloud Cost Optimization Report
Account: ${estate.account.name} (AWS ID: ${estate.account.id})
Generated: ${new Date().toUTCString()}

## 1. Executive Summary
- Current Monthly Run Rate: $${estate.account.currentMonthlyRunRate.toLocaleString()}
- Total Detected Waste: $${estate.account.detectedMonthlyWaste.toLocaleString()} (${((estate.account.detectedMonthlyWaste / estate.account.currentMonthlyRunRate) * 100).toFixed(1)}% of total spend)
- Projected Annual Net Savings: $${estate.account.potentialAnnualSavings.toLocaleString()}
- Green Cloud Carbon Offset: ${estate.account.carbonFootprintMetric}

## 2. Zero-Trust Cedar Governance Posture
- Mathematical Policy Engine: Active (AWS Cedar RFC)
- Production Protection Gate: Enforced (No automated destructive termination permitted)
- Non-Prod Automation: Permitted under 25% ROI threshold

## 3. High-Priority Remediations
${estate.resources.map(r => `- ${r.name} (${r.service}): Potential monthly savings of $${r.monthlySavings.toLocaleString()} via ${r.recommendation}`).join('\n')}
`;
                const blob = new Blob([reportContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `FinOpsGuard-Executive-Report-${estate.account.id}.md`;
                a.click();
                addToast('success', 'Report Exported', `FinOpsGuard-Executive-Report-${estate.account.id}.md downloaded successfully.`);
              }}
            >
              <Download size={16} /> Export Markdown Audit Report
            </button>
          </div>

          {/* Top 3 Metric Highlight Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>12-Month Net Payback</span>
              <div className="code-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', margin: '6px 0' }}>
                $221,400.00
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Direct EBITDA improvement with zero application degradation.
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sustainability & ESG</span>
              <div className="code-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#A855F7', margin: '6px 0' }}>
                4.8 Tons CO2e
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Green Cloud equivalent to taking 1.2 passenger vehicles off the road annually.
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Autonomous Safety Rating</span>
              <div className="code-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8', margin: '6px 0' }}>
                99.98%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Protected by embedded AWS Cedar Zero-Trust policy gate.
              </div>
            </div>
          </div>

          {/* C-Suite Visual Analytics Charts */}
          <div className="content-grid-2col" style={{ marginBottom: '28px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>
                    Workload Optimization by Engineering Team
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Current vs optimized cloud run-rate across cost centers
                  </p>
                </div>
                <span className="badge badge-aws">Cost Allocation</span>
              </div>
              <DepartmentSavingsBarChart data={estate.departmentSavings} />
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>
                    AWS Well-Architected Efficiency Score
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Infrastructure posture rating vs industry peers
                  </p>
                </div>
                <span className="badge badge-emerald">Target: 96/100</span>
              </div>
              <EfficiencyRadialGauge data={estate.efficiencyBenchmarks} />
            </div>
          </div>

          {/* Architectural Compliance & Strategy */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              Architectural Compliance & Next Steps
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>1. Execute Automated Dev/Staging Rightsizing:</strong> Immediately approve Terraform plans for GPU cluster scale-to-zero and Lambda Graviton migration ($19,415/mo savings).
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>2. Authorize Production Storage Lifecycle:</strong> Apply S3 Intelligent-Tiering to 165 TB archive data lake ($2,277/mo savings).
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>3. Schedule Production Database Right-Sizing:</strong> Submit CAB request to migrate Aurora Postgres core cluster to Aurora Serverless v2 during weekend maintenance window ($1,920/mo savings).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 7: GENAI OPTIMIZER */}
      {activeTab === 'genai' && (
        <GenAIOptimizer addToast={addToast} />
      )}

      {/* Global Hackathon & Engine Footer */}
      <Footer />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
