'use client';

import { IndianRupee, ShieldCheck } from 'lucide-react';
import { formatCompactCurrency, type VisualEstimate } from '@/lib/engines/visual-estimate-engine';

export function MobileEstimateCard({ estimate }: { estimate: VisualEstimate }) {
  return (
    <div className="mobile-estimate-card">
      <div className="mobile-estimate-card__icon"><IndianRupee /></div>
      <span>Preliminary range</span>
      <strong>{formatCompactCurrency(estimate.rangeLow)} – {formatCompactCurrency(estimate.rangeHigh)}</strong>
      <p><ShieldCheck /> Final quote after a site survey</p>
    </div>
  );
}
