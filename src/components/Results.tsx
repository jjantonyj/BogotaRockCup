import React, { useState, useEffect } from 'react';
import { getMatches, getBands, db } from '../firebase';
import { Match, Band } from '../types';
import { Trophy, Star, TrendingUp, ArrowLeft, ChevronRight, Music } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface BandStats {
  id: string;
  name: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  votesFor: number;
  votesAgainst: number;
  points: number;
}

export function Results() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [votesData, setVotesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, b, v] = await Promise.all([
          getMatches(), 
          getBands(),
          getDocs(collection(db, 'votes'))
        ]);
        setMatches((m || []) as Match[]);
        setBands((b || []) as Band[]);
        setVotesData(v.docs.map(doc => doc.data()));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMatchVotes = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { band1: 0, band2: 0 };
    
    const band1Votes = votesData.filter(v => v.matchId === matchId && v.bandId === match.band1Id).length;
    const band2Votes = votesData.filter(v => v.matchId === matchId && v.bandId === match.band2Id).length;
    
    return { band1: band1Votes, band2: band2Votes };
  };

  const calculateStandings = () => {
    const stats: Record<string, BandStats> = {};
    
    bands.forEach(b => {
      const id = b.id || (b as any).id;
      stats[id] = {
        id,
        name: b.name,
        group: (b as any).group || 'A',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        votesFor: 0,
        votesAgainst: 0,
        points: 0
      };
    });

    matches.forEach(m => {
      const b1Id = m.band1Id;
      const b2Id = m.band2Id;
      const { band1: b1Votes, band2: b2Votes } = getMatchVotes(m.id);

      if (!stats[b1Id] || !stats[b2Id]) return;

      const matchDate = new Date(m.date);
      const now = new Date();
      
      // Only count matches that have happened or have votes
      if (matchDate < now || b1Votes > 0 || b2Votes > 0) {
        stats[b1Id].played++;
        stats[b2Id].played++;
        stats[b1Id].votesFor += b1Votes;
        stats[b1Id].votesAgainst += b2Votes;
        stats[b2Id].votesFor += b2Votes;
        stats[b2Id].votesAgainst += b1Votes;

        if (b1Votes > b2Votes) {
          stats[b1Id].won++;
          stats[b1Id].points += 3;
          stats[b2Id].lost++;
        } else if (b1Votes < b2Votes) {
          stats[b2Id].won++;
          stats[b2Id].points += 3;
          stats[b1Id].lost++;
        } else if (matchDate < now) {
          stats[b1Id].drawn++;
          stats[b2Id].drawn++;
          stats[b1Id].points += 1;
          stats[b2Id].points += 1;
        }
      }
    });

    const groups: Record<string, BandStats[]> = {};
    Object.values(stats).forEach(s => {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s);
    });

    // Sort each group
    Object.keys(groups).forEach(g => {
      groups[g].sort((a, b) => 
        b.points - a.points || 
        (b.votesFor - b.votesAgainst) - (a.votesFor - a.votesAgainst) || 
        b.votesFor - a.votesFor
      );
    });

    return groups;
  };

  const standings = calculateStandings();
  const selectedBand = bands.find(b => (b.id || (b as any).id) === selectedBandId);
  const bandHistory = matches.filter(m => m.band1Id === selectedBandId || m.band2Id === selectedBandId);

  if (loading) return <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Cargando resultados...</div>;

  if (selectedBandId && selectedBand) {
    return (
      <div className="py-20 px-4 max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedBandId(null)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Grupos
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-bogota-red rounded-2xl flex items-center justify-center">
              <Music className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">{selectedBand.name}</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Historial de Partidos</p>
            </div>
          </div>

          <div className="space-y-4">
            {bandHistory.length > 0 ? bandHistory.map(m => {
              const { band1: b1Votes, band2: b2Votes } = getMatchVotes(m.id);
              const b1 = bands.find(b => (b.id || (b as any).id) === m.band1Id);
              const b2 = bands.find(b => (b.id || (b as any).id) === m.band2Id);
              const isWinner = (m.band1Id === selectedBandId && b1Votes > b2Votes) || (m.band2Id === selectedBandId && b2Votes > b1Votes);
              const isLoser = (m.band1Id === selectedBandId && b1Votes < b2Votes) || (m.band2Id === selectedBandId && b2Votes < b1Votes);

              return (
                <div key={m.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex-1 text-right pr-8">
                    <span className={cn("font-bold uppercase tracking-tight", m.band1Id === selectedBandId ? "text-white" : "text-zinc-500")}>
                      {b1?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 bg-zinc-900 px-6 py-2 rounded-xl border border-zinc-800">
                    <span className="text-2xl font-black tabular-nums">{b1Votes}</span>
                    <span className="text-zinc-700 font-black italic">VS</span>
                    <span className="text-2xl font-black tabular-nums">{b2Votes}</span>
                  </div>
                  <div className="flex-1 text-left pl-8">
                    <span className={cn("font-bold uppercase tracking-tight", m.band2Id === selectedBandId ? "text-white" : "text-zinc-500")}>
                      {b2?.name}
                    </span>
                  </div>
                  <div className="ml-8 w-24 text-right">
                    {isWinner && <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Victoria</span>}
                    {isLoser && <span className="text-[10px] font-black uppercase tracking-widest text-bogota-red">Derrota</span>}
                    {!isWinner && !isLoser && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Empate</span>}
                  </div>
                </div>
              );
            }) : (
              <p className="text-center py-12 text-zinc-600 font-bold uppercase tracking-widest">No hay partidos registrados aún</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4">
          Fase de <span className="text-bogota-yellow">Grupos</span>
        </h2>
        <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
          Sigue el desempeño de tus bandas favoritas. Clasifican los dos mejores de cada grupo a la siguiente ronda.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {Object.entries(standings).sort().map(([groupName, groupBands]) => (
          <div key={groupName} className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tight">Grupo {groupName}</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bogotá Rock Cup 2026</span>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <th className="px-6 py-4">Pos</th>
                    <th className="px-6 py-4">Banda</th>
                    <th className="px-4 py-4 text-center">PJ</th>
                    <th className="px-4 py-4 text-center">G</th>
                    <th className="px-4 py-4 text-center">E</th>
                    <th className="px-4 py-4 text-center">P</th>
                    <th className="px-4 py-4 text-center">GF</th>
                    <th className="px-4 py-4 text-center">GC</th>
                    <th className="px-6 py-4 text-center text-bogota-yellow">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {groupBands.map((entry, index) => (
                    <tr 
                      key={entry.id} 
                      onClick={() => setSelectedBandId(entry.id)}
                      className="hover:bg-zinc-800/30 transition-all cursor-pointer group"
                    >
                      <td className="px-6 py-5 font-black text-zinc-500 italic">{index + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold uppercase tracking-tight group-hover:text-bogota-yellow transition-colors">{entry.name}</span>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-bogota-yellow" />
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center font-bold text-zinc-400">{entry.played}</td>
                      <td className="px-4 py-5 text-center font-bold text-zinc-500">{entry.won}</td>
                      <td className="px-4 py-5 text-center font-bold text-zinc-500">{entry.drawn}</td>
                      <td className="px-4 py-5 text-center font-bold text-zinc-500">{entry.lost}</td>
                      <td className="px-4 py-5 text-center font-bold text-zinc-500">{entry.votesFor}</td>
                      <td className="px-4 py-5 text-center font-bold text-zinc-500">{entry.votesAgainst}</td>
                      <td className="px-6 py-5 text-center">
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
        ))}
      </div>

      {/* Legend */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
        <div className="flex items-center gap-2"><span className="text-zinc-400">PJ:</span> Partidos Jugados</div>
        <div className="flex items-center gap-2"><span className="text-zinc-400">G:</span> Ganados</div>
        <div className="flex items-center gap-2"><span className="text-zinc-400">E:</span> Empatados</div>
        <div className="flex items-center gap-2"><span className="text-zinc-400">P:</span> Perdidos</div>
        <div className="flex items-center gap-2"><span className="text-zinc-400">GF:</span> Votos a Favor</div>
        <div className="flex items-center gap-2"><span className="text-zinc-400">GC:</span> Votos en Contra</div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
