/**
 * Quiz Analysis API Route
 * Submits quiz responses to ML backend for personality analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { personalityAPI } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, responses } = body;

    console.log('[v0] Quiz analysis request received:', { userId, responseCount: responses?.length });

    if (!userId || !responses || !Array.isArray(responses) || responses.length !== 15) {
      console.error('[v0] Invalid quiz submission data');
      return NextResponse.json(
        { error: 'Invalid request: userId and 15 responses required' },
        { status: 400 }
      );
    }

    // Call ML backend for analysis (with fallback to mock)
    const analysis = await personalityAPI.analyzePersonality(userId, responses);
    
    console.log('[v0] Analysis result:', analysis);

    // Store analysis in a way the dashboard can access it
    return NextResponse.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error('[v0] Quiz analysis error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze personality',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
