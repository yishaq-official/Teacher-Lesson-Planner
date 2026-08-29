import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import type { LessonPlan } from '../types/index.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  CheckCircle2,
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';

const PERIODS = [
  'Period 1 (08:30 - 09:15)',
  'Period 2 (09:20 - 10:05)',
  'Period 3 (10:15 - 11:00)',
  'Lunch Break (11:00 - 11:45)',
  'Period 4 (11:45 - 12:30)',
  'Period 5 (12:35 - 13:20)',
  'Period 6 (13:25 - 14:10)',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Subject theme colors
const getSubjectStyle = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('bio')) {
    return {
      bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-300',
    };
  }
  if (s.includes('math')) {
    return {
      bg: 'bg-blue-500/15 hover:bg-blue-500/25',
      border: 'border-blue-500/40',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      text: 'text-blue-300',
    };
  }
  if (s.includes('chem')) {
    return {
      bg: 'bg-purple-500/15 hover:bg-purple-500/25',
      border: 'border-purple-500/40',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      text: 'text-purple-300',
    };
  }
  if (s.includes('phys')) {
    return {
      bg: 'bg-amber-500/15 hover:bg-amber-500/25',
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      text: 'text-amber-300',
    };
  }
  return {
    bg: 'bg-indigo-500/15 hover:bg-indigo-500/25',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    text: 'text-indigo-300',
  };
};

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);

  // Quick draft modal state
  const [quickModal, setQuickModal] = useState<{ open: boolean; dateStr: string; period: string }>({
    open: false,
    dateStr: '',
    period: '',
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lessons');
      setLessons(res.data.lessons || []);
    } catch (err) {
      console.error('Failed to load timetable lessons', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate the 5 week days (Mon-Fri) based on currentWeekStart
  const weekDays = DAYS.map((dayName, idx) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + idx);
    return {
      name: dayName,
      dateObj: d,
      dateStr: d.toISOString().split('T')[0],
      formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: new Date().toISOString().split('T')[0] === d.toISOString().split('T')[0],
    };
  });

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Find lesson matching day and period
  const getLessonForCell = (dateStr: string, periodName: string) => {
    return lessons.find((l) => {
      const lDate = new Date(l.date).toISOString().split('T')[0];
      const normPeriod = l.period || 'Period 1 (08:30 - 09:15)';
      return lDate === dateStr && (normPeriod.startsWith(periodName.slice(0, 8)) || normPeriod === periodName);
    });
  };

  const toggleLessonStatus = async (lesson: LessonPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = lesson.status === 'completed' ? 'upcoming' : 'completed';
      const res = await api.put(`/lessons/${lesson._id}`, { status: newStatus });
      setLessons((prev) => prev.map((l) => (l._id === lesson._id ? res.data.lesson : l)));
      if (selectedLesson?._id === lesson._id) {
        setSelectedLesson(res.data.lesson);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const weekRangeText = `${weekDays[0].formatted} - ${weekDays[4].formatted}, ${currentWeekStart.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-heading text-white">Weekly Teaching Timetable</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Organize your daily teaching periods and access lesson plans directly from your weekly schedule.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-900/80 rounded-xl border border-slate-800 p-1">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-200 min-w-[140px] text-center">
              {weekRangeText}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/lessons/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Lesson Plan</span>
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : (
        /* Timetable Grid Table */
        <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 w-44 border-r border-slate-800">
                    Teaching Period
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.name}
                      className={`py-3 px-4 text-center text-xs font-semibold border-r border-slate-800 last:border-r-0 ${
                        day.isToday ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-300'
                      }`}
                    >
                      <div className="font-heading text-sm font-bold">{day.name}</div>
                      <div className={`text-[11px] ${day.isToday ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                        {day.formatted} {day.isToday && '(Today)'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pIdx) => {
                  const isLunch = period.includes('Lunch');

                  if (isLunch) {
                    return (
                      <tr key={period} className="bg-slate-950/60 border-b border-slate-800/80">
                        <td className="py-2.5 px-4 text-xs font-semibold text-amber-400/80 border-r border-slate-800">
                          {period}
                        </td>
                        <td colSpan={5} className="py-2.5 text-center text-xs font-medium text-slate-500 tracking-wider">
                          ☕ RECESS / LUNCH BREAK
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={period} className="border-b border-slate-800/60 hover:bg-slate-900/30 transition">
                      {/* Period Header Column */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-400 bg-slate-900/40 border-r border-slate-800">
                        <div className="font-semibold text-slate-300">{period.split(' ')[0]} {period.split(' ')[1]}</div>
                        <div className="text-[11px] text-slate-500">{period.split('(')[1]?.replace(')', '')}</div>
                      </td>

                      {/* Day Columns */}
                      {weekDays.map((day) => {
                        const lesson = getLessonForCell(day.dateStr, period);
                        const subjectStyle = lesson ? getSubjectStyle(lesson.subject) : null;

                        return (
                          <td
                            key={day.name}
                            className={`p-2 border-r border-slate-800/60 last:border-r-0 align-top transition ${
                              day.isToday ? 'bg-indigo-500/[0.02]' : ''
                            }`}
                          >
                            {lesson ? (
                              <div
                                onClick={() => setSelectedLesson(lesson)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer shadow-md group ${subjectStyle?.bg} ${subjectStyle?.border}`}
                              >
                                <div className="flex items-start justify-between gap-1 mb-1.5">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${subjectStyle?.badge}`}>
                                    {lesson.subject}
                                  </span>
                                  <button
                                    onClick={(e) => toggleLessonStatus(lesson, e)}
                                    title={lesson.status === 'completed' ? 'Mark Upcoming' : 'Mark Completed'}
                                    className="text-slate-400 hover:text-emerald-400 transition"
                                  >
                                    <CheckCircle2
                                      className={`w-3.5 h-3.5 ${
                                        lesson.status === 'completed' ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-500'
                                      }`}
                                    />
                                  </button>
                                </div>

                                <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-200 transition">
                                  {lesson.title}
                                </h4>

                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                  {lesson.topic}
                                </p>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3 text-slate-400" />
                                    {lesson.grade}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {lesson.duration}m
                                  </span>
                                </div>
                              </div>
                            ) : (
                              /* Empty Cell Slot - Quick Schedule Action */
                              <button
                                onClick={() =>
                                  setQuickModal({
                                    open: true,
                                    dateStr: day.dateStr,
                                    period: period,
                                  })
                                }
                                className="w-full h-full min-h-[90px] border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:text-indigo-300 transition group"
                              >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition" />
                                <span className="text-[11px] font-medium mt-1 opacity-0 group-hover:opacity-100 transition">
                                  Add Lesson
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lesson Details Drawer / Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass max-w-lg w-full rounded-2xl border border-white/10 p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedLesson(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {selectedLesson.subject}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedLesson.grade}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                    selectedLesson.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {selectedLesson.status === 'completed' ? 'Completed' : 'Upcoming'}
                </span>
              </div>

              <h2 className="text-xl font-bold font-heading text-white">{selectedLesson.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{selectedLesson.topic}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Date & Time</span>
                <span className="font-medium text-slate-200">
                  {new Date(selectedLesson.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Period</span>
                <span className="font-medium text-slate-200">{selectedLesson.period || 'Period 1'}</span>
              </div>
            </div>

            {selectedLesson.objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Learning Objectives
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Attached Resources
                </h4>
                <div className="space-y-1.5">
                  {selectedLesson.resources.map((r) => (
                    <a
                      key={r._id}
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-xs text-indigo-300 transition"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{r.title}</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={(e) => toggleLessonStatus(selectedLesson, e)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              >
                Toggle {selectedLesson.status === 'completed' ? 'Upcoming' : 'Completed'}
              </button>

              <button
                onClick={() => navigate(`/lessons/${selectedLesson._id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg transition"
              >
                <span>Full Document View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Schedule Prompt Modal */}
      {quickModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass max-w-md w-full rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setQuickModal({ open: false, dateStr: '', period: '' })}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold font-heading text-white">Schedule Lesson Plan</h3>
            </div>

            <p className="text-xs text-slate-400">
              Create a new lesson plan scheduled for{' '}
              <strong className="text-indigo-300">{quickModal.dateStr}</strong> during{' '}
              <strong className="text-indigo-300">{quickModal.period}</strong>.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setQuickModal({ open: false, dateStr: '', period: '' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const query = new URLSearchParams({
                    date: quickModal.dateStr,
                    period: quickModal.period,
                  }).toString();
                  navigate(`/lessons/create?${query}`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-semibold text-white shadow-lg transition"
              >
                Create Lesson Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
