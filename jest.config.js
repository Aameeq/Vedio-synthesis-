/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle CSS imports (and other static assets)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Handle module aliases from importmap
    '^react$': '<rootDir>/node_modules/react/index.js',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
    '^@google/genai$': '<rootDir>/__mocks__/googleGenaiMock.js',
    '^three$': '<rootDir>/__mocks__/threeMock.js',
    '^three/(.*)$': '<rootDir>/__mocks__/threeMock.js',
    '^@mediapipe/tasks-vision$': '<rootDir>/__mocks__/mediaPipeMock.js',
    
    // Handle raw file imports used in componentSources.ts
    '\\?raw$': '<rootDir>/__mocks__/rawMock.js',

    // Handle path aliases
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  // Ignore transform for node_modules except for specific ES modules if needed
  transformIgnorePatterns: [
      "node_modules/(?!three/.*)"
  ],
};