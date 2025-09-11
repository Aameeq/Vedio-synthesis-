import React from 'react';
import { SavedWorld } from '../types';

interface AssetLibraryProps {
  worlds: SavedWorld[];
  onLoad: (world: SavedWorld) => void;
  onDelete: (worldId: string) => void;
  onClose: () => void;
}

const WorldCard: React.FC<{ world: SavedWorld; onLoad: () => void; onDelete: () => void; }> = ({ world, onLoad, onDelete }) => (
  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
    <img src={world.imageData} alt={world.name} className="w-full h-32 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-brand-text truncate">{world.name}</h3>
      <p className="text-xs text-brand-text-secondary">{new Date(world.createdAt).toLocaleString()}</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onLoad}
          className="flex-1 px-3 py-1 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          Load
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const AssetLibrary: React.FC<AssetLibraryProps> = ({ worlds, onLoad, onDelete, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-dark w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Saved Worlds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto">
          {worlds.length === 0 ? (
            <p className="text-center text-brand-text-secondary">You haven't saved any worlds yet. Use the "Save World" button to start your collection.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {worlds.map(world => (
                <WorldCard
                  key={world.id}
                  world={world}
                  onLoad={() => onLoad(world)}
                  onDelete={() => onDelete(world.id)}
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
