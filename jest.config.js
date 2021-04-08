module.exports = {
  verbose: true,
  automock: false,
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  testPathIgnorePatterns: ["/node_modules/", "./__tests__/utils.js"],
  reporters: ["jest-progress-bar-reporter"],
};
