import React from 'react';

interface ChatInputProps {
  value?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ value = '', onChange, onSubmit, disabled, placeholder }: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex gap-2"
    >
      <input
        className="flex-1 border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:text-zinc-500 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Type a message..."}
        disabled={disabled}
      />
      <button
        type="submit"
        className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 active:bg-zinc-950 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        disabled={disabled || !value.trim()}
      >
        Enviar
      </button>
    </form>
  );
}
