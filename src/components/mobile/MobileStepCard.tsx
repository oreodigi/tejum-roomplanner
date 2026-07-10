'use client';

export function MobileStepCard({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return <section className="mobile-step-card">{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2>{children}</section>;
}
