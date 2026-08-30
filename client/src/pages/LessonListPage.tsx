import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import type { LessonPlan } from '../types/index.js';
import {
  BookOpen,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Trash2,
  Loader2,
  Calendar,
} from 'lucide-react';

export const LessonListPage: React.FC = () => {
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchLessons();
  }, [statusFilter, subjectFilter, search]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (subjectFilter) params.subject = subjectFilter;
      if (search) params.search = search;

      const res = await api.get('/lessons', { params });
      if (res.data.success) {
        setLessons(res.data.lessons);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'upcoming' ? 'completed' : 'upcoming';
      await api.patch(`/lessons/${id}/status`, { status: nextStatus });
      fetchLessons();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/lessons/${id}/duplicate`);
      fetchLessons();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson plan?')) return;
    try {
      await api.delete(`/lessons/${id}`);
      fetchLessons();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-400" />
            My Lesson Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage, schedule, duplicate, and track your educational plans.
          </p>
        </div>

        <Link
          to="/lessons/create"
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Create New Lesson
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel rounded-2xl p-4 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search lessons by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 md:flex items-center gap-2.5">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'upcoming', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 md:flex-initial px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-orange-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Subject Select */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Subjects</option>
            <option value="Biology">Biology</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="Technology">Technology</option>
            <option value="Art">Art</option>
          </select>
        </div>
      </div>

      {/* Lesson List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
          <p className="text-sm font-medium">Fetching lesson plans...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No lesson plans found</h3>
          <p className="text-xs text-slate-400">
            {search || subjectFilter || statusFilter !== 'all'
              ? 'No lessons matched your current filter criteria.'
              : 'You haven’t created any lesson plans yet. Click below to craft your first lesson!'}
          </p>
          <Link
            to="/lessons/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg-primary text-white font-semibold text-xs shadow-lg shadow-orange-600/20"
          >
            + Create Lesson Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative group"
            >
              <div>
                {/* Status & Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {lesson.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{lesson.grade}</span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 capitalize ${
                      lesson.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {lesson.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {lesson.status}
                  </span>
                </div>

                {/* Title */}
                <Link
                  to={`/lessons/${lesson._id}`}
                  className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1 mb-1"
                >
                  {lesson.title}
                </Link>

                <p className="text-xs font-medium text-slate-400 mb-4 line-clamp-2">
                  Topic: {lesson.topic} &bull; {lesson.duration || 45} mins
                </p>

                {/* Attached resources summary */}
                {lesson.resources && lesson.resources.length > 0 && (
                  <div className="mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-orange-300 flex items-center justify-between">
                    <span>📎 {lesson.resources.length} linked resource(s)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Hub Attached</span>
                  </div>
                )}
              </div>

              <div>
                {/* Date & Actions Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    {new Date(lesson.date).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleToggleStatus(lesson._id, lesson.status)}
                      title={lesson.status === 'completed' ? 'Mark as Upcoming' : 'Mark as Completed'}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          lesson.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleDuplicate(lesson._id)}
                      title="Duplicate Lesson"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-orange-400" />
                    </button>

                    <Link
                      to={`/lessons/${lesson._id}/edit`}
                      title="Edit Lesson"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-amber-400" />
                    </Link>

                    <button
                      onClick={() => handleDelete(lesson._id)}
                      title="Delete Lesson"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/lessons/${lesson._id}`}
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors ml-1"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
