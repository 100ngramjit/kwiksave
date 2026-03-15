import React, { useState, useEffect, useCallback } from 'react';

let _showToast = null;

export function useToast() {
  return _showToast;
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  useEffect(() => { _showToast = show; }, [show]);

  return (
    <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {toasts.map(({ id, msg, type }) => (
        <div key={id} style={{
          background: 'var(--card)',
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--border)",
          borderLeft: `4px solid ${type === 'success' ? '#27ae60' : 'var(--destructive)'}`,
          borderRadius: 'var(--radius)',
          padding: '16px 24px',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--foreground)',
          maxWidth: 340,
          animation: 'slideIn .4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-sans)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>{type === 'success' ? '✓' : '✕'}</span>
            {msg}
          </div>
        </div>
      ))}
    </div>
  );
}
