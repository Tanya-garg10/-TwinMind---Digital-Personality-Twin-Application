/**
 * Simulation API Route
 * Simulates behavior with modified personality traits
 */

import { NextRequest, NextResponse } from 'next/server';
import { personalityAPI } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scenario, traitModifications } = body;

    if (!userId || !scenario || !traitModifications) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, scenario, traitModifications' },
        { status: 400 }
      );
    }

    // Call ML backend for simulation
    const simulation = await personalityAPI.simulateModifiedTraits(
      userId,
      scenario,
      traitModifications
    );

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('[v0] Simulation error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}
