'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TwinMind
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-foreground-secondary hover:text-foreground transition">
            Sign In
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Discover Your <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Digital Twin</span>
          </h1>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
            AI-powered personality analysis that reveals how you think, make decisions, and interact with the world. Unlock insights about yourself and explore who you could become.
          </p>
        </div>

        <div className="flex gap-4 mb-16">
          <Link href="/quiz">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
              Start Quiz
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 font-semibold px-8">
            Learn More
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 w-full mt-20">
          <div className="bg-card border border-border rounded-lg p-6 text-left hover:border-accent/50 transition">
            <div className="text-accent text-2xl mb-4">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Instant Analysis</h3>
            <p className="text-foreground-secondary">
              Complete personality assessment in just minutes with our advanced AI model.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-left hover:border-accent/50 transition">
            <div className="text-accent text-2xl mb-4">🎯</div>
            <h3 className="font-semibold text-lg mb-2">5 Key Traits</h3>
            <p className="text-foreground-secondary">
              Risk tolerance, Logic vs Emotion, Social dynamics, Leadership style, Financial patterns.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-left hover:border-accent/50 transition">
            <div className="text-accent text-2xl mb-4">🔮</div>
            <h3 className="font-semibold text-lg mb-2">Simulate Scenarios</h3>
            <p className="text-foreground-secondary">
              Explore what-if scenarios and see how different traits would change your decisions.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="w-full mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">How It Works</h2>
          <p className="text-foreground-secondary text-center mb-16 max-w-xl mx-auto">
            Four steps from your responses to a fully calibrated digital personality twin.
          </p>

          {/* Steps */}
          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {[
              {
                num: '1',
                icon: '📋',
                label: 'Input',
                title: 'Quizzes & Scenarios',
                desc: 'User provides responses',
                tags: ['Text', 'Voice', 'Video', 'Social'],
                color: 'from-blue-500/20 to-blue-600/10',
                border: 'border-blue-500/30',
                tag_color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              },
              {
                num: '2',
                icon: '📊',
                label: 'Analyze',
                title: 'Behavioral Traits',
                desc: 'Multi-modal signal processing',
                tags: ['Text', 'Voice', 'Video', 'Social'],
                color: 'from-purple-500/20 to-purple-600/10',
                border: 'border-purple-500/30',
                tag_color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              },
              {
                num: '3',
                icon: '👤',
                label: 'Profile',
                title: 'Personality Model',
                desc: 'Scientific frameworks applied',
                tags: ['Big Five', 'MBTI', 'HEXACO'],
                color: 'from-cyan-500/20 to-cyan-600/10',
                border: 'border-cyan-500/30',
                tag_color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
              },
              {
                num: '4',
                icon: '🧠',
                label: 'Predict',
                title: 'Decision Engine',
                desc: 'Response prediction with confidence',
                tags: ['Prompt Aug', 'RAG', 'Finetuning'],
                color: 'from-accent/20 to-primary/10',
                border: 'border-accent/30',
                tag_color: 'bg-accent/10 text-accent border-accent/20',
              },
            ].map((step, i, arr) => (
              <div key={step.num} className="flex flex-col md:flex-row items-center flex-1">
                {/* Card */}
                <div className={`flex-1 w-full bg-gradient-to-br ${step.color} border ${step.border} rounded-2xl p-6 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <span className="text-xs text-foreground-secondary uppercase tracking-widest">{step.label}</span>
                      <h3 className="text-lg font-bold text-foreground leading-tight">{step.title}</h3>
                    </div>
                    <span className="ml-auto text-4xl font-black text-foreground/10">{step.num}</span>
                  </div>
                  <p className="text-sm text-foreground-secondary">{step.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {step.tags.map((tag) => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${step.tag_color}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow between steps */}
                {i < arr.length - 1 && (
                  <div className="flex items-center justify-center px-2 py-4 md:py-0 text-foreground-secondary text-xl shrink-0">
                    <span className="hidden md:block">→</span>
                    <span className="md:hidden">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final state */}
          <div className="mt-8 flex items-center justify-center gap-3 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-2xl px-8 py-5">
            <span className="text-2xl">✅</span>
            <div className="text-left">
              <p className="text-foreground font-semibold text-lg">Your Digital Personality Twin is Ready</p>
              <p className="text-foreground-secondary text-sm">Decision suggestion + Confidence score · Multi-modal: Text · Voice · Video · Behavioral data</p>
            </div>
            <Link href="/quiz" className="ml-auto shrink-0">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                Start Now →
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-8 mt-20 pt-20 border-t border-border w-full">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">10K+</div>
            <p className="text-foreground-secondary">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">95%</div>
            <p className="text-foreground-secondary">Accuracy Rate</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">50+</div>
            <p className="text-foreground-secondary">Daily Scenarios</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-foreground-secondary">
        <p>&copy; 2026 TwinMind. Powered by AI.</p>
      </footer>
    </div>
  );
}
