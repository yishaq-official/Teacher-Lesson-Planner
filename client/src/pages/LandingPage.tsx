import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';
import {
  GraduationCap,
  BookOpen,
  Share2,
  Sparkles,
  ArrowRight,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            EduNexus <span className="gradient-text font-extrabold">Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-amber-400 border border-slate-700/60 transition-all flex items-center justify-center shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Built for Nexus Educators Challenge
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Lesson Planning Made Effortless.{' '}
            <span className="gradient-text block mt-2">Shared Teaching Resources Reimagined.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Stop recreating lesson plans and worksheets from scratch. Organize your personal curriculum, discover community teaching materials, and link real resources directly into your daily lessons.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white gradient-bg-primary hover:opacity-95 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              Start Planning Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-300 glass-panel hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Teacher Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Structured Lesson Planner</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Organize objectives, main activities, practice exercises, homework, and teacher notes in an intuitive layout.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Community Resource Hub</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Explore worksheets, presentations, exams, and notes uploaded by fellow teachers. Search by topic, subject, and grade.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Seamless Linkage & Reuse</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Attach shared teaching resources directly to your lesson plans, duplicate successful plans, and track lesson completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} EduNexus Hub. Built for Educators.
      </footer>
    </div>
  );
};
