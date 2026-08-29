import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../lib/api.js';
import type { DashboardStats, LessonPlan, Resource } from '../types/index.js';
import { ResourceCard } from '../components/ResourceCard.js';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FolderUp,
  PlusCircle,
  FileSearch,
  Sparkles,
  Clock,
  Copy,
  ChevronRight,
  GraduationCap,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    upcomingCount: 0,
    completedCount: 0,
    myResourcesCount: 0,
  });
  const [upcomingLessons, setUpcomingLessons] = useState<LessonPlan[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setUpcomingLessons(res.data.upcomingLessons || []);
        setRecentResources(res.data.recentResources || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'upcoming' ? 'completed' : 'upcoming';
      await api.patch(`/lessons/${id}/status`, { status: nextStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/lessons/${id}/duplicate`);
      fetchDashboardData();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading your teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              <Sparkles className="w-4 h-4" />
              Teacher Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name}</span>!
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Organize your upcoming lessons, link educational resources, and discover shared teaching materials from the community.
            </p>
            {user?.institution && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                {user.institution} &bull; {user.subject || 'General Educator'}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/lessons/create"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              Create Lesson Plan
            </Link>
            <Link
              to="/resources/upload"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2"
            >
              <FolderUp className="w-4.5 h-4.5 text-indigo-400" />
              Upload Resource
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Lessons</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalLessons}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Saved in workspace</span>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Upcoming</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300">{stats.upcomingCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled to teach</span>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.completedCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Finished lessons</span>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Shared Assets</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300">{stats.myResourcesCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Uploaded to Hub</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upcoming Lessons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Upcoming Lessons
            </h2>
            <Link
              to="/lessons"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingLessons.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No upcoming lessons scheduled</p>
              <p className="text-xs text-slate-500">
                Create a new lesson plan to organize your learning objectives and materials.
              </p>
              <Link
                to="/lessons/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                + Create Lesson Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingLessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {lesson.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{lesson.grade}</span>
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        {new Date(lesson.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to={`/lessons/${lesson._id}`}
                      className="text-base font-bold text-white hover:text-indigo-400 transition-colors block truncate"
                    >
                      {lesson.title}
                    </Link>
                    <p className="text-xs text-slate-400 truncate">Topic: {lesson.topic}</p>

                    {lesson.resources && lesson.resources.length > 0 && (
                      <div className="text-[11px] text-indigo-300 pt-1">
                        📎 {lesson.resources.length} attached resource(s)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(lesson._id, lesson.status)}
                      title="Mark as Completed"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleDuplicate(lesson._id)}
                      title="Duplicate Lesson Plan"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/lessons/${lesson._id}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Shared Resources Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-purple-400" />
              Resource Hub Feed
            </h2>
            <Link
              to="/resources"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Explore All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentResources.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-slate-400">
              <p className="text-xs">No resources uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResources.slice(0, 3).map((item) => (
                <ResourceCard key={item._id} resource={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
