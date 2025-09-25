// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

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

// Mock for HTMLCanvasElement.getContext
// This is used in VideoDisplay.tsx for WebXR UI
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    strokeRect: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn(),
  })),
  writable: true,
});
