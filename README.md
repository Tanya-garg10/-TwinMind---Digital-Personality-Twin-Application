# 🧠 TwinMind — Digital Personality Twin

> AI-powered personality analysis, decision prediction, and your digital twin that thinks like you.

---

## 🚀 What is TwinMind?

TwinMind creates a **digital clone of your personality** based on a quiz.
Once your twin is built, it can:
- Predict what decisions you'd make in real scenarios
- Chat with you and answer as you would
- Show how your choices change if your personality traits shift

---

## ✨ Features

### 1. 🧩 Personality Quiz
- 30-question bank, 3 randomly picked per trait each session
- 5 traits measured: Risk Tolerance, Logic vs Emotion, Social Dynamics, Leadership Style, Financial Patterns
- Slider-based answers (0–100), trait progress bar shown live

### 2. 📊 Dashboard
- **Radar Chart** — visual web of all 5 traits
- **Bar Chart** — score breakdown with confidence %
- **Personality Type** — classified into 7 types (Risk Explorer, Analytical Planner, etc.)
- **AI Advice** — personalized suggestions based on your scores
- **Evolution Tracker** — bar graph showing how traits change across sessions
- **PDF Report** — download full report with traits, strengths, weaknesses, suggestions

### 3. 🔮 Scenario Simulator
- 4 preset scenarios: Career, Purchase, Leadership, Social
- Click an option → twin predicts what you'd actually choose
- **Accuracy Test** — record your real choice, track twin accuracy %
- **Scenario Recommendations** — AI suggests which scenario fits your profile
- **What-If Simulator** — adjust trait sliders, compare Original You vs Modified You
- **Custom Scenario** — type any situation, get a prediction

### 4. 💬 Twin Chat
- Chat with your AI twin that responds as you would
- **Mood Detection** — detects Happy/Stressed/Sad from text, adjusts risk in reply
- **Dual Twin** — shows Real You vs Ideal You side by side
- **Bias Detector** — flags overthinking, peer pressure, fear of failure
- **Goal Alignment** — set your goals, get warned when decisions conflict
- **Adaptive Learning** — twin updates trait weights after each decision
- **Voice Input** — speak your question (Chrome supported)
- **Voice Response** — twin speaks the reply back

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Recharts |
| Backend | FastAPI (Python) |
| ML | scikit-learn, numpy, scipy |
| Deploy | Vercel (frontend) + Render (backend) |

---

## ⚙️ How to Run Locally

### Frontend
```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
py -m uvicorn app:app --reload --port 8000
# → http://localhost:8000
```

### Environment
Create `.env.local` in root:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 🌐 Deploy

### Frontend → Vercel
```bash
pnpm add -g vercel
vercel
```
Or connect GitHub repo at [vercel.com](https://vercel.com)

Add environment variable in Vercel dashboard:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo, set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

---

## 🎤 Demo Script (Presentation)

> "TwinMind builds a digital clone of your personality in 3 steps."

**Step 1 — Quiz (30 sec)**
"User fills a 15-question quiz. Each question measures one of 5 personality traits on a 0–100 scale. Questions are randomized every session so no two users get the same set."

**Step 2 — Profile (30 sec)**
"The backend analyzes responses using a weighted ML model and generates trait scores with confidence percentages. The dashboard shows a radar chart, personality type classification, and AI-generated advice."

**Step 3 — Prediction (1 min)**
"Now the interesting part — the Scenario Simulator. User picks a real-life scenario like 'Should I take a risky startup job?' and clicks an option. The twin predicts what the user would actually choose based on their trait profile — not just a generic answer, but one that changes based on their specific Risk Tolerance, Leadership, and Financial scores."

**Step 4 — What-If (30 sec)**
"The What-If Simulator lets you ask: what if I was more risk-tolerant? Drag the slider up 30 points — the prediction changes from 'stable job' to 'go for the startup'. This shows how personality directly drives decisions."

**Step 5 — Twin Chat (30 sec)**
"Finally, Twin Chat. You can have a full conversation with your digital twin. It detects your mood from text, warns you about decision biases like overthinking or peer pressure, and even speaks the reply back using voice synthesis."

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx          # Landing page
│   ├── quiz/             # Personality quiz
│   ├── dashboard/        # Trait analysis + charts
│   ├── simulator/        # Scenario + What-If simulator
│   ├── twin-chat/        # AI twin chat
│   └── api/              # Next.js API routes → backend proxy
├── backend/
│   ├── app.py            # FastAPI server
│   └── personality_model.py  # ML prediction engine
├── components/ui/        # shadcn/ui components
└── lib/api.ts            # Frontend API client
```
