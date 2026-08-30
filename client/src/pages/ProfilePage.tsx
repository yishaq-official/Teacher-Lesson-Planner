import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import api from '../lib/api.js';
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
} from 'lucide-react';

interface ProfileStats {
  totalLessons: number;
  totalResources: number;
  totalDownloads: number;
}

export const ProfilePage: React.FC = () => {
  const { user, refetchSession } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [subject, setSubject] = useState(user?.subject || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [yearsOfExperience, setYearsOfExperience] = useState<string | number>(user?.yearsOfExperience || '');

  const [stats, setStats] = useState<ProfileStats>({ totalLessons: 0, totalResources: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800/80">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalLessons}</div>
                <div className="text-[11px] text-slate-400 font-medium">Lesson Plans Created</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalResources}</div>
                <div className="text-[11px] text-slate-400 font-medium">Shared Resources</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalDownloads}</div>
                <div className="text-[11px] text-slate-400 font-medium">Resource Downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
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
      </div>
    </div>
  );
};
