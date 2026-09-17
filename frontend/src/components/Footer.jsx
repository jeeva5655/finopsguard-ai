import React from 'react';
import { Shield, ExternalLink, GitBranch, Award, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: '48px',
      padding: '32px 0 16px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      color: 'var(--text-secondary, #94A3B8)',
      fontSize: '0.82rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Left Column: Brand & Hackathon */}
        <div style={{ maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #FF9900 0%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#07090E'
            }}>
              <Shield size={14} strokeWidth={2.4} />
            </div>
            <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>
              FinOps<span style={{ color: 'var(--aws-orange, #FF9900)' }}>Guard</span> AI
            </strong>
          </div>
          <p style={{ lineHeight: 1.5, color: 'var(--text-muted, #64748B)', fontSize: '0.78rem' }}>
            Autonomous multi-agent cloud cost optimization & Zero-Trust AWS FinOps governance platform. Built for the{' '}
            <span style={{ color: '#FFB340', fontWeight: 600 }}>WeMakeDevs & AWS &ldquo;First Commit&rdquo; Hackathon</span> (Bharat Builds Tour 2026).
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <span className="badge badge-aws" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
              <Award size={11} /> Track: Ship It
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
              <Award size={11} /> Target: Best UI
            </span>
          </div>
        </div>

        {/* Center Column: Live Status */}
        <div>
          <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '10px', fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Engine Runtime Health
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>Multi-Agent SSE Stream: <strong>Active (5 Tiers)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>AWS Cedar PDP/PEP: <strong>Default-Deny Enforced</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>Amazon Bedrock Runtime: <strong>Claude 3.5 Sonnet</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Links & Source */}
        <div>
          <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '10px', fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Artifacts & Open Source
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
            <a
              href="https://github.com/jeeva5655/finopsguard-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary, #94A3B8)',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFB340'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <GitBranch size={14} /> GitHub: jeeva5655/finopsguard-ai <ExternalLink size={11} />
            </a>
            <span style={{ color: 'var(--text-muted, #64748B)' }}>
              License: <strong style={{ color: '#F8FAFC' }}>MIT Open Source</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Hackathon Note */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.74rem',
        color: 'var(--text-muted, #64748B)'
      }}>
        <div>
          &copy; 2026 FinOpsGuard AI Team • Built with AWS Well-Architected Framework & Cedar Zero-Trust Engine
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>React 19 + Vite 8</span>
          <span>Amazon Bedrock</span>
          <span>AWS Cedar PDP</span>
          <span>Terraform HCL</span>
        </div>
      </div>
    </footer>
  );
}
