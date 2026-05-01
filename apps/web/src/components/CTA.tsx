import Link from 'next/link';

export function CTA() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-primary/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-text mb-6">
          Ready to Start Saving?
        </h2>
        <p className="text-xl text-text-secondary mb-10">
          Join thousands of women making smarter purchasing decisions together
        </p>
        <Link
          href="https://apps.apple.com"
          className="btn-primary text-lg inline-block"
          rel="noopener"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}