import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const flowId = process.env.FLOW_ID;

  if (!apiKey || !flowId) {
    const missing = [];
    if (!apiKey) missing.push('OPENAI_API_KEY');
    if (!flowId) missing.push('FLOW_ID');
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error: Missing configuration',
        details: `Missing: ${missing.join(', ')}`,
      },
      { status: 500 }
    );
  }

  // Obtener userId del body si está presente, sino usar uno genérico
  let userId: string;
  try {
    const body = await request.json().catch(() => ({}));
    userId = body.userId || 'anonymous-user';
  } catch {
    userId = 'anonymous-user';
  }

  const openai = new OpenAI({ apiKey });

  try {
    const cleanFlowId = flowId.trim();
    
    // @ts-ignore - The 'chatkit' namespace might not be in the types yet
    const session = await openai.beta.chatkit.sessions.create({
      workflow: { id: cleanFlowId },
      user: userId,
    });
    
    if (!session.client_secret) {
      return NextResponse.json(
        { error: 'No client_secret received from OpenAI' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error: any) {
    console.error('Error creating chatkit session:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create session',
        details: error.status ? `OpenAI API error: ${error.status}` : undefined,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
