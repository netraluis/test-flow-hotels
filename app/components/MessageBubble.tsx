import React from 'react';
import { WeatherCard } from './WeatherCard';
import { PlacesNearCard } from './PlacesNearCard';
import { RouteCard } from './RouteCard';

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

  // Default text rendering
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm bg-white text-zinc-900 border border-zinc-200 rounded-bl-none">
        {text}
      </div>
    </div>
  );
}
