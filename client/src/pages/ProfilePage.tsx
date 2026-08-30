import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../lib/api.js';
import type { Resource, LessonPlan } from '../types/index.js';
import { ResourceCard } from '../components/ResourceCard.js';
import { ResourcePreviewModal } from '../components/ResourcePreviewModal.js';
import {
  User as UserIcon,
  School,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  FileSearch,
  Download,
  AlertCircle,
  Plus,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
  Settings,
} from 'lucide-react';

interface ProfileStats {
  totalLessons: number;
  totalResources: number;
  totalDownloads: number;
}

export const ProfilePage: React.FC = () => {
  const { user, refetchSession } = useAuth();

  const [activeTab, setActiveTab] = useState<'settings' | 'resources' | 'lessons'>('settings');

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [subject, setSubject] = useState(user?.subject || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [yearsOfExperience, setYearsOfExperience] = useState<string | number>(user?.yearsOfExperience || '');

  const [resources, setResources] = useState<Resource[]>([]);
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ totalLessons: 0, totalResources: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      if (res.data.success) {
        const u = res.data.user;
        setName(u.name || user?.name || '');
        setInstitution(u.institution || '');
        setSubject(u.subject || '');
        setGrade(u.grade || '');
        setBio(u.bio || '');
        setPhone(u.phone || '');
        setLocation(u.location || '');
        setYearsOfExperience(u.yearsOfExperience || '');
        if (res.data.resources) {
          setResources(res.data.resources);
        }
        if (res.data.lessons) {
          setLessons(res.data.lessons);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.put('/user/profile', {
        name,
        institution,
        subject,
        grade,
        bio,
        phone,
        location,
        yearsOfExperience,
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        if (refetchSession) {
          refetchSession();
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
      setStats((prev) => ({
        ...prev,
        totalResources: Math.max(0, prev.totalResources - 1),
      }));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggleVisibility = async (id: string, currentIsPublic: boolean) => {
    try {
      const res = await api.patch(`/resources/${id}/visibility`, { isPublic: !currentIsPublic });
      if (res.data.success) {
        setResources((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isPublic: !currentIsPublic } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update visibility:', err);
    }
  };

  const handleDownloadResource = async (resource: Resource) => {
    try {
      const res = await api.post(`/resources/${resource._id}/download`);
      if (res.data.success) {
        setResources((prev) =>
          prev.map((r) =>
            r._id === resource._id ? { ...r, downloadsCount: res.data.downloadsCount } : r
          )
        );
        window.open(res.data.fileUrl, '_blank');
      }
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Teacher Profile & Assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner Alert Toast */}
        {successMsg && (
          <div className="glass-panel border border-emerald-500/40 bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 text-emerald-300 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="glass-panel border border-rose-500/40 bg-rose-500/10 p-4 rounded-2xl flex items-center gap-3 text-rose-300 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="text-xs sm:text-sm font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Profile Hero Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            {/* Avatar Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl gradient-bg-primary p-1 shadow-xl shadow-orange-600/20 shrink-0 relative group">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-orange-400 border border-slate-800">
                {name ? name.charAt(0).toUpperCase() : 'T'}
              </div>
            </div>

            {/* Profile Brief */}
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{name || 'Teacher Profile'}</h1>
                {subject && (
                  <span className="px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-semibold text-xs flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {subject}
                  </span>
                )}
                {grade && (
                  <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                    {grade}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 font-medium">
                {user?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                    {user.email}
                  </span>
                )}
                {institution && (
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-orange-400 shrink-0" />
                    {institution}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                    {location}
                  </span>
                )}
              </div>

              {bio && (
                <p className="text-xs sm:text-sm text-slate-300 italic max-w-2xl pt-1 leading-relaxed">
                  &quot;{bio}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Interactive Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:border-orange-500/40 ${
                activeTab === 'lessons' ? 'border-orange-500/50 bg-orange-500/10' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalLessons}</div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  Lesson Plans Created <ArrowRight className="w-3 h-3 text-orange-400" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:border-rose-500/40 ${
                activeTab === 'resources' ? 'border-rose-500/50 bg-rose-500/10' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalResources}</div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  Shared Resources <ArrowRight className="w-3 h-3 text-rose-400" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:border-emerald-500/40 ${
                activeTab === 'resources' ? 'border-emerald-500/50 bg-emerald-500/10' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalDownloads}</div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  Resource Downloads <ArrowRight className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'resources'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Shared Assets ({resources.length})
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'lessons'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Lesson Plans ({lessons.length})
          </button>
        </div>

        {/* Tab 1: Profile Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Customize Teacher Profile
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Update your teaching credentials, school details, and contact preferences visible across EduShelf.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl gradient-bg-primary text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 hover:opacity-95 transition-all disabled:opacity-50 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>

            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Account Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name / Username <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Hana Tesfaye"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Email is associated with your account authentication.</span>
                </div>
              </div>
            </div>

            {/* Section 2: Teaching Credentials & School */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Teaching Credentials</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Educational Institution / School
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. St. George Academy / Nexus Secondary"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Subject Taught
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Biology & General Science"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Grade Level(s) Taught
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g. Grade 9, Grade 10 & High School"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Years of Teaching Experience
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="e.g. 6 Years"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Location */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Contact & Location</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location / City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Addis Ababa, Ethiopia"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +251 911 000 000"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Bio / Teaching Statement */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Bio & Teaching Philosophy</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Biography / Intro Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your passion for teaching, curriculum highlights, or favorite pedagogical methods..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 rounded-xl gradient-bg-primary text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Shared Resources & Downloads Viewer */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-orange-400" />
                  My Uploaded Assets & Resource Downloads
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your uploaded teaching resources, toggle visibility, and track download counts.
                </p>
              </div>

              <Link
                to="/resources/upload"
                className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Upload New Resource
              </Link>
            </div>

            {resources.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Shared Resources Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload worksheets, presentations, exam papers, or notes to build your teaching portfolio and share with educators.
                </p>
                <Link
                  to="/resources/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Upload First Resource
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    resource={resource}
                    onPreview={(r: Resource) => setPreviewResource(r)}
                    onDelete={(id: string) => handleDeleteResource(id)}
                    onToggleVisibility={(id: string, current: boolean) => handleToggleVisibility(id, current)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lesson Plans Viewer */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  My Created Lesson Plans
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  View and manage your saved lesson plans.
                </p>
              </div>

              <Link
                to="/lessons/create"
                className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Create New Lesson
              </Link>
            </div>

            {lessons.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Lesson Plans Created Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Plan your curriculum, set objectives, and attach teaching resources seamlessly.
                </p>
                <Link
                  to="/lessons/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Create Lesson Plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-500/40 transition-all"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[11px] font-bold">
                          {lesson.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {lesson.grade}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold capitalize ${
                            lesson.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate">{lesson.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-orange-400" />
                          {new Date(lesson.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          {lesson.duration} mins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-400" />
                        View Plan
                      </Link>
                      <Link
                        to={`/lessons/${lesson._id}/edit`}
                        className="px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-all border border-orange-500/30"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Document Preview Modal */}
        <ResourcePreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
          onDownload={(r: Resource) => handleDownloadResource(r)}
        />
      </div>
    </div>
  );
};
