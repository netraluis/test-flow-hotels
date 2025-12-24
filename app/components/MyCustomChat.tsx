"use client";
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export function MyCustomChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingUserMessageRef = useRef<string | null>(null);
  const threadIdRef = useRef<string | null>(null);

  // justo después de los refs
  const loadMessages = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/api/chatkit/thread/${threadId}/messages`);
      const data = await res.json();
      console.log('🔍 data', data);
      if (Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            text: msg.content || msg.text || '',
            isUser: msg.role === 'user',
          }))
        );
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, []);



  const chatKit = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // implement session refresh
        }

        console.log('🔑 [ChatKit] Getting client secret...');
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'micolau-user',
            state: {
              name_place: 'Hotel Micolau',
              latitude: '42.5709392',
              longitude: '1.4724762',
            },
          }),
        });
        const { client_secret } = await res.json();
        console.log('🔑 [ChatKit] Client secret received', client_secret);
        return client_secret;
      },
    },
    onResponseStart: () => {
      setIsLoading(true);
    },
    onResponseEnd: async () => {
      setIsLoading(false);
      if (threadIdRef.current) {
        await loadMessages(threadIdRef.current);
      }
    },
    onError: (event: { error: Error }) => {
      console.error('ChatKit error:', event.error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
    onThreadChange: async (event: { threadId: string | null }) => {
      const threadId = event.threadId;
      threadIdRef.current = threadId;
      setCurrentThreadId(threadId);
      if (!threadId) {
        setMessages([]);
      } else {
        await loadMessages(threadId);
      }
    },
  });

  const { control, sendUserMessage, fetchUpdates, ref } = chatKit;

  useEffect(() => {
    console.log('🔑 [ChatKit] Control object:', chatKit);
  }, [chatKit]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    pendingUserMessageRef.current = messageText;
    setInputValue('');
    setIsLoading(true);

    try {
      // Enviar mensaje solo a ChatKit usando el control
      // La respuesta se extraerá automáticamente en onResponseEnd
      await sendUserMessage({
        text: messageText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al enviar tu mensaje.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl">
      <div className="absolute opacity-0 pointer-events-none -z-10" style={{ width: '1px', height: '1px', overflow: 'hidden' }}>
        <ChatKit control={control} className="h-[600px] w-full" />
      </div>

      <div className="flex flex-col bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px] bg-zinc-50/50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              Comienza una conversación...
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                text={message.text}
                isUser={message.isUser}
              />
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-none px-4 py-2 text-sm text-zinc-600">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-200 bg-white">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            disabled={isLoading}
            placeholder="Escribe un mensaje..."
          />
        </div>
      </div>
    </div>
  );
}