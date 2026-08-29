import { GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/40 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">EduNexus Hub</span> &mdash;
          <span>Empowering Teachers with Shared Knowledge & Effortless Planning</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          Built for Nexus Challenge &bull; Empowering Educators everywhere
        </div>
      </div>
    </footer>
  );
};
