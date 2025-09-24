// Fix: Change React import to namespace import to resolve JSX typing issues.
import * as React from 'react';
import { SavedWorld } from '../types';

interface AssetLibraryProps {
  worlds: SavedWorld[];
  onLoad: (world: SavedWorld) => void;
  onDelete: (worldId: string) => void;
  onClose: () => void;
  onAddToStoryboard?: (world: SavedWorld) => void;
}

const WorldCard: React.FC<{ 
    world: SavedWorld; 
    onLoad: () => void; 
    onDelete: () => void;
    onAddToStoryboard?: () => void;
}> = ({ world, onLoad, onDelete, onAddToStoryboard }) => (
  <div className="bg-brand-dark-tertiary rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 group border border-slate-700/50">
    <div className="relative">
      <img src={world.imageData} alt={world.name} className="w-full h-32 object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
            onClick={onLoad}
            className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
            Load
        </button>
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-bold text-slate-200 truncate text-sm">{world.name}</h3>
      <p className="text-xs text-slate-400">{new Date(world.createdAt).toLocaleString()}</p>
      <div className="mt-3 flex gap-2">
        {onAddToStoryboard && (
             <button
                onClick={onAddToStoryboard}
                className="flex-1 px-3 py-1 bg-green-700 text-white text-xs font-semibold rounded-md hover:bg-green-600"
            >
                + Storyboard
            </button>
        )}
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-md hover:bg-red-600 hover:text-white"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const AssetLibrary: React.FC<AssetLibraryProps> = ({ worlds, onLoad, onDelete, onClose, onAddToStoryboard }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-brand-dark-secondary w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col border border-slate-700 animate-fadeInScaleUp" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold">My Saved Worlds</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl" aria-label="Close library">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto">
          {worlds.length === 0 ? (
            <p className="text-center text-slate-400 py-12">You haven't saved any worlds yet. Use the save icon to start your collection.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {worlds.map(world => (
                <WorldCard
                  key={world.id}
                  world={world}
                  onLoad={() => onLoad(world)}
                  onDelete={() => onDelete(world.id)}
                  onAddToStoryboard={onAddToStoryboard ? () => onAddToStoryboard(world) : undefined}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AssetLibrary;
