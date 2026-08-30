import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { signIn } from '../lib/auth-client.js';
import { useAuth } from '../context/AuthContext.js';
import logoImg from '../assets/logo.png';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refetchSession } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || 'Failed to sign in. Check your email & password.');
      } else {
        toast.success('Welcome back! Signed in successfully.');
        await refetchSession();
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('hana.teacher@edushelf.org');
    setPassword('TeacherPass123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-2 sm:px-4 py-6 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-3">
            <img
              src={logoImg}
              alt="EduShelf Logo"
              className="w-12 h-12 rounded-2xl object-contain shadow-xl shadow-orange-500/30 hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back, Educator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your lesson plans and resource hub
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-5 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Fill Demo Teacher Credentials
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold underline">
            Register as a Teacher
          </Link>
        </p>
      </div>
    </div>
  );
};
