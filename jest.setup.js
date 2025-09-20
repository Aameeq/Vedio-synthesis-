// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock browser APIs that are not available in JSDOM

// Mock for navigator.mediaDevices.getUserMedia
// This is used in ARForge.tsx to get camera access
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([{
        stop: jest.fn(),
      }]),
    }),
  },
  writable: true
});

// Mock for URL.createObjectURL and URL.revokeObjectURL
// These are used in ARForge.tsx when handling file uploads
global.URL.createObjectURL = jest.fn((blob) => `mock-object-url-for-${blob.name || 'file'}`);
global.URL.revokeObjectURL = jest.fn();

// Mock for window.matchMedia
// Often used by UI libraries for responsive design checks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
