import { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Testimonials } from '../components/Testimonials';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'Unspent | Turn Wishlist Regret into Savings',
  description: 'The social deinfluencing app that helps you save money. Add wishes, wait 72 hours, and let friends help you decide.',
  openGraph: {
    title: 'Unspent | Turn Wishlist Regret into Savings',
    description: 'The social deinfluencing app that helps you save money.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}