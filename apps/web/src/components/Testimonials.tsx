const testimonials = [
  {
    quote: "I saved $400 last month alone. The 72-hour wait is a game-changer!",
    name: "Sarah M.",
    role: "Unspent member since 2024",
  },
  {
    quote: "My friends help me see when I'm being influenced. So grateful for this app.",
    name: "Jessica K.",
    role: "Saved $1,200+",
  },
  {
    quote: "The share cards are so fun to post. My TikTok loves the savings updates!",
    name: "Alex R.",
    role: "Content creator",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-text mb-16">
          What Our Community Says
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="card">
              <p className="text-lg text-text mb-6">"{testimonial.quote}"</p>
              <div className="border-t border-accent pt-4">
                <p className="font-semibold text-text">{testimonial.name}</p>
                <p className="text-sm text-text-secondary">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}