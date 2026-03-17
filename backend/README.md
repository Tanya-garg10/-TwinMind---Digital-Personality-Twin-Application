# TwinMind Backend - Personality Analysis API

FastAPI-based backend for AI-powered personality analysis. Provides endpoints for quiz processing, personality prediction, and scenario simulation.

## Features

- **Personality Analysis**: Process quiz responses and extract 5 key personality traits
- **Behavior Prediction**: Predict how users would behave in various scenarios
- **What-If Simulation**: Show how modified traits would change decision-making
- **Confidence Scoring**: Statistical confidence for each prediction
- **Trait Definitions**: Available trait and scenario library

## Setup

### Prerequisites
- Python 3.10+
- pip or uv package manager

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -e .
# OR using uv:
uv run
```

4. Copy environment template:
```bash
cp .env.example .env
```

5. Fill in `.env` with your configuration

### Running the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Analysis
- **POST** `/analyze` - Analyze personality from quiz responses
  ```json
  {
    "user_id": "user123",
    "responses": [25, 35, 45, 55, 65, 75, 45, 55, 65, 30, 40, 50, 60, 70, 80]
  }
  ```

### Predictions
- **POST** `/predict` - Predict behavior in a scenario
  ```json
  {
    "user_id": "user123",
    "scenario": "career_risk",
    "trait_values": {
      "Risk Tolerance": 65,
      "Logic vs Emotion": 55,
      "Social Dynamics": 45,
      "Leadership Style": 70,
      "Financial Patterns": 60
    }
  }
  ```

### Simulations
- **POST** `/simulate` - Simulate modified traits
  ```json
  {
    "user_id": "user123",
    "trait_modifications": {
      "Risk Tolerance": 80
    },
    "scenario": "career_risk"
  }
  ```

### Reference Data
- **GET** `/traits` - Get trait definitions
- **GET** `/scenarios` - Get available scenarios

## Architecture

### Main Components

1. **main.py** - FastAPI application and route handlers
2. **personality_model.py** - ML logic using scikit-learn
   - Quiz analysis and trait extraction
   - Behavior prediction engine
   - Scenario simulation
   - Confidence scoring

### Personality Traits

1. **Risk Tolerance** - Comfort with uncertainty and calculated risks
2. **Logic vs Emotion** - Analytical vs intuitive decision-making
3. **Social Dynamics** - Preference for group interaction and social settings
4. **Leadership Style** - Natural leadership and decision-making approach
5. **Financial Patterns** - Saving vs spending behavior and priorities

## Deployment

### Local Development
```bash
uvicorn main:app --reload
```

### Production
Use a production ASGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Docker
Create a `Dockerfile`:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

Build and run:
```bash
docker build -t twinmind-backend .
docker run -p 8000:8000 twinmind-backend
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 8000)
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `FRONTEND_URL` - Frontend application URL

## Testing

Run tests (when added):
```bash
pytest
```

## Technology Stack

- **FastAPI** - Modern web framework
- **scikit-learn** - Machine learning library
- **NumPy** - Numerical computing
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## License

MIT
