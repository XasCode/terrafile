//const path = require("path");
const fs = require("fs-extra");

//const venDir = require("../src/venDir");
const terraFile = require("../src/processFile");
//jest.requireActual("../src/run");
//const terraFile = jest.requireActual("../src/processFile");
const fsHelpers = require("../src/fsHelpers");
const spy = require("./spy");
//  const jestConfig = require("../jest.config");

const testDirs = [
  "vendor",
  "vendor1",
  "vendor2",
  "vendor_lerror",
  "vendor_tfregistry_error",
  "vendor_empty",
];
const cleanUpTestDirs = () =>
  testDirs.map((testDir) =>
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(testDir))
  );

describe("read file contents should read specified json file and validate its contents", () => {
  beforeEach(() => {
    // cleans up any dirs created from previous tests
    cleanUpTestDirs();
    spy.beforeEach();
  });

  afterEach(() => {
    // cleans up any dirs create by the test
    cleanUpTestDirs();
  });

  // expected result when provide bad file path
  async function expectFileIssue(options) {
    const retVals = await terraFile.readFileContents(options);
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  }

  test("should err on bad terraform registry", async () => {
    const configFile = "__tests__/tfRegistryError.json";
    await expectFileIssue({
      directory: "vendor_tfregistry_error/modules",
      file: configFile,
    });
  });
  /* TODO:
  test("should err on empty source", async () => {
    const configFile = "__tests__/tfRegistryEmptyError.json";
    const options = {
      directory: "vendor_empty/modules",
      file: configFile,
    };
    await expectFileIssue(options);
  });
  */
});
