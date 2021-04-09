module.exports = {
  verbose: true,
  automock: false,
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  testPathIgnorePatterns: [
    "/node_modules/",
    "./__tests__/utils.js",
    "./__tests__/testSetupFile.js",
    "./__tests__/spy.js",
  ],
  reporters: ["jest-progress-bar-reporter"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/testSetupFile.js"],
};
