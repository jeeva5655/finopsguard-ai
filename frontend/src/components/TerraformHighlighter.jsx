import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function TerraformHighlighter({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code ? code.split('\n') : [];

  const highlightLine = (line) => {
    // 1. Comment line
    const commentMatch = line.match(/^(\s*)(#.*)$/);
    if (commentMatch) {
      return (
        <>
          <span>{commentMatch[1]}</span>
          <span style={{ color: '#64748B', fontStyle: 'italic' }}>{commentMatch[2]}</span>
        </>
      );
    }

    // Tokenize parts
    const tokens = [];
    // Regex for HCL patterns
    const regex = /(\s+|"[^"]*"|#.*|\b(?:resource|variable|locals|output|provider|module|data|true|false|null)\b|\b\d+\b|[={}[\]:,])/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const text = line.slice(lastIndex, match.index);
        tokens.push({ text, type: 'plain' });
      }

      const matchText = match[0];
      let type = 'plain';

      if (matchText.startsWith('#')) {
        type = 'comment';
      } else if (matchText.startsWith('"')) {
        type = 'string';
      } else if (/^(resource|variable|locals|output|provider|module|data)$/.test(matchText)) {
        type = 'keyword';
      } else if (/^(true|false|null)$/.test(matchText)) {
        type = 'boolean';
      } else if (/^\d+$/.test(matchText)) {
        type = 'number';
      } else if (/^[={}[\]:,]$/.test(matchText)) {
        type = 'punctuation';
      }

      tokens.push({ text: matchText, type });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push({ text: line.slice(lastIndex), type: 'plain' });
    }

    return (
      <>
        {tokens.map((token, i) => {
          let color = '#E2E8F0';
          let fontWeight = 400;

          if (token.type === 'comment') {
            color = '#64748B';
          } else if (token.type === 'keyword') {
            color = '#FF9900';
            fontWeight = 600;
          } else if (token.type === 'string') {
            color = '#34D399';
          } else if (token.type === 'number') {
            color = '#A78BFA';
            fontWeight = 600;
          } else if (token.type === 'boolean') {
            color = '#38BDF8';
            fontWeight = 600;
          } else if (token.type === 'punctuation') {
            color = '#94A3B8';
          }

          return (
            <span key={i} style={{ color, fontWeight }}>
              {token.text}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div style={{
      position: 'relative',
      background: '#04060A',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--radius-md, 12px)',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '0.82rem',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)'
    }}>
      {/* Code Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            HCL / TERRAFORM 1.8+
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${copied ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
            color: copied ? '#34D399' : 'var(--text-secondary)',
            fontSize: '0.72rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Copy HCL to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied!
            </>
          ) : (
            <>
              <Copy size={12} /> Copy Manifest
            </>
          )}
        </button>
      </div>

      {/* Code Lines with Line Numbers */}
      <div style={{
        padding: '16px 0',
        overflowX: 'auto',
        lineHeight: 1.6
      }}>
        {lines.map((line, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              padding: '0 16px',
              transition: 'background 0.1s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: '32px',
              minWidth: '32px',
              textAlign: 'right',
              paddingRight: '16px',
              color: '#475569',
              userSelect: 'none',
              fontSize: '0.75rem'
            }}>
              {idx + 1}
            </span>
            <span style={{ flex: 1, whiteSpace: 'pre' }}>
              {highlightLine(line)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
