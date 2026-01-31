import { fal } from '@fal-ai/client';

export async function generateLogo(prompt: string): Promise<string> {
  // Configure inside function to ensure env vars are loaded
  fal.config({ credentials: process.env.FAL_KEY });
  
  try {
    const res = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: `crypto token logo, modern minimalist style, white background, ${prompt}`,
        image_size: 'square_hd'
      }
    });
    
    // Handle various response structures
    const images = (res as any).images || (res as any).data?.images;
    if (images && images.length > 0) {
      return images[0].url;
    }
    throw new Error('No image generated');
  } catch (e) {
    console.error('Fal.ai error:', e);
    // Return fallback image on error
    return 'https://iili.io/fLUphxa.jpg';
  }
}
