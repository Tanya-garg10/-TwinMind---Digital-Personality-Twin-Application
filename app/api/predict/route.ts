/**
 * Behavior Prediction API Route
 * Predicts user behavior in various scenarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { personalityAPI } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scenario, traits, chosenOption } = body;

    if (!userId || !scenario || !traits) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, scenario, traits' },
        { status: 400 }
      );
    }

    const prediction = await personalityAPI.predictBehavior(userId, scenario, traits, chosenOption ?? '');

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('[v0] Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
