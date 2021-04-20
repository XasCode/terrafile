const path = require("path");

const venDir = require("../src/venDir");
const terraFile = require("../src/processFile");
const fsHelpers = require("../src/fsHelpers");
const spy = require("./spy");

/* createTargetDirectory({"directory": <path>, ...})
 * Args: Expects an object with the <path> to the "directory" that is needed
 * Returns: {success: bool, created: <abs path>|null, saved: <abs path>|null }
 *   {success: true,  created: null, saved:<path>/../.terrafile.save} if the directory already esists
 *   {success: true,  created: <absolute path to the dir closest to the root created>, saved: null} if created
 *   {success: false, created: <abs path of created>, saved: <abs path of saved>} if error
 *      + if error, created? delete created, saved: delete <path>, restore saved to <path>
 */
describe("createTargetDirectory should create a directory for vendor modules", () => {
  beforeEach(() => {
    // before each test clean up any dirs created in previous tests
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    // clean up any dirs created by the test
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
  });

  test("should create the target directory when provided a relative path", () => {
    const installDir = "vendor/modules";
    const retVals = venDir.createTargetDirectory({
      directory: installDir,
    });
    expect(
      fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(installDir))
    ).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(fsHelpers.getAbsolutePath("vendor"));
    expect(retVals.saved).toBe(null);
  });

  test("should create the target directory when provided an absolute path", () => {
    const installDir = fsHelpers.getAbsolutePath("vendor/modules");
    const retVals = venDir.createTargetDirectory({
      directory: installDir,
    });
    expect(fsHelpers.checkIfDirExists(installDir)).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(path.resolve(installDir, ".."));
    expect(retVals.saved).toBe(null);
  });

  test("should create the target directory and save <path> when directory already exists", () => {
    const installDir = "vendor/modules";
    const absInstallDir = fsHelpers.getAbsolutePath(installDir);
    fsHelpers.createDir(absInstallDir);
    const retVals = venDir.createTargetDirectory({
      directory: installDir,
    });
    expect(fsHelpers.checkIfDirExists(absInstallDir)).toBe(true);
    expect(
      fsHelpers.checkIfDirExists(
        path.resolve(absInstallDir, "..", ".terrafile.save")
      )
    ).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(absInstallDir);
    expect(retVals.saved).toBe(
      path.resolve(absInstallDir, "..", ".terrafile.save")
    );
  });

  // expected output when bad input provided to createTargetDirectory
  function expectDirIssue(options) {
    const retVals = venDir.createTargetDirectory(options);
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  }

  test("should not create the target directory when path is to a file", () => {
    const installDir = "vendor/modules";
    fsHelpers.createDir(fsHelpers.getAbsolutePath(installDir + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(installDir));
    expectDirIssue({ directory: installDir });
  });

  // try various bad inputs
  test.each([undefined, -1, {}, { directory: -1 }, { directory: "" }])(
    "should not create the target directory when provided a bad path %s",
    (badDirOption) => {
      expectDirIssue(badDirOption);
    }
  );
});

describe("read file contents should read specified json file and validate its contents", () => {
  beforeEach(() => {
    // cleans up any dirs created from previous tests
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    // cleans up any dirs create by the test
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
  });

  test("should successfully read a valid terrafile when provided a relative path", () => {
    const configFile = "terrafile.json.sample";
    const retVals = terraFile.readFileContents({
      directory: "vendor/modules",
      file: configFile,
    });
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    expect(
      fsHelpers.checkIfFileExists(
        fsHelpers.getAbsolutePath("vendor/modules/test-module/main.tf")
      )
    ).toBe(true);
  });

  test("should successfully read a valid terrafile when provided an absolute path", () => {
    const configFile = fsHelpers.getAbsolutePath("terrafile.json.sample");
    const retVals = terraFile.readFileContents({
      directory: "vendor/modules",
      file: configFile,
    });
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
  });

  // expected result when provide bad file path
  function expectFileIssue(options) {
    const retVals = terraFile.readFileContents(options);
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  }

  test("should err on lack read access to file", () => {
    const configFile = "vendor/no_access_file";
    fsHelpers.createDir(fsHelpers.getAbsolutePath(configFile + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(configFile), 0);
    expectFileIssue({ file: configFile });
  });

  // test various bad paths and files
  test.each([
    undefined,
    -1,
    {},
    { file: -1 },
    { file: "" },
    { file: fsHelpers.getAbsolutePath(".") },
    { file: "does_not_exist" },
    { file: "__tests__/invalid.txt" },
    { file: "__tests__/invalid.json" },
    { file: "__tests__/invalid2.json" },
  ])("should err when bad file provided: %s", (badFileOption) => {
    expectFileIssue(badFileOption);
  });
});
