import { NextRequest, NextResponse } from 'next/server';
import { generateLogo } from '@/lib/fal';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });
    }

    const imageUrl = await generateLogo(prompt);
    
    return NextResponse.json({ success: true, image_url: imageUrl });
  } catch (e: unknown) {
    const error = e as { message?: string };
    console.error('Generate logo error:', e);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Image generation failed' 
    }, { status: 500 });
  }
}
