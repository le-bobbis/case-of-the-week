import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the evidence generation endpoint
    const evidenceResponse = await fetch('http://localhost:3000/api/evidence/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body) // This will include caseId if present
    });

    if (evidenceResponse.ok) {
      const evidenceData = await evidenceResponse.json();
      return NextResponse.json(evidenceData);
    }
    
    return NextResponse.json({
      evidenceGenerated: false,
      evidence: null
    });

  } catch (error) {
    console.error('Evidence check error:', error);
    return NextResponse.json({
      evidenceGenerated: false,
      evidence: null
    });
  }
}