import React from 'react';

interface DownloadButtonProps {
  videoUrl: string | null;
  isDisabled: boolean;
  isStereo: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ videoUrl, isDisabled, isStereo }) => {
    const handleDownload = () => {
        if (!videoUrl) return;
        const link = document.createElement('a');
        link.href = videoUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = isStereo ? `aameeq-video-left-eye-${timestamp}.mp4` : `aameeq-video-${timestamp}.mp4`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
      <button
        onClick={handleDownload}
        disabled={isDisabled}
        className="relative group flex items-center justify-center p-3 bg-black/50 text-slate-300 rounded-full transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-brand-primary/80 hover:enabled:text-white"
        aria-label={isStereo ? 'Download (Left Eye)' : 'Download Video'}
        title={isStereo ? 'Download (Left Eye)' : 'Download Video'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      </button>
    );
}

export default DownloadButton;