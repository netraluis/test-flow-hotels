import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const flowId = process.env.FLOW_ID;

  if (!apiKey || !flowId) {
    return NextResponse.json(
      { error: 'Missing configuration' },
      { status: 500 }
    );
  }

  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Construir el historial de conversación
    const messages = [
      ...conversationHistory,
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Usar la API de Chat Completions con el modelo del workflow
    // Nota: Para usar el workflow específico, necesitarías usar la API de Responses
    // que soporta workflows, pero por ahora usamos Chat Completions como alternativa
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Puedes cambiar esto al modelo que uses en tu workflow
      messages: messages as any,
      stream: false,
    });

    const responseText = completion.choices[0]?.message?.content || 'No response received';

    return NextResponse.json({
      response: responseText,
    });
  } catch (error: any) {
    console.error('Error sending message:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

