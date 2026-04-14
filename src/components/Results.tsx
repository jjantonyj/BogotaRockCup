import React from 'react';
import matchesData from '../data/matches.json';
import bandsData from '../data/bands.json';
import { Match, Band } from '../types';
import { Trophy, Star, TrendingUp } from 'lucide-react';

const matches = matchesData as Match[];
const bands = bandsData as Band[];

export function Results() {
  // Simple logic to calculate points (3 for win, 1 for draw)
  const calculateLeaderboard = () => {
    const stats: Record<string, { points: number; played: number; votes: number }> = {};
    
    bands.forEach(b => stats[b.id] = { points: 0, played: 0, votes: 0 });

    matches.forEach(m => {
      if (m.result) {
        stats[m.band1Id].played++;
        stats[m.band2Id].played++;
        stats[m.band1Id].votes += m.result.band1Votes;
        stats[m.band2Id].votes += m.result.band2Votes;

        if (m.result.band1Votes > m.result.band2Votes) {
          stats[m.band1Id].points += 3;
        } else if (m.result.band1Votes < m.result.band2Votes) {
          stats[m.band2Id].points += 3;
        } else {
          stats[m.band1Id].points += 1;
          stats[m.band2Id].points += 1;
        }
      }
    });

    return Object.entries(stats)
      .map(([id, s]) => ({
        id,
        name: bands.find(b => b.id === id)?.name || 'Unknown',
        ...s
      }))
      .sort((a, b) => b.points - a.points || b.votes - a.votes);
  };

  const leaderboard = calculateLeaderboard();

  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
          Tabla de <span className="text-bogota-yellow">Posiciones</span>
        </h2>
        <p className="text-zinc-500 font-medium">Resultados oficiales de la fase de grupos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard Table */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  <th className="px-6 py-4">Pos</th>
                  <th className="px-6 py-4">Banda</th>
                  <th className="px-6 py-4 text-center">PJ</th>
                  <th className="px-6 py-4 text-center">Votos</th>
                  <th className="px-6 py-4 text-center text-bogota-yellow">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-black text-zinc-500 italic">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold uppercase tracking-tight">{entry.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-400">{entry.played}</td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-400">{entry.votes}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-bogota-yellow/10 text-bogota-yellow px-3 py-1 rounded-lg font-black">
                        {entry.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-bogota-yellow" /> Destacados
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Más Votada</p>
                <p className="text-lg font-black uppercase italic">{leaderboard[0]?.name}</p>
              </div>
              
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Mejor Promedio</p>
                <p className="text-lg font-black uppercase italic">Los Rockeros de Chapinero</p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase">Progreso del Torneo</span>
                <span className="text-xs font-black text-bogota-red">15%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-bogota-red h-full w-[15%]" />
              </div>
            </div>
          </div>

          <div className="bg-bogota-red p-6 rounded-3xl text-white">
            <TrendingUp className="w-8 h-8 mb-4" />
            <h4 className="text-xl font-black uppercase italic leading-tight mb-2">
              ¡La competencia está que arde!
            </h4>
            <p className="text-sm font-medium opacity-80">
              Más de 10,000 votos registrados en la primera semana. Bogotá respira rock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
