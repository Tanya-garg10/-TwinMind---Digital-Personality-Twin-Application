"""
Personality Analysis Model using scikit-learn
Implements ML logic for personality trait analysis and predictions
"""

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from typing import Tuple, Dict, List
import json

class PersonalityAnalyzer:
    """
    ML-powered personality analyzer using scikit-learn
    Analyzes quiz responses and generates predictions for various scenarios
    """
    
    def __init__(self):
        self.trait_names = [
            "Risk Tolerance",
            "Logic vs Emotion",
            "Social Dynamics",
            "Leadership Style",
            "Financial Patterns"
        ]
        
        self.trait_descriptions = {
            "Risk Tolerance": "How comfortable you are taking calculated risks",
            "Logic vs Emotion": "Whether you prioritize data/logic or intuition/feelings",
            "Social Dynamics": "Your preference for social interaction and group settings",
            "Leadership Style": "How naturally you take charge and influence others",
            "Financial Patterns": "Your approach to spending vs saving money"
        }
        
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=3)
        
        # Define scenarios with trait weights
        self.scenarios = {
            "career_risk": {
                "description": "Career opportunity with significant financial risk",
                "weights": {"Risk Tolerance": 0.4, "Logic vs Emotion": 0.3, "Financial Patterns": 0.3}
            },
            "leadership_decision": {
                "description": "Making a team decision under uncertainty",
                "weights": {"Leadership Style": 0.4, "Logic vs Emotion": 0.3, "Risk Tolerance": 0.3}
            },
            "social_event": {
                "description": "Large social gathering with networking opportunity",
                "weights": {"Social Dynamics": 0.5, "Leadership Style": 0.3, "Risk Tolerance": 0.2}
            },
            "major_purchase": {
                "description": "Deciding on a significant financial purchase",
                "weights": {"Financial Patterns": 0.4, "Logic vs Emotion": 0.3, "Risk Tolerance": 0.3}
            }
        }
    
    def analyze(self, responses: List[int]) -> Tuple[Dict[str, float], Dict[str, float], Dict[str, str]]:
        """
        Analyze quiz responses and extract personality traits
        
        Args:
            responses: List of 15 responses (3 per trait, 0-100 scale)
        
        Returns:
            Tuple of (traits, confidence, reasoning)
        """
        # Organize responses by trait (3 questions per trait)
        trait_scores = {}
        trait_responses = {}
        
        for i, trait in enumerate(self.trait_names):
            start_idx = i * 3
            end_idx = start_idx + 3
            responses_for_trait = responses[start_idx:end_idx]
            trait_responses[trait] = responses_for_trait
            
            # Calculate trait score (average of 3 questions)
            trait_scores[trait] = np.mean(responses_for_trait)
        
        # Calculate confidence based on consistency
        confidence_scores = {}
        for trait, responses_list in trait_responses.items():
            # Lower variance = higher confidence
            variance = np.std(responses_list)
            confidence = 1 - (variance / 100)  # Normalize to 0-1
            confidence_scores[trait] = max(0.5, confidence)  # Min 50% confidence
        
        # Generate reasoning for each trait
        reasoning = self._generate_reasoning(trait_scores, trait_responses)
        
        return trait_scores, confidence_scores, reasoning
    
    def _generate_reasoning(self, traits: Dict[str, float], responses: Dict[str, List[int]]) -> Dict[str, str]:
        """Generate human-readable reasoning for each trait score"""
        reasoning = {}
        
        for trait, score in traits.items():
            if score >= 70:
                intensity = "strongly"
            elif score >= 50:
                intensity = "moderately"
            elif score >= 30:
                intensity = "somewhat"
            else:
                intensity = "not particularly"
            
            if trait == "Risk Tolerance":
                if score >= 70:
                    reasoning[trait] = f"You {intensity} embrace risk and uncertainty. You're comfortable with bold decisions."
                else:
                    reasoning[trait] = f"You {intensity} prefer stable, predictable outcomes over high-risk opportunities."
            
            elif trait == "Logic vs Emotion":
                if score >= 70:
                    reasoning[trait] = f"You {intensity} rely on data and logic. You tend to think through decisions analytically."
                else:
                    reasoning[trait] = f"You {intensity} trust your intuition and emotional responses in decision-making."
            
            elif trait == "Social Dynamics":
                if score >= 70:
                    reasoning[trait] = f"You {intensity} enjoy social interaction. You gain energy from being around people."
                else:
                    reasoning[trait] = f"You {intensity} prefer intimate settings and smaller groups over large gatherings."
            
            elif trait == "Leadership Style":
                if score >= 70:
                    reasoning[trait] = f"You {intensity} take charge naturally. People look to you for direction and decisions."
                else:
                    reasoning[trait] = f"You {intensity} prefer collaborative approaches and seek consensus before deciding."
            
            elif trait == "Financial Patterns":
                if score >= 70:
                    reasoning[trait] = f"You {intensity} prioritize long-term security through saving and financial planning."
                else:
                    reasoning[trait] = f"You {intensity} value experiences and living in the moment over strict budgeting."
        
        return reasoning
    
    # Rich per-scenario prediction templates keyed by (scenario, chosen_option, level)
    PREDICTIONS = {
        "career_risk": {
            "option1": {  # Stable Job chosen
                "high":    ("Your twin would still pick the stable job — but feels the pull of the startup. High risk tolerance means this was a tough call.", 0.71),
                "mid":     ("Your twin would choose the stable job. With moderate risk tolerance, security wins when stakes are this high.", 0.78),
                "low":     ("Your twin would firmly choose the stable job. Low risk tolerance makes the startup feel too dangerous.", 0.88),
            },
            "option2": {  # Risky Startup chosen
                "high":    ("Your twin would go for the startup. High risk tolerance + growth mindset = bold career move.", 0.87),
                "mid":     ("Your twin leans toward the startup but would negotiate a safety net first. Moderate risk tolerance drives careful boldness.", 0.72),
                "low":     ("Your twin would hesitate on the startup. Low risk tolerance makes this feel reckless — they'd likely back out.", 0.80),
            },
        },
        "major_purchase": {
            "option1": {  # Save and wait
                "high":    ("Your twin would save — but impatiently. High financial discipline wins, though they'd set a strict deadline.", 0.74),
                "mid":     ("Your twin would save and wait. Moderate financial patterns favor patience over impulse.", 0.79),
                "low":     ("Your twin would save reluctantly. Low financial discipline means they'd struggle but ultimately wait.", 0.70),
            },
            "option2": {  # Buy now
                "high":    ("Your twin would buy it now. Strong financial confidence means they trust they can rebuild savings.", 0.82),
                "mid":     ("Your twin might buy it — after checking if there's an EMI option. Balanced financial patterns seek middle ground.", 0.73),
                "low":     ("Your twin would buy it impulsively. Low financial discipline + high desire = immediate purchase.", 0.85),
            },
        },
        "leadership_decision": {
            "option1": {  # Seek consensus
                "high":    ("Your twin would seek input but drive the conversation. High leadership means consensus is a tool, not a crutch.", 0.76),
                "mid":     ("Your twin would gather opinions then decide. Moderate leadership balances team buy-in with decisiveness.", 0.80),
                "low":     ("Your twin would fully defer to the team. Low leadership tendency means consensus feels safer.", 0.84),
            },
            "option2": {  # Decisive call
                "high":    ("Your twin would make the call confidently. High leadership instinct takes over under pressure.", 0.89),
                "mid":     ("Your twin would decide — but explain the reasoning to the team after. Moderate leadership with accountability.", 0.75),
                "low":     ("Your twin would struggle to make a unilateral call. Low leadership means this feels uncomfortable.", 0.78),
            },
        },
        "social_event": {
            "option1": {  # Decline
                "high":    ("Your twin would decline despite high social energy — 300 strangers feels overwhelming even for extroverts.", 0.68),
                "mid":     ("Your twin would decline or attend briefly. Moderate social dynamics means large crowds drain energy fast.", 0.77),
                "low":     ("Your twin would definitely decline. Low social dynamics = large networking events are draining, not energizing.", 0.91),
            },
            "option2": {  # Attend
                "high":    ("Your twin would attend enthusiastically. High social energy turns 300 strangers into 300 opportunities.", 0.90),
                "mid":     ("Your twin would attend with a plan — arrive early, leave when energy dips. Moderate social dynamics = strategic socializing.", 0.74),
                "low":     ("Your twin would attend but feel drained quickly. Low social dynamics means they'd leave early.", 0.72),
            },
        },
    }

    def predict_behavior(self, traits: Dict[str, float], scenario: str, chosen_option: str = "") -> Tuple[str, float, str, List[str]]:
        """
        Predict behavior based on personality traits, scenario, and the option the user clicked.
        chosen_option: the label of the option clicked (e.g. "Stable Corporate Job")
        """
        if scenario not in self.scenarios:
            # fallback for unknown scenarios
            scenario = "career_risk"

        scenario_weights = self.scenarios[scenario]["weights"]

        # Weighted trait score
        weighted_score = sum(traits.get(t, 50) * w for t, w in scenario_weights.items())
        weighted_score /= sum(scenario_weights.values())

        # Determine level bucket — tighter neutral zone
        if weighted_score >= 60:
            level = "high"
        elif weighted_score >= 40:
            level = "mid"
        else:
            level = "low"

        # Map chosen_option string to option1/option2 key
        option_key = self._resolve_option_key(scenario, chosen_option)

        # Get prediction text + base confidence
        templates = self.PREDICTIONS.get(scenario, {})
        option_templates = templates.get(option_key, templates.get("option1", {}))
        prediction_text, base_conf = option_templates.get(level, (None, 0.70))

        if not prediction_text:
            prediction_text = f"Your twin would approach this with a {'bold' if level == 'high' else 'cautious' if level == 'low' else 'balanced'} mindset."

        # Confidence varies slightly with distance from 50
        confidence = min(0.95, base_conf + abs(weighted_score - 50) * 0.002)

        # Rich reasoning
        primary_trait = max(scenario_weights, key=lambda t: scenario_weights[t] * traits.get(t, 50))
        primary_score = traits.get(primary_trait, 50)
        reasoning = self._build_reasoning(primary_trait, primary_score, weighted_score, chosen_option, level)

        # Alternatives = the other option's mid prediction
        alt_key = "option2" if option_key == "option1" else "option1"
        alt_templates = templates.get(alt_key, {})
        alt_text, _ = alt_templates.get("mid", ("A different approach was also possible.", 0.65))
        alternatives = [alt_text, f"With a different risk profile, your twin might have chosen differently."]

        return prediction_text, confidence, reasoning, alternatives

    def _resolve_option_key(self, scenario: str, chosen_option: str) -> str:
        """Map the clicked option label to option1 or option2."""
        option1_keywords = {
            "career_risk":         ["stable", "corporate", "safe"],
            "major_purchase":      ["save", "wait", "longer"],
            "leadership_decision": ["consensus", "compromise", "seek"],
            "social_event":        ["decline", "politely", "no"],
        }
        lower = chosen_option.lower()
        keywords = option1_keywords.get(scenario, [])
        if any(k in lower for k in keywords):
            return "option1"
        return "option2"

    def _build_reasoning(self, trait: str, score: float, weighted: float, chosen: str, level: str) -> str:
        level_desc = {"high": "above average", "mid": "moderate", "low": "below average"}[level]
        trait_impact = {
            "Risk Tolerance":    f"Risk Tolerance at {score:.0f}% ({level_desc}) is the dominant driver here.",
            "Logic vs Emotion":  f"Logic vs Emotion at {score:.0f}% ({level_desc}) shapes how this decision is processed.",
            "Social Dynamics":   f"Social Dynamics at {score:.0f}% ({level_desc}) determines comfort in this situation.",
            "Leadership Style":  f"Leadership Style at {score:.0f}% ({level_desc}) dictates the approach taken.",
            "Financial Patterns":f"Financial Patterns at {score:.0f}% ({level_desc}) controls the money-related instinct.",
        }
        chosen_part = f' You clicked "{chosen}".' if chosen else ""
        return f"{trait_impact.get(trait, f'{trait}: {score:.0f}%')}{chosen_part} Overall scenario score: {weighted:.0f}/100."
    
    def simulate_modification(self, trait_modifications: Dict[str, float], scenario: str) -> Tuple[str, str, Dict]:
        """
        Simulate how behavior would change with modified traits.
        trait_modifications contains the ALREADY modified trait values.
        We derive the original by reversing a +15 boost for comparison.
        """
        # The incoming dict is the modified state; derive original by subtracting 15
        original_traits = {
            trait: max(0, val - 15)
            for trait, val in trait_modifications.items()
        }
        changes = {
            trait: trait_modifications[trait] - original_traits[trait]
            for trait in trait_modifications
        }

        original, _, _, _ = self.predict_behavior(original_traits, scenario)
        modified, _, _, _ = self.predict_behavior(trait_modifications, scenario)

        return original, modified, changes
    
    def get_trait_definitions(self) -> Dict[str, str]:
        """Get trait definitions and descriptions"""
        return self.trait_descriptions
    
    def get_scenarios(self) -> Dict:
        """Get available scenarios"""
        return {k: v["description"] for k, v in self.scenarios.items()}
