import React from 'react';
import matchesData from '../data/matches.json';
import bandsData from '../data/bands.json';
import { Match, Band } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

const matches = matchesData as Match[];
const bands = bandsData as Band[];

export function Calendar() {
  const getBandName = (id: string) => bands.find(b => b.id === id)?.name || 'TBD';

  return (
    <div className="py-20 px-4 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
          Calendario de <span className="text-bogota-red">Enfrentamientos</span>
        </h2>
        <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
          Sigue el ritmo de la competencia. Los horarios coinciden con los partidos oficiales del mundial de fútbol 2026.
        </p>
      </div>

      <div className="space-y-8">
        {/* Group by Stage */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-widest text-bogota-yellow border-b border-bogota-yellow/20 pb-2">
            Fase de Grupos
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => (
              <div 
                key={match.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col items-center md:items-start gap-1 min-w-[150px]">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <CalendarIcon className="w-3 h-3" />
                    {format(new Date(match.date), "EEEE, d 'de' MMMM", { locale: es })}
                  </div>
                  <div className="flex items-center gap-2 text-bogota-yellow text-sm font-black uppercase">
                    <Clock className="w-3 h-3" />
                    {format(new Date(match.date), "HH:mm")}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
                  <div className="text-right flex-1">
                    <span className="block text-lg md:text-2xl font-black uppercase italic tracking-tight truncate">
                      {getBandName(match.band1Id)}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Banda Local</span>
                  </div>
                  
                  <div className="bg-zinc-800 px-4 py-2 rounded-lg font-black text-xl text-zinc-400 italic">
                    VS
                  </div>

                  <div className="text-left flex-1">
                    <span className="block text-lg md:text-2xl font-black uppercase italic tracking-tight truncate">
                      {getBandName(match.band2Id)}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Banda Local</span>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1 min-w-[120px]">
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Grupo {match.group}
                  </span>
                  <div className="flex items-center gap-1 text-zinc-600 text-[10px] font-bold uppercase">
                    <MapPin className="w-3 h-3" /> Estadio Virtual
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
