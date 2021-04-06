module.exports = {
  verbose: true,
  automock: false,
  reporters: [["jest-simple-dot-reporter", { color: true }]],
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  testPathIgnorePatterns: ["/node_modules/", "./__tests__/utils.js"],
};
