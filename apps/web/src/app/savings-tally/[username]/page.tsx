import type { Metadata } from 'next';
import { formatCurrency } from '@unspent/shared/utils';

type SavingsTallyPageProps = {
  params: {
    username: string;
  };
};

export function generateMetadata({ params }: SavingsTallyPageProps): Metadata {
  const username = decodeURIComponent(params.username);

  return {
    title: `@${username}'s Savings Tally`,
    description: `See how much @${username} has saved with Unspent.`,
    openGraph: {
      title: `@${username}'s Savings Tally`,
      description: `A public Unspent savings tally for @${username}.`,
      type: 'profile',
    },
  };
}

export default function SavingsTallyPage({ params }: SavingsTallyPageProps) {
  const username = decodeURIComponent(params.username);
  const placeholderSavedAmount = 0;

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <section className="mx-auto flex max-w-3xl flex-col gap-8 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark">
            Public savings tally
          </p>
          <h1 className="mt-3 text-4xl font-bold text-text md:text-5xl">
            @{username} is building an Unspent streak.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            This page is wired as the public profile shell. Live Supabase totals
            and item breakdowns will be connected in the MVP data phase.
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-8 shadow-md">
          <p className="text-sm font-medium text-text-secondary">
            Total saved so far
          </p>
          <p className="mt-3 text-6xl font-bold text-primary-dark">
            {formatCurrency(placeholderSavedAmount)}
          </p>
        </div>
      </section>
    </main>
  );
}
