'use client'

import { CreateTabForm } from '@/components/create-tab-form'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12 fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 gradient-text">
            Tabby
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2 fade-in" style={{animationDelay: '0.1s'}}>
            The social IOU tracker for friend groups
          </p>
          <p className="text-sm md:text-base text-muted-foreground fade-in" style={{animationDelay: '0.2s'}}>
            Split expenses. Track balances. Settle up with style.
          </p>
        </div>

        <div className="flex justify-center mb-16 fade-in" style={{animationDelay: '0.3s'}}>
          <CreateTabForm />
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 px-4">
          <div className="text-center glass-card p-6 rounded-xl glow-hover fade-in" style={{animationDelay: '0.4s'}}>
            <div className="text-4xl mb-4 pulse-soft">📝</div>
            <h3 className="font-semibold mb-2 text-lg">Track IOUs</h3>
            <p className="text-sm text-muted-foreground">
              Add expenses and split them evenly or custom amounts
            </p>
          </div>
          <div className="text-center glass-card p-6 rounded-xl glow-hover fade-in" style={{animationDelay: '0.5s'}}>
            <div className="text-4xl mb-4 pulse-soft" style={{animationDelay: '0.5s'}}>⚖️</div>
            <h3 className="font-semibold mb-2 text-lg">Smart Balances</h3>
            <p className="text-sm text-muted-foreground">
              See who owes who with optimized settlement paths
            </p>
          </div>
          <div className="text-center glass-card p-6 rounded-xl glow-hover fade-in" style={{animationDelay: '0.6s'}}>
            <div className="text-4xl mb-4 pulse-soft" style={{animationDelay: '1s'}}>🎯</div>
            <h3 className="font-semibold mb-2 text-lg">AI Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Generate playful nudges to settle up with friends
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}