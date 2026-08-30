import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api.js';
import { ArrowLeft, Upload, FileUp, CheckCircle2, AlertCircle, Globe, Lock } from 'lucide-react';

export const ResourceUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [grade, setGrade] = useState('Grade 9');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('worksheet');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        // Auto fill title from filename without extension
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!title.trim() || !topic.trim()) {
      setError('Title and topic are required.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', subject);
      formData.append('grade', grade);
      formData.append('topic', topic);
      formData.append('type', type);
      formData.append('tags', tags);
      formData.append('isPublic', String(isPublic));

      const res = await api.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        navigate('/resources');
      }
    } catch (err: any) {
      console.error('Resource upload failed:', err);
      setError(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Resource Hub
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-white text-right">Upload Teaching Resource</h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-5 sm:p-8 space-y-6 border border-slate-800">
        {/* File Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Upload File (PDF, Word, PowerPoint, Image) <span className="text-rose-400">*</span>
          </label>

          <div className="relative border-2 border-dashed border-slate-700/80 hover:border-orange-500/80 bg-slate-900/60 rounded-2xl p-6 sm:p-8 text-center transition-colors cursor-pointer group">
            <input
              type="file"
              required
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.webp,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileUp className="w-6 h-6" />
              </div>
              {file ? (
                <div>
                  <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Click to replace file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click or drag & drop file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, PPTX, PNG, JPG (Max 15MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Inputs */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resource Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Photosynthesis Diagram Worksheet & Answer Key"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resource Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or instructions for other teachers using this material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resource Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500 capitalize"
              >
                <option value="worksheet">Worksheet</option>
                <option value="presentation">Presentation</option>
                <option value="exercise">Exercise</option>
                <option value="exam">Exam</option>
                <option value="notes">Teacher Notes</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject <span className="text-rose-400">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
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
                Target Grade <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 9"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Topic <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Light Reaction & ATP"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. biology, chloroplast, printable"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Privacy & Sharing Selector */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Privacy & Access Control
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isPublic
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 ${isPublic ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Public (Community Hub)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Visible to all teachers across EduNexus to discover and download.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  !isPublic
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 ${!isPublic ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Private (Only You)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Private resource saved strictly to your personal library.</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            to="/resources"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading File...' : 'Publish to Resource Hub'}
          </button>
        </div>
      </form>
    </div>
  );
};
