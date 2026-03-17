'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Large question bank — 6 questions per trait, 3 randomly picked each session
const QUESTION_BANK = {
  'Risk Tolerance': [
    'I prefer safe, predictable outcomes over exciting opportunities with potential downsides.',
    'I would quit a stable job to start my own business if I believed in the idea.',
    'I am comfortable making life-changing decisions with uncertain outcomes.',
    'I would invest a large portion of my savings in a high-risk, high-reward opportunity.',
    'I enjoy trying new things even when the outcome is completely unknown.',
    'When faced with a risky shortcut vs a safe long route, I usually take the shortcut.',
  ],
  'Logic vs Emotion': [
    'I make most decisions based on logical analysis rather than feelings.',
    'People tell me I am overly analytical and lack emotional intuition.',
    'I trust my gut feelings more than data when making important decisions.',
    'Before making a big decision, I always create a pros and cons list.',
    'I find it hard to make decisions when my emotions and logic point in different directions.',
    'I believe data and facts should always override personal feelings in decision-making.',
  ],
  'Social Dynamics': [
    'I gain energy from being around other people.',
    'I prefer small group interactions over large social gatherings.',
    'I am comfortable being the center of attention in a room full of strangers.',
    'After a long social event, I feel drained and need alone time to recharge.',
    'I find it easy to start conversations with people I have never met before.',
    'I would rather spend a Friday night at a party than at home reading a book.',
  ],
  'Leadership Style': [
    'I naturally take charge in group situations.',
    'I prefer to lead by consensus rather than making unilateral decisions.',
    'People look to me for direction and decision-making.',
    'I am comfortable giving critical feedback to someone even if it makes them uncomfortable.',
    'I would rather be the one setting the vision than executing someone else\'s plan.',
    'When a group is stuck, I am usually the first one to propose a solution.',
  ],
  'Financial Patterns': [
    'I prioritize saving money over experiencing life now.',
    'I enjoy spending money on experiences and material goods.',
    'I have a detailed budget and track my expenses carefully.',
    'I would rather buy something on EMI today than wait until I can afford it outright.',
    'I feel anxious when my savings account balance drops below a certain level.',
    'I believe money is meant to be enjoyed, not hoarded for the future.',
  ],
};

const TRAIT_NAMES = Object.keys(QUESTION_BANK) as Array<keyof typeof QUESTION_BANK>;

// Pick 3 random questions per trait — different every session
function buildRandomQuiz() {
  const questions: { trait: string; question: string; traitIndex: number }[] = [];
  TRAIT_NAMES.forEach((trait, traitIndex) => {
    const pool = [...QUESTION_BANK[trait]];
    // Fisher-Yates shuffle then take first 3
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    pool.slice(0, 3).forEach((question) => {
      questions.push({ trait, question, traitIndex });
    });
  });
  return questions;
}

export default function QuizPage() {
  const router = useRouter();

  // Build once per page load — different every time
  const QUIZ_QUESTIONS = useMemo(() => buildRandomQuiz(), []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(QUIZ_QUESTIONS.length).fill(50));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('userId') || 'user-' + Date.now();
      localStorage.setItem('userId', userId);
      localStorage.setItem('quizResponses', JSON.stringify(responses));

      const response = await fetch('/api/quiz-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, responses }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze quiz');
      }

      localStorage.setItem('personalityAnalysis', JSON.stringify({
        traits: data.traits,
        confidence: data.confidence,
        reasoning: data.reasoning,
        timestamp: new Date().toISOString(),
      }));

      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error analyzing quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const question = QUIZ_QUESTIONS[currentQuestion];
  const response = responses[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  // Group progress: which trait block are we in
  const traitProgress = TRAIT_NAMES.map((trait, i) => ({
    trait,
    active: question.traitIndex === i,
    done: question.traitIndex > i,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TwinMind
        </Link>
        <span className="text-foreground-secondary text-sm">
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </span>
      </nav>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-border">
        <div
          className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Trait Steps */}
      <div className="flex justify-center gap-2 px-6 py-3 border-b border-border">
        {traitProgress.map(({ trait, active, done }) => (
          <span
            key={trait}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${active
                ? 'bg-accent/20 border-accent text-accent font-semibold'
                : done
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-foreground-secondary'
              }`}
          >
            {trait.split(' ')[0]}
          </span>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Trait Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-primary/20 text-accent border border-accent/30 rounded-full text-sm font-medium">
              {question.trait}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 leading-tight">
            {question.question}
          </h2>

          {/* Scale Response */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-foreground-secondary">Strongly Disagree</span>
              <span className="text-2xl font-bold text-accent">{response}</span>
              <span className="text-foreground-secondary">Strongly Agree</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={response}
              onChange={(e) => handleResponse(parseInt(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
              style={{
                background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${response}%, var(--color-border) ${response}%, var(--color-border) 100%)`,
              }}
            />

            <div className="grid grid-cols-5 gap-2 mt-6">
              {[0, 25, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => handleResponse(val)}
                  className={`py-2 rounded font-medium transition text-sm ${response === val
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-border text-foreground hover:bg-border/80'
                    }`}
                >
                  {val === 0 ? 'No' : val === 50 ? 'Neutral' : val === 100 ? 'Yes' : val}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Previous
            </Button>

            {currentQuestion === QUIZ_QUESTIONS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                {isSubmitting ? 'Analyzing...' : 'Get Results'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
