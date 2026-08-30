import React, { useState } from 'react';
import toast from 'react-hot-toast';
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
  Globe,
  Lock,
  Calendar,
  Eye,
  Bookmark,
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, currentIsPublic: boolean) => void;
  onPreview?: (resource: Resource) => void;
  onAttach?: (resource: Resource) => void;
  onBookmarkToggle?: (id: string, isBookmarked: boolean) => void;
  onSelectTag?: (tag: string) => void;
  isAttached?: boolean;
  isBookmarkedInitial?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onDelete,
  onToggleVisibility,
  onPreview,
  onAttach,
  onBookmarkToggle,
  onSelectTag,
  isAttached = false,
  isBookmarkedInitial,
}) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadsCount, setDownloadsCount] = useState(resource.downloadsCount || 0);

  const initialBookmarked =
    isBookmarkedInitial !== undefined
      ? isBookmarkedInitial
      : Boolean(user?.savedResources && user.savedResources.includes(resource._id));

  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarking, setBookmarking] = useState(false);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarking) return;
    try {
      setBookmarking(true);
      const res = await api.post(`/user/bookmarks/${resource._id}`);
      if (res.data.success) {
        setBookmarked(res.data.isBookmarked);
        toast.success(res.data.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
        if (onBookmarkToggle) {
          onBookmarkToggle(resource._id, res.data.isBookmarked);
        }
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarking(false);
    }
  };

  const teacherObj = typeof resource.teacherId === 'object' ? (resource.teacherId as any) : null;
  const teacherName = teacherObj?.name || 'Teacher User';
  const teacherIdStr = teacherObj ? (teacherObj._id || teacherObj.id) : String(resource.teacherId || '');

  const currentUserId = user?.id || (user as any)?._id;
  const isOwner = Boolean(currentUserId && teacherIdStr && String(currentUserId) === String(teacherIdStr));

  const isPublic = resource.isPublic !== false;

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloading(true);
      const res = await api.post(`/resources/${resource._id}/download`);
      if (res.data.success) {
        setDownloadsCount(res.data.downloadsCount);
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
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'File';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative group border border-slate-800 hover:border-orange-500/40 transition-all">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize ${getTypeBadgeColor(
                resource.type
              )}`}
            >
              {resource.type}
            </span>

            {/* Visibility Badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                isPublic
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              {resource.subject}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              {resource.grade}
            </span>
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={bookmarking}
              title={bookmarked ? 'Remove from Saved Items' : 'Save to Bookmarks'}
              className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                bookmarked
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-orange-400 hover:border-slate-600'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-orange-400 text-orange-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Resource Title */}
        <h3
          onClick={() => onPreview && onPreview(resource)}
          className="font-extrabold text-base text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-1.5 cursor-pointer flex items-center gap-1.5"
        >
          <span>{resource.title}</span>
        </h3>

        {/* Topic & Description */}
        <p className="text-xs font-semibold text-slate-300 mb-3 line-clamp-2 leading-relaxed">
          {resource.description || `Educational ${resource.type} focusing on ${resource.topic}.`}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-700/60"
              >
                <Tag className="w-2.5 h-2.5 text-orange-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Author metadata, Post Date & file size */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-200">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="font-bold text-slate-100 truncate">
                By <span className="text-orange-300">@{teacherName}</span> {isOwner && <span className="text-[10px] text-orange-400 font-mono font-bold">(You)</span>}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300 font-semibold">
              {formatFileSize(resource.fileSize)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-orange-400" />
              <span>Posted: {formatDate(resource.createdAt) || 'Recently'}</span>
            </div>
            {resource.publicId && resource.publicId.startsWith('local/') ? (
              <span className="text-[10px] text-slate-400 font-mono">Local File</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Cloudinary</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onPreview && (
            <button
              onClick={() => onPreview(resource)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-sm"
              title="View document preview without downloading"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>View</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2 px-3 rounded-xl gradient-bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-all min-w-0"
          >
            <Download className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">Download ({downloadsCount})</span>
          </button>

          {onAttach && (
            <button
              onClick={() => onAttach(resource)}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                isAttached
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {isAttached ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 text-slate-300" />}
              <span>{isAttached ? 'Attached' : 'Attach'}</span>
            </button>
          )}

          {isOwner && onToggleVisibility && (
            <button
              onClick={() => onToggleVisibility(resource._id, isPublic)}
              title={isPublic ? 'Click to make Private (Only visible to you)' : 'Click to make Public (Shared in Hub)'}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                isPublic
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              title="Delete resource"
              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
