import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-accent">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-text">
          Unspent
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-text-secondary hover:text-text transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-text-secondary hover:text-text transition-colors">
            How It Works
          </Link>
          <Link href="https://apps.apple.com" className="btn-primary">
            Download
          </Link>
        </div>
      </div>
    </nav>
  );
}