import React from 'react';
import sponsorsData from '../data/sponsors.json';
import { Sponsor } from '../types';

const sponsors = sponsorsData as Sponsor[];

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-bogota-red/30 py-4 px-6 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex items-center gap-3 flex-shrink-0">
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                className="h-10 w-auto transition-all"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                  {sponsor.type}
                </span>
                <span className="text-xs font-medium text-zinc-300">
                  {sponsor.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold border-l border-zinc-800 pl-6 hidden md:block">
          Bogotá Rock Cup 2026
        </div>
      </div>
    </footer>
  );
}
