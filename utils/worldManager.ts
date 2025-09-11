import { SavedWorld } from '../types';

const WORLDS_STORAGE_KEY = 'ai-steerable-video-worlds';

export const getSavedWorlds = (): SavedWorld[] => {
  try {
    const worldsJson = localStorage.getItem(WORLDS_STORAGE_KEY);
    if (worldsJson) {
      const worlds = JSON.parse(worldsJson) as SavedWorld[];
      // Sort by newest first
      return worlds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (error) {
    console.error("Failed to parse saved worlds from localStorage", error);
    return [];
  }
  return [];
};

export const saveWorld = (worldToSave: SavedWorld): void => {
  const worlds = getSavedWorlds();
  const existingIndex = worlds.findIndex(world => world.id === worldToSave.id);

  if (existingIndex > -1) {
    worlds[existingIndex] = worldToSave;
  } else {
    worlds.unshift(worldToSave); // Add to the beginning
  }

  try {
    localStorage.setItem(WORLDS_STORAGE_KEY, JSON.stringify(worlds));
  } catch (error) {
    console.error("Failed to save world to localStorage", error);
  }
};

export const deleteWorld = (worldId: string): void => {
  let worlds = getSavedWorlds();
  worlds = worlds.filter(world => world.id !== worldId);

  try {
    localStorage.setItem(WORLDS_STORAGE_KEY, JSON.stringify(worlds));
  } catch (error) {
    console.error("Failed to delete world from localStorage", error);
  }
};
