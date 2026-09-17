import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        let borderCol = 'rgba(255, 153, 0, 0.4)';
        let bgCol = 'rgba(15, 22, 36, 0.95)';
        let icon = <Info size={18} color="#FF9900" />;

        if (toast.type === 'success') {
          borderCol = 'rgba(16, 185, 129, 0.4)';
          icon = <CheckCircle2 size={18} color="#10B981" />;
        } else if (toast.type === 'error' || toast.type === 'forbid') {
          borderCol = 'rgba(244, 63, 94, 0.4)';
          icon = <XCircle size={18} color="#F43F5E" />;
        } else if (toast.type === 'warning') {
          borderCol = 'rgba(245, 158, 11, 0.4)';
          icon = <AlertTriangle size={18} color="#F59E0B" />;
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              background: bgCol,
              border: `1px solid ${borderCol}`,
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(16px)',
              animation: 'slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              color: '#F8FAFC'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '2px' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', wordBreak: 'break-word', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
