import React, { useState } from 'react';
import type { Resource } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import api from '../lib/api.js';
import {
  Download,
  Trash2,
  Tag,
  User,
  Plus,
  Check,
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onDelete?: (id: string) => void;
  onAttach?: (resource: Resource) => void;
  isAttached?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onDelete,
  onAttach,
  isAttached = false,
}) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadsCount, setDownloadsCount] = useState(resource.downloadsCount || 0);

  const teacherName =
    typeof resource.teacherId === 'object' && resource.teacherId?.name
      ? resource.teacherId.name
      : 'Teacher User';

  const isOwner =
    user &&
    ((typeof resource.teacherId === 'object' && resource.teacherId?.id === user.id) ||
      (typeof resource.teacherId === 'string' && resource.teacherId === user.id));

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await api.post(`/resources/${resource._id}/download`);
      if (res.data.success) {
        setDownloadsCount(res.data.downloadsCount);
        // Open file in new tab or trigger download
        window.open(res.data.fileUrl, '_blank');
      }
    } catch (err) {
      console.error('Download error:', err);
      window.open(resource.fileUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'worksheet':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'presentation':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'exercise':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'exam':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'notes':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'File';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize ${getTypeBadgeColor(
              resource.type
            )}`}
          >
            {resource.type}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              {resource.subject}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              {resource.grade}
            </span>
          </div>
        </div>

        {/* Resource Title */}
        <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
          {resource.title}
        </h3>

        {/* Topic & Description */}
        <p className="text-xs font-medium text-slate-400 mb-3 line-clamp-2">
          {resource.description || `Educational ${resource.type} focusing on ${resource.topic}.`}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5 text-indigo-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Author metadata & file size */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{teacherName}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {formatFileSize(resource.fileSize)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ({downloadsCount})</span>
          </button>

          {onAttach && (
            <button
              onClick={() => onAttach(resource)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                isAttached
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isAttached ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAttached ? 'Attached' : 'Attach'}</span>
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              title="Delete resource"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
