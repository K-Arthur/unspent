const features = [
  {
    icon: '🎯',
    title: 'Add Your Wishes',
    description: 'Paste links or upload screenshots of items you want. Set a price and start the cooling-off timer.',
  },
  {
    icon: '⏰',
    title: '72-Hour Pause',
    description: 'Wait before purchasing. The impulse fades, and you get a clearer perspective on whether you really need it.',
  },
  {
    icon: '🗳️',
    title: 'Community Vote',
    description: 'Friends weigh in: Buy, Pass, or Dupe it. Majority rules help you make smarter decisions.',
  },
  {
    icon: '💰',
    title: 'Track Savings',
    description: 'Every item you dont buy adds to your savings tally. Share your wins and inspire others.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-text mb-4">
          How Unspent Works
        </h2>
        <p className="text-xl text-text-secondary text-center mb-16 max-w-3xl mx-auto">
          A simple habit that transforms your relationship with shopping
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="card text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
              <p className="text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}