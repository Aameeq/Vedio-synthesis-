import React from 'react';

type Route = 'world-builder' | 'ar-forge';

interface HeaderProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  onLibraryClick?: () => void;
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 transform ${
      isActive
        ? 'bg-brand-primary text-white scale-105 shadow-lg'
        : 'bg-gray-700 text-brand-text-secondary hover:bg-gray-600 hover:-translate-y-px'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onLibraryClick }) => {
  const isWorldBuilder = currentRoute === 'world-builder';

  return (
    <header className="w-full max-w-7xl mb-6 text-left flex flex-col items-center">
       <div className="w-full flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-brand-text tracking-tight">
          AI Creative Suite
        </h1>
        <div className="flex items-center gap-2">
            <NavLink
            label="World Builder"
            isActive={isWorldBuilder}
            onClick={() => onNavigate('world-builder')}
            />
            <NavLink
            label="AR Filter Forge"
            isActive={!isWorldBuilder}
            onClick={() => onNavigate('ar-forge')}
            />
             {isWorldBuilder && onLibraryClick && (
                <button
                onClick={onLibraryClick}
                className="px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-all transform hover:-translate-y-px"
                aria-label="Open saved worlds library"
                >
                Library
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;