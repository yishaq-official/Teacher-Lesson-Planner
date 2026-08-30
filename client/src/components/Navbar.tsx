import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  BookOpen,
  FolderKanban,
  FileSearch,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  GraduationCap,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 transition-colors duration-300 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1">
                Edu<span className="gradient-text font-extrabold">Shelf</span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 -mt-1 truncate">Lesson Planner & Resources</span>
            </div>
          </Link>

          {/* Theme Toggle & Links */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive('/dashboard')
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/calendar"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive('/calendar')
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Weekly Timetable
                </Link>
                <Link
                  to="/lessons"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive('/lessons')
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Lesson Plans
                </Link>
                <Link
                  to="/resources"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive('/resources')
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileSearch className="w-4 h-4" />
                  Resource Hub
                </Link>
              </nav>
            )}

            {/* Action Buttons & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-amber-400 hover:text-amber-300 border border-slate-700/60 transition-all flex items-center justify-center shadow-sm"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-orange-500" />}
              </button>

              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/lessons/create"
                    className="px-3.5 py-2 rounded-lg text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    New Lesson
                  </Link>

                  <div className="h-6 w-[1px] bg-slate-800" />

                  <Link
                    to="/profile"
                    title="Edit Teacher Profile"
                    className="flex items-center gap-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-orange-500/40 rounded-xl px-3 py-1.5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30 group-hover:scale-105 transition-transform">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                        {user.subject || 'Teacher'}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <Link
                    to="/login"
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-md shadow-orange-600/20 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Weekly Timetable
          </Link>
          <Link
            to="/lessons"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Lesson Plans
          </Link>
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Resource Hub
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-orange-400 hover:bg-slate-800 hover:text-orange-300 flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Teacher Profile Settings
          </Link>
          <Link
            to="/lessons/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-white gradient-bg-primary text-center"
          >
            + Create New Lesson
          </Link>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-slate-200 font-medium text-sm"
            >
              <UserIcon className="w-4 h-4 text-orange-400" />
              <span>{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 font-semibold px-3 py-1 bg-rose-500/10 rounded-lg hover:bg-rose-500/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
