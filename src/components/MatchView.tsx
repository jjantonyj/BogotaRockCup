import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import matchesData from '../data/matches.json';
import bandsData from '../data/bands.json';
import { Match, Band } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Vote as VoteIcon, User, AlertCircle, LogIn } from 'lucide-react';
import { auth, signInWithGoogle, voteForBand } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const matches = matchesData as Match[];
const bands = bandsData as Band[];

export function MatchView() {
  const { id } = useParams();
  const match = matches.find(m => m.id === id) || matches[0];
  const band1 = bands.find(b => b.id === match.band1Id);
  const band2 = bands.find(b => b.id === match.band2Id);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [currentBand, setCurrentBand] = useState(1);
  const [votes, setVotes] = useState({ band1: 0, band2: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Mock alternating logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBand(prev => (prev === 1 ? 2 : 1));
    }, 30000); // Alternate every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (bandId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para votar.');
      return;
    }
    if (hasVoted) return;

    try {
      await voteForBand(match.id, bandId);
      setVotes(prev => ({
        ...prev,
        [bandId === band1?.id ? 'band1' : 'band2']: prev[bandId === band1?.id ? 'band1' : 'band2'] + 1
      }));
      setHasVoted(true);
      alert('¡Voto registrado! Gracias por apoyar el rock local.');
    } catch (error) {
      console.error(error);
      alert('Error al registrar el voto. Inténtalo de nuevo.');
    }
  };

  if (!band1 || !band2) return <div>Cargando partido...</div>;

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      {/* Scoreboard */}
      <div className="bg-zinc-900 border-2 border-bogota-red rounded-3xl p-8 mb-12 shadow-[0_0_50px_rgba(239,51,64,0.2)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">{band1.name}</h2>
            <div className="text-5xl font-black text-bogota-yellow">{votes.band1}</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-zinc-800 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-zinc-400">
              En Vivo
            </div>
            <div className="text-4xl font-black italic text-zinc-700">VS</div>
            <div className="text-[10px] font-bold text-bogota-red uppercase animate-pulse">Votaciones Abiertas</div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">{band2.name}</h2>
            <div className="text-5xl font-black text-bogota-yellow">{votes.band2}</div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-zinc-800 relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${(currentBand === 1 ? band1 : band2).videos[0]}?autoplay=1&mute=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute top-6 left-6 z-10">
              <div className="bg-bogota-red px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                <Play className="w-4 h-4 fill-white" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Presentando: {(currentBand === 1 ? band1 : band2).name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-4">
              {user ? (
                <img src={user.photoURL || ''} className="w-12 h-12 rounded-full border-2 border-bogota-yellow" alt="User" />
              ) : (
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-zinc-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-zinc-300">
                  {user ? `Hola, ${user.displayName}` : 'Inicia sesión para votar'}
                </p>
                <p className="text-xs text-zinc-500">Solo un voto por partido por persona.</p>
              </div>
            </div>
            {!user && (
              <button 
                onClick={signInWithGoogle}
                className="bg-white text-zinc-950 px-6 py-2 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Conectar Google
              </button>
            )}
          </div>
        </div>

        {/* Voting Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <VoteIcon className="w-5 h-5 text-bogota-yellow" /> Panel de Votación
            </h3>

            <div className="space-y-4">
              <button 
                onClick={() => handleVote(band1.id)}
                disabled={hasVoted || !user}
                className="w-full group relative overflow-hidden bg-zinc-950 border border-zinc-800 p-4 rounded-2xl hover:border-bogota-red transition-all disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-bold uppercase italic">{band1.name}</span>
                  <div className="bg-zinc-800 px-3 py-1 rounded-lg text-xs font-black text-zinc-400 group-hover:bg-bogota-red group-hover:text-white transition-all">
                    VOTAR
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleVote(band2.id)}
                disabled={hasVoted || !user}
                className="w-full group relative overflow-hidden bg-zinc-950 border border-zinc-800 p-4 rounded-2xl hover:border-bogota-yellow transition-all disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-bold uppercase italic">{band2.name}</span>
                  <div className="bg-zinc-800 px-3 py-1 rounded-lg text-xs font-black text-zinc-400 group-hover:bg-bogota-yellow group-hover:text-zinc-950 transition-all">
                    VOTAR
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex gap-3">
              <AlertCircle className="w-5 h-5 text-zinc-600 shrink-0" />
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                El partido finaliza al mismo tiempo que el encuentro oficial del mundial. Los votos registrados después del pitazo final no serán contabilizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
