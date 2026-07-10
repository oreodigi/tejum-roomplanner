'use client';

interface MobileProgressHeaderProps {
  current: number;
  total: number;
  label: string;
}

export function MobileProgressHeader({ current, total, label }: MobileProgressHeaderProps) {
  const progress = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  return (
    <div className="mobile-progress-header">
      <div><span>{label}</span><strong>{current}/{total}</strong></div>
      <div className="mobile-progress-header__track"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </div>
  );
}
