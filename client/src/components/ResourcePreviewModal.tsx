import React, { useState } from 'react';
import type { Resource } from '../types/index.js';
import { X, Download, ExternalLink, FileText, User, Calendar, Globe, Lock, AlertTriangle, Eye } from 'lucide-react';

interface ResourcePreviewModalProps {
  resource: Resource | null;
  onClose: () => void;
  onDownload: (resource: Resource) => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  resource,
  onClose,
  onDownload,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  if (!resource) return null;

  const fileUrl = resource.fileUrl;
  const isImage = resource.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl);
  const isPdf = resource.fileType === 'application/pdf' || /\.pdf$/i.test(fileUrl);

  const teacherName =
    typeof resource.teacherId === 'object' && resource.teacherId?.name
      ? resource.teacherId.name
      : 'Teacher User';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const isLocalHost = fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1');

  // Determine viewer embed URL
  let embedUrl = fileUrl;
  if (useGoogleViewer || (!isImage && !isPdf && !isLocalHost && fileUrl.startsWith('http'))) {
    embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl border border-slate-700/80 w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold capitalize">
                {resource.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {resource.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {resource.grade}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700 text-[11px] flex items-center gap-1">
                {resource.isPublic !== false ? (
                  <>
                    <Globe className="w-3 h-3 text-emerald-400" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-400" /> Private
                  </>
                )}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{resource.title}</h2>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <User className="w-3.5 h-3.5 text-orange-400" /> {teacherName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Posted: {formatDate(resource.createdAt) || 'Recently'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950 flex flex-col justify-center items-center relative min-h-[400px]">
          {loadError ? (
            <div className="text-center p-6 sm:p-8 max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Direct Preview Unavailable</h3>
              <p className="text-xs text-slate-400">
                This document cannot be rendered inline by the browser. You can open it directly or download it.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  onClick={() => onDownload(resource)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          ) : isImage ? (
            <div className="w-full flex items-center justify-center">
              <img
                src={fileUrl}
                alt={resource.title}
                onError={() => setLoadError(true)}
                className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-xl border border-slate-800"
              />
            </div>
          ) : (
            <div className="w-full h-full min-h-[60vh] relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 flex flex-col">
              {!isLocalHost && !useGoogleViewer && (
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                  <span>Standard Document View</span>
                  <button
                    onClick={() => setUseGoogleViewer(true)}
                    className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Try Google Docs Viewer</span>
                  </button>
                </div>
              )}
              <iframe
                src={embedUrl}
                title={resource.title}
                onError={() => setLoadError(true)}
                className="w-full flex-1 min-h-[55vh] border-0 rounded-b-2xl bg-slate-950"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="truncate max-w-xs">{resource.topic}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </a>

            <button
              onClick={() => onDownload(resource)}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-orange-600/20 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
