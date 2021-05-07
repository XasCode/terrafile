const fs = require("fs-extra");

const terraFile = require("../dist/src/processFile");
const fsHelpers = require("../dist/src/fsHelpers");
const spy = require("./spy");

const testDirs = [
  "be_vendor_tfregistry_error",
  "be_vendor_empty",
  "be_vendor_live",
];
const cleanUpTestDirs = () =>
  testDirs.map((testDir) =>
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(testDir))
  );

describe("read file contents should read specified json file and validate its contents", () => {
  beforeEach(() => {
    cleanUpTestDirs();
    spy.beforeEach();
  });

  afterEach(() => {
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
      directory: "be_vendor_tfregistry_error/modules",
      file: configFile,
    });
  });

  test("should err on empty source", async () => {
    const configFile = "__tests__/tfRegistryEmptyError.json";
    const options = {
      directory: "be_vendor_empty/modules",
      file: configFile,
    };
    await expectFileIssue(options);
  });

  test("run live against teeraform registry", async () => {
    const configFile = "__tests__/tfRegistryLive.json";
    const options = {
      directory: "be_vendor_live/modules",
      file: configFile,
    };
    const retVals = await terraFile.readFileContents(options);
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(
      fs.readFileSync(
        fsHelpers.getAbsolutePath("__tests__/tfRegistryLive.json"),
        "utf-8"
      )
    );
    expect(Object.keys(testJson).length).toBe(1);
    for (const modName of Object.keys(testJson)) {
      expect(
        fsHelpers.checkIfFileExists(
          fsHelpers.getAbsolutePath(`${options.directory}/${modName}/main.tf`)
        )
      ).toBe(true);
    }
  });
});
