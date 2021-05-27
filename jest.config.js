module.exports = {
  verbose: true,
  automock: false,
  coverageDirectory: '<rootDir>/coverage/',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/testUtils/'],
  // reporters: ['jest-progress-bar-reporter'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/testUtils/testSetupFile.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1",
    "__tests__/(.*)": "<rootDir>/__tests__/$1",
    "__mocks__/(.*)": "<rootDir>/__mocks__/$1",
    "^/(.*)": "<rootDir>/$1"
  },
};
