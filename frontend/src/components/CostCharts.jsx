import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';

const CHART_COLORS = [
  '#FF9900', // AWS Orange
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#38BDF8'  // Light Blue
];

/**
 * Custom glassmorphism Tooltip for Recharts
 */
const CustomChartTooltip = ({ active, payload, label, prefix = '$', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 22, 36, 0.94)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        fontSize: '0.8rem',
        color: '#F8FAFC'
      }}>
        {label && <div style={{ fontWeight: 700, marginBottom: '6px', color: '#FFB340' }}>{label}</div>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '3px 0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill }} />
            <span style={{ color: '#94A3B8' }}>{entry.name}:</span>
            <strong style={{ color: '#FFF' }}>
              {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{suffix}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * 1. Donut Pie Chart for AWS Service Spend
 */
export function CostBreakdownPieChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: item.service.replace('Amazon ', '').replace('AWS ', ''),
    value: item.monthlySpend,
    waste: item.waste,
    percentage: item.percentage
  }));

  const totalSpend = data.reduce((acc, curr) => acc + (curr.monthlySpend || 0), 0);

  return (
    <div style={{ width: '100%', height: 260, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomChartTooltip prefix="$" />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                stroke="rgba(7, 9, 14, 0.8)"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Centered Donut Total Label */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Monthly Total
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFB340', fontFamily: 'var(--font-mono)' }}>
          ${Math.round(totalSpend / 1000)}k
        </div>
      </div>
    </div>
  );
}

/**
 * 2. 6-Month Historical Spend & Waste Area Chart
 */
export function HistoricalSpendAreaChart({ data = [] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF9900" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FF9900" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickFormatter={(val) => `$${val / 1000}k`}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomChartTooltip prefix="$" />} />
          <Area
            type="monotone"
            dataKey="grossSpend"
            name="Gross Cloud Spend"
            stroke="#FF9900"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendGradient)"
          />
          <Area
            type="monotone"
            dataKey="detectedWaste"
            name="Detected Waste"
            stroke="#F43F5E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#wasteGradient)"
          />
          <Area
            type="monotone"
            dataKey="optimizedBaseline"
            name="Optimized Run-Rate"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#baselineGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * 3. Department Savings Realization Bar Chart (Executive Briefing)
 */
export function DepartmentSavingsBarChart({ data = [] }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="team"
            stroke="var(--text-muted)"
            fontSize={10.5}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickFormatter={(val) => `$${val / 1000}k`}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomChartTooltip prefix="$" />} />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem' }}
          />
          <Bar dataKey="currentSpend" name="Current Spend" fill="#64748B" radius={[4, 4, 0, 0]} />
          <Bar dataKey="targetSpend" name="Post-Optimization" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="savings" name="Net Monthly Savings" fill="#FF9900" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * 4. Efficiency Benchmark Radial Gauge (Executive Briefing)
 */
export function EfficiencyRadialGauge({ data = [] }) {
  return (
    <div style={{ width: '100%', height: 280, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="100%"
          barSize={14}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            label={{ position: 'insideStart', fill: '#FFF', fontSize: 10, fontWeight: 700 }}
            background={{ fill: 'rgba(255,255,255,0.04)' }}
            dataKey="score"
          />
          <Tooltip content={<CustomChartTooltip prefix="" suffix="/100" />} />
          <Legend
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: '0.78rem', color: '#94A3B8' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
