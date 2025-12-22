import React from 'react';
import { WeatherCard } from './WeatherCard';

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
}

function parseWeatherData(text: string) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.type === 'weather') {
      return parsed;
    }
  } catch {
    // Not valid JSON or not weather type
  }
  return null;
}

export function MessageBubble({ text, isUser }: MessageBubbleProps) {
  // Don't render weather card for user messages
  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm bg-zinc-900 text-white rounded-br-none">
          {text}
        </div>
      </div>
    );
  }

  // Try to parse weather data
  const weatherData = parseWeatherData(text);

  if (weatherData) {
    return (
      <div className="flex w-full justify-start">
        <WeatherCard data={weatherData} />
      </div>
    );
  }

  // Default text rendering
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm bg-white text-zinc-900 border border-zinc-200 rounded-bl-none">
        {text}
      </div>
    </div>
  );
}
