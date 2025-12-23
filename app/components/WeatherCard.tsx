import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ForecastItem {
  id: string;
  conditionImage: string;
  temperature: string;
}

interface WeatherData {
  type: 'weather';
  location: string;
  currentTemperature: string;
  minTemperature: string;
  maxTemperature: string;
  conditionDescription: string;
  conditionImage: string;
  forecast: ForecastItem[];
  name: string;
}

interface WeatherCardProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherCardProps) {
  return (
    <Card
      className="w-full max-w-sm border-0 shadow-lg"
      style={{
        background: 'linear-gradient(111deg, #1769C8 0%, #258AE3 56.92%, #31A3F8 100%)',
      }}
    >
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-3">
          {/* Location */}
          <p className="text-white/90 text-sm font-medium">{data.location}</p>

          {/* Current Temperature Row */}
          <div className="flex items-center gap-2">
            <img
              src={data.conditionImage}
              alt={data.conditionDescription}
              className="w-[60px] h-[60px] object-contain"
            />
            <h2 className="text-5xl font-normal text-white/70 leading-none">
              {data.currentTemperature}
            </h2>
          </div>

          {/* Min/Max Temperature */}
          <p className="text-white/80 text-sm">
            Mín {data.minTemperature} · Máx {data.maxTemperature}
          </p>

          {/* Condition Description */}
          <p className="text-white text-center text-sm">{data.conditionDescription}</p>

          {/* Forecast Row */}
          <div className="flex gap-6 mt-2">
            {data.forecast.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-0">
                <img
                  src={item.conditionImage}
                  alt={`Forecast ${item.id}`}
                  className="w-10 h-10 object-contain"
                />
                <p className="text-white text-xs mt-1">{item.temperature}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



