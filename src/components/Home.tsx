import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Music, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop" 
            alt="Rock Concert" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-bogota-yellow text-zinc-950 text-xs font-black uppercase tracking-[0.2em] mb-6 rounded-full">
              Bogotá, Colombia • 2026
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-6">
              Donde el <span className="text-bogota-red">Rock</span> <br />
              se encuentra con el <span className="text-bogota-yellow">Fútbol</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium">
              La competencia de bandas más grande de la capital. 48 bandas, 12 grupos, un solo campeón. Vive la pasión del mundial en el escenario.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/inscripcion" 
                className="w-full sm:w-auto px-8 py-4 bg-bogota-red hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition-all transform hover:scale-105"
              >
                Inscribe tu Banda
              </Link>
              <Link 
                to="/calendario" 
                className="w-full sm:w-auto px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Ver Calendario
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-bogota-red/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-bogota-red" />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight">48 Bandas Locales</h3>
            <p className="text-zinc-500">Seleccionadas por un jurado experto para representar el talento de las localidades de Bogotá.</p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-bogota-yellow/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-bogota-yellow" />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight">Mismo Calendario</h3>
            <p className="text-zinc-500">Los partidos se juegan en las mismas fechas y horarios que el mundial de fútbol 2026.</p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight">Votación en Vivo</h3>
            <p className="text-zinc-500">Tú decides quién avanza. Vota por tu banda favorita durante el tiempo reglamentario del partido.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
