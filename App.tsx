import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WorldBuilder from './pages/WorldBuilder';
import ARForge from './pages/ARForge';
import ErrorBoundary from './components/ErrorBoundary';

type Route = 'world-builder' | 'ar-forge';

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>('world-builder');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'ar-forge') {
        setRoute('ar-forge');
      } else {
        setRoute('world-builder');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (newRoute: Route) => {
    window.location.hash = `/${newRoute}`;
  };

  const handleLibraryClick = () => {
    document.dispatchEvent(new CustomEvent('open-library'));
  };

  const renderPage = () => {
    switch (route) {
      case 'ar-forge':
        return <ARForge />;
      case 'world-builder':
      default:
        return <WorldBuilder />;
    }
  };

  return (
    <div className="h-screen bg-brand-dark flex flex-col font-sans text-slate-200">
      <Header currentRoute={route} onNavigate={navigate} onLibraryClick={handleLibraryClick} />
      <main className="w-full flex-grow flex flex-col overflow-hidden">
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
