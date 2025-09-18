import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WorldBuilder from './pages/WorldBuilder';
import ARForge from './pages/ARForge';

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

    // Set initial route
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
    // This event is listened to by WorldBuilder.tsx to open the modal
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
    <div className="min-h-screen bg-brand-dark flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <Header currentRoute={route} onNavigate={navigate} onLibraryClick={handleLibraryClick} />
      {renderPage()}
    </div>
  );
};

export default App;
