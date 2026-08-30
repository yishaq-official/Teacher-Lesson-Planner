import React from 'react';
import logoImg from '../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-black text-slate-400 text-xs py-6 sm:py-8 mt-auto w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5">
            <img src={logoImg} alt="EduShelf Logo" className="w-5 h-5 object-contain shrink-0" />
            <span className="font-semibold text-slate-300">EduShelf</span>
          </div>
          <span className="hidden sm:inline">&mdash;</span>
          <span className="text-[11px] sm:text-xs text-slate-400">
            Empowering Teachers with Shared Knowledge & Effortless Planning
          </span>
        </div>
        <div className="text-[11px] sm:text-xs text-slate-500">
          Built for Nexus Challenge &bull; Empowering Educators everywhere
        </div>
      </div>
    </footer>
  );
};
