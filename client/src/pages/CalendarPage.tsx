import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import type { LessonPlan, Timetable } from '../types/index.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Loader2,
  FileText,
  Settings2,
  Search,
  BookOpen,
  Edit3,
  Link2,
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

const DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

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
      bg: 'bg-rose-500/15 hover:bg-rose-500/25',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      text: 'text-rose-300',
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
    bg: 'bg-orange-500/15 hover:bg-orange-500/25',
    border: 'border-orange-500/40',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    text: 'text-orange-300',
  };
};

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();

  // Current selected Monday for the active week view
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Mobile selected day tab (Monday - Friday)
  const [selectedMobileDay, setSelectedMobileDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);

  // Cell Action Modal (Attach/Create Lesson Plan or Edit Period Class)
  const [cellModal, setCellModal] = useState<{
    open: boolean;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    dateStr: string;
    period: string;
    className: string;
  }>({
    open: false,
    day: 'Monday',
    dateStr: '',
    period: '',
    className: '',
  });

  const [classNameInput, setClassNameInput] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');

  // Bulk Setup Timetable Modal
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, timetableRes] = await Promise.all([
        api.get('/lessons'),
        api.get('/timetable'),
      ]);

      if (lessonsRes.data.success) {
        setLessons(lessonsRes.data.lessons || []);
      }
      if (timetableRes.data.success) {
        setTimetable(timetableRes.data.timetable);
      }
    } catch (err) {
      console.error('Failed to load schedule data', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate 5 week days (Monday - Friday)
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

  // Find class name assigned to day & period
  const getClassForCell = (dayName: string, periodName: string): string => {
    if (!timetable || !timetable.slots) return '';
    const slot = timetable.slots.find(
      (s) => s.day === dayName && (s.period === periodName || s.period.startsWith(periodName.slice(0, 8)))
    );
    return slot?.className || '';
  };

  // Find lesson matching dateStr & period
  const getLessonForCell = (dateStr: string, periodName: string) => {
    return lessons.find((l) => {
      const lDate = new Date(l.date).toISOString().split('T')[0];
      const normPeriod = l.period || 'Period 1';
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
      console.error('Failed to update lesson status', err);
    }
  };

  // Save class assignment for a timetable period slot
  const handleSaveClassSlot = async (day: string, period: string, newClassName: string) => {
    try {
      const res = await api.post('/timetable/slot', {
        day,
        period,
        className: newClassName,
      });

      if (res.data.success) {
        setTimetable(res.data.timetable);
      }
    } catch (err) {
      console.error('Failed to save class slot', err);
    }
  };

  // Attach existing created lesson plan to specific date & period slot
  const handleAttachLesson = async (lesson: LessonPlan) => {
    try {
      const res = await api.put(`/lessons/${lesson._id}`, {
        date: cellModal.dateStr,
        period: cellModal.period,
        grade: cellModal.className || lesson.grade,
      });

      if (res.data.success) {
        setLessons((prev) => prev.map((l) => (l._id === lesson._id ? res.data.lesson : l)));
        setCellModal({ open: false, day: 'Monday', dateStr: '', period: '', className: '' });
      }
    } catch (err) {
      console.error('Failed to attach lesson plan', err);
    }
  };

  const weekRangeText = `${weekDays[0].formatted} - ${weekDays[4].formatted}, ${currentWeekStart.getFullYear()}`;

  // Filter existing lessons in modal
  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      l.subject.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      l.topic.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  const activeMobileDayObj = weekDays.find((d) => d.name === selectedMobileDay) || weekDays[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header Banner & Controls */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-orange-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
            <Sparkles className="w-4 h-4" />
            Weekly Class Timetable
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Teaching Period Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Register your weekly period classes (e.g. 9A, 10B) and attach lesson plans directly to each day&apos;s slot.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 z-10">
          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            Current Week
          </button>

          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 sm:px-3 text-xs font-semibold text-slate-200 min-w-[120px] sm:min-w-[140px] text-center font-mono">
              {weekRangeText}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Settings2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Setup Timetable</span>
          </button>

          <Link
            to="/lessons/create"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-orange-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lesson Plan</span>
          </Link>
        </div>
      </div>

      {/* Mobile Day Selector Tabs (visible only on < md screens) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {weekDays.map((day) => {
          const isSelected = selectedMobileDay === day.name;
          return (
            <button
              key={day.name}
              onClick={() => setSelectedMobileDay(day.name)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'gradient-bg-primary text-white border-transparent shadow-md'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{day.name}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                {day.formatted}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Timetable Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-sm font-medium">Loading weekly class schedule...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table Grid (visible md and up) */}
          <div className="hidden md:block glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800">
                    <th className="py-4 px-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-48 border-r border-slate-800">
                      Teaching Period
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day.name}
                        className={`py-4 px-4 text-center border-r border-slate-800 last:border-r-0 ${
                          day.isToday ? 'bg-orange-500/10 text-orange-300' : 'text-slate-300'
                        }`}
                      >
                        <div className="font-extrabold text-sm text-white">{day.name}</div>
                        <div className={`text-[11px] font-mono mt-0.5 ${day.isToday ? 'text-orange-400 font-bold' : 'text-slate-500'}`}>
                          {day.formatted} {day.isToday && '(Today)'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {PERIODS.map((period) => {
                    const isLunch = period.includes('Lunch');

                    if (isLunch) {
                      return (
                        <tr key={period} className="bg-slate-950/80 border-b border-slate-800/80">
                          <td className="py-2.5 px-4 text-xs font-semibold text-amber-400/80 border-r border-slate-800">
                            {period}
                          </td>
                          <td colSpan={5} className="py-2.5 text-center text-xs font-bold text-slate-500 tracking-widest uppercase">
                            ☕ RECESS & LUNCH BREAK
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={period} className="border-b border-slate-800/60 hover:bg-slate-900/30 transition-all">
                        {/* Period Time Column */}
                        <td className="py-3 px-4 text-xs font-medium text-slate-400 bg-slate-900/40 border-r border-slate-800">
                          <div className="font-bold text-slate-200">{period.split('(')[0]}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {period.split('(')[1]?.replace(')', '')}
                          </div>
                        </td>

                        {/* Day Columns */}
                        {weekDays.map((day) => {
                          const assignedClass = getClassForCell(day.name, period);
                          const lesson = getLessonForCell(day.dateStr, period);
                          const subjectStyle = lesson ? getSubjectStyle(lesson.subject) : null;

                          return (
                            <td
                              key={day.name}
                              className={`p-2 border-r border-slate-800/60 last:border-r-0 align-top transition-all ${
                                day.isToday ? 'bg-orange-500/[0.02]' : ''
                              }`}
                            >
                              {lesson ? (
                                /* Attached Lesson Plan Card */
                                <div
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md group ${subjectStyle?.bg} ${subjectStyle?.border}`}
                                >
                                  {/* Top Header Badges */}
                                  <div className="flex items-start justify-between gap-1 mb-2">
                                    <div className="flex items-center gap-1.5">
                                      {assignedClass && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                                          {assignedClass}
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${subjectStyle?.badge}`}>
                                        {lesson.subject}
                                      </span>
                                    </div>

                                    <button
                                      onClick={(e) => toggleLessonStatus(lesson, e)}
                                      title={lesson.status === 'completed' ? 'Mark Upcoming' : 'Mark Completed'}
                                      className="text-slate-400 hover:text-emerald-400 transition"
                                    >
                                      <CheckCircle2
                                        className={`w-3.5 h-3.5 ${
                                          lesson.status === 'completed'
                                            ? 'text-emerald-400 fill-emerald-500/20'
                                            : 'text-slate-500'
                                        }`}
                                      />
                                    </button>
                                  </div>

                                  {/* Title & Topic */}
                                  <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-orange-200 transition mb-1">
                                    {lesson.title}
                                  </h4>

                                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                                    {lesson.topic}
                                  </p>

                                  {/* Footer details */}
                                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
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
                                /* Empty Slot - Display Assigned Class + Attach Action */
                                <div className="w-full min-h-[95px] p-2.5 rounded-2xl border border-dashed border-slate-800 hover:border-orange-500/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between group">
                                  <div className="flex items-center justify-between">
                                    {assignedClass ? (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 font-mono">
                                        {assignedClass}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 italic">No class assigned</span>
                                    )}

                                    <button
                                      onClick={() => {
                                        setClassNameInput(assignedClass);
                                        setCellModal({
                                          open: true,
                                          day: day.name,
                                          dateStr: day.dateStr,
                                          period,
                                          className: assignedClass,
                                        });
                                      }}
                                      title="Edit Class / Attach Lesson Plan"
                                      className="p-1 rounded-lg text-slate-500 hover:text-orange-300 hover:bg-slate-800 transition"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setClassNameInput(assignedClass);
                                      setCellModal({
                                        open: true,
                                        day: day.name,
                                        dateStr: day.dateStr,
                                        period,
                                        className: assignedClass,
                                      });
                                    }}
                                    className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-orange-600/20 text-slate-400 hover:text-orange-300 border border-slate-800 hover:border-orange-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all mt-2"
                                  >
                                    <Plus className="w-3 h-3 text-orange-400" />
                                    <span>{assignedClass ? `Attach to ${assignedClass}` : 'Attach Lesson'}</span>
                                  </button>
                                </div>
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

          {/* Mobile Single-Day View Cards (visible only on < md screens) */}
          <div className="block md:hidden space-y-3">
            {PERIODS.map((period) => {
              const isLunch = period.includes('Lunch');

              if (isLunch) {
                return (
                  <div key={period} className="glass-panel p-3 rounded-2xl text-center text-xs font-bold text-amber-400/80 border border-slate-800">
                    ☕ RECESS & LUNCH BREAK ({period.split('(')[1]?.replace(')', '')})
                  </div>
                );
              }

              const assignedClass = getClassForCell(activeMobileDayObj.name, period);
              const lesson = getLessonForCell(activeMobileDayObj.dateStr, period);
              const subjectStyle = lesson ? getSubjectStyle(lesson.subject) : null;

              return (
                <div key={period} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-white">{period.split('(')[0]}</span>
                    <span className="text-[11px] font-mono text-slate-400">{period.split('(')[1]?.replace(')', '')}</span>
                  </div>

                  {lesson ? (
                    <div
                      onClick={() => setSelectedLesson(lesson)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${subjectStyle?.bg} ${subjectStyle?.border}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5">
                          {assignedClass && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                              {assignedClass}
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${subjectStyle?.badge}`}>
                            {lesson.subject}
                          </span>
                        </div>

                        <button
                          onClick={(e) => toggleLessonStatus(lesson, e)}
                          className="text-slate-400 hover:text-emerald-400 transition"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              lesson.status === 'completed' ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-500'
                            }`}
                          />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">{lesson.title}</h4>
                      <p className="text-xs text-slate-400 mb-2">{lesson.topic}</p>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                        <span>Grade: {lesson.grade}</span>
                        <span>Duration: {lesson.duration} mins</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                      <div>
                        {assignedClass ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 font-mono">
                            {assignedClass}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No class section set</span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setClassNameInput(assignedClass);
                          setCellModal({
                            open: true,
                            day: activeMobileDayObj.name,
                            dateStr: activeMobileDayObj.dateStr,
                            period,
                            className: assignedClass,
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-slate-700 p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedLesson(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
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

              <h2 className="text-xl font-bold text-white">{selectedLesson.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{selectedLesson.topic}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Date & Time</span>
                <span className="font-medium text-slate-200 font-mono">
                  {new Date(selectedLesson.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Teaching Period</span>
                <span className="font-medium text-slate-200">{selectedLesson.period || 'Period 1'}</span>
              </div>
            </div>

            {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Learning Objectives
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Attached Resources
                </h4>
                <div className="space-y-1.5">
                  {selectedLesson.resources.map((r) => (
                    <a
                      key={r._id}
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-xs text-orange-300 transition"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white shadow-lg transition"
              >
                <span>Full Document View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cell Action Modal - Attach Lesson Plan / Set Class Section */}
      {cellModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full rounded-3xl border border-slate-700 p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setCellModal({ open: false, day: 'Monday', dateStr: '', period: '', className: '' })}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                Schedule Slot Assignment
              </div>
              <h3 className="text-xl font-bold text-white">
                {cellModal.day} ({cellModal.dateStr}) — {cellModal.period.split('(')[0]}
              </h3>
            </div>

            {/* Section 1: Class Name Configuration */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-orange-400" />
                Class Section Name for this Weekly Period:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Grade 9A, Grade 10B, Physics 11C"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  onClick={async () => {
                    await handleSaveClassSlot(cellModal.day, cellModal.period, classNameInput);
                    setCellModal((prev) => ({ ...prev, className: classNameInput }));
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition"
                >
                  Save Class
                </button>
              </div>
            </div>

            {/* Section 2: Attach Existing Lesson Plan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-orange-400" />
                  Attach Existing Created Lesson Plan
                </h4>
                <span className="text-[11px] text-slate-500">{filteredLessons.length} lessons available</span>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search your created lesson plans..."
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Lesson Plans List */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredLessons.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl">
                    No lesson plans found matching your search.
                  </div>
                ) : (
                  filteredLessons.map((l) => (
                    <div
                      key={l._id}
                      className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            {l.subject}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {l.grade}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white truncate">{l.title}</h5>
                        <p className="text-[11px] text-slate-400 truncate">{l.topic}</p>
                      </div>

                      <button
                        onClick={() => handleAttachLesson(l)}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shrink-0 transition"
                      >
                        Attach
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 3: Create New Lesson Plan */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setCellModal({ open: false, day: 'Monday', dateStr: '', period: '', className: '' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const query = new URLSearchParams({
                    date: cellModal.dateStr,
                    period: cellModal.period,
                    grade: cellModal.className || 'Grade 9A',
                  }).toString();
                  navigate(`/lessons/create?${query}`);
                }}
                className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Lesson Plan for {cellModal.className || 'this Period'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Setup Timetable Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-3xl w-full rounded-3xl border border-slate-700 p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                <Settings2 className="w-4 h-4" />
                Timetable Setup
              </div>
              <h3 className="text-xl font-bold text-white">Configure Weekly Period Classes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Set your recurring teaching class sections (e.g. Grade 9A, Grade 10B) for each period from Monday to Friday.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {DAYS.map((day) => (
                <div key={day} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {day}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {PERIODS.filter((p) => !p.includes('Lunch')).map((period) => {
                      const currentVal = getClassForCell(day, period);
                      return (
                        <div key={period} className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400">
                            {period.split('(')[0]}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 9A"
                            defaultValue={currentVal}
                            onBlur={(e) => {
                              if (e.target.value !== currentVal) {
                                handleSaveClassSlot(day, period, e.target.value);
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-6 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
