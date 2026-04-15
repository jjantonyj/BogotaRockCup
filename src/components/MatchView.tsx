import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Match, Band } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Vote as VoteIcon, User, AlertCircle, LogIn, Calendar, Instagram, Facebook } from 'lucide-react';
import { auth, signInWithGoogle, voteForBand, getMatches, getBands, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import YouTube, { YouTubeProps } from 'react-youtube';
import { toZonedTime } from 'date-fns-tz';

const COLOMBIA_TZ = 'America/Bogota';

export function MatchView() {
  const { id } = useParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBand, setCurrentBand] = useState(1);
  const [videoIndex, setVideoIndex] = useState(0);
  const [votes, setVotes] = useState({ band1: 0, band2: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, b] = await Promise.all([getMatches(), getBands()]);
        setMatches((m || []) as Match[]);
        setBands((b || []) as Band[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logic to find matches in progress using Colombia Time
  const now = toZonedTime(new Date(), COLOMBIA_TZ);
  const activeMatches = matches.filter(m => {
    const startDate = toZonedTime(new Date(m.date), COLOMBIA_TZ);
    const endDate = new Date(startDate.getTime() + (m.durationMinutes || 90) * 60000);
    return now >= startDate && now <= endDate;
  });

  const match = id ? matches.find(m => m.id === id) : activeMatches[0];
  
  const band1 = match ? bands.find(b => b.id === match.band1Id || (b as any).id === match.band1Id) : null;
  const band2 = match ? bands.find(b => b.id === match.band2Id || (b as any).id === match.band2Id) : null;

  // Real-time votes listener
  useEffect(() => {
    if (!match) return;

    const q = query(collection(db, 'votes'), where('matchId', '==', match.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votesCount = { band1: 0, band2: 0 };
      let userVoted = false;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.bandId === match.band1Id) votesCount.band1++;
        if (data.bandId === match.band2Id) votesCount.band2++;
        if (user && data.userId === user.uid) userVoted = true;
      });

      setVotes(votesCount);
      setHasVoted(userVoted);
    }, (error) => {
      console.error("Error listening to votes:", error);
    });

    return () => unsubscribe();
  }, [match, user]);

  const handleVote = async (bandId: string) => {
    if (!match || !band1 || !band2) return;
    if (!user) {
      alert('Debes iniciar sesión para votar.');
      return;
    }
    if (hasVoted) return;

    try {
      await voteForBand(match.id, bandId);
      alert('¡Voto registrado! Gracias por apoyar el rock local.');
    } catch (error) {
      console.error(error);
      alert('Error al registrar el voto. Inténtalo de nuevo.');
    }
  };

  const onVideoEnd = () => {
    if (currentBand === 1) {
      setCurrentBand(2);
    } else {
      setCurrentBand(1);
      setVideoIndex(prev => prev + 1);
    }
  };

  const videoOptions: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      mute: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  if (loading) return <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Cargando partido...</div>;

  if (!match || !band1 || !band2) {
    return (
      <div className="py-24 px-4 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl space-y-6"
        >
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            Ningún partido está ocurriendo en este momento
          </h2>
          <p className="text-zinc-500 font-medium">
            Te invitamos a visitar el calendario de partidos para conocer los próximos encuentros.
          </p>
          <Link 
            to="/calendario" 
            className="inline-block px-8 py-4 bg-bogota-red hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Ver Calendario
          </Link>
        </motion.div>
      </div>
    );
  }

  const activeBand = currentBand === 1 ? band1 : band2;
  const bandVideos = activeBand.videos?.filter(v => v && v.trim() !== '') || [];
  const activeVideoId = bandVideos.length > 0 
    ? bandVideos[videoIndex % bandVideos.length] 
    : 'dQw4w9WgXcQ';

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      {/* Scoreboard */}
      <div className="bg-zinc-900 border-2 border-bogota-red rounded-3xl p-8 mb-12 shadow-[0_0_50px_rgba(239,51,64,0.2)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-1">{band1.name}</h2>
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
              {band1.genre} • {band1.locality}
            </div>
            <div className="flex justify-center md:justify-end gap-3 mb-4">
              {band1.social?.instagram && (
                <a 
                  href={band1.social.instagram.startsWith('http') ? band1.social.instagram : `https://instagram.com/${band1.social.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {band1.social?.facebook && (
                <a 
                  href={band1.social.facebook.startsWith('http') ? band1.social.facebook : `https://facebook.com/${band1.social.facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
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
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-1">{band2.name}</h2>
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
              {band2.genre} • {band2.locality}
            </div>
            <div className="flex justify-center md:justify-left gap-3 mb-4">
              {band2.social?.instagram && (
                <a 
                  href={band2.social.instagram.startsWith('http') ? band2.social.instagram : `https://instagram.com/${band2.social.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {band2.social?.facebook && (
                <a 
                  href={band2.social.facebook.startsWith('http') ? band2.social.facebook : `https://facebook.com/${band2.social.facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
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
                key={`${currentBand}-${activeVideoId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <YouTube
                  videoId={activeVideoId}
                  opts={videoOptions}
                  onEnd={onVideoEnd}
                  className="w-full h-full"
                  containerClassName="w-full h-full"
                />
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <div className="bg-bogota-red px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                <Play className="w-4 h-4 fill-white" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Presentando: {activeBand.name}
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
