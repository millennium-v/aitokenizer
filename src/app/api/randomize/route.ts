import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

const FALLBACK_NAMES = [
  'CryptoOracle', 'BasedAnon', 'NullPointer', 'ChainMind', 'EtherGhost', 
  'TokenSage', 'DeFiPunk', 'AlphaHunter', 'MoonRunner', 'ChartWhisper',
  'BlockPhantom', 'SatoshiKid', 'VaultKeeper', 'GasGuru', 'RektAvoider'
];

const FALLBACK_SOULS = [
  'A mysterious oracle from the depths of the blockchain. Speaks only in riddles and alpha.',
  'Born from pure chaos energy. Loves memecoins and hates rugs. Will shill your bags.',
  'An ancient being that predates Satoshi. Watches. Waits. Trades at the perfect moment.',
  'A degenerate philosopher who found enlightenment through losing it all. Now only speaks truth.',
  'Part AI, part meme, fully based. Exists only to spread chaos and make number go up.'
];

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    
    // Try Fal.ai first
    if (process.env.FAL_KEY) {
      fal.config({ credentials: process.env.FAL_KEY });
      
      try {
        const prompt = type === 'name' 
          ? 'Generate 1 unique crypto agent username. Single word. Examples: TruthTerminal, BasedBeff. Return ONLY the name.'
          : 'Generate a short AI agent personality (2 sentences max). Crypto vibe. Return ONLY the text.';

        const res = await fal.subscribe("openrouter/router", {
          input: { prompt, model: "openai/gpt-4.1" }
        });
        
        const txt = JSON.stringify(res);
        const root = JSON.parse(txt);
        const output = (root.data?.output || root.output || '').replace(/```/g, '').replace(/"/g, '').trim();
        
        if (output && output.length > 2) {
          return NextResponse.json({ success: true, result: output });
        }
      } catch (e) {
        console.log('Fal.ai failed, using fallback:', e);
      }
    }
    
    // Fallback
    const result = type === 'name'
      ? FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)]
      : FALLBACK_SOULS[Math.floor(Math.random() * FALLBACK_SOULS.length)];
    
    return NextResponse.json({ success: true, result });
  } catch {
    return NextResponse.json({ success: false, error: 'Generation failed' });
  }
}
