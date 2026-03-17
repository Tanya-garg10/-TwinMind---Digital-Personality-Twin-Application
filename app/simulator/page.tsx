'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PRESET_SCENARIOS = [
  { id: 'career_risk', title: 'Career Crossroads', description: "You're offered a stable corporate job OR a startup with 50% higher pay but significant risk of failure.", question: 'Which would your digital twin choose?', option1: 'Stable Corporate Job', option2: 'Risky Startup' },
  { id: 'major_purchase', title: 'Major Purchase', description: "You want to buy something you've wanted for years. It costs ₹5,00,000 and would deplete your emergency fund.", question: 'What would your digital twin do?', option1: 'Save longer and wait', option2: 'Buy it now' },
  { id: 'leadership_decision', title: 'Leadership Decision', description: 'Your team is divided on a major project direction. You need to make a call quickly with incomplete information.', question: 'How would your digital twin proceed?', option1: 'Seek consensus and compromise', option2: 'Make a decisive unilateral call' },
  { id: 'social_event', title: 'Social Invitation', description: "You're invited to a large networking event with 300+ people. You have no prior connections there.", question: 'Your digital twin would:', option1: 'Politely decline', option2: 'Enthusiastically attend' },
];

interface PredictionResult { predicted_behavior: string; confidence: number; reasoning: string; alternative_behaviors: string[]; chosen_option?: string; }
interface PersonalityTraits { [key: string]: number; }
interface AccuracyRecord { scenario: string; predicted: string; actual: string; match: boolean; }

// Feature 5: Scenario Recommendations
function getRecommendedScenarios(traits: PersonalityTraits) {
  const risk = traits['Risk Tolerance'] ?? 50;
  const lead = traits['Leadership Style'] ?? 50;
  const social = traits['Social Dynamics'] ?? 50;
  const fin = traits['Financial Patterns'] ?? 50;
  const recs: { id: string; title: string; why: string }[] = [];
  if (risk > 60) recs.push({ id: 'career_risk', title: 'Career Crossroads', why: 'High risk tolerance — this scenario is most revealing for you.' });
  if (risk < 40) recs.push({ id: 'major_purchase', title: 'Major Purchase', why: 'Cautious nature shows interesting patterns here.' });
  if (lead > 60) recs.push({ id: 'leadership_decision', title: 'Leadership Decision', why: 'Strong leadership score — see how your twin handles pressure.' });
  if (social > 60) recs.push({ id: 'social_event', title: 'Social Invitation', why: 'High social energy — this will match your instincts.' });
  if (social < 40) recs.push({ id: 'social_event', title: 'Social Invitation', why: "Low social score — your twin's choice here might surprise you." });
  if (fin < 40) recs.push({ id: 'major_purchase', title: 'Major Purchase', why: 'Low financial discipline — most revealing scenario for you.' });
  return recs.slice(0, 2);
}

async function fetchPrediction(userId: string, scenarioId: string, traits: PersonalityTraits, chosenOption = ''): Promise<PredictionResult> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, scenario: scenarioId, traits, chosenOption }),
  });
  if (!res.ok) throw new Error('Prediction failed');
  return res.json();
}

function localPredict(scenarioId: string, traits: PersonalityTraits, chosenOption: string): PredictionResult {
  const risk = traits['Risk Tolerance'] ?? 50;
  const social = traits['Social Dynamics'] ?? 50;
  const lead = traits['Leadership Style'] ?? 50;
  const fin = traits['Financial Patterns'] ?? 50;
  const lower = chosenOption.toLowerCase();
  const wantsRisky = lower.includes('startup') || lower.includes('buy') || lower.includes('decisive') || lower.includes('attend');
  const map: Record<string, { bold: string; cautious: string; key: string; val: number }> = {
    career_risk: { bold: 'Your twin would go for the startup — growth mindset wins.', cautious: 'Your twin would pick the stable job — security first.', key: 'Risk Tolerance', val: risk },
    major_purchase: { bold: 'Your twin would buy it now — experiences over savings.', cautious: 'Your twin would save and wait — financial discipline holds.', key: 'Financial Patterns', val: fin },
    leadership_decision: { bold: 'Your twin would make the decisive call — leadership instinct kicks in.', cautious: 'Your twin would seek consensus — collaboration over authority.', key: 'Leadership Style', val: lead },
    social_event: { bold: 'Your twin would attend enthusiastically — social energy is high.', cautious: 'Your twin would decline — large crowds are draining.', key: 'Social Dynamics', val: social },
  };
  const p = map[scenarioId] ?? map['career_risk'];
  const isHigh = p.val >= 50;
  const prediction = wantsRisky
    ? (isHigh ? p.bold : `Your twin would hesitate — ${p.key} at ${Math.round(p.val)}% makes this feel too risky.`)
    : (isHigh ? `Your twin would resist this choice — ${p.key} at ${Math.round(p.val)}% pushes toward bolder options.` : p.cautious);
  return {
    predicted_behavior: prediction,
    confidence: Math.min(0.93, 0.60 + Math.abs(p.val - 50) / 100),
    reasoning: `${p.key}: ${Math.round(p.val)}%. You chose "${chosenOption}".`,
    alternative_behaviors: [wantsRisky ? p.cautious : p.bold, 'A balanced approach is also possible.'],
    chosen_option: chosenOption,
  };
}

// What-If prediction — purely trait-driven, no chosen option bias
function whatIfPredict(scenarioId: string, traits: PersonalityTraits): { behavior: string; confidence: number; label: string } {
  // Resolve trait value — try exact key first, then fuzzy match
  const get = (keys: string[]): number => {
    for (const k of keys) {
      const exact = traits[k];
      if (exact !== undefined) return exact;
      // fuzzy: find any key containing the first word
      const word = k.split(' ')[0].toLowerCase();
      const found = Object.keys(traits).find(t => t.toLowerCase().includes(word));
      if (found) return traits[found];
    }
    return 50;
  };

  const risk = get(['Risk Tolerance', 'Risk']);
  const logic = get(['Logic vs Emotion', 'Logic']);
  const social = get(['Social Dynamics', 'Social', 'Introvert/Extrovert']);
  const lead = get(['Leadership Style', 'Leadership']);
  const fin = get(['Financial Patterns', 'Financial', 'Spending vs Saving']);

  const SCENARIOS: Record<string, { key: string; val: number; levels: [string, string, string, string, string] }> = {
    career_risk: {
      key: 'Risk Tolerance', val: risk,
      levels: [
        'Firmly choose the stable job — risk feels overwhelming.',
        'Lean toward stable job, but feel the pull of the startup.',
        'Weigh both carefully — could go either way.',
        'Lean toward the startup — calculated risk feels worth it.',
        'Go all-in on the startup — high risk tolerance drives bold action.',
      ],
    },
    major_purchase: {
      key: 'Financial Patterns', val: fin,
      levels: [
        'Buy it immediately — impulse spending is strong.',
        'Likely buy it, maybe on EMI to soften the blow.',
        'Hesitate and compare options before deciding.',
        'Save a bit more first, then buy with confidence.',
        'Wait until fully financially ready — discipline wins.',
      ],
    },
    leadership_decision: {
      key: 'Leadership Style', val: lead,
      levels: [
        'Fully defer to the team — avoid making the call alone.',
        'Gather opinions extensively before deciding.',
        'Decide — but explain reasoning to the team after.',
        'Make a confident call and brief the team quickly.',
        'Take charge decisively — strong leadership instinct kicks in.',
      ],
    },
    social_event: {
      key: 'Social Dynamics', val: social,
      levels: [
        'Definitely decline — large crowds are draining.',
        'Politely decline or leave very early.',
        'Attend briefly, talk to 2–3 people, then leave.',
        'Attend with a plan — work the room strategically.',
        'Attend enthusiastically — 300 strangers = 300 opportunities.',
      ],
    },
  };

  const s = SCENARIOS[scenarioId] ?? SCENARIOS['career_risk'];
  const val = s.val;
  const idx = Math.min(4, Math.floor(val / 20));
  const behavior = `${s.levels[idx]} (${s.key}: ${Math.round(val)}%)`;
  const label = val >= 60 ? 'Bold' : val >= 40 ? 'Balanced' : 'Cautious';
  const confidence = Math.min(0.95, 0.62 + Math.abs(val - 50) * 0.003);
  return { behavior, confidence, label };
}

export default function SimulatorPage() {
  const [traits, setTraits] = useState<PersonalityTraits | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customScenario, setCustomScenario] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customPrediction, setCustomPrediction] = useState<PredictionResult | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [history, setHistory] = useState<{ title: string; prediction: string; confidence: number; option: string }[]>([]);
  // Feature 2: Accuracy Test
  const [accuracyRecords, setAccuracyRecords] = useState<AccuracyRecord[]>([]);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [actualChoice, setActualChoice] = useState<string | null>(null);
  // Feature 4: What-If Simulator
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [whatIfTraits, setWhatIfTraits] = useState<PersonalityTraits | null>(null);
  const whatIfTraitsRef = useRef<PersonalityTraits | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<{ original: string; modified: string } | null>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('personalityAnalysis');
    if (saved) {
      try {
        const t = JSON.parse(saved).traits as PersonalityTraits;
        setTraits(t);
        setWhatIfTraits({ ...t });
        whatIfTraitsRef.current = { ...t };
      } catch { /* ignore */ }
    }
    const acc = localStorage.getItem('accuracyRecords');
    if (acc) {
      try { setAccuracyRecords(JSON.parse(acc)); } catch { /* ignore */ }
    }
  }, []);

  const handleOptionClick = async (option: string) => {
    if (!traits || loading) return;
    setSelectedOption(option);
    setActualChoice(null);
    setLoading(true);
    setPrediction(null);
    const scenario = PRESET_SCENARIOS[currentScenario];
    const userId = localStorage.getItem('userId') || 'user-demo';
    try {
      const data = await fetchPrediction(userId, scenario.id, traits, option);
      setPrediction({ ...data, chosen_option: option });
      setHistory(prev => [{ title: scenario.title, prediction: data.predicted_behavior, confidence: data.confidence, option }, ...prev.slice(0, 4)]);
    } catch {
      const result = localPredict(scenario.id, traits, option);
      setPrediction(result);
      setHistory(prev => [{ title: scenario.title, prediction: result.predicted_behavior, confidence: result.confidence, option }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  // Feature 2: Record actual choice vs prediction
  const recordActualChoice = (actual: string) => {
    if (!prediction) return;
    setActualChoice(actual);
    const scenario = PRESET_SCENARIOS[currentScenario];
    const predicted = prediction.chosen_option ?? selectedOption ?? '';
    const match = actual.toLowerCase() === predicted.toLowerCase();
    const record: AccuracyRecord = { scenario: scenario.title, predicted, actual, match };
    const updated = [record, ...accuracyRecords.slice(0, 9)];
    setAccuracyRecords(updated);
    localStorage.setItem('accuracyRecords', JSON.stringify(updated));
  };

  const accuracyPct = accuracyRecords.length > 0
    ? Math.round((accuracyRecords.filter(r => r.match).length / accuracyRecords.length) * 100)
    : null;

  const handleNext = () => { setCurrentScenario(p => Math.min(p + 1, PRESET_SCENARIOS.length - 1)); setPrediction(null); setSelectedOption(null); setActualChoice(null); };
  const handlePrev = () => { setCurrentScenario(p => Math.max(p - 1, 0)); setPrediction(null); setSelectedOption(null); setActualChoice(null); };

  // Feature 4: What-If run
  const runWhatIf = () => {
    if (!traits || !whatIfTraitsRef.current) return;
    setWhatIfLoading(true);
    setWhatIfResult(null);
    const scenario = PRESET_SCENARIOS[currentScenario];
    const orig = whatIfPredict(scenario.id, traits);
    const mod = whatIfPredict(scenario.id, whatIfTraitsRef.current);
    setWhatIfResult({ original: `[${orig.label}] ${orig.behavior}`, modified: `[${mod.label}] ${mod.behavior}` });
    setWhatIfLoading(false);
  };

  const detectScenarioType = (text: string) => {
    const l = text.toLowerCase();
    if (l.includes('job') || l.includes('career') || l.includes('startup') || l.includes('work')) return 'career_risk';
    if (l.includes('buy') || l.includes('purchase') || l.includes('money') || l.includes('invest')) return 'major_purchase';
    if (l.includes('team') || l.includes('lead') || l.includes('manage') || l.includes('decision')) return 'leadership_decision';
    if (l.includes('social') || l.includes('party') || l.includes('event') || l.includes('people')) return 'social_event';
    return 'career_risk';
  };

  const getCustomPrediction = async () => {
    if (!traits || !customScenario.trim()) return;
    setCustomLoading(true);
    setCustomPrediction(null);
    const userId = localStorage.getItem('userId') || 'user-demo';
    const key = detectScenarioType(customScenario);
    try {
      const data = await fetchPrediction(userId, key, traits, customScenario);
      setCustomPrediction({ ...data, reasoning: `For "${customScenario.slice(0, 70)}..." — ${data.reasoning}` });
    } catch {
      const result = localPredict(key, traits, customScenario);
      setCustomPrediction({ ...result, reasoning: `For "${customScenario.slice(0, 70)}..." — ${result.reasoning}` });
    } finally {
      setCustomLoading(false);
    }
  };

  const scenario = PRESET_SCENARIOS[currentScenario];
  const recommendations = traits ? getRecommendedScenarios(traits) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TwinMind</Link>
        <div className="flex gap-3 flex-wrap">
          <Link href="/dashboard"><Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Dashboard</Button></Link>
          <Link href="/twin-chat"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">💬 Twin Chat</Button></Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Scenario Simulator</h1>
              <p className="text-foreground-secondary">Click an option — your digital twin predicts what you'd actually choose.</p>
            </div>
            {/* Feature 2: Accuracy badge */}
            {accuracyPct !== null && (
              <button onClick={() => setShowAccuracy(!showAccuracy)} className="bg-card border border-border rounded-xl px-4 py-3 text-center hover:border-accent/50 transition">
                <div className="text-2xl font-bold text-accent">{accuracyPct}%</div>
                <div className="text-xs text-foreground-secondary">Twin Accuracy</div>
              </button>
            )}
          </div>

          {/* Feature 2: Accuracy breakdown */}
          {showAccuracy && accuracyRecords.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-lg font-bold text-foreground mb-3">🎯 Accuracy Test Results</h2>
              <div className="space-y-2">
                {accuracyRecords.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className={r.match ? 'text-green-400' : 'text-red-400'}>{r.match ? '✓' : '✗'}</span>
                    <span className="text-foreground-secondary flex-1">{r.scenario}</span>
                    <span className="text-xs text-foreground-secondary">Predicted: <span className="text-accent">{r.predicted}</span></span>
                    <span className="text-xs text-foreground-secondary">Actual: <span className="text-primary">{r.actual}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!traits && (
            <div className="bg-card border border-accent/30 rounded-lg p-6 text-center">
              <p className="text-foreground-secondary mb-4">No personality data found. Take the quiz first.</p>
              <Link href="/quiz"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Take Quiz</Button></Link>
            </div>
          )}

          {traits && (
            <>
              {/* Trait profile */}
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-foreground-secondary mb-2 uppercase tracking-wide">Active personality profile</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(traits).map(([name, score]) => (
                    <div key={name} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                      <span className="text-xs text-foreground-secondary">{name.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-accent">{Math.round(score)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature 5: Recommendations */}
              {recommendations.length > 0 && (
                <div className="bg-card border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-primary uppercase tracking-wide mb-3">🎯 Recommended for you</p>
                  <div className="flex gap-3 flex-wrap">
                    {recommendations.map(rec => {
                      const idx = PRESET_SCENARIOS.findIndex(s => s.id === rec.id);
                      return (
                        <button key={rec.id} onClick={() => { setCurrentScenario(idx); setPrediction(null); setSelectedOption(null); }}
                          className="text-left bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 hover:border-primary/50 transition flex-1 min-w-48">
                          <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                          <p className="text-xs text-foreground-secondary mt-1">{rec.why}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scenario Card */}
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-foreground-secondary">Scenario {currentScenario + 1} / {PRESET_SCENARIOS.length}</span>
                  <div className="flex gap-2">
                    <button onClick={handlePrev} disabled={currentScenario === 0} className="px-3 py-1 rounded border border-border text-foreground-secondary hover:border-accent/50 disabled:opacity-30 text-sm transition">←</button>
                    <button onClick={handleNext} disabled={currentScenario === PRESET_SCENARIOS.length - 1} className="px-3 py-1 rounded border border-border text-foreground-secondary hover:border-accent/50 disabled:opacity-30 text-sm transition">→</button>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-3">{scenario.title}</h2>
                <p className="text-foreground-secondary mb-4 leading-relaxed">{scenario.description}</p>
                <p className="text-accent font-semibold mb-6">{scenario.question}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[scenario.option1, scenario.option2].map(opt => {
                    const isSelected = selectedOption === opt;
                    const isOther = selectedOption !== null && selectedOption !== opt;
                    return (
                      <button key={opt} onClick={() => handleOptionClick(opt)} disabled={loading}
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-200
                          ${isSelected ? 'border-accent bg-accent/15 scale-[1.02] shadow-lg shadow-accent/20'
                            : isOther ? 'border-border bg-background/30 opacity-50'
                              : 'border-border bg-background/50 hover:border-accent/60 hover:bg-accent/5 hover:scale-[1.01]'}
                          ${loading ? 'cursor-wait' : 'cursor-pointer'}`}>
                        <span className={`font-semibold text-base block ${isSelected ? 'text-accent' : 'text-foreground'}`}>{opt}</span>
                        {!selectedOption && <span className="text-xs text-foreground-secondary mt-1 block">Click to predict →</span>}
                        {isSelected && loading && <span className="text-xs text-accent mt-1 block animate-pulse">Analyzing...</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Feature 4: Prediction + Confidence */}
                {prediction && !loading && (
                  <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 text-center">
                        <div className="text-3xl font-bold text-accent">{Math.round(prediction.confidence * 100)}%</div>
                        <div className="text-xs text-foreground-secondary">confidence</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-semibold text-lg mb-2">{prediction.predicted_behavior}</p>
                        <p className="text-foreground-secondary text-sm mb-3">{prediction.reasoning}</p>
                        {prediction.alternative_behaviors?.length > 0 && (
                          <ul className="space-y-1">
                            {prediction.alternative_behaviors.map((alt, i) => (
                              <li key={i} className="text-xs text-foreground-secondary pl-3 border-l-2 border-accent/30">{alt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Feature 2: Accuracy Test — what did you actually choose? */}
                    {!actualChoice && (
                      <div className="mt-5 pt-4 border-t border-border/50">
                        <p className="text-xs text-foreground-secondary mb-2">🎯 Accuracy Test: What would you actually choose?</p>
                        <div className="flex gap-2 flex-wrap">
                          {[scenario.option1, scenario.option2].map(opt => (
                            <button key={opt} onClick={() => recordActualChoice(opt)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 text-foreground-secondary hover:text-accent transition">
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {actualChoice && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
                        {actualChoice.toLowerCase() === (prediction.chosen_option ?? '').toLowerCase()
                          ? <span className="text-green-400 font-semibold text-sm">✓ Twin predicted correctly!</span>
                          : <span className="text-amber-400 font-semibold text-sm">✗ Twin was off — you chose "{actualChoice}"</span>
                        }
                        {accuracyPct !== null && <span className="text-xs text-foreground-secondary ml-auto">Overall accuracy: {accuracyPct}%</span>}
                      </div>
                    )}

                    <button onClick={() => { setPrediction(null); setSelectedOption(null); setActualChoice(null); }} className="mt-3 text-xs text-accent hover:underline">↩ Try the other option</button>
                  </div>
                )}
              </div>

              {/* Custom Scenario */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Custom Scenario</h2>
                  <button onClick={() => setShowCustom(!showCustom)} className="text-sm text-accent hover:underline">{showCustom ? 'Hide ↑' : 'Try your own →'}</button>
                </div>
                {showCustom && (
                  <div className="space-y-4">
                    <p className="text-foreground-secondary text-sm">Type any situation — career, finance, relationship, study.</p>
                    <textarea value={customScenario} onChange={e => setCustomScenario(e.target.value)}
                      placeholder="e.g. Should I quit my job and move abroad for a better opportunity?"
                      className="w-full h-24 bg-background border border-border rounded-lg p-4 text-foreground placeholder:text-foreground-secondary resize-none focus:outline-none focus:border-accent/50 transition" />
                    <Button onClick={getCustomPrediction} disabled={customLoading || !customScenario.trim()} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                      {customLoading ? 'Analyzing...' : '🧠 Ask My Digital Twin'}
                    </Button>
                    {customPrediction && (
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 animate-in fade-in duration-300">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 text-center">
                            <div className="text-3xl font-bold text-primary">{Math.round(customPrediction.confidence * 100)}%</div>
                            <div className="text-xs text-foreground-secondary">confidence</div>
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground font-semibold text-lg mb-2">{customPrediction.predicted_behavior}</p>
                            <p className="text-foreground-secondary text-sm">{customPrediction.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Feature 4: What-If Simulator */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">🔄 What-If Simulator</h2>
                    <p className="text-xs text-foreground-secondary mt-1">Adjust trait sliders — see how your twin's decision changes.</p>
                  </div>
                  <button onClick={() => { setShowWhatIf(!showWhatIf); setWhatIfResult(null); if (!showWhatIf && traits) { whatIfTraitsRef.current = { ...traits }; setWhatIfTraits({ ...traits }); } }}
                    className="text-sm text-accent hover:underline">{showWhatIf ? 'Hide ↑' : 'Try it →'}</button>
                </div>
                {showWhatIf && whatIfTraits && traits && (
                  <div className="space-y-5">
                    {Object.entries(whatIfTraits).map(([name, val]) => {
                      const orig = traits[name] ?? 50;
                      const diff = Math.round(val - orig);
                      return (
                        <div key={name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground-secondary">{name}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-foreground-secondary">orig: {Math.round(orig)}%</span>
                              <span className={`font-bold text-sm ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-accent'}`}>
                                {Math.round(val)}% {diff !== 0 ? `(${diff > 0 ? '+' : ''}${diff})` : ''}
                              </span>
                            </span>
                          </div>
                          <input type="range" min={0} max={100} value={Math.round(val)}
                            onChange={e => {
                              const updated = whatIfTraitsRef.current ? { ...whatIfTraitsRef.current, [name]: Number(e.target.value) } : { [name]: Number(e.target.value) };
                              whatIfTraitsRef.current = updated;
                              setWhatIfTraits(updated);
                            }}
                            className="w-full accent-accent h-2 rounded-full cursor-pointer" />
                        </div>
                      );
                    })}
                    <div className="flex gap-3 flex-wrap">
                      <Button onClick={runWhatIf} disabled={whatIfLoading} className="bg-primary hover:bg-primary/90 text-white">
                        {whatIfLoading ? 'Comparing...' : '⚡ Compare Outcomes'}
                      </Button>
                      <button onClick={() => { if (traits) { whatIfTraitsRef.current = { ...traits }; setWhatIfTraits({ ...traits }); } setWhatIfResult(null); }}
                        className="text-xs text-foreground-secondary hover:text-accent transition px-3 py-1 border border-border rounded-lg">Reset</button>
                    </div>
                    {whatIfResult && (
                      <div className="space-y-3 mt-2">
                        {/* Trait changes summary */}
                        {traits && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(whatIfTraits).map(([name, val]) => {
                              const diff = Math.round(val - (traits[name] ?? 50));
                              if (diff === 0) return null;
                              return (
                                <span key={name} className={`text-xs px-2 py-1 rounded-full border font-semibold ${diff > 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                  {name.split(' ')[0]} {diff > 0 ? `+${diff}` : diff}%
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-background/50 border border-border rounded-xl p-4">
                            <p className="text-xs text-foreground-secondary uppercase tracking-wide mb-2">👤 Original You</p>
                            <p className="text-sm text-foreground">{whatIfResult.original}</p>
                          </div>
                          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                            <p className="text-xs text-accent uppercase tracking-wide mb-2">✨ Modified You</p>
                            <p className="text-sm text-foreground">{whatIfResult.modified}</p>
                          </div>
                        </div>
                        {whatIfResult.original === whatIfResult.modified && (
                          <p className="text-xs text-amber-400 text-center">Slider change is too small to shift the outcome — try a bigger difference (±20%+)</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Prediction History</h2>
                  <div className="space-y-3">
                    {history.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-border">
                        <span className="text-accent font-bold text-sm shrink-0 w-10 text-center">{Math.round(item.confidence * 100)}%</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground-secondary mb-0.5">{item.title} — chose: <span className="text-accent">{item.option}</span></p>
                          <p className="text-sm text-foreground truncate">{item.prediction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
