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
        <Link href="/" aria-label="Tejum home"><Home /></Link>
      )}
      <div><strong>TEJUM</strong><span>{title}</span></div>
      <ThemeToggle compact />
    </header>
  );
}
