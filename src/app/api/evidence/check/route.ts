import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Construct the URL based on the incoming request so it works in
    // both local and deployed environments
    const evidenceUrl = new URL('/api/evidence/generate', request.url);
    const evidenceResponse = await fetch(evidenceUrl.href, {
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