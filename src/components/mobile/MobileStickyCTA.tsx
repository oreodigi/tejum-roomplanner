'use client';

import { ArrowRight, Loader2 } from 'lucide-react';

interface MobileStickyCTAProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function MobileStickyCTA({ label, onClick, disabled, loading, secondaryLabel, onSecondary }: MobileStickyCTAProps) {
  return (
    <div className="mobile-sticky-cta">
      {secondaryLabel && onSecondary && <button type="button" className="mobile-sticky-cta__secondary" onClick={onSecondary}>{secondaryLabel}</button>}
      <button type="button" className="mobile-sticky-cta__primary" onClick={onClick} disabled={disabled || loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}<span>{label}</span>{!loading && <ArrowRight />}
      </button>
    </div>
  );
}
