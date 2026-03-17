'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Message {
    role: 'user' | 'twin';
    text: string;
    mood?: string;
    bias?: string;
    goalAlert?: string;
    idealDiff?: string;
}
interface Traits { [key: string]: number; }

// Feature 1: Mood Detection
function detectMood(text: string): { mood: string; emoji: string; modifier: number } {
    const l = text.toLowerCase();
    if (/happy|excited|great|amazing|love|fantastic|awesome/.test(l)) return { mood: 'Happy', emoji: '😊', modifier: +15 };
    if (/stressed|anxious|worried|scared|nervous|overwhelmed|panic/.test(l)) return { mood: 'Stressed', emoji: '😰', modifier: -20 };
    if (/sad|depressed|down|unhappy|upset|lost/.test(l)) return { mood: 'Sad', emoji: '😔', modifier: -15 };
    if (/angry|frustrated|annoyed|mad|furious/.test(l)) return { mood: 'Frustrated', emoji: '😤', modifier: -10 };
    if (/confident|ready|motivated|determined|focused/.test(l)) return { mood: 'Confident', emoji: '💪', modifier: +10 };
    return { mood: 'Neutral', emoji: '😐', modifier: 0 };
}

// Feature 3: Bias Detector
function detectBias(text: string, traits: Traits): string | null {
    const l = text.toLowerCase();
    const risk = traits['Risk Tolerance'] ?? 50;
    if (/everyone|all my friends|people say|they think/.test(l)) return '🕵️ Peer pressure bias detected — make sure this is YOUR decision, not others\'';
    if (/what if|fail|wrong|mistake|regret/.test(l) && risk < 45) return '🕵️ Fear of failure bias — your low risk tolerance amplifies worst-case thinking';
    if (/overthink|can\'t decide|too many|confused|stuck/.test(l)) return '🕵️ Overthinking bias — you\'re in analysis paralysis. Set a decision deadline.';
    if (/should i|must i|have to|supposed to/.test(l)) return '🕵️ External validation bias — you\'re seeking permission. Trust your own judgment.';
    return null;
}

// Feature 5: Goal Alignment
function checkGoalAlignment(text: string, traits: Traits, goals: string[]): string | null {
    if (goals.length === 0) return null;
    const l = text.toLowerCase();
    const risk = traits['Risk Tolerance'] ?? 50;
    const fin = traits['Financial Patterns'] ?? 50;
    for (const goal of goals) {
        const gl = goal.toLowerCase();
        if (gl.includes('financial') || gl.includes('save') || gl.includes('money')) {
            if (/startup|risky|invest|gamble|quit/.test(l) && fin < 55)
                return `⚠️ Goal conflict: "${goal}" vs this risky decision. Your financial patterns (${Math.round(fin)}%) suggest caution.`;
        }
        if (gl.includes('career') || gl.includes('growth') || gl.includes('promotion')) {
            if (/quit|leave|stop|give up/.test(l) && risk < 45)
                return `⚠️ Goal conflict: "${goal}" — quitting may not align with your growth goal given your risk profile.`;
        }
        if (gl.includes('health') || gl.includes('fitness') || gl.includes('wellbeing')) {
            if (/stress|overwork|no sleep|burnout/.test(l))
                return `⚠️ Goal conflict: "${goal}" — this path risks your wellbeing goal.`;
        }
    }
    return null;
}

// Feature 2: Dual Twin — Real vs Ideal
function getDualTwin(text: string, traits: Traits): string | null {
    const l = text.toLowerCase();
    if (!/career|job|startup|invest|decision|choose|should/.test(l)) return null;
    const risk = traits['Risk Tolerance'] ?? 50;
    const lead = traits['Leadership Style'] ?? 50;
    const idealRisk = Math.min(100, risk + 20);
    const idealLead = Math.min(100, lead + 15);
    const realChoice = risk < 50 ? 'stable, safe option' : 'calculated risk';
    const idealChoice = idealRisk > 65 ? 'bold move with a structured plan' : 'stretch goal just outside comfort zone';
    return `👤 Real You (Risk ${Math.round(risk)}%): Would choose the ${realChoice}.\n🌟 Ideal You (Risk ${Math.round(idealRisk)}%, Lead ${Math.round(idealLead)}%): Would go for the ${idealChoice} — that's your growth edge.`;
}

// Feature 7: Adaptive Learning — update trait weights based on decisions
function adaptTraits(decision: string, traits: Traits): Traits {
    const updated = { ...traits };
    const l = decision.toLowerCase();
    if (/startup|risky|bold|quit|invest/.test(l)) updated['Risk Tolerance'] = Math.min(100, (updated['Risk Tolerance'] ?? 50) + 2);
    if (/stable|safe|wait|save|careful/.test(l)) updated['Risk Tolerance'] = Math.max(0, (updated['Risk Tolerance'] ?? 50) - 1);
    if (/team|consensus|together|collaborate/.test(l)) updated['Leadership Style'] = Math.max(0, (updated['Leadership Style'] ?? 50) - 1);
    if (/decided|lead|took charge|my call/.test(l)) updated['Leadership Style'] = Math.min(100, (updated['Leadership Style'] ?? 50) + 2);
    return updated;
}

// Core reply engine
function twinReply(userMsg: string, traits: Traits, moodMod: number): string {
    const risk = Math.min(100, Math.max(0, (traits['Risk Tolerance'] ?? 50) + moodMod));
    const logic = traits['Logic vs Emotion'] ?? 50;
    const social = traits['Social Dynamics'] ?? 50;
    const lead = traits['Leadership Style'] ?? 50;
    const fin = traits['Financial Patterns'] ?? 50;
    const l = userMsg.toLowerCase();
    const type = risk > 65 && lead > 65 ? 'Risk Explorer' : logic > 65 && fin > 65 ? 'Analytical Planner' : social > 65 && lead > 65 ? 'Emotional Leader' : logic > 65 && risk < 40 ? 'Strategic Thinker' : 'Balanced Realist';

    if (/who am i|personality|type|profile/.test(l)) return `You're a ${type}. Risk: ${Math.round(risk)}%, Logic: ${Math.round(logic)}%, Social: ${Math.round(social)}%, Leadership: ${Math.round(lead)}%, Finance: ${Math.round(fin)}%.`;
    if (/career|job|switch|quit|startup/.test(l)) return risk > 60 ? `Risk at ${Math.round(risk)}% — you'd lean toward the bold career move. Logic (${Math.round(logic)}%) says plan it first. Go for it, but negotiate a safety net.` : `Risk at ${Math.round(risk)}% — you prefer gradual transitions. Test the new path on the side before fully committing.`;
    if (/invest|money|save|spend|finance/.test(l)) return fin > 60 ? `Financial discipline at ${Math.round(fin)}% — you'd plan before investing. Avoid impulsive moves.` : `Finance score ${Math.round(fin)}% — you tend to spend in the moment. Automate savings so discipline doesn't rely on willpower.`;
    if (/relationship|friend|social|people/.test(l)) return social > 60 ? `Social at ${Math.round(social)}% — you thrive around people. Watch for over-committing.` : `Social at ${Math.round(social)}% — you prefer depth over breadth. A few close bonds matter more than a wide network.`;
    if (/lead|team|manage|boss/.test(l)) return lead > 60 ? `Leadership at ${Math.round(lead)}% — you naturally take charge. Watch for steamrolling under pressure.` : `Leadership ${Math.round(lead)}% — you're a strong contributor and consensus-builder. That's valuable.`;
    if (/stress|anxious|worried|fear/.test(l)) return logic > 60 ? `Analytical mind (${Math.round(logic)}%) — stress comes from uncertainty. Break it into parts.` : `Emotion-driven (logic ${Math.round(logic)}%) — talk it out with someone trusted before deciding.`;
    if (/study|exam|learn|course/.test(l)) return logic > 55 ? `Logic ${Math.round(logic)}% — structured, framework-based learning works best for you.` : `Logic ${Math.round(logic)}% — hands-on, experiential learning suits you better than theory.`;
    if (/hello|hi|hey/.test(l)) return `Hey! I'm your ${type} twin. Ask me about career, money, relationships, or any decision.`;
    if (/advice|suggest|help|what should/.test(l)) return `As your ${type}: ${risk > 60 ? 'lean into bold moves but plan the exit.' : 'take measured steps.'} ${logic > 60 ? 'Use data to validate your gut.' : 'Trust instincts but sanity-check with someone logical.'}`;
    return `As your ${type} (Risk ${Math.round(risk)}%, Logic ${Math.round(logic)}%) — I'd ${risk > 55 ? 'act decisively and adjust as I go' : 'gather more info before committing'}. What's the specific decision?`;
}

export default function TwinChatPage() {
    const [traits, setTraits] = useState<Traits | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [currentMood, setCurrentMood] = useState<{ mood: string; emoji: string; modifier: number }>({ mood: 'Neutral', emoji: '😐', modifier: 0 });
    const [goals, setGoals] = useState<string[]>([]);
    const [goalInput, setGoalInput] = useState('');
    const [showGoals, setShowGoals] = useState(false);
    const [listening, setListening] = useState(false);
    const [adaptedTraits, setAdaptedTraits] = useState<Traits | null>(null);
    const [adaptCount, setAdaptCount] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('personalityAnalysis');
        if (saved) {
            try {
                const t = JSON.parse(saved).traits as Traits;
                setTraits(t);
                setAdaptedTraits(t);
                const risk = t['Risk Tolerance'] ?? 50;
                const logic = t['Logic vs Emotion'] ?? 50;
                const lead = t['Leadership Style'] ?? 50;
                const type = risk > 65 && lead > 65 ? 'Risk Explorer' : logic > 65 ? 'Analytical Planner' : 'Balanced Realist';
                setMessages([{ role: 'twin', text: `Hey! I'm your ${type} twin. Ask me anything — career, money, relationships, or any decision. I'll answer as you. 🎙️ You can also use voice input!` }]);
            } catch { /* ignore */ }
        }
        const savedGoals = localStorage.getItem('twinGoals');
        if (savedGoals) try { setGoals(JSON.parse(savedGoals)); } catch { /* ignore */ }
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Feature 8: Voice Input
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Voice input not supported in this browser. Try Chrome.');
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
        recognition.onerror = () => setListening(false);
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    }, []);

    const addGoal = () => {
        if (!goalInput.trim()) return;
        const updated = [...goals, goalInput.trim()];
        setGoals(updated);
        setGoalInput('');
        localStorage.setItem('twinGoals', JSON.stringify(updated));
    };

    const send = () => {
        if (!input.trim() || !traits || !adaptedTraits) return;
        const userMsg = input.trim();
        setInput('');

        // Feature 1: detect mood
        const mood = detectMood(userMsg);
        setCurrentMood(mood);

        // Feature 3: bias detection
        const bias = detectBias(userMsg, adaptedTraits);

        // Feature 5: goal alignment
        const goalAlert = checkGoalAlignment(userMsg, adaptedTraits, goals);

        // Feature 2: dual twin
        const idealDiff = getDualTwin(userMsg, adaptedTraits);

        setMessages(prev => [...prev, { role: 'user', text: userMsg, mood: mood.mood !== 'Neutral' ? `${mood.emoji} ${mood.mood}` : undefined }]);
        setTyping(true);

        setTimeout(() => {
            const reply = twinReply(userMsg, adaptedTraits, mood.modifier);

            // Feature 7: adaptive learning
            const newTraits = adaptTraits(userMsg, adaptedTraits);
            setAdaptedTraits(newTraits);
            const changed = Object.keys(newTraits).some(k => Math.abs((newTraits[k] ?? 0) - (adaptedTraits[k] ?? 0)) > 0);
            if (changed) setAdaptCount(c => c + 1);

            const twinMsg: Message = { role: 'twin', text: reply, bias: bias ?? undefined, goalAlert: goalAlert ?? undefined, idealDiff: idealDiff ?? undefined };
            setMessages(prev => [...prev, twinMsg]);
            setTyping(false);

            // Feature 8: Voice response (speak the reply)
            if ('speechSynthesis' in window) {
                const utt = new SpeechSynthesisUtterance(reply.slice(0, 200));
                utt.rate = 1.05;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utt);
            }
        }, 600 + Math.random() * 400);
    };

    const SUGGESTIONS = ['What career move would I make?', 'I feel stressed about a decision', 'Should I invest my savings?', 'What is my personality type?', 'I am excited about a new opportunity!'];

    const displayTraits = adaptedTraits ?? traits;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TwinMind</Link>
                <div className="flex gap-3 flex-wrap">
                    <Link href="/dashboard"><Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Dashboard</Button></Link>
                    <Link href="/simulator"><Button variant="outline" className="border-accent text-accent hover:bg-accent/10">Simulator</Button></Link>
                </div>
            </nav>

            <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6 gap-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-1">💬 Twin Chat</h1>
                        <p className="text-foreground-secondary text-sm">Chat with your AI twin — mood-aware, bias-detecting, goal-aligned.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentMood.mood !== 'Neutral' && (
                            <div className="bg-card border border-border rounded-xl px-3 py-2 text-center">
                                <div className="text-xl">{currentMood.emoji}</div>
                                <div className="text-xs text-foreground-secondary">{currentMood.mood}</div>
                            </div>
                        )}
                        {adaptCount > 0 && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-center">
                                <div className="text-xs text-primary font-bold">🔁 Adapted</div>
                                <div className="text-xs text-foreground-secondary">{adaptCount}x</div>
                            </div>
                        )}
                    </div>
                </div>

                {!traits && (
                    <div className="bg-card border border-accent/30 rounded-xl p-6 text-center flex-1 flex flex-col items-center justify-center">
                        <p className="text-foreground-secondary mb-4">Take the quiz first to activate your digital twin.</p>
                        <Link href="/quiz"><Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Take Quiz</Button></Link>
                    </div>
                )}

                {traits && displayTraits && (
                    <>
                        {/* Trait bar — shows adapted values */}
                        <div className="flex flex-wrap gap-2 items-center">
                            {Object.entries(displayTraits).map(([name, score]) => (
                                <span key={name} className="text-xs bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 text-foreground-secondary">
                                    {name.split(' ')[0]}: <span className="text-accent font-bold">{Math.round(score)}%</span>
                                </span>
                            ))}
                            <button onClick={() => setShowGoals(!showGoals)} className="text-xs px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-accent hover:bg-accent/20 transition ml-auto">
                                🎯 Goals {goals.length > 0 ? `(${goals.length})` : '+ Add'}
                            </button>
                        </div>

                        {/* Feature 5: Goals panel */}
                        {showGoals && (
                            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                                <p className="text-sm font-semibold text-foreground">Your Goals (for alignment check)</p>
                                <div className="flex gap-2">
                                    <input value={goalInput} onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()}
                                        placeholder="e.g. Financial stability, Career growth..."
                                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-accent/50" />
                                    <Button onClick={addGoal} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm px-3">Add</Button>
                                </div>
                                {goals.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {goals.map((g, i) => (
                                            <span key={i} className="text-xs bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-foreground-secondary flex items-center gap-1">
                                                {g}
                                                <button onClick={() => { const u = goals.filter((_, j) => j !== i); setGoals(u); localStorage.setItem('twinGoals', JSON.stringify(u)); }} className="text-foreground-secondary hover:text-red-400 ml-1">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 bg-card border border-border rounded-xl p-4 overflow-y-auto space-y-4 min-h-80 max-h-[45vh]">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.mood && <span className="text-xs text-foreground-secondary mb-1 px-2">{msg.mood} mood detected</span>}
                                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user' ? 'bg-accent text-accent-foreground rounded-br-sm' : 'bg-primary/10 border border-primary/20 text-foreground rounded-bl-sm'}`}>
                                        {msg.role === 'twin' && <span className="text-xs text-primary font-semibold block mb-1">🤖 Your Twin</span>}
                                        {msg.text}
                                    </div>
                                    {/* Feature 3: Bias alert */}
                                    {msg.bias && <div className="max-w-[82%] mt-1 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-400">{msg.bias}</div>}
                                    {/* Feature 5: Goal alert */}
                                    {msg.goalAlert && <div className="max-w-[82%] mt-1 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400">{msg.goalAlert}</div>}
                                    {/* Feature 2: Dual twin */}
                                    {msg.idealDiff && (
                                        <div className="max-w-[82%] mt-1 text-xs bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg px-3 py-2 text-foreground-secondary whitespace-pre-line">{msg.idealDiff}</div>
                                    )}
                                </div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-bl-sm px-4 py-3">
                                        <span className="text-xs text-primary font-semibold block mb-1">🤖 Your Twin</span>
                                        <span className="flex gap-1">{[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Suggestions */}
                        {messages.length <= 1 && (
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-1.5 bg-card border border-border rounded-full text-foreground-secondary hover:border-accent/50 hover:text-accent transition">{s}</button>
                                ))}
                            </div>
                        )}

                        {/* Input + Voice */}
                        <div className="flex gap-2">
                            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                placeholder="Ask your twin anything..."
                                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-accent/50 transition text-sm" />
                            {/* Feature 8: Voice input button */}
                            <button onClick={startListening} title="Voice input"
                                className={`px-3 rounded-xl border transition text-lg ${listening ? 'border-red-400 bg-red-400/10 text-red-400 animate-pulse' : 'border-border text-foreground-secondary hover:border-accent/50 hover:text-accent'}`}>
                                🎙️
                            </button>
                            <Button onClick={send} disabled={!input.trim() || typing} className="bg-accent hover:bg-accent/90 text-accent-foreground px-5">Send</Button>
                        </div>
                        {listening && <p className="text-xs text-red-400 text-center animate-pulse">Listening... speak now</p>}
                    </>
                )}
            </main>
        </div>
    );
}
