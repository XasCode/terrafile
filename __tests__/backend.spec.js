const fs = require("fs");
const path = require("path");

const backend = require("../src/backend");
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
describe("create the target directory", () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
  });

  test("should create the target directory when provided relative path", () => {
    const installDir = "vendor/modules";
    const retVals = backend.createTargetDirectory({
      directory: installDir,
    });
    expect(
      fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(installDir))
    ).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(fsHelpers.getAbsolutePath("vendor"));
    expect(retVals.saved).toBe(null);
  });

  test("should create the target directory when provided absolute path", () => {
    const installDir = fsHelpers.getAbsolutePath("vendor/modules");
    const retVals = backend.createTargetDirectory({
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
    const retVals = backend.createTargetDirectory({
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

  test("should error if no directory provided", () => {
    const retVals = backend.createTargetDirectory({});
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  });

  test("should error if no directory provided", () => {
    const retVals = backend.createTargetDirectory();
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  });

  test("should error if directory provided is empty string", () => {
    const retVals = backend.createTargetDirectory({ directory: "" });
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  });

  test("should error if directory provided is a file", () => {
    const installDir = "vendor/modules";
    fsHelpers.createDir(fsHelpers.getAbsolutePath(installDir + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(installDir));
    const retVals = backend.createTargetDirectory({ directory: installDir });
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  });
});

describe("reads specified terrafile", () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath("vendor"));
  });

  test("should read in the terrafile (JSON) specified in {options: <file>} w/ relative path", () => {
    const configFile = "terrafile.json.sample";
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
  });

  test("should read in the terrafile (JSON) specified in {options: <file>} w/ abs path", () => {
    const configFile = fsHelpers.getAbsolutePath("terrafile.json.sample");
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
  });

  test("should err on no options", () => {
    const retVals = backend.readFileContents();
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on bad file path", () => {
    const retVals = backend.readFileContents({ file: -1 });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on empty file path", () => {
    const retVals = backend.readFileContents({ file: "" });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on no file path", () => {
    const retVals = backend.readFileContents({});
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on file is not a file", () => {
    const configFile = fsHelpers.getAbsolutePath(".");
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on file not found", () => {
    const configFile = "does_not_exist";
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on lack read access to file", () => {
    const configFile = "vendor/no_access_file";
    fsHelpers.createDir(fsHelpers.getAbsolutePath(configFile + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(configFile), 0o0);
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on file is not valid json", () => {
    const configFile = "./__tests__/invalid.txt";
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on json contents not as expected - no source", () => {
    const configFile = "./__tests__/invalid.json";
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });

  test("should err on json contents not as expected - bad key", () => {
    const configFile = "__tests__/invalid2.json";
    const retVals = backend.readFileContents({ file: configFile });
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  });
});
