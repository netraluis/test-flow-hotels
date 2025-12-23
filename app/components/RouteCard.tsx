import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Navigation, Clock, MapPin } from 'lucide-react';

interface RouteData {
  type: 'calculate_distance';
  distance: string;
  duration: string;
  mode: string;
  map_link: string;
}

interface RouteCardProps {
  data: RouteData;
}

const getModeIcon = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'walking':
      return '🚶';
    case 'driving':
      return '🚗';
    case 'transit':
      return '🚌';
    case 'bicycling':
      return '🚴';
    default:
      return '📍';
  }
};

const getModeLabel = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'walking':
      return 'Caminando';
    case 'driving':
      return 'En coche';
    case 'transit':
      return 'Transporte público';
    case 'bicycling':
      return 'En bicicleta';
    default:
      return mode;
  }
};

export function RouteCard({ data }: RouteCardProps) {
  return (
    <Card className="w-full max-w-sm border border-zinc-200 shadow-lg bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-5 h-5 text-zinc-700" />
            <h3 className="text-zinc-900 text-base font-semibold">Ruta</h3>
          </div>

          {/* Route Info Card */}
          <div className="bg-zinc-50 rounded-lg p-6 border border-zinc-200">
            <div className="flex flex-col gap-4">
              {/* Mode Badge */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getModeIcon(data.mode)}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-200 text-zinc-700 font-medium">
                  {getModeLabel(data.mode)}
                </span>
              </div>

              {/* Distance and Duration */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-600" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Distancia</span>
                    <span className="text-lg font-semibold text-zinc-900">{data.distance}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-600" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Duración</span>
                    <span className="text-lg font-semibold text-zinc-900">{data.duration}</span>
                  </div>
                </div>
              </div>

              {/* Map Link */}
              <a
                href={data.map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors group text-sm font-medium"
              >
                Ver ruta en Maps
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

