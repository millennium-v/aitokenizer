import { NextRequest, NextResponse } from 'next/server';
import { registerAgent } from '@/lib/moltbook';

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    
    if (!name || !description) {
      return NextResponse.json({ success: false, error: 'Name and description required' }, { status: 400 });
    }

    const result = await registerAgent(name, description);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        agent: {
          id: result.agent.id,
          name: result.agent.name,
          api_key: result.agent.api_key,
          claim_url: result.agent.claim_url
        }
      });
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Registration failed' }, { status: 400 });
    }
  } catch (e: unknown) {
    const error = e as { response?: { data?: { error?: string } }; message?: string };
    console.error('Create agent error:', e);
    return NextResponse.json({ 
      success: false, 
      error: error.response?.data?.error || error.message || 'Server error' 
    }, { status: 500 });
  }
}
