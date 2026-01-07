import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, MapPin } from 'lucide-react';
import { renderTextWithLinks } from '@/lib/utils';

interface ActivityPlace {
  name: string;
  description: string;
  map_link: string;
}

interface ActivitiesData {
  intent: string;
  type: 'activities';
  message: string;
  places: ActivityPlace[];
}

interface ActivitiesCardProps {
  data: ActivitiesData;
}

export function ActivitiesCard({ data }: ActivitiesCardProps) {
  return (
    <Card className="w-full max-w-sm border border-zinc-200 shadow-lg bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-zinc-700" />
            <h3 className="text-zinc-900 text-base font-semibold">Actividades y Lugares</h3>
          </div>

          {/* Message */}
          {data.message && (
            <p className="text-zinc-700 text-sm leading-relaxed mb-2">
              {renderTextWithLinks(data.message)}
            </p>
          )}

          {/* Activities List */}
          <div className="flex flex-col gap-3">
            {data.places.map((place, index) => (
              <div
                key={`${place.name}-${index}`}
                className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 hover:bg-zinc-100 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  {/* Name */}
                  <h4 className="text-zinc-900 font-medium text-sm leading-tight">
                    {place.name}
                  </h4>

                  {/* Description */}
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    {renderTextWithLinks(place.description)}
                  </p>

                  {/* Map Link */}
                  <div className="flex items-center justify-end mt-1">
                    <a
                      href={place.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-zinc-700 hover:text-zinc-900 text-xs font-medium transition-colors group"
                    >
                      Ver en Maps
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


