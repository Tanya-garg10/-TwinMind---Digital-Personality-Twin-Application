'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Feature 6: PDF Report Generator using Canvas API (no external deps)
function generatePDFReport(traits: TraitData[], personality: { type: string; emoji: string; desc: string }, advice: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 794;   // A4 width at 96dpi
  canvas.height = 1123; // A4 height at 96dpi
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header gradient bar
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, '#3b5bdb');
  grad.addColorStop(1, '#00d9ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, 6);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('TwinMind', 48, 60);
  ctx.fillStyle = '#b0b9d4';
  ctx.font = '16px Arial';
  ctx.fillText('Digital Personality Twin — Profile Report', 48, 85);

  // Date
  ctx.fillStyle = '#6b7280';
  ctx.font = '13px Arial';
  ctx.fillText(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), canvas.width - 200, 60);

  // Divider
  ctx.strokeStyle = '#252552';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(48, 105); ctx.lineTo(canvas.width - 48, 105); ctx.stroke();

  // Personality Type box
  ctx.fillStyle = '#16213e';
  roundRect(ctx, 48, 120, canvas.width - 96, 80, 12);
  ctx.fillStyle = '#00d9ff';
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`${personality.type}`, 80, 155);
  ctx.fillStyle = '#b0b9d4';
  ctx.font = '14px Arial';
  ctx.fillText(personality.desc, 80, 178);

  // Section: Trait Scores
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Personality Traits', 48, 235);

  const traitColors: Record<string, string> = {
    'Risk Tolerance': '#00d9ff',
    'Logic vs Emotion': '#3b5bdb',
    'Social Dynamics': '#a855f7',
    'Leadership Style': '#22c55e',
    'Financial Patterns': '#f59e0b',
  };

  traits.forEach((trait, i) => {
    const y = 255 + i * 58;
    // Trait name
    ctx.fillStyle = '#b0b9d4';
    ctx.font = '13px Arial';
    ctx.fillText(trait.name, 48, y);
    // Score
    ctx.fillStyle = traitColors[trait.name] ?? '#00d9ff';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`${Math.round(trait.value)}%`, canvas.width - 100, y);
    // Confidence
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.fillText(`conf: ${Math.round(trait.confidence * 100)}%`, canvas.width - 160, y);
    // Bar background
    ctx.fillStyle = '#252552';
    roundRect(ctx, 48, y + 8, canvas.width - 96, 14, 7);
    // Bar fill
    ctx.fillStyle = traitColors[trait.name] ?? '#00d9ff';
    roundRect(ctx, 48, y + 8, Math.max(14, (canvas.width - 96) * trait.value / 100), 14, 7);
    // Reasoning
    if (trait.reasoning) {
      ctx.fillStyle = '#6b7280';
      ctx.font = 'italic 11px Arial';
      ctx.fillText(`"${trait.reasoning.slice(0, 90)}"`, 48, y + 32);
    }
  });

  const afterTraits = 255 + traits.length * 58 + 20;

  // Divider
  ctx.strokeStyle = '#252552';
  ctx.beginPath(); ctx.moveTo(48, afterTraits); ctx.lineTo(canvas.width - 48, afterTraits); ctx.stroke();

  // Strengths & Weaknesses
  const strengths = getStrengths(traits);
  const weaknesses = getWeaknesses(traits);

  const colW = (canvas.width - 120) / 2;
  let sy = afterTraits + 20;

  // Strengths
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Strengths', 48, sy);
  sy += 22;
  strengths.forEach(s => {
    ctx.fillStyle = '#16213e';
    roundRect(ctx, 48, sy, colW, 30, 6);
    ctx.fillStyle = '#22c55e';
    ctx.font = '12px Arial';
    ctx.fillText(`✓  ${s}`, 60, sy + 19);
    sy += 38;
  });

  // Weaknesses
  let wy = afterTraits + 20 + 22;
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Areas to Improve', 48 + colW + 24, afterTraits + 20);
  weaknesses.forEach(w => {
    ctx.fillStyle = '#16213e';
    roundRect(ctx, 48 + colW + 24, wy, colW, 30, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px Arial';
    ctx.fillText(`→  ${w}`, 60 + colW + 24, wy + 19);
    wy += 38;
  });

  const afterSW = Math.max(sy, wy) + 10;

  // Divider
  ctx.strokeStyle = '#252552';
  ctx.beginPath(); ctx.moveTo(48, afterSW); ctx.lineTo(canvas.width - 48, afterSW); ctx.stroke();

  // Suggestions
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('AI Suggestions', 48, afterSW + 28);

  let ay = afterSW + 48;
  advice.slice(0, 4).forEach(a => {
    const clean = a.replace(/💡\s?/, '');
    ctx.fillStyle = '#16213e';
    roundRect(ctx, 48, ay, canvas.width - 96, 34, 8);
    ctx.fillStyle = '#00d9ff';
    ctx.font = '12px Arial';
    wrapText(ctx, `• ${clean}`, 62, ay + 21, canvas.width - 120, 16);
    ay += 42;
  });

  // Footer
  ctx.fillStyle = '#252552';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.fillText('Generated by TwinMind — Digital Personality Twin', 48, canvas.height - 15);
  ctx.fillText('twinmind.app', canvas.width - 130, canvas.height - 15);

  // Download
  const link = document.createElement('a');
  link.download = `TwinMind_Report_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word + ' ';
      y += lineH;
    } else { line = test; }
  }
  ctx.fillText(line, x, y);
}

function getStrengths(traits: TraitData[]): string[] {
  const out: string[] = [];
  const map: Record<string, number> = {};
  traits.forEach(t => { map[t.name] = t.value; });
  if ((map['Risk Tolerance'] ?? 50) > 60) out.push('Bold decision-making');
  if ((map['Logic vs Emotion'] ?? 50) > 60) out.push('Analytical thinking');
  if ((map['Social Dynamics'] ?? 50) > 60) out.push('Strong social skills');
  if ((map['Leadership Style'] ?? 50) > 60) out.push('Natural leadership');
  if ((map['Financial Patterns'] ?? 50) > 60) out.push('Financial discipline');
  if ((map['Risk Tolerance'] ?? 50) < 45) out.push('Stability & reliability');
  if ((map['Logic vs Emotion'] ?? 50) < 45) out.push('Emotional intelligence');
  if (out.length === 0) out.push('Balanced & adaptable');
  return out.slice(0, 4);
}

function getWeaknesses(traits: TraitData[]): string[] {
  const out: string[] = [];
  const map: Record<string, number> = {};
  traits.forEach(t => { map[t.name] = t.value; });
  if ((map['Risk Tolerance'] ?? 50) > 70) out.push('May act impulsively');
  if ((map['Risk Tolerance'] ?? 50) < 35) out.push('Avoids necessary risks');
  if ((map['Logic vs Emotion'] ?? 50) < 35) out.push('Emotionally reactive');
  if ((map['Logic vs Emotion'] ?? 50) > 70) out.push('Can seem cold/detached');
  if ((map['Social Dynamics'] ?? 50) < 35) out.push('Avoids networking');
  if ((map['Leadership Style'] ?? 50) > 75) out.push('Can be overbearing');
  if ((map['Financial Patterns'] ?? 50) < 35) out.push('Impulsive spending');
  if (out.length === 0) out.push('No major weaknesses found');
  return out.slice(0, 4);
}
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface TraitData { name: string; value: number; confidence: number; reasoning?: string; }

// Feature 7: Personality Type Classification
function classifyPersonality(traits: TraitData[]): { type: string; emoji: string; desc: string } {
  const map: Record<string, number> = {};
  traits.forEach(t => { map[t.name] = t.value; });
  const risk = map['Risk Tolerance'] ?? 50;
  const logic = map['Logic vs Emotion'] ?? 50;
  const social = map['Social Dynamics'] ?? 50;
  const lead = map['Leadership Style'] ?? 50;
  const fin = map['Financial Patterns'] ?? 50;

  if (risk > 65 && lead > 65) return { type: 'Risk Explorer', emoji: '🚀', desc: 'Bold, decisive, thrives in uncertainty. Natural pioneer.' };
  if (logic > 65 && fin > 65) return { type: 'Analytical Planner', emoji: '📊', desc: 'Data-driven, methodical, financially disciplined.' };
  if (social > 65 && lead > 65) return { type: 'Emotional Leader', emoji: '🤝', desc: 'Empathetic, inspiring, builds strong teams.' };
  if (logic > 65 && risk < 40) return { type: 'Strategic Thinker', emoji: '🧠', desc: 'Calculated, precise, minimizes risk through analysis.' };
  if (social > 65 && risk > 55) return { type: 'Social Adventurer', emoji: '🌟', desc: 'Energetic, connects easily, loves new experiences.' };
  if (fin > 65 && logic > 55) return { type: 'Cautious Optimizer', emoji: '🛡️', desc: 'Security-focused, plans ahead, avoids unnecessary risk.' };
  return { type: 'Balanced Realist', emoji: '⚖️', desc: 'Adaptable, pragmatic, weighs all sides before deciding.' };
}

// Feature 6: AI Advice Generator
function generateAdvice(traits: TraitData[]): string[] {
  const map: Record<string, number> = {};
  traits.forEach(t => { map[t.name] = t.value; });
  const advice: string[] = [];
  if ((map['Risk Tolerance'] ?? 50) < 40)
    advice.push('💡 Since you prefer stability, build a financial safety net before making bold career moves.');
  if ((map['Risk Tolerance'] ?? 50) > 70)
    advice.push('💡 Your high risk tolerance is a strength — channel it with structured planning to avoid impulsive decisions.');
  if ((map['Logic vs Emotion'] ?? 50) < 35)
    advice.push('💡 You lead with emotion — try journaling decisions to spot patterns and add analytical balance.');
  if ((map['Logic vs Emotion'] ?? 50) > 70)
    advice.push('💡 Your analytical mind is powerful — remember to factor in emotional impact on others when deciding.');
  if ((map['Social Dynamics'] ?? 50) < 35)
    advice.push('💡 Networking in small groups or 1-on-1 settings will suit you better than large events.');
  if ((map['Leadership Style'] ?? 50) > 70)
    advice.push('💡 Your leadership instinct is strong — practice active listening to bring your team along.');
  if ((map['Financial Patterns'] ?? 50) < 35)
    advice.push('💡 Consider automating savings — your spending tendency benefits from systems over willpower.');
  if (advice.length === 0)
    advice.push('💡 Your balanced profile gives you flexibility — focus on the trait you want to develop most.');
  return advice;
}

export default function DashboardPage() {
  const [traits, setTraits] = useState<TraitData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const savedAnalysis = localStorage.getItem('personalityAnalysis');
        if (savedAnalysis) {
          const analysis = JSON.parse(savedAnalysis);
          const traitsData = Object.entries(analysis.traits).map(([name, value]) => ({
            name, value: value as number,
            confidence: (analysis.confidence?.[name] as number) || 0.7,
            reasoning: analysis.reasoning?.[name] as string | undefined,
          }));
          // Feature 3: save snapshot to evolution history
          saveEvolutionSnapshot(analysis.traits);
          setTraits(traitsData);
          setLoading(false);
          return;
        }
        const savedResponses = localStorage.getItem('quizResponses');
        if (!savedResponses) { setLoading(false); return; }
        const responses = JSON.parse(savedResponses);
        const userId = localStorage.getItem('userId') || 'user-' + Date.now();
        const response = await fetch('/api/quiz-analysis', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, responses }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        localStorage.setItem('personalityAnalysis', JSON.stringify({
          traits: data.traits, confidence: data.confidence, reasoning: data.reasoning,
        }));
        saveEvolutionSnapshot(data.traits);
        setTraits(Object.entries(data.traits).map(([name, value]) => ({
          name, value: value as number,
          confidence: (data.confidence?.[name] as number) || 0.7,
          reasoning: data.reasoning?.[name] as string | undefined,
        })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const radarData = traits.map(t => ({ trait: t.name.split(' ')[0], value: t.value, fullMark: 100 }));
  const barData = traits.map(t => ({ name: t.name.split(' ')[0], score: Math.round(t.value), confidence: Math.round(t.confidence * 100) }));
  const personality = traits.length > 0 ? classifyPersonality(traits) : null;
  const advice = traits.length > 0 ? generateAdvice(traits) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TwinMind</Link>
        <div className="flex gap-3 flex-wrap">
          <Link href="/profile"><Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Profile</Button></Link>
          <Link href="/simulator"><Button variant="outline" className="border-accent text-accent hover:bg-accent/10">Simulator</Button></Link>
          <Link href="/twin-chat"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">💬 Twin Chat</Button></Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Your Personality Profile</h1>
            <p className="text-foreground-secondary max-w-2xl">AI-analyzed breakdown of your traits and decision-making patterns.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto" />
                <p className="text-foreground-secondary">Analyzing your personality...</p>
              </div>
            </div>
          )}

          {!loading && traits.length === 0 && (
            <div className="bg-card border border-accent/30 rounded-lg p-8 text-center">
              <p className="text-foreground-secondary mb-4">No personality data yet. Take the quiz first.</p>
              <Link href="/quiz"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Take Quiz</Button></Link>
            </div>
          )}

          {!loading && traits.length > 0 && (
            <>
              {/* Feature 7: Personality Type */}
              {personality && (
                <div className="bg-gradient-to-r from-accent/15 to-primary/10 border border-accent/30 rounded-2xl p-6 flex items-center gap-5 flex-wrap">
                  <span className="text-5xl">{personality.emoji}</span>
                  <div>
                    <p className="text-xs text-foreground-secondary uppercase tracking-widest mb-1">Your Personality Type</p>
                    <h2 className="text-2xl font-bold text-foreground">{personality.type}</h2>
                    <p className="text-foreground-secondary text-sm mt-1">{personality.desc}</p>
                  </div>
                  <div className="ml-auto flex gap-3 shrink-0 flex-wrap">
                    <Link href="/simulator"><Button variant="outline" className="border-accent text-accent hover:bg-accent/10">Simulate</Button></Link>
                    <Link href="/twin-chat"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Chat Twin</Button></Link>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => generatePDFReport(traits, personality, advice)}>🖨️ Download Report</Button>
                  </div>
                </div>
              )}

              {/* Feature 1: Radar Chart */}
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Personality Radar</h2>
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#252552" />
                    <PolarAngleAxis dataKey="trait" stroke="#b0b9d4" tick={{ fontSize: 13 }} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#b0b9d4" tick={{ fontSize: 10 }} />
                    <Radar name="Your Score" dataKey="value" stroke="#00d9ff" fill="#00d9ff" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart + Trait cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Score Breakdown</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData}>
                      <CartesianGrid stroke="#252552" />
                      <XAxis dataKey="name" stroke="#b0b9d4" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} stroke="#b0b9d4" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#16213e', border: '1px solid #252552', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                      <Bar dataKey="score" fill="#3b5bdb" name="Trait Score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground">Key Insights</h2>
                  {traits.map((trait, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-foreground text-sm">{trait.name}</span>
                        {/* Feature 4: Confidence Score */}
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-bold">{Math.round(trait.value)}%</span>
                          <span className="text-xs text-foreground-secondary bg-primary/10 px-2 py-0.5 rounded-full">
                            {Math.round(trait.confidence * 100)}% conf
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-700" style={{ width: `${trait.value}%` }} />
                      </div>
                      {trait.reasoning && (
                        <p className="text-xs text-foreground-secondary mt-2 italic border-l-2 border-accent/30 pl-2">"{trait.reasoning}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature 6: AI Advice */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">🤖 AI Advice for You</h2>
                <div className="space-y-3">
                  {advice.map((a, i) => (
                    <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-foreground-secondary">{a}</div>
                  ))}
                </div>
              </div>

              {/* Feature 3: Evolution Tracker */}
              <EvolutionTracker />

              {/* CTA */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-accent/30 rounded-xl p-8 text-center">
                <h2 className="text-xl font-bold text-foreground mb-3">Explore Your Digital Twin</h2>
                <p className="text-foreground-secondary mb-5 max-w-xl mx-auto text-sm">Test predictions, chat with your twin, or simulate real-world decisions.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/simulator"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Try Simulator</Button></Link>
                  <Link href="/twin-chat"><Button variant="outline" className="border-primary text-primary hover:bg-primary/10">💬 Chat with Twin</Button></Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Feature 3: Evolution Tracker Component
function saveEvolutionSnapshot(traits: Record<string, number>) {
  try {
    const history: { date: string; traits: Record<string, number> }[] = JSON.parse(localStorage.getItem('personalityHistory') || '[]');
    const today = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    // Only save if last entry is from a different day
    if (history.length === 0 || history[history.length - 1].date !== today) {
      history.push({ date: today, traits });
      localStorage.setItem('personalityHistory', JSON.stringify(history.slice(-6))); // keep last 6
    }
  } catch { /* ignore */ }
}

function EvolutionTracker() {
  const [history, setHistory] = useState<{ date: string; traits: Record<string, number> }[]>([]);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('personalityHistory') || '[]');
      setHistory(h);
    } catch { /* ignore */ }
  }, []);

  if (history.length < 2) return null;

  const traitNames = Object.keys(history[0].traits);
  const colors = ['#00d9ff', '#3b5bdb', '#a855f7', '#22c55e', '#f59e0b'];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-bold text-foreground mb-1">📈 Personality Evolution</h2>
      <p className="text-xs text-foreground-secondary mb-5">How your traits have changed across quiz sessions</p>
      <div className="space-y-4">
        {traitNames.map((trait, ti) => (
          <div key={trait}>
            <div className="flex justify-between text-xs text-foreground-secondary mb-1">
              <span>{trait}</span>
              <span className="text-accent">
                {history[0].traits[trait]?.toFixed(0)}% → {history[history.length - 1].traits[trait]?.toFixed(0)}%
                {' '}
                {(history[history.length - 1].traits[trait] - history[0].traits[trait]) > 0 ? '↑' : '↓'}
              </span>
            </div>
            <div className="flex gap-1 items-end h-8">
              {history.map((snap, si) => {
                const val = snap.traits[trait] ?? 0;
                return (
                  <div key={si} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{ height: `${(val / 100) * 28}px`, backgroundColor: colors[ti % colors.length], opacity: 0.7 + si * 0.05 }}
                      title={`${snap.date}: ${val.toFixed(0)}%`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {history.map((snap, si) => (
                <div key={si} className="flex-1 text-center text-xs text-foreground-secondary">{snap.date}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
