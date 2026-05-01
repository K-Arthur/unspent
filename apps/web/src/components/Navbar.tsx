'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-accent">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-surface focus:text-text focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-primary"
      >
        Skip to content
      </a>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-text link-focus">
          Unspent
        </Link>
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-text-secondary hover:text-text link-focus transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-text-secondary hover:text-text link-focus transition-colors">
            How It Works
          </Link>
          <Link href="https://apps.apple.com" className="btn-primary" rel="noopener">
            Download
          </Link>
        </nav>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg link-focus"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <span className="text-2xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Mobile navigation"
        className="md:hidden border-t border-accent bg-surface px-4 py-4 flex flex-col gap-4"
        style={{ display: mobileOpen ? 'flex' : 'none' }}
      >
          <Link href="#features" className="text-text-secondary hover:text-text link-focus py-2 transition-colors" onClick={() => setMobileOpen(false)}>
            Features
          </Link>
          <Link href="#how-it-works" className="text-text-secondary hover:text-text link-focus py-2 transition-colors" onClick={() => setMobileOpen(false)}>
            How It Works
          </Link>
          <Link href="https://apps.apple.com" className="btn-primary text-center" rel="noopener" onClick={() => setMobileOpen(false)}>
            Download
          </Link>
        </nav>
    </header>
  );
}