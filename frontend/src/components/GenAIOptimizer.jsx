import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  Database,
  FileText,
  Layers,
  TrendingDown,
  Activity,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  DollarSign,
  Cpu,
  Eye,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import AnimatedCounter from './AnimatedCounter.jsx';

// ── Icon mapping for optimization strategies ─────────────────────────────
const STRATEGY_ICONS = {
  Zap: Zap,
  Database: Database,
  FileText: FileText,
  Layers: Layers,
};

const IMPACT_COLORS = {
  high: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#34D399' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FBBF24' },
  low: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', text: '#818CF8' },
};

// ── Custom Recharts Tooltip ─────────────────────────────────────────────
function GenAITooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15, 15, 25, 0.95)',
      border: '1px solid rgba(139, 92, 246, 0.4)',
      borderRadius: '10px',
      padding: '12px 16px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
    }}>
      <p style={{ color: '#C084FC', fontWeight: 600, margin: '0 0 8px', fontSize: '0.8rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontSize: '0.75rem' }}>
          {p.name}: <strong>${typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function GenAIOptimizer({ addToast }) {
  const [usageData, setUsageData] = useState(null);
  const [antigravityData, setAntigravityData] = useState(null);
  const [optimizations, setOptimizations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [expandedOpt, setExpandedOpt] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usageRes, agiRes] = await Promise.all([
        fetch('/api/genai/usage'),
        fetch('/api/genai/antigravity'),
      ]);
      const usage = await usageRes.json();
      const agi = await agiRes.json();
      setUsageData(usage);
      setAntigravityData(agi);
      if (usage.optimizations) setOptimizations(usage.optimizations);
    } catch (err) {
      console.error('GenAI fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const runOptimizer = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/genai/optimize', { method: 'POST' });
      const data = await res.json();
      setOptimizations(data);
      addToast?.('success', 'GenAI Optimizer Complete', `Projected savings: $${data.totalProjectedSavings?.toFixed(2)}/month`);
    } catch (err) {
      addToast?.('error', 'Optimizer Failed', err.message);
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Brain size={48} style={{ color: '#A78BFA', animation: 'pulse-animation 1.5s ease-in-out infinite' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading GenAI Analytics...</p>
        </div>
      </div>
    );
  }

  const usage = usageData?.usage;
  const monthlyTotals = usage?.monthlyTotals || {};
  const agiSessions = antigravityData?.sessions || [];
  const agiAggregate = antigravityData?.aggregate || {};

  // Prepare chart data: daily spend by model (last 14 days for readability)
  const dailyChartData = (usage?.dailyUsage || []).slice(-14).map(day => {
    const entry = { date: day.date.slice(5) }; // MM-DD
    for (const [model, data] of Object.entries(day.models)) {
      const pricing = usageData?.pricing?.[model];
      if (pricing) {
        entry[model] = parseFloat(
          ((data.inputTokens / 1_000_000) * pricing.input + (data.outputTokens / 1_000_000) * pricing.output).toFixed(2)
        );
      }
    }
    return entry;
  });

  // Model pie data
  const pieData = Object.entries(monthlyTotals).map(([key, val]) => ({
    name: val.displayName,
    value: parseFloat(val.cost.toFixed(2)),
    color: val.color,
  })).sort((a, b) => b.value - a.value);

  return (
    <main className="genai-optimizer-container">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#E0E0E0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={24} color="#A78BFA" />
            GenAI Cost Intelligence Engine
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Multi-model LLM spend analytics • Antigravity IDE integration • Optimization recommendations
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={runOptimizer}
          disabled={scanning}
          style={{
            background: scanning ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {scanning ? <RefreshCw size={16} className="spin-animation" /> : <Sparkles size={16} />}
          {scanning ? 'Analyzing...' : 'Run Full Optimization'}
        </button>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <section className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-panel kpi-card" style={{ borderTop: '3px solid #A78BFA' }}>
          <div className="kpi-header">
            <span className="kpi-label">Total GenAI Spend</span>
            <DollarSign size={18} color="#A78BFA" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#C084FC' }}>
            <AnimatedCounter value={usage?.totalMonthlyCost || 0} prefix="$" decimals={2} />
          </div>
          <div className="kpi-footer">
            <span>{usage?.activeModels || 0} Active Models</span> • <span>30-day period</span>
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderTop: '3px solid #10B981' }}>
          <div className="kpi-header">
            <span className="kpi-label">Projected Savings</span>
            <TrendingDown size={18} color="#10B981" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#34D399' }}>
            <AnimatedCounter value={optimizations?.totalProjectedSavings || 0} prefix="$" decimals={2} />
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#10B981', fontWeight: 700 }}>{optimizations?.savingsPercent || 0}%</span> cost reduction possible
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderTop: '3px solid #06B6D4' }}>
          <div className="kpi-header">
            <span className="kpi-label">Antigravity Sessions</span>
            <Activity size={18} color="#06B6D4" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#22D3EE' }}>
            <AnimatedCounter value={agiAggregate.sessionCount || 0} decimals={0} />
          </div>
          <div className="kpi-footer">
            <span>{(agiAggregate.totalTokens || 0).toLocaleString()} est. tokens</span>
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderTop: '3px solid #FF9900' }}>
          <div className="kpi-header">
            <span className="kpi-label">Live Session Cost</span>
            <Cpu size={18} color="#FF9900" />
          </div>
          <div className="kpi-value code-font" style={{ color: '#FFB340' }}>
            <AnimatedCounter value={agiAggregate.totalCost || 0} prefix="$" decimals={4} />
          </div>
          <div className="kpi-footer">
            <span>Avg: ${(agiAggregate.averageCostPerSession || 0).toFixed(4)}/session</span>
          </div>
        </div>
      </section>

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <div className="content-grid-2col" style={{ marginBottom: '24px' }}>
        {/* Daily Spend Stacked Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#E0E0E0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#A78BFA" />
            Daily LLM Spend (Last 14 Days)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#8B8B9E', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8B8B9E', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<GenAITooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#A0A0B8' }} />
              {Object.entries(usageData?.pricing || {}).map(([key, pricing]) => (
                <Bar key={key} dataKey={key} stackId="cost" fill={pricing.color} name={pricing.displayName} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model Cost Distribution Pie */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#E0E0E0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="#A78BFA" />
            Model Cost Distribution (Monthly)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={2}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<GenAITooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#A0A0B8' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: '-40px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#C084FC', fontFamily: 'var(--font-mono)' }}>
              ${(usage?.totalMonthlyCost || 0).toFixed(2)}
            </span>
            <br />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Monthly</span>
          </div>
        </div>
      </div>

      {/* ── Optimization Recommendations ───────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#E0E0E0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#10B981" />
            Optimization Recommendations
          </h3>
          {optimizations && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total projected savings:</span>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ${optimizations.totalProjectedSavings?.toFixed(2)}/mo
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {(optimizations?.optimizations || []).map((opt, idx) => {
            const IconComp = STRATEGY_ICONS[opt.icon] || Zap;
            const impactStyle = IMPACT_COLORS[opt.impact] || IMPACT_COLORS.medium;
            const isExpanded = expandedOpt === opt.id;

            return (
              <div key={opt.id} style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: `1px solid ${isExpanded ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}>
                <div
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto auto auto',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                  onClick={() => setExpandedOpt(isExpanded ? null : opt.id)}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '10px',
                    background: impactStyle.bg,
                    border: `1px solid ${impactStyle.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconComp size={20} color={impactStyle.text} />
                  </div>

                  <div>
                    <div style={{ color: '#E0E0E0', fontWeight: 600, fontSize: '0.9rem' }}>{opt.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{opt.description}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Current</div>
                    <div style={{ color: '#F43F5E', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem' }}>
                      ${opt.currentCost?.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Optimized</div>
                      <div style={{ color: '#10B981', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem' }}>
                        ${opt.optimizedCost?.toFixed(2)}
                      </div>
                    </div>
                    <span className="badge" style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34D399',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      -{opt.savingsPercent}%
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    padding: '0 20px 16px',
                    borderTop: '1px solid rgba(139, 92, 246, 0.15)',
                    paddingTop: '16px',
                    animation: 'slideInUp 0.25s ease-out',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>Monthly Savings</div>
                        <div style={{ color: '#34D399', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>
                          ${opt.savings?.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>Impact Level</div>
                        <span className="badge" style={{ background: impactStyle.bg, color: impactStyle.text, padding: '4px 10px', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                          {opt.impact}
                        </span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>Effort</div>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', padding: '4px 10px', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                          {opt.effort}
                        </span>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                      <div style={{ color: '#A78BFA', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>💡 Implementation Strategy</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>{opt.strategy}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Antigravity Live Session Monitor ────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px', color: '#E0E0E0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={18} color="#06B6D4" />
          Antigravity IDE — Live Session Analytics
          <span className="badge badge-aws pulse-animation" style={{ padding: '3px 10px', fontSize: '0.65rem', marginLeft: '8px' }}>LIVE</span>
        </h3>

        {agiSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <Brain size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No Antigravity transcripts detected.</p>
            <p style={{ fontSize: '0.8rem' }}>Start a coding session with Antigravity IDE to see real-time token analytics here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Steps</th>
                  <th>User Msgs</th>
                  <th>Model Responses</th>
                  <th>Tool Calls</th>
                  <th>Est. Tokens</th>
                  <th>Est. Cost</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {agiSessions.map(session => (
                  <tr key={session.conversationId}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#A78BFA' }}>
                        {session.conversationId.slice(0, 8)}...
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{session.stepCount}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{session.userMessages}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{session.modelResponses}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{session.toolCallCount}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#22D3EE' }}>
                      {session.totalEstimatedTokens?.toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#34D399', fontWeight: 600 }}>
                      ${session.totalCost?.toFixed(4)}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(session.lastModified).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Aggregate footer */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px 16px', borderRadius: '8px', flex: 1, minWidth: '180px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total Estimated Tokens</div>
                <div style={{ color: '#C084FC', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
                  {(agiAggregate.totalTokens || 0).toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 16px', borderRadius: '8px', flex: 1, minWidth: '180px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total Estimated Cost</div>
                <div style={{ color: '#34D399', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
                  ${(agiAggregate.totalCost || 0).toFixed(4)}
                </div>
              </div>
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px 16px', borderRadius: '8px', flex: 1, minWidth: '180px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Sessions Analyzed</div>
                <div style={{ color: '#22D3EE', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
                  {agiAggregate.sessionCount || 0}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 153, 0, 0.1)', padding: '10px 16px', borderRadius: '8px', flex: 1, minWidth: '180px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Avg Cost/Session</div>
                <div style={{ color: '#FFB340', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
                  ${(agiAggregate.averageCostPerSession || 0).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
