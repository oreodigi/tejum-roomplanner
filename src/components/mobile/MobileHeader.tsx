'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
}

export function MobileHeader({ title, onBack }: MobileHeaderProps) {
  return (
    <header className="mobile-app-header">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Go back"><ArrowLeft /></button>
      ) : (
        <Link href="/" aria-label="Tejum home">
          <img src="/tejum-landing/images/tejum-logo.png" alt="Tejum" className="h-6 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
        </Link>
      )}
      <div><strong>TEJUM</strong><span>{title}</span></div>
      <ThemeToggle compact />
    </header>
  );
}
