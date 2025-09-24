
// Fix: Use standard React default import to resolve JSX typing issues.
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
    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 relative ${
      isActive
        ? 'text-white'
        : 'text-slate-400 hover:text-white'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {label}
    {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-primary rounded-full"></span>}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onLibraryClick }) => {
  const isWorldBuilder = currentRoute === 'world-builder';

  return (
    <header className="w-full bg-brand-dark flex-shrink-0">
       <div className="w-full max-w-[90rem] mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
        <h1 className="text-2xl font-bold text-white tracking-tighter">
          Aameeq
        </h1>
        <nav className="flex items-center gap-2 bg-brand-dark-secondary p-1 rounded-lg">
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
             {onLibraryClick && (
                <button
                onClick={onLibraryClick}
                className="px-3 py-2 text-sm font-semibold rounded-md text-slate-400 hover:text-white transition-colors"
                aria-label="Open saved worlds library"
                >
                Library
                </button>
            )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
