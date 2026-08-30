import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import type { Resource } from '../types/index.js';
import { ResourceCard } from '../components/ResourceCard.js';
import { ResourcePreviewModal } from '../components/ResourcePreviewModal.js';
import {
  Upload,
  Search,
  UserCheck,
  FolderOpen,
  Loader2,
  Sparkles,
  Bookmark,
  Tag,
  X,
} from 'lucide-react';

export const ResourceHubPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [type, setType] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [myResources, setMyResources] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [search, subject, grade, type, selectedTag, myResources, onlySaved]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      if (onlySaved) {
        const res = await api.get('/user/bookmarks');
        if (res.data.success) {
          let list = res.data.resources || [];
          if (subject) list = list.filter((r: Resource) => r.subject === subject);
          if (grade) list = list.filter((r: Resource) => r.grade === grade);
          if (type) list = list.filter((r: Resource) => r.type === type);
          if (selectedTag) {
            list = list.filter((r: Resource) =>
              r.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
            );
          }
          if (search) {
            const q = search.toLowerCase();
            list = list.filter(
              (r: Resource) =>
                r.title.toLowerCase().includes(q) ||
                r.topic?.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q) ||
                r.tags?.some((t) => t.toLowerCase().includes(q))
            );
          }
          setResources(list);
        }
        return;
      }

      const params: any = {};
      const queryTerm = selectedTag ? selectedTag : search;
      if (queryTerm) params.q = queryTerm;
      if (subject) params.subject = subject;
      if (grade) params.grade = grade;
      if (type) params.type = type;
      if (myResources) params.myResources = 'true';

      const res = await api.get('/resources', { params });
      if (res.data.success) {
        let list = res.data.resources || [];
        if (selectedTag && search) {
          const q = search.toLowerCase();
          list = list.filter(
            (r: Resource) =>
              r.title.toLowerCase().includes(q) ||
              r.topic?.toLowerCase().includes(q) ||
              r.description?.toLowerCase().includes(q)
          );
        }
        setResources(list);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this uploaded resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      fetchResources();
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

  return (
    <div className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Page Banner Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
              <Sparkles className="w-4 h-4" />
              Teacher Community Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Educational Resource Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
              Discover worksheets, presentations, exams, and notes shared by teachers worldwide. Preview documents directly, download freely, or share your own materials.
            </p>
          </div>

          <Link
            to="/resources/upload"
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload Teaching Resource
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel rounded-2xl p-4 space-y-3 md:space-y-0 md:flex md:items-center md:gap-3 border border-slate-800">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search resources by title, topic, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Filters Group for Mobile Wrap */}
        <div className="grid grid-cols-2 md:flex items-center gap-2.5">
          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 capitalize"
          >
            <option value="">All Types</option>
            <option value="worksheet">Worksheets</option>
            <option value="presentation">Presentations</option>
            <option value="exercise">Exercises</option>
            <option value="exam">Exams</option>
            <option value="notes">Teacher Notes</option>
            <option value="other">Other</option>
          </select>

          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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

          {/* Grade Filter */}
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
          </select>
        </div>

        {/* My Resources Toggle */}
        <button
          onClick={() => {
            setMyResources(!myResources);
            if (!myResources) setOnlySaved(false);
          }}
          className={`w-full md:w-auto justify-center px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            myResources
              ? 'gradient-bg-primary text-white shadow-md shadow-orange-600/20'
              : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          My Uploads
        </button>

        {/* Saved Items Toggle */}
        <button
          onClick={() => {
            setOnlySaved(!onlySaved);
            if (!onlySaved) setMyResources(false);
          }}
          className={`w-full md:w-auto justify-center px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            onlySaved
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10'
              : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${onlySaved ? 'fill-amber-300 text-amber-300' : ''}`} />
          Saved Items
        </button>
      </div>

      {/* Active Tag Indicator */}
      {selectedTag && (
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-orange-300 w-fit">
          <Tag className="w-3.5 h-3.5" />
          <span>Active Tag: <strong className="text-white">#{selectedTag}</strong></span>
          <button
            onClick={() => setSelectedTag('')}
            className="p-0.5 hover:bg-orange-500/20 rounded-md transition-colors cursor-pointer"
            title="Clear tag filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
          <p className="text-sm font-medium">Searching educational resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No resources found</h3>
          <p className="text-xs text-slate-400">
            {search || subject || grade || type || selectedTag || myResources || onlySaved
              ? 'No teaching materials match your active search filters.'
              : 'The resource hub is currently empty. Be the first teacher to share a worksheet or presentation!'}
          </p>
          <Link
            to="/resources/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg-primary text-white font-semibold text-xs shadow-lg shadow-orange-600/20"
          >
            + Upload Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {resources.map((item) => (
            <ResourceCard
              key={item._id}
              resource={item}
              onDelete={handleDeleteResource}
              onToggleVisibility={handleToggleVisibility}
              onPreview={(r) => setPreviewResource(r)}
              onSelectTag={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      <ResourcePreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onDownload={handleDownloadResource}
      />
    </div>
  );
};
