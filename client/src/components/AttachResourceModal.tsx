import React, { useState, useEffect } from 'react';
import type { Resource } from '../types/index.js';
import api from '../lib/api.js';
import { X, Search, Check, Plus, Loader2, FolderOpen } from 'lucide-react';

interface AttachResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedResources: Resource[];
  onToggleAttach: (resource: Resource) => void;
}

export const AttachResourceModal: React.FC<AttachResourceModalProps> = ({
  isOpen,
  onClose,
  attachedResources,
  onToggleAttach,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchResources();
    }
  }, [isOpen, search, subjectFilter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.q = search;
      if (subjectFilter) params.subject = subjectFilter;

      const res = await api.get('/resources', { params });
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources for modal:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isAttached = (id: string) => attachedResources.some((r) => r._id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel rounded-2xl border border-slate-700/60 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              Attach Shared Resources
            </h2>
            <p className="text-xs text-slate-400">
              Browse materials from the Resource Hub to link with this lesson plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search resources by title, topic, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="Technology">Technology</option>
            <option value="Art">Art</option>
          </select>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
              <p className="text-xs">Loading educational resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No resources found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for different terms or clear filters.
              </p>
            </div>
          ) : (
            resources.map((item) => {
              const attached = isAttached(item._id);
              return (
                <div
                  key={item._id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    attached
                      ? 'bg-indigo-950/40 border-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.subject} &bull; {item.grade}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{item.topic}</p>
                  </div>

                  <button
                    onClick={() => onToggleAttach(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      attached
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {attached ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Attached
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Attach
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{attachedResources.length} resource(s) selected</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
