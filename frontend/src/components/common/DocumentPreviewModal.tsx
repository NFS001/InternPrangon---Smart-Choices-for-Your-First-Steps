import React, { useEffect, useState } from "react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentTitle?: string;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  documentUrl,
  documentTitle = "Nafis_Uddin_Chowdhury_Resume.pdf",
}: DocumentPreviewModalProps) {
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIframeError(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentTitle;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Toolbar */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            {/* Red PDF Icon Container */}
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity="0.4" />
                <path d="M14 2v6h6" />
                <path d="M9 13h6M9 17h3" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="document-preview-title"
                  className="font-bold text-slate-900 text-sm sm:text-base truncate"
                  title={documentTitle}
                >
                  {documentTitle}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>🟢</span>
                  <span>Verified PDF</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Encrypted Document Vault · 1-Click Apply Ready
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Open in New Tab Fallback */}
            <button
              onClick={handleOpenExternal}
              title="Open in new browser tab"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <span>External</span>
              <span>↗</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download PDF</span>
            </button>

            {/* ✕ Close Button */}
            <button
              onClick={onClose}
              aria-label="Close document preview"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className="text-lg leading-none font-bold">✕</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Embedded PDF Viewer */}
        <div className="p-4 sm:p-5 flex-1 overflow-auto bg-slate-100/60 flex flex-col items-center justify-center">
          {iframeError ? (
            <div className="p-8 text-center max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl">
                ⚠️
              </div>
              <h3 className="font-bold text-slate-900 text-base">In-App Preview Blocked</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your browser security settings or platform headers prevented embedded PDF rendering. You can view or download the file directly:
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleOpenExternal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Open in New Tab ↗
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full relative">
              <iframe
                src={documentUrl}
                className="w-full h-[75vh] rounded-xl border border-slate-200 bg-white shadow-inner"
                title="Resume Preview"
                onError={() => {
                  setIframeError(true);
                  handleOpenExternal();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
