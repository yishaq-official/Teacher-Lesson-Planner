import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../lib/api.js';
import type { Resource } from '../types/index.js';
import { AttachResourceModal } from '../components/AttachResourceModal.js';
import {
  BookOpen,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Paperclip,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const LessonCreatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [grade, setGrade] = useState('Grade 9');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(45);
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [introduction, setIntroduction] = useState('');
  const [mainActivity, setMainActivity] = useState('');
  const [practiceActivity, setPracticeActivity] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [homework, setHomework] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [attachedResources, setAttachedResources] = useState<Resource[]>([]);

  useEffect(() => {
    if (isEditMode && id) {
      fetchExistingLesson(id);
    }
  }, [id]);

  const fetchExistingLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/lessons/${lessonId}`);
      if (res.data.success) {
        const l = res.data.lesson;
        setTitle(l.title);
        setSubject(l.subject);
        setGrade(l.grade);
        setTopic(l.topic);
        setDate(l.date ? new Date(l.date).toISOString().split('T')[0] : '');
        setDuration(l.duration || 45);
        setObjectives(l.objectives && l.objectives.length > 0 ? l.objectives : ['']);
        setIntroduction(l.introduction || '');
        setMainActivity(l.mainActivity || '');
        setPracticeActivity(l.practiceActivity || '');
        setConclusion(l.conclusion || '');
        setHomework(l.homework || '');
        setTeacherNotes(l.teacherNotes || '');
        setAttachedResources(l.resources || []);
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
      setError('Could not load lesson plan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveChange = (index: number, val: string) => {
    const next = [...objectives];
    next[index] = val;
    setObjectives(next);
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleToggleResourceAttach = (resource: Resource) => {
    if (attachedResources.some((r) => r._id === resource._id)) {
      setAttachedResources(attachedResources.filter((r) => r._id !== resource._id));
    } else {
      setAttachedResources([...attachedResources, resource]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !topic.trim()) {
      setError('Please fill in the Lesson Title and Topic.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        subject,
        grade,
        topic,
        date,
        duration: Number(duration),
        objectives: objectives.filter((o) => o.trim().length > 0),
        introduction,
        mainActivity,
        practiceActivity,
        conclusion,
        homework,
        teacherNotes,
        resources: attachedResources.map((r) => r._id),
      };

      if (isEditMode && id) {
        const res = await api.put(`/lessons/${id}`, payload);
        if (res.data.success) {
          navigate(`/lessons/${id}`);
        }
      } else {
        const res = await api.post('/lessons', payload);
        if (res.data.success) {
          navigate(`/lessons/${res.data.lesson._id}`);
        }
      }
    } catch (err: any) {
      console.error('Save lesson failed:', err);
      setError(err.response?.data?.message || 'Failed to save lesson plan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading lesson plan details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isEditMode ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
          <h2 className="text-base font-bold text-indigo-300 flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5" />
            1. Basic Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lesson Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Introduction to Photosynthesis & Plant Cells"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject <span className="text-rose-400">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Grade / Class Level <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 9"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lesson Topic <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chloroplasts & Light Reactions"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scheduled Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={10}
                max={240}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Learning Objectives */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5" />
              2. Learning Objectives
            </h2>
            <button
              type="button"
              onClick={addObjective}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              + Add Objective
            </button>
          </div>

          <div className="space-y-2.5">
            {objectives.map((obj, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
                <input
                  type="text"
                  placeholder="Students will be able to..."
                  value={obj}
                  onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                {objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Lesson Activities */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
          <h2 className="text-base font-bold text-indigo-300 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5" />
            3. Lesson Structure & Activities
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Introduction & Warm-up (5-10 mins)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Review previous concept, ask hook question about light energy..."
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Main Teaching Activity (20-25 mins)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Explain chemical formula of photosynthesis using slide deck presentation..."
              value={mainActivity}
              onChange={(e) => setMainActivity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Guided Practice & Exercises (10-15 mins)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Students complete photosynthesis worksheet in pairs..."
              value={practiceActivity}
              onChange={(e) => setPracticeActivity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Conclusion & Exit Ticket (5 mins)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Summarize key takeaways, collect exit ticket responses..."
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Section 4: Homework & Teacher Notes */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
          <h2 className="text-base font-bold text-indigo-300 flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5" />
            4. Homework & Personal Teacher Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Homework Assignment
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Read textbook page 45-48 and complete questions 1-5."
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Private Teacher Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Remember to bring microscope samples for period 3."
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Resource Hub Integration */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                <Paperclip className="w-4.5 h-4.5" />
                5. Link Teaching Resources
              </h2>
              <p className="text-xs text-slate-400">
                Attach worksheets, presentations, or exams from the Resource Hub.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Attach Shared Resource
            </button>
          </div>

          {attachedResources.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-center text-xs text-slate-400">
              No shared resources attached yet. Click above to attach worksheets or slides.
            </div>
          ) : (
            <div className="space-y-2">
              {attachedResources.map((res) => (
                <div
                  key={res._id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {res.type}
                    </span>
                    <span className="text-slate-200 font-semibold truncate">{res.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleResourceAttach(res)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/lessons"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditMode ? 'Update Lesson Plan' : 'Save Lesson Plan'}
          </button>
        </div>
      </form>

      {/* Modal */}
      <AttachResourceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        attachedResources={attachedResources}
        onToggleAttach={handleToggleResourceAttach}
      />
    </div>
  );
};
