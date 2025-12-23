import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, MapPin } from 'lucide-react';

interface Place {
  place_id: string;
  name: string;
  address: string;
  status: string;
  view_on_google_maps: string;
}

interface PlacesNearData {
  type: 'places_near';
  places_near: Place[];
}

interface PlacesNearCardProps {
  data: PlacesNearData;
}

export function PlacesNearCard({ data }: PlacesNearCardProps) {
  return (
    <Card className="w-full max-w-sm border border-zinc-200 shadow-lg bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-zinc-700" />
            <h3 className="text-zinc-900 text-base font-semibold">Lugares Cercanos</h3>
          </div>

          {/* Places List */}
          <div className="flex flex-col gap-3">
            {data.places_near.map((place) => (
              <div
                key={place.place_id}
                className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 hover:bg-zinc-100 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  {/* Name */}
                  <h4 className="text-zinc-900 font-medium text-sm leading-tight">
                    {place.name}
                  </h4>

                  {/* Address */}
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    {place.address}
                  </p>

                  {/* Status and Link */}
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        place.status === 'OPERATIONAL'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {place.status}
                    </span>
                    <a
                      href={place.view_on_google_maps}
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

