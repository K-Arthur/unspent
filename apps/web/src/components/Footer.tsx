import Link from 'next/link';

export function Footer() {
  const links = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Download', href: 'https://apps.apple.com' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Guidelines', href: '/guidelines' },
    ],
  };

  return (
    <footer className="bg-surface border-t border-accent py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="text-2xl font-bold text-text">
              Unspent
            </Link>
            <p className="text-text-secondary mt-2">
              Pinterest meets Robinhood for the deinfluencing generation.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-text mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-text-secondary hover:text-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-text mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-text-secondary hover:text-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-text-secondary hover:text-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-accent pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            © 2024 Unspent. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" className="text-text-secondary hover:text-text transition-colors">
              𝕏
            </a>
            <a href="https://instagram.com" className="text-text-secondary hover:text-text transition-colors">
              📷
            </a>
            <a href="https://tiktok.com" className="text-text-secondary hover:text-text transition-colors">
              🎵
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}