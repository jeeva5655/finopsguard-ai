import React from 'react';
import { AlertOctagon, RotateCcw, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FinOpsGuard Intercepted Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-dark, #07090E)',
          color: 'var(--text-primary, #F8FAFC)',
          fontFamily: 'var(--font-main, sans-serif)'
        }}>
          <div style={{
            maxWidth: '640px',
            width: '100%',
            background: 'rgba(244, 63, 94, 0.05)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px',
            padding: '36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#F43F5E'
            }}>
              <ShieldAlert size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>
              FinOpsGuard Intercepted An Error
            </h2>
            <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.9rem', marginBottom: '20px' }}>
              The Zero-Trust isolation perimeter caught an unhandled UI exception. Cloud infrastructure state remains safe and unmutated.
            </p>

            {this.state.error && (
              <pre style={{
                background: '#04060A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '0.8rem',
                color: '#FB7185',
                overflowX: 'auto',
                marginBottom: '24px',
                fontFamily: 'var(--font-mono, monospace)'
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF9900 0%, #EA580C 100%)',
                color: '#07090E',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255, 153, 0, 0.3)'
              }}
            >
              <RotateCcw size={16} /> Reload & Restore FinOps State
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
