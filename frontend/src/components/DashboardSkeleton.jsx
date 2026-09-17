import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="app-container" style={{ opacity: 0.85 }}>
      {/* Navbar skeleton */}
      <div style={{
        height: '76px',
        borderRadius: 'var(--radius-xl, 24px)',
        background: 'rgba(15, 22, 36, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="skeleton-box" style={{ width: 44, height: 44, borderRadius: 12 }} />
          <div>
            <div className="skeleton-box" style={{ width: 140, height: 20, marginBottom: 6, borderRadius: 4 }} />
            <div className="skeleton-box" style={{ width: 220, height: 12, borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton-box" style={{ width: 100, height: 36, borderRadius: 8 }} />
          <div className="skeleton-box" style={{ width: 160, height: 36, borderRadius: 8 }} />
        </div>
      </div>

      {/* KPI grid skeleton */}
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel" style={{ padding: '22px', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="skeleton-box" style={{ width: '60%', height: 14, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ width: 20, height: 20, borderRadius: 4 }} />
            </div>
            <div className="skeleton-box" style={{ width: '80%', height: 36, borderRadius: 6, marginBottom: '12px' }} />
            <div className="skeleton-box" style={{ width: '50%', height: 12, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="content-grid-2col" style={{ marginTop: '28px' }}>
        <div className="glass-panel" style={{ padding: '24px', minHeight: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div className="skeleton-box" style={{ width: 220, height: 22, borderRadius: 4 }} />
            <div className="skeleton-box" style={{ width: 80, height: 20, borderRadius: 12 }} />
          </div>
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div className="skeleton-box" style={{ width: '40%', height: 14, borderRadius: 4 }} />
                <div className="skeleton-box" style={{ width: '25%', height: 14, borderRadius: 4 }} />
              </div>
              <div className="skeleton-box" style={{ width: '100%', height: 8, borderRadius: 4 }} />
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: '24px', minHeight: '340px' }}>
          <div className="skeleton-box" style={{ width: 200, height: 22, marginBottom: '20px', borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: '90%', height: 14, marginBottom: '10px', borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: '75%', height: 14, marginBottom: '28px', borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: '100%', height: 160, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}
