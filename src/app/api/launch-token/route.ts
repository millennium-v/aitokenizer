import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/lib/moltbook';
import { launchToken } from '@/lib/clawnch';

export async function POST(req: NextRequest) {
  try {
    const { api_key, name, symbol, description, image_url, wallet } = await req.json();
    
    if (!api_key || !name || !symbol || !wallet) {
      return NextResponse.json({ 
        success: false, 
        error: 'api_key, name, symbol, and wallet are required' 
      }, { status: 400 });
    }

    // Validate inputs
    if (name.length > 50) {
      return NextResponse.json({ success: false, error: 'Token name too long (max 50 chars)' }, { status: 400 });
    }
    if (symbol.length > 10) {
      return NextResponse.json({ success: false, error: 'Symbol too long (max 10 chars)' }, { status: 400 });
    }
    const desc = (description || `${name} - Launched via Agent Tokenizer`).slice(0, 500);

    // Build the clawnch post content - EXACT format from skill.md
    const tokenData = JSON.stringify({
      name: name.slice(0, 50),
      symbol: symbol.toUpperCase().slice(0, 10),
      wallet,
      description: desc,
      image: image_url || 'https://iili.io/fLUphxa.jpg'
    }, null, 2);

    // Format: !clawnch on its own line, then code block with json
    const postContent = `Launching ${name}! 🚀

!clawnch
\`\`\`json
${tokenData}
\`\`\``;

    // Create post on Moltbook
    let postResult;
    try {
      postResult = await createPost(api_key, `🚀 ${name}`, postContent);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string }, status?: number }; message?: string };
      if (err.response?.status === 429) {
        return NextResponse.json({ 
          success: false, 
          error: 'Rate limited: You can only post once every 30 minutes' 
        }, { status: 429 });
      }
      throw e;
    }
    
    if (!postResult.success && !postResult.post && !postResult.data) {
      return NextResponse.json({ 
        success: false, 
        error: postResult.error || 'Failed to create post' 
      }, { status: 400 });
    }

    const postId = postResult.post?.id || postResult.data?.id || postResult.id;
    
    if (!postId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Post created but no ID returned' 
      }, { status: 400 });
    }

    // Trigger Clawnch launch
    let launchResult;
    try {
      launchResult = await launchToken(api_key, postId);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number }; message?: string };
      if (err.response?.status === 503) {
        return NextResponse.json({ 
          success: false, 
          error: 'Clawnch server is temporarily unavailable. Post created - retry launch later with post_id: ' + postId
        }, { status: 503 });
      }
      throw e;
    }
    
    if (launchResult.success) {
      return NextResponse.json({
        success: true,
        clanker_url: launchResult.clanker_url,
        token_address: launchResult.token_address || null,
        post_id: postId
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: launchResult.error || 'Clawnch launch failed',
        post_id: postId 
      }, { status: 400 });
    }
  } catch (e: unknown) {
    const error = e as { response?: { data?: { error?: string } }; message?: string };
    console.error('Launch token error:', e);
    return NextResponse.json({ 
      success: false, 
      error: error.response?.data?.error || error.message || 'Server error' 
    }, { status: 500 });
  }
}
