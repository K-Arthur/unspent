import Link from 'next/link';

export function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-8">
          <span className="text-xl">🎉</span>
          <span className="text-sm font-medium text-text">Now Available on TestFlight</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-text mb-6 leading-tight">
          Turn Wishlist Regret{'\n'}
          <span className="text-primary">into Savings</span>
        </h1>
        
        <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
          The social deinfluencing app that helps you save money. Add items you want, 
          wait 72 hours, and let friends vote: Buy, Pass, or Dupe it.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="https://apps.apple.com" className="btn-primary text-lg px-8">
            Download on App Store
          </Link>
          <Link href="#how-it-works" className="btn-secondary text-lg px-8">
            Learn More
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-text-secondary">
          Join XX,XXX+ women saving together
        </p>
      </div>
    </section>
  );
}