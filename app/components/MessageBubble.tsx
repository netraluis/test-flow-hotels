import React from 'react';

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
}

export function MessageBubble({ text, isUser }: MessageBubbleProps) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isUser
            ? 'bg-zinc-900 text-white rounded-br-none'
            : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-none'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
