


export const KnotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L12 22M2 12L22 12" className="opacity-0" />
    <path d="M12 2C13.5 4 15 5 17 5C19.5 5 21 7 21 9C21 11.5 19 13 17 13H7C5 13 3 11.5 3 9C3 7 4.5 5 7 5C9 5 10.5 4 12 2Z" stroke="currentColor" fill="none" />
    <path d="M12 22C10.5 20 9 19 7 19C4.5 19 3 17 3 15C3 12.5 5 11 7 11H17C19 11 21 12.5 21 15C21 17 19.5 19 17 19C15 19 13.5 20 12 22Z" stroke="currentColor" fill="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" className="text-cinnabar" />
  </svg>
);

export const CloudPattern = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 20" className={className} preserveAspectRatio="none">
    <path d="M0 20 C 10 10, 20 10, 30 20 C 40 10, 50 10, 60 20 C 70 10, 80 10, 90 20 L 100 20 L 100 25 L 0 25 Z" fill="currentColor" />
  </svg>
);

export const LatticeBorder = () => (
  <div className="absolute inset-0 pointer-events-none border-[8px] border-double border-wood-border/30 rounded-lg">
    <div className="absolute top-0 left-0 w-8 h-8 border-r border-b border-wood-border/30 bg-antique-paper"></div>
    <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-wood-border/30 bg-antique-paper"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 border-r border-t border-wood-border/30 bg-antique-paper"></div>
    <div className="absolute bottom-0 right-0 w-8 h-8 border-l border-t border-wood-border/30 bg-antique-paper"></div>
  </div>
);

export const PlumFlower = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2 C13 5 15 6 18 6 C15 8 15 10 16 12 C13 11 12 13 12 16 C12 13 11 11 8 12 C9 10 9 8 6 6 C9 6 11 5 12 2 Z" />
    <circle cx="12" cy="10" r="1.5" className="text-yellow-600" />
  </svg>
);

export const BrushIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export const SealIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" />
    <path d="M8 8h8v8H8z" fill="currentColor" className="opacity-20" />
    <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  </svg>
);

export const LibraryIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CloseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const PPTIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M7 8h10M7 12h6" strokeOpacity="0.5" />
  </svg>
);

export const FolderIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const UploadIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const ExamIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export const TargetIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const BookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const PhotoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);