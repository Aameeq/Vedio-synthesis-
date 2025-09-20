import React from 'react';

interface SaveWorldButtonProps {
    onClick: () => void;
    isDisabled: boolean;
}

const SaveWorldButton: React.FC<SaveWorldButtonProps> = ({ onClick, isDisabled }) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className="relative group flex items-center justify-center p-3 bg-black/50 text-slate-300 rounded-full transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-brand-primary/80 hover:enabled:text-white"
        aria-label="Save current world"
        title="Save current world"
    >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
    </button>
);

export default SaveWorldButton;