import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { threadId } = await params;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
  }
  if (!threadId) {
    return NextResponse.json({ error: 'Missing threadId parameter' }, { status: 400 });
  }

  try {
    console.log('🔍 fetching chatkit thread items', { threadId });

    const res = await fetch(`https://api.openai.com/v1/chatkit/threads/${threadId}/items`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1', // <- header requerido
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('❌ chatkit items error', { status: res.status, err });
      return NextResponse.json(
        {
          error: err?.error?.message || 'Failed to fetch chatkit items',
          details: `OpenAI API error: ${res.status}`,
          code: err?.error?.code,
          threadId,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log('🟢 raw items data length', data?.data?.length);

    const messages =
      data?.data
        ?.map((item: any) => {
          const role =
            item.role ??
            (item.type === 'user_message'
              ? 'user'
              : item.type === 'response'
              ? 'assistant'
              : 'assistant');

          let content = '';
          if (typeof item.content === 'string') content = item.content;
          else if (Array.isArray(item.content))
            content = item.content
              .map((part: any) =>
                typeof part === 'string' ? part : part?.text ?? part?.content ?? ''
              )
              .join(' ')
              .trim();
          else if (item.content?.text) content = item.content.text;
          else if (item.text) content = item.text;
          else if (item.message)
            content =
              typeof item.message === 'string'
                ? item.message
                : item.message.text ?? '';

          if (!content?.trim()) return null;

          return {
            id: item.id ?? `msg-${Date.now()}-${Math.random()}`,
            role,
            content: content.trim(),
            createdAt:
              item.created_at ?? item.createdAt ?? new Date().toISOString(),
          };
        })
        .filter(Boolean) ?? [];

    return NextResponse.json({ messages, threadId });
  } catch (error: any) {
    console.error('❌ chatkit fetch error', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch messages',
        code: error?.code,
        threadId,
      },
      { status: 500 }
    );
  }
}