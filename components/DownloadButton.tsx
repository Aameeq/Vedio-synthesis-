import React from 'react';

interface DownloadButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isStereo: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick, isDisabled, isStereo }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-black bg-opacity-60 text-white font-bold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label="Download generated video"
  >
    {isStereo ? 'Download (Left Eye)' : 'Download Video'}
  </button>
);

export default DownloadButton;
