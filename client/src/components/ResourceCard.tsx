import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { Resource } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import api, { getApiFileUrl } from '../lib/api.js';
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
  variant?: 'default' | 'compact';
  onDelete?: (id: string) => void;
  onEdit?: (resource: Resource) => void;
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
  variant = 'default',
  onDelete,
  onEdit,
  onToggleVisibility,
  onPreview,
  onAttach,
  onBookmarkToggle,
  onSelectTag,
  isAttached = false,
  isBookmarkedInitial,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
  const teacherIdStr = teacherObj ? String(teacherObj._id || teacherObj.id || '') : String(resource.teacherId || '');
  const teacherEmail = teacherObj?.email || '';

  const currentUserId = String(user?.id || (user as any)?._id || '');
  const currentUserEmail = String(user?.email || '').toLowerCase();

  const isOwner = Boolean(
    (currentUserId && teacherIdStr && currentUserId === teacherIdStr) ||
    (currentUserEmail && teacherEmail && currentUserEmail === teacherEmail.toLowerCase())
  );

  const rawTeacherName = teacherObj?.name || (isOwner ? user?.name : null);
  const activeTeacherEmail = teacherEmail || (isOwner ? user?.email : '');
  const emailFallback = activeTeacherEmail ? activeTeacherEmail.split('@')[0] : '';
  const teacherName = rawTeacherName || emailFallback || 'Teacher User';

  const isPublic = resource.isPublic !== false;

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloading(true);
      const res = await api.post(`/resources/${resource._id}/download`);
      if (res.data.success) {
        setDownloadsCount(res.data.downloadsCount);
        window.open(getApiFileUrl(res.data.fileUrl), '_blank');
      }
    } catch (err) {
      console.error('Download error:', err);
      window.open(getApiFileUrl(resource.fileUrl), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'worksheet':
        return isLight
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50';
      case 'presentation':
        return isLight
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-amber-950/50 text-amber-300 border-amber-800/50';
      case 'exercise':
        return isLight
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-blue-950/50 text-blue-300 border-blue-800/50';
      case 'exam':
        return isLight
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-rose-950/50 text-rose-300 border-rose-800/50';
      case 'notes':
        return isLight
          ? 'bg-orange-50 text-orange-700 border-orange-200'
          : 'bg-orange-950/50 text-orange-300 border-orange-800/50';
      default:
        return isLight
          ? 'bg-slate-100 text-slate-700 border-slate-200'
          : 'bg-slate-800 text-slate-300 border-slate-700';
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

  const cardClassName =
    variant === 'compact'
      ? isLight
        ? 'bg-white/92 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 hover:border-slate-300 transition-all shadow-[0_14px_30px_-20px_rgba(15,23,42,0.18)] overflow-hidden'
        : 'bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800/90 hover:border-slate-700 transition-all shadow-lg hover:shadow-xl overflow-hidden'
      : isLight
        ? 'bg-white/92 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between relative group border border-slate-200/90 hover:border-slate-300 transition-all shadow-[0_18px_40px_-24px_rgba(15,23,42,0.2)] overflow-hidden'
        : 'bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between relative group border border-slate-800/90 hover:border-slate-700 transition-all shadow-lg hover:shadow-xl overflow-hidden';

  const visibilityBadgeClass = isLight
    ? isPublic
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'
    : isPublic
      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
      : 'bg-amber-950/40 text-amber-300 border-amber-800/50';

  const metaBadgeClass = isLight
    ? 'bg-slate-50 text-slate-600 border-slate-200'
    : 'bg-slate-800/90 text-slate-300 border-slate-700/70';

  const textPrimaryClass = isLight ? 'text-slate-900' : 'text-white';
  const textSecondaryClass = isLight ? 'text-slate-600' : 'text-slate-300';
  const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400';
  const borderTopClass = isLight ? 'border-slate-200/90' : 'border-slate-800/80';

  const bookmarkClass = bookmarked
    ? isLight
      ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm shadow-orange-500/10'
      : 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-500/20'
    : isLight
      ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200'
      : 'bg-slate-800/90 text-slate-400 border-slate-700/60 hover:text-orange-400 hover:border-slate-600';

  const compactBookmarkClass = bookmarked
    ? isLight
      ? 'bg-orange-50 text-orange-600 border-orange-200'
      : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
    : isLight
      ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200'
      : 'bg-slate-800/90 text-slate-400 border-slate-700/60 hover:text-orange-400 hover:border-slate-600';

  const actionSurfaceClass = isLight
    ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
    : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:border-slate-600';

  if (variant === 'compact') {
    return (
      <div className={cardClassName}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center flex-wrap gap-2 min-w-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getTypeBadgeColor(resource.type)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {resource.type}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium shrink-0 ${visibilityBadgeClass}`}>
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublic ? 'Public' : 'Private'}
              </span>

              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium ${metaBadgeClass}`}>
                {resource.subject}
              </span>

              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium ${metaBadgeClass}`}>
                {resource.grade}
              </span>
            </div>

            <button type="button" onClick={() => onPreview && onPreview(resource)} className="text-left w-full">
              <h3 className={`font-bold text-sm transition-colors line-clamp-1 cursor-pointer ${textPrimaryClass} ${isLight ? 'hover:text-orange-600' : 'hover:text-orange-400'}`}>
                {resource.title}
              </h3>
            </button>

            <p className={`text-[11px] line-clamp-2 leading-relaxed ${textSecondaryClass}`}>
              {resource.description || `Educational ${resource.type} focusing on ${resource.topic}.`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={bookmarking}
            title={bookmarked ? 'Remove from Saved Items' : 'Save to Bookmarks'}
            className={`w-9 h-9 rounded-full border transition-all shrink-0 inline-flex items-center justify-center ${compactBookmarkClass}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className={`mt-3 pt-3 border-t flex items-center justify-between gap-3 ${borderTopClass}`}>
          <div className="min-w-0">
            <div className={`flex items-center gap-1.5 text-[11px] truncate ${textSecondaryClass}`}>
              <User className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">
                @{teacherName}
                {isOwner && <span className="text-[10px] text-orange-500 font-mono font-bold"> (You)</span>}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-[10px] mt-1 ${textMutedClass}`}>
              <span>{formatFileSize(resource.fileSize)}</span>
              <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>•</span>
              <span>{formatDate(resource.createdAt) || 'Recently'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwner && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${actionSurfaceClass}`}
                title="Edit this resource"
              >
                <span className="w-3 h-3 rounded-full bg-orange-400/20 border border-orange-400/40 inline-flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                </span>
                <span>Edit</span>
              </button>
            )}

            {onPreview && (
              <button
                onClick={() => onPreview(resource)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${actionSurfaceClass}`}
              >
                <Eye className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>View</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide shrink-0 ${getTypeBadgeColor(resource.type)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {resource.type}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium shrink-0 ${visibilityBadgeClass}`}>
              {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isPublic ? 'Public' : 'Private'}
            </span>

            <span title={resource.subject} className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium max-w-[110px] truncate shrink-0 ${metaBadgeClass}`}>
              {resource.subject}
            </span>

            <span title={resource.grade} className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium max-w-[100px] truncate shrink-0 ${metaBadgeClass}`}>
              {resource.grade}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={bookmarking}
            title={bookmarked ? 'Remove from Saved Items' : 'Save to Bookmarks'}
            className={`w-10 h-10 rounded-full border transition-all shrink-0 inline-flex items-center justify-center ${bookmarkClass}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h3
          onClick={() => onPreview && onPreview(resource)}
          className={`font-bold text-base transition-colors line-clamp-1 mb-1.5 cursor-pointer flex items-center gap-1.5 ${textPrimaryClass} ${isLight ? 'hover:text-orange-600' : 'hover:text-orange-400'}`}
        >
          <span>{resource.title}</span>
        </h3>

        <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${textSecondaryClass}`}>
          {resource.description || `Educational ${resource.type} focusing on ${resource.topic}.`}
        </p>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {resource.tags.slice(0, 4).map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectTag) onSelectTag(tag);
                }}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border transition-all cursor-pointer ${isLight ? 'text-slate-600 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border-slate-200 hover:border-orange-200' : 'text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-orange-300 border-slate-700/60'}`}
                title={`Filter by tag #${tag}`}
              >
                <Tag className="w-2.5 h-2.5 text-orange-400" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className={`pt-3 border-t space-y-1.5 mb-4 ${borderTopClass}`}>
          <div className={`flex items-center justify-between text-xs ${textSecondaryClass}`}>
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">
                By <span className={`${isLight ? 'text-slate-900' : 'text-slate-100'} font-medium`}>@{teacherName}</span>{' '}
                {isOwner && <span className="text-[10px] text-orange-500 font-mono font-bold">(You)</span>}
              </span>
            </div>
            <span className={`text-[11px] font-mono font-medium ${textMutedClass}`}>
              {formatFileSize(resource.fileSize)}
            </span>
          </div>

          <div className={`flex items-center justify-between text-[11px] font-medium ${textMutedClass}`}>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Posted: {formatDate(resource.createdAt) || 'Recently'}</span>
            </div>
            {resource.publicId && resource.publicId.startsWith('local/') ? (
              <span className="text-[10px] font-mono">Local File</span>
            ) : (
              <span className="text-[10px] text-emerald-400/90 font-mono font-medium">Cloudinary</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onPreview && (
            <button
              onClick={() => onPreview(resource)}
              className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 ${actionSurfaceClass}`}
              title="View document preview without downloading"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>View</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-all min-w-0"
          >
            <Download className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">Download ({downloadsCount})</span>
          </button>

          {onAttach && (
            <button
              onClick={() => onAttach(resource)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 border ${isAttached ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60') : actionSurfaceClass}`}
            >
              {isAttached ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isAttached ? 'Attached' : 'Attach'}</span>
            </button>
          )}

          {isOwner && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 border ${isLight ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border-blue-800/50'}`}
              title="Edit resource"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-current opacity-70 inline-flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </span>
              <span>Edit</span>
            </button>
          )}

          {isOwner && onToggleVisibility && (
            <button
              onClick={() => onToggleVisibility(resource._id, isPublic)}
              title={isPublic ? 'Click to make Private (Only visible to you)' : 'Click to make Public (Shared in Hub)'}
              className={`w-10 h-10 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                isLight
                  ? isPublic
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : isPublic
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-800/40'
                    : 'bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border-amber-800/40'
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource._id);
              }}
              title="Delete resource"
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 border ${isLight ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/50'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
