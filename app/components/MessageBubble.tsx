import React from 'react';
import { WeatherCard } from './WeatherCard';
import { PlacesNearCard } from './PlacesNearCard';
import { RouteCard } from './RouteCard';
import { ActivitiesCard } from './ActivitiesCard';
import { renderTextWithLinks } from '@/lib/utils';

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

function parsePlacesNearData(text: string) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.type === 'places_near' && parsed.places_near) {
      return parsed;
    }
  } catch {
    // Not valid JSON or not places_near type
  }
  return null;
}

function parseRouteData(text: string) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.type === 'calculate_distance') {
      return parsed;
    }
  } catch {
    // Not valid JSON or not calculate_distance type
  }
  return null;
}

function parseActivitiesData(text: string) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.type === 'activities' && parsed.places) {
      return parsed;
    }
  } catch {
    // Not valid JSON or not activities type
  }
  return null;
}

function parseTextResponse(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(text);
    console.log('🔍 parseTextResponse - parsed:', parsed);
    
    if (parsed && parsed.intent === 'finish' && parsed.response) {
      console.log('✅ parseTextResponse - found finish intent with response');
      return parsed.response;
    }
    // También manejar otros casos donde venga un response directamente
    if (parsed && parsed.response && typeof parsed.response === 'string') {
      console.log('✅ parseTextResponse - found response field');
      return parsed.response;
    }
  } catch (e) {
    // Not valid JSON - this is expected for regular text
    console.log('ℹ️ parseTextResponse - not valid JSON, will render as plain text');
  }
  return null;
}

export function MessageBubble({ text, isUser }: MessageBubbleProps) {
  console.log({text})
  // Don't render weather card for user messages
  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm bg-zinc-900 text-white rounded-br-none">
          {renderTextWithLinks(text)}
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

  // Try to parse places near data
  const placesNearData = parsePlacesNearData(text);

  if (placesNearData) {
    return (
      <div className="flex w-full justify-start">
        <PlacesNearCard data={placesNearData} />
      </div>
    );
  }

  // Try to parse route data
  const routeData = parseRouteData(text);

  if (routeData) {
    return (
      <div className="flex w-full justify-start">
        <RouteCard data={routeData} />
      </div>
    );
  }

  // Try to parse activities data
  const activitiesData = parseActivitiesData(text);

  if (activitiesData) {
    return (
      <div className="flex w-full justify-start">
        <ActivitiesCard data={activitiesData} />
      </div>
    );
  }

  // Try to parse text response from JSON (intent: "finish" or similar)
  const textResponse = parseTextResponse(text);

  if (textResponse) {
    return (
      <div className="flex w-full justify-start">
        <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm bg-white text-zinc-900 border border-zinc-200 rounded-bl-none">
          {renderTextWithLinks(textResponse)}
        </div>
      </div>
    );
  }

  // Default text rendering
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm bg-white text-zinc-900 border border-zinc-200 rounded-bl-none">
        {renderTextWithLinks(text)}
      </div>
    </div>
  );
}
