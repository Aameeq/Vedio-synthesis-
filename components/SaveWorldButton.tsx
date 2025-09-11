import React from 'react';

interface SaveWorldButtonProps {
    onClick: () => void;
    isDisabled: boolean;
}

const SaveWorldButton: React.FC<SaveWorldButtonProps> = ({ onClick, isDisabled }) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-black bg-opacity-60 text-white font-bold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50"
        aria-label="Save current world"
    >
        Save World
    </button>
);

export default SaveWorldButton;
