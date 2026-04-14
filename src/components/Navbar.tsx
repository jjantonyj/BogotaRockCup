import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, Trophy, Calendar, UserPlus, Home } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/inscripcion', label: 'Inscripción', icon: UserPlus },
    { path: '/calendario', label: 'Calendario', icon: Calendar },
    { path: '/partidos', label: 'Partidos', icon: Music },
    { path: '/resultados', label: 'Resultados', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-bogota-yellow p-1.5 rounded-lg group-hover:bg-bogota-red transition-colors">
              <Trophy className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">
              Bogotá<span className="text-bogota-red">Rock</span>Cup
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-2",
                  location.pathname === item.path
                    ? "bg-bogota-red text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <button className="md:hidden p-2 text-zinc-400">
            <Music className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
