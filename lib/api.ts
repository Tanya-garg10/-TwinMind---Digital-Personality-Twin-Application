/**
 * API Service for communicating with TwinMind backend
 * Handles personality analysis, predictions, and simulations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface PersonalityTraits {
  [key: string]: number;
}

interface AnalysisResponse {
  user_id: string;
  traits: PersonalityTraits;
  confidence: PersonalityTraits;
  reasoning: { [key: string]: string };
}

interface PredictionResponse {
  user_id: string;
  scenario: string;
  predicted_behavior: string;
  confidence: number;
  reasoning: string;
  alternative_behaviors: string[];
}

interface SimulationResponse {
  user_id: string;
  original_prediction: string;
  modified_prediction: string;
  changes: { [key: string]: number };
}

// Mock personality analysis for development/fallback
function generateMockAnalysis(userId: string, responses: number[]): AnalysisResponse {
  const riskTolerance = (responses.slice(0, 3).reduce((a, b) => a + b) / 3);
  const logicEmotion = (responses.slice(3, 6).reduce((a, b) => a + b) / 3);
  const socialDynamics = (responses.slice(6, 9).reduce((a, b) => a + b) / 3);
  const leadership = (responses.slice(9, 12).reduce((a, b) => a + b) / 3);
  const financialPatterns = (responses.slice(12, 15).reduce((a, b) => a + b) / 3);

  const traits = {
    'Risk Tolerance': Math.round(riskTolerance),
    'Logic vs Emotion': Math.round(logicEmotion),
    'Social Dynamics': Math.round(socialDynamics),
    'Leadership Style': Math.round(leadership),
    'Financial Patterns': Math.round(financialPatterns),
  };

  return {
    user_id: userId,
    traits,
    confidence: {
      'Risk Tolerance': 0.85,
      'Logic vs Emotion': 0.82,
      'Social Dynamics': 0.88,
      'Leadership Style': 0.80,
      'Financial Patterns': 0.84,
    },
    reasoning: {
      'Risk Tolerance': 'Based on your responses about career and financial decisions',
      'Logic vs Emotion': 'Derived from how you approach problem-solving',
      'Social Dynamics': 'Calculated from your social and interaction preferences',
      'Leadership Style': 'Based on your leadership style preferences',
      'Financial Patterns': 'From your financial management responses',
    },
  };
}

class PersonalityAPI {
  private baseUrl: string;
  private backendAvailable: boolean | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      this.backendAvailable = response.ok;
      return response.ok;
    } catch (error) {
      console.warn('[v0] Backend health check failed, using mock mode:', error);
      this.backendAvailable = false;
      return false;
    }
  }

  /**
   * Analyze personality from quiz responses
   */
  async analyzePersonality(
    userId: string,
    responses: number[]
  ): Promise<AnalysisResponse> {
    // Check if backend is available
    if (this.backendAvailable === null) {
      await this.healthCheck();
    }

    // Use mock if backend unavailable
    if (!this.backendAvailable) {
      console.log('[v0] Using mock personality analysis (backend unavailable)');
      return generateMockAnalysis(userId, responses);
    }

    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          responses,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[v0] Backend analysis failed, using mock:', error);
      this.backendAvailable = false;
      return generateMockAnalysis(userId, responses);
    }
  }

  /**
   * Predict behavior in a scenario — always tries backend fresh, no caching
   */
  async predictBehavior(
    userId: string,
    scenario: string,
    traits: PersonalityTraits,
    chosenOption: string = ""
  ): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, scenario, trait_values: traits, chosen_option: chosenOption }),
      });

      if (!response.ok) throw new Error(`Prediction failed: ${response.statusText}`);
      this.backendAvailable = true;
      return response.json();
    } catch (error) {
      console.warn('[v0] Backend prediction failed, using local fallback:', error);
      this.backendAvailable = false;
      const risk = traits['Risk Tolerance'] ?? 50;
      const logic = traits['Logic vs Emotion'] ?? 50;
      const social = traits['Social Dynamics'] ?? 50;
      const lead = traits['Leadership Style'] ?? 50;
      const finance = traits['Financial Patterns'] ?? 50;

      const lower = chosenOption.toLowerCase();
      const wantsRisky = lower.includes('startup') || lower.includes('buy') || lower.includes('decisive') || lower.includes('attend');

      const scenarioMap: Record<string, { bold: string; cautious: string; key: string; val: number }> = {
        career_risk: { bold: 'Your twin would go for the startup — growth mindset wins.', cautious: 'Your twin would pick the stable job — security first.', key: 'Risk Tolerance', val: risk },
        major_purchase: { bold: 'Your twin would buy it now — experiences over savings.', cautious: 'Your twin would save and wait — financial discipline holds.', key: 'Financial Patterns', val: finance },
        leadership_decision: { bold: 'Your twin would make the decisive call — leadership instinct kicks in.', cautious: 'Your twin would seek consensus — collaboration over authority.', key: 'Leadership Style', val: lead },
        social_event: { bold: 'Your twin would attend enthusiastically — social energy is high.', cautious: 'Your twin would decline — large crowds are draining.', key: 'Social Dynamics', val: social },
      };

      const p = scenarioMap[scenario] ?? scenarioMap['career_risk'];
      const isHigh = p.val >= 50;
      const prediction = wantsRisky
        ? (isHigh ? p.bold : `Your twin would hesitate on "${chosenOption}" — ${p.key} at ${Math.round(p.val)}% makes this feel too risky.`)
        : (isHigh ? `Your twin would resist "${chosenOption}" — ${p.key} at ${Math.round(p.val)}% pushes toward bolder choices.` : p.cautious);

      const confidence = Math.min(0.93, 0.60 + Math.abs(p.val - 50) / 100);

      return {
        user_id: userId,
        scenario,
        predicted_behavior: prediction,
        confidence,
        reasoning: `${p.key}: ${Math.round(p.val)}% · Logic: ${Math.round(logic)}% · Risk: ${Math.round(risk)}%. You chose "${chosenOption}".`,
        alternative_behaviors: [
          wantsRisky ? p.cautious : p.bold,
          'A balanced approach: weigh both options carefully before committing.',
        ],
      };
    }
  }

  /**
   * Simulate behavior with modified traits
   */
  async simulateModifiedTraits(
    userId: string,
    scenario: string,
    traitModifications: Partial<PersonalityTraits>
  ): Promise<SimulationResponse> {
    // Use mock if backend unavailable
    if (!this.backendAvailable) {
      console.log('[v0] Using mock simulation (backend unavailable)');
      return {
        user_id: userId,
        original_prediction: 'Your original behavior prediction',
        modified_prediction: 'With the modified traits, you would likely behave differently',
        changes: traitModifications as PersonalityTraits,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          scenario,
          trait_modifications: traitModifications,
        }),
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[v0] Backend simulation failed, using mock:', error);
      this.backendAvailable = false;
      return {
        user_id: userId,
        original_prediction: 'Your original behavior prediction',
        modified_prediction: 'With the modified traits, you would likely behave differently',
        changes: traitModifications as PersonalityTraits,
      };
    }
  }

  /**
   * Get trait definitions
   */
  async getTraitDefinitions(): Promise<{ [key: string]: string }> {
    const mockTraits = {
      'Risk Tolerance': 'Willingness to take calculated risks in career and financial decisions',
      'Logic vs Emotion': 'Balance between rational thinking and emotional intuition',
      'Introvert/Extrovert': 'Preference for solitary reflection vs social interaction',
      'Leadership': 'Natural tendency to lead, influence, and inspire others',
      'Spending vs Saving': 'Financial behavior pattern and monetary conservation level',
    };

    if (!this.backendAvailable) {
      return mockTraits;
    }

    try {
      const response = await fetch(`${this.baseUrl}/traits`);

      if (!response.ok) {
        throw new Error(`Failed to fetch trait definitions: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[v0] Failed to fetch trait definitions, using mock:', error);
      return mockTraits;
    }
  }

  /**
   * Get available scenarios
   */
  async getScenarios(): Promise<{ [key: string]: string }> {
    const mockScenarios = {
      conflict: 'You face a conflict with a colleague at work. How do you handle it?',
      decision: 'You must make a major career decision with incomplete information.',
      financial: 'You have an unexpected financial opportunity. What do you do?',
      social: 'You are invited to a large networking event. How do you approach it?',
      failure: 'A project you led fails unexpectedly. How do you respond?',
    };

    if (!this.backendAvailable) {
      return mockScenarios;
    }

    try {
      const response = await fetch(`${this.baseUrl}/scenarios`);

      if (!response.ok) {
        throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[v0] Failed to fetch scenarios, using mock:', error);
      return mockScenarios;
    }
  }
}

// Export singleton instance
export const personalityAPI = new PersonalityAPI();

// Export types
export type { AnalysisResponse, PredictionResponse, SimulationResponse, PersonalityTraits };
