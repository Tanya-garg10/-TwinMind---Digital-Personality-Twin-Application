"""
TwinMind Personality Analysis Backend
FastAPI server for AI-powered personality analysis and predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import json

from personality_model import PersonalityAnalyzer

load_dotenv()

app = FastAPI(
    title="TwinMind Backend",
    description="AI-powered personality analysis API",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the personality analyzer
analyzer = PersonalityAnalyzer()

# Request/Response Models
class QuizResponse(BaseModel):
    user_id: str
    responses: List[int]  # List of 0-100 scores for quiz questions

class PersonalityResult(BaseModel):
    user_id: str
    traits: dict
    confidence: dict
    reasoning: dict

class PredictionRequest(BaseModel):
    user_id: str
    scenario: str
    trait_values: dict

class PredictionResult(BaseModel):
    user_id: str
    scenario: str
    predicted_behavior: str
    confidence: float
    reasoning: str
    alternative_behaviors: List[str]

class SimulationRequest(BaseModel):
    user_id: str
    trait_modifications: dict
    scenario: str

class SimulationResult(BaseModel):
    user_id: str
    original_prediction: str
    modified_prediction: str
    changes: dict

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "personality-twin-backend"}

@app.post("/analyze", response_model=PersonalityResult)
async def analyze_personality(data: QuizResponse):
    """
    Analyze personality based on quiz responses
    
    Takes 15 responses (0-100 scale) and returns 5 trait scores
    """
    try:
        if len(data.responses) != 15:
            raise ValueError("Expected 15 quiz responses")
        
        traits, confidence, reasoning = analyzer.analyze(data.responses)
        
        return PersonalityResult(
            user_id=data.user_id,
            traits=traits,
            confidence=confidence,
            reasoning=reasoning
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict", response_model=PredictionResult)
async def predict_behavior(data: PredictionRequest):
    """
    Predict how a person would behave in a scenario
    
    Takes current trait values and a scenario, returns predicted behavior
    """
    try:
        prediction, confidence, reasoning, alternatives = analyzer.predict_behavior(
            data.trait_values,
            data.scenario
        )
        
        return PredictionResult(
            user_id=data.user_id,
            scenario=data.scenario,
            predicted_behavior=prediction,
            confidence=confidence,
            reasoning=reasoning,
            alternative_behaviors=alternatives
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/simulate", response_model=SimulationResult)
async def simulate_modified_traits(data: SimulationRequest):
    """
    Simulate behavior with modified personality traits
    
    Takes current traits, modifications, and scenario to show what-if outcomes
    """
    try:
        original, modified, changes = analyzer.simulate_modification(
            data.trait_modifications,
            data.scenario
        )
        
        return SimulationResult(
            user_id=data.user_id,
            original_prediction=original,
            modified_prediction=modified,
            changes=changes
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class CustomScenarioRequest(BaseModel):
    user_id: str
    scenario_text: str
    trait_values: dict

@app.post("/predict-custom")
async def predict_custom_scenario(data: CustomScenarioRequest):
    """
    Predict behavior for a free-text scenario by mapping it to the closest
    built-in scenario type using keyword matching.
    """
    try:
        text = data.scenario_text.lower()
        if any(w in text for w in ["job", "career", "startup", "work", "salary"]):
            scenario_key = "career_risk"
        elif any(w in text for w in ["buy", "purchase", "money", "invest", "spend", "save"]):
            scenario_key = "major_purchase"
        elif any(w in text for w in ["team", "lead", "manage", "decision", "boss"]):
            scenario_key = "leadership_decision"
        elif any(w in text for w in ["social", "party", "event", "people", "friend"]):
            scenario_key = "social_event"
        else:
            scenario_key = "career_risk"

        prediction, confidence, reasoning, alternatives = analyzer.predict_behavior(
            data.trait_values, scenario_key
        )
        return {
            "user_id": data.user_id,
            "scenario": data.scenario_text,
            "predicted_behavior": prediction,
            "confidence": confidence,
            "reasoning": f'For your scenario: "{data.scenario_text[:80]}..." — {reasoning}',
            "alternative_behaviors": alternatives,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/traits")
async def get_trait_definitions():
    """Get definitions of all personality traits"""
    return analyzer.get_trait_definitions()

@app.get("/scenarios")
async def get_scenario_library():
    """Get available scenarios for simulation"""
    return analyzer.get_scenarios()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
