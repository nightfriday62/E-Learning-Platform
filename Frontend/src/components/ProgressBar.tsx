import React from 'react';

type ProgressBarProps = {
  currentIndex: number;
  total: number;
};

export default function ProgressBar({ currentIndex, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(920px, 92%)',
        zIndex: 70,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, pointerEvents: 'auto' }}>
        <div style={{ color: '#fff', fontSize: 13 }}>Question {Math.min(total, Math.max(0, currentIndex + 1))} / {total || 0}</div>
        <div style={{ color: '#fff', fontSize: 13 }}>{percent}%</div>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 9999, overflow: 'hidden' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg,#f59e0b,#ef4444)',
            transition: 'width 220ms ease',
          }}
        />
      </div>
    </div>
  );
}
