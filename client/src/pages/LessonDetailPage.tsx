import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import type { LessonPlan } from '../types/index.js';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Copy,
  Edit,
  Trash2,
  Download,
  Printer,
  Sparkles,
  Paperclip,
  Check,
  Loader2,
} from 'lucide-react';

export const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchLessonDetails(id);
  }, [id]);

  const fetchLessonDetails = async (lessonId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/lessons/${lessonId}`);
      if (res.data.success) {
        setLesson(res.data.lesson);
      }
    } catch (err) {
      console.error('Failed to load lesson detail:', err);
      setError('Lesson plan not found or removed.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!lesson) return;
    try {
      const nextStatus = lesson.status === 'upcoming' ? 'completed' : 'upcoming';
      const res = await api.patch(`/lessons/${lesson._id}/status`, { status: nextStatus });
      if (res.data.success) {
        setLesson(res.data.lesson);
        toast.success(nextStatus === 'completed' ? 'Lesson marked as completed!' : 'Lesson set to upcoming');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('Failed to update lesson status');
    }
  };

  const handleDuplicate = async () => {
    if (!lesson) return;
    try {
      const res = await api.post(`/lessons/${lesson._id}/duplicate`);
      if (res.data.success) {
        toast.success('Lesson plan duplicated successfully!');
        navigate(`/lessons/${res.data.lesson._id}`);
      }
    } catch (err) {
      console.error('Duplicate failed:', err);
      toast.error('Failed to duplicate lesson plan');
    }
  };

  const handleDelete = async () => {
    if (!lesson) return;
    if (!window.confirm('Are you sure you want to delete this lesson plan?')) return;
    try {
      await api.delete(`/lessons/${lesson._id}`);
      toast.success('Lesson plan deleted successfully!');
      navigate('/lessons');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete lesson plan');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading lesson plan...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error || 'Lesson plan not found.'}
        </div>
        <Link
          to="/lessons"
          className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lesson Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lessons
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              lesson.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {lesson.status === 'completed' ? 'Status: Completed' : 'Mark as Completed'}
          </button>

          <button
            onClick={handleDuplicate}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-orange-400" />
            Duplicate
          </button>

          <Link
            to={`/lessons/${lesson._id}/edit`}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" />
            Edit
          </Link>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl gradient-bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all"
            title="Export lesson plan as PDF or send directly to printer"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Export PDF / Print</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            title="Delete Lesson Plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Layout */}
      <div className="glass-panel rounded-3xl p-5 sm:p-10 border border-slate-800 space-y-6 sm:space-y-8 print:bg-white print:text-black print:border-none print-page">
        {/* Printable Official School Header (Only Visible When Printing / Exporting) */}
        <div className="hidden print:block print-header border-b-2 border-orange-500 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">EduShelf Lesson Plan</h1>
              <p className="text-xs text-slate-600 font-medium">Official Curriculum & Teaching Document</p>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5 font-mono">
              <div>Subject: <strong className="text-slate-900">{lesson.subject}</strong></div>
              <div>Grade: <strong className="text-slate-900">{lesson.grade}</strong></div>
              <div>Duration: <strong className="text-slate-900">{lesson.duration || 45} mins</strong></div>
            </div>
          </div>
        </div>

        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 space-y-3 print:border-slate-300">
          <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
            <span className="font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {lesson.subject}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
              {lesson.grade}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              {lesson.duration || 45} Minutes
            </span>
          </div>

          <h1 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight print:text-2xl print:text-slate-900">
            {lesson.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 print:text-slate-700">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-4 h-4 text-orange-400 print:text-slate-700" />
              Date: {new Date(lesson.date).toLocaleDateString()}
            </span>
            <span>&bull;</span>
            <span>Topic: <strong className="text-slate-200 print:text-slate-900">{lesson.topic}</strong></span>
          </div>
        </div>

        {/* Section 1: Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-orange-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Learning Objectives
            </h2>
            <ul className="space-y-2">
              {lesson.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 2: Lesson Structure */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-base font-bold text-orange-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Lesson Activities & Structure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.introduction && (
              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  1. Introduction & Warm-up
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {lesson.introduction}
                </p>
              </div>
            )}

            {lesson.mainActivity && (
              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  2. Main Activity
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {lesson.mainActivity}
                </p>
              </div>
            )}

            {lesson.practiceActivity && (
              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  3. Practice & Exercises
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {lesson.practiceActivity}
                </p>
              </div>
            )}

            {lesson.conclusion && (
              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  4. Conclusion & Exit Ticket
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {lesson.conclusion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Homework & Notes */}
        {(lesson.homework || lesson.teacherNotes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            {lesson.homework && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Homework Assignment
                </h3>
                <p className="text-xs text-slate-400 whitespace-pre-line bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {lesson.homework}
                </p>
              </div>
            )}

            {lesson.teacherNotes && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Teacher Notes
                </h3>
                <p className="text-xs text-slate-400 whitespace-pre-line bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {lesson.teacherNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Attached Shared Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-orange-300 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attached Teaching Materials ({lesson.resources.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.resources.map((res) => (
                <div
                  key={res._id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {res.type}
                      </span>
                      <span className="text-xs text-slate-400">{res.subject}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 truncate">{res.title}</h4>
                  </div>

                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
