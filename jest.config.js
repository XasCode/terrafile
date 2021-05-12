module.exports = {
  verbose: true,
  automock: false,
  coverageDirectory: './coverage/',
  collectCoverage: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    './__tests__/utils.ts',
    './__tests__/testSetupFile.ts',
    './__tests__/spy.ts',
  ],
  reporters: ['jest-progress-bar-reporter'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/testSetupFile.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
};
