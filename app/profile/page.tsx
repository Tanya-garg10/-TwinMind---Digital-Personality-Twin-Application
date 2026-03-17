'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PersonalityData {
  traits: { [key: string]: number };
  confidence: { [key: string]: number };
  reasoning: { [key: string]: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedUserId = localStorage.getItem('userId');
        const savedAnalysis = localStorage.getItem('personalityAnalysis');

        if (!savedUserId || !savedAnalysis) {
          console.log('[v0] No profile data found, redirecting to quiz');
          router.push('/quiz');
          return;
        }

        setUserId(savedUserId);
        setPersonalityData(JSON.parse(savedAnalysis));
      } catch (error) {
        console.error('[v0] Error loading profile:', error);
        router.push('/quiz');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleRetakeQuiz = () => {
    localStorage.removeItem('quizResponses');
    localStorage.removeItem('personalityAnalysis');
    localStorage.removeItem('userId');
    router.push('/quiz');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!personalityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TwinMind
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-foreground-secondary">No profile data found</p>
            <Button onClick={() => router.push('/quiz')} className="bg-accent hover:bg-accent/90">
              Take Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TwinMind
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Dashboard
            </Button>
          </Link>
          <Link href="/simulator">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
              Simulator
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Your Profile
            </h1>
            <p className="text-lg text-foreground-secondary">
              User ID: <span className="text-accent font-mono">{userId}</span>
            </p>
          </div>

          {/* Traits Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(personalityData.traits).map(([traitName, score]) => (
              <div key={traitName} className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-foreground">{traitName}</h3>
                    <span className="text-2xl font-bold text-accent">{Math.round(score)}</span>
                  </div>

                  {/* Score Bar */}
                  <div className="w-full h-3 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  {/* Confidence */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-secondary">Confidence:</span>
                    <span className="text-sm font-semibold text-primary">
                      {Math.round((personalityData.confidence[traitName] || 0.7) * 100)}%
                    </span>
                  </div>

                  {/* Reasoning */}
                  {personalityData.reasoning?.[traitName] && (
                    <p className="text-sm text-foreground-tertiary italic border-l-2 border-accent/30 pl-3">
                      "{personalityData.reasoning[traitName]}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">What's Next?</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/simulator" className="block">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg hover:border-primary/50 transition cursor-pointer">
                  <h3 className="font-semibold text-primary mb-2">Explore Scenarios</h3>
                  <p className="text-sm text-foreground-secondary">
                    See how different traits would change your decisions in real-world situations
                  </p>
                </div>
              </Link>

              <Link href="/dashboard" className="block">
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg hover:border-accent/50 transition cursor-pointer">
                  <h3 className="font-semibold text-accent mb-2">View Dashboard</h3>
                  <p className="text-sm text-foreground-secondary">
                    See detailed visualizations and insights about your personality profile
                  </p>
                </div>
              </Link>
            </div>

            <button
              onClick={handleRetakeQuiz}
              className="w-full mt-6 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-border/50 transition font-medium"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
