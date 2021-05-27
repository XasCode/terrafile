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
};
