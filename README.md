# TwinMind - Digital Personality Twin Application

AI-powered personality analysis and simulation platform. Complete production-ready application with React/Next.js frontend, FastAPI backend, and Supabase PostgreSQL database.

## Project Overview

**TwinMind** is a sophisticated web application that analyzes user personality through a scientifically-designed quiz, leveraging machine learning to:

- Extract 5 key personality traits (Risk Tolerance, Logic vs Emotion, Social Dynamics, Leadership, Financial Patterns)
- Predict behavior in various real-world scenarios
- Simulate "what-if" personality modifications
- Provide confidence scoring and reasoning for predictions
- Display personalized insights through interactive dashboards

## Architecture

```
+-------------------------------------------------------------+
|                    Frontend (Next.js 16)                    |
|  - Landing page with feature overview                       |
|  - Interactive personality quiz (15 questions)              |
|  - Dashboard with trait visualization (Radar, Bar charts)   |
|  - Scenario simulator with what-if analysis                 |
|  - Admin dashboard with analytics                           |
+--------------------+----------------------------------------+
                     | REST API (Next.js API Routes)
+--------------------v----------------------------------------+
|            Backend (FastAPI - Python 3.10+)                 |
|  - Quiz analysis engine                                     |
|  - ML personality model (scikit-learn)                      |
|  - Behavior prediction system                               |
|  - Scenario simulation engine                               |
|  - Trait confidence scoring                                 |
+--------------------+----------------------------------------+
                     | PostgreSQL Driver
+--------------------v----------------------------------------+
|      Database (Supabase PostgreSQL + Auth)                  |
|  - Users table                                              |
|  - Quiz responses                                           |
|  - Personality traits (with confidence)                     |
|  - Predictions and reasoning                                |
|  - Twin simulations                                         |
|  - Row Level Security (RLS) enabled                         |
+-------------------------------------------------------------+
```

## Quick Start - Local Development

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.10+
- PostgreSQL 14+ (or use Supabase)
- Git

### Frontend Setup

```bash
# Clone or download project
cd /path/to/twinmind

# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local with backend URL
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Start development server
pnpm dev
```

Frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Create .env
cp .env.example .env

# Edit .env with database credentials
# DATABASE_URL=postgresql://user:password@localhost/twinmind

# Run migrations (if not using Supabase)
# psql -U postgres -f scripts/schema.sql

# Start FastAPI server
python main.py
```

Backend will be available at `http://localhost:8000`

### Database Setup

**Option 1: Supabase (Recommended)**
1. Create Supabase project at https://supabase.com
2. Copy project credentials
3. Run migration from Supabase dashboard:
   - Go to SQL Editor
   - Create new query
   - Paste contents from `/vercel/share/v0-project/scripts/01_create_schema.sql`
   - Execute

**Option 2: Local PostgreSQL**
```bash
createdb twinmind
psql -U postgres -d twinmind -f scripts/01_create_schema.sql
```

## Project Structure

```
twinmind/
Γö£ΓöÇΓöÇ app/
Γöé   Γö£ΓöÇΓöÇ page.tsx                 # Landing page
Γöé   Γö£ΓöÇΓöÇ layout.tsx               # Root layout with metadata
Γöé   Γö£ΓöÇΓöÇ globals.css              # Theme tokens and styles
Γöé   Γö£ΓöÇΓöÇ quiz/
Γöé   Γöé   ΓööΓöÇΓöÇ page.tsx             # Interactive quiz (15 questions)
Γöé   Γö£ΓöÇΓöÇ dashboard/
Γöé   Γöé   ΓööΓöÇΓöÇ page.tsx             # Personality profile visualization
Γöé   Γö£ΓöÇΓöÇ simulator/
Γöé   Γöé   ΓööΓöÇΓöÇ page.tsx             # What-if scenario simulator
Γöé   Γö£ΓöÇΓöÇ admin/
Γöé   Γöé   ΓööΓöÇΓöÇ page.tsx             # Admin analytics dashboard
Γöé   ΓööΓöÇΓöÇ api/
Γöé       Γö£ΓöÇΓöÇ quiz-analysis/       # Quiz response analysis endpoint
Γöé       Γö£ΓöÇΓöÇ predict/             # Behavior prediction endpoint
Γöé       ΓööΓöÇΓöÇ simulate/            # Trait simulation endpoint
Γö£ΓöÇΓöÇ components/
Γöé   ΓööΓöÇΓöÇ ui/                      # shadcn/ui components
Γö£ΓöÇΓöÇ lib/
Γöé   Γö£ΓöÇΓöÇ api.ts                   # API service client
Γöé   ΓööΓöÇΓöÇ utils.ts                 # Utility functions
Γö£ΓöÇΓöÇ backend/
Γöé   Γö£ΓöÇΓöÇ main.py                  # FastAPI application
Γöé   Γö£ΓöÇΓöÇ personality_model.py     # ML analysis engine
Γöé   Γö£ΓöÇΓöÇ pyproject.toml           # Python dependencies
Γöé   Γö£ΓöÇΓöÇ .env.example             # Environment template
Γöé   ΓööΓöÇΓöÇ README.md                # Backend documentation
ΓööΓöÇΓöÇ scripts/
    ΓööΓöÇΓöÇ 01_create_schema.sql     # Database migrations
```

## Features

### 1. Personality Quiz
- 15 carefully designed questions across 5 traits
- 0-100 continuous scale responses
- Real-time progress tracking
- Validation and error handling

### 2. Trait Analysis
- Risk Tolerance assessment
- Logic vs Emotion scoring
- Social Dynamics evaluation
- Leadership style analysis
- Financial behavior patterns

### 3. Personality Dashboard
- Interactive radar chart showing trait profile
- Bar chart comparison of trait scores
- Confidence scoring for each trait
- Trait reasoning and insights
- Seamless navigation to scenario simulator

### 4. Scenario Simulator
- 5+ real-world scenarios
- Behavior prediction with confidence scores
- Alternative behavior suggestions
- Visual confidence indicators
- What-if trait modification simulation

### 5. Admin Dashboard
- User metrics and growth trends
- Quiz completion analytics
- Trait distribution analysis
- Model performance metrics
- User management interface

## API Endpoints

### Quiz Analysis
```
POST /api/quiz-analysis
Content-Type: application/json

{
  "userId": "user123",
  "responses": [25, 35, 45, 55, 65, ...]  // 15 values (0-100)
}

Response: { traits, confidence, reasoning }
```

### Behavior Prediction
```
POST /api/predict
Content-Type: application/json

{
  "userId": "user123",
  "scenario": "career_risk",
  "traits": { "Risk Tolerance": 65, ... }
}

Response: { predicted_behavior, confidence, reasoning, alternatives }
```

### Trait Simulation
```
POST /api/simulate
Content-Type: application/json

{
  "userId": "user123",
  "scenario": "career_risk",
  "traitModifications": { "Risk Tolerance": 80 }
}

Response: { original_prediction, modified_prediction, changes }
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```
PORT=8000
DATABASE_URL=postgresql://user:password@host/database
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
FRONTEND_URL=http://localhost:3000
```

## Production Deployment

### Frontend - Vercel (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel:**
   - Visit https://vercel.com
   - Import GitHub repository
   - Set environment variables:
     - `NEXT_PUBLIC_BACKEND_URL` ΓåÆ Backend API URL
   - Deploy

### Backend - Render/Railway

**Using Render:**

1. Create `Dockerfile` in backend directory
2. Push to GitHub
3. Connect to Render.com
4. Set environment variables
5. Deploy

**Using Railway:**

1. Create `Procfile`:
```
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

2. Push to GitHub
3. Connect Railway project
4. Deploy

### Database - Supabase

Database is already configured in Supabase - no additional setup needed. Just ensure:
- Schema is migrated
- RLS policies are enabled
- Connection string is secure

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with v4
- **Recharts** - Data visualization
- **shadcn/ui** - Accessible components

### Backend
- **FastAPI** - Modern Python web framework
- **scikit-learn** - ML library for analysis
- **NumPy** - Numerical computing
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Database
- **PostgreSQL 14+** - Relational database
- **Supabase** - PostgreSQL hosting + Auth
- **Row Level Security** - Data access control

## Security

- Γ£à Row Level Security (RLS) on all tables
- Γ£à Environment variables for sensitive data
- Γ£à CORS configured for frontend
- Γ£à Input validation on all endpoints
- Γ£à Type safety with TypeScript/Pydantic
- Γ£à No hardcoded credentials

## Performance Optimization

- Frontend: Next.js App Router with server components
- Backend: Efficient ML model caching
- Database: Indexed queries, connection pooling
- Charts: Recharts with responsive containers
- Lazy loading for admin data

## Testing

```bash
# Frontend tests
pnpm test

# Backend tests
pytest

# End-to-end tests
pnpm e2e
```

## Troubleshooting

**Backend connection fails:**
- Ensure backend is running: `python main.py`
- Check `NEXT_PUBLIC_BACKEND_URL` in frontend .env
- Verify CORS configuration

**Database connection error:**
- Verify PostgreSQL is running
- Check connection string in `.env`
- Run migrations if needed

**Quiz submission fails:**
- Ensure backend API is accessible
- Check browser console for errors
- Verify all 15 responses are provided

## Future Enhancements

- User authentication with Supabase Auth
- Social sharing of personality profiles
- Comparison with friends/colleagues
- Historical trait tracking
- Advanced ML model improvements
- Mobile app (React Native)
- Real-time multiplayer scenarios

## Support

For issues or questions:
1. Check documentation in `backend/README.md`
2. Review API error messages
3. Check browser console for client-side errors
4. Verify environment variables are set correctly

## License

MIT - Open source and free to use

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Submit pull request

---

**Built with Γ¥ñ∩╕Å using Next.js, FastAPI, and PostgreSQL**
