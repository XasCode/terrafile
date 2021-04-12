const fs = require("fs");
const path = require("path");
const { hasUncaughtExceptionCaptureCallback } = require("process");

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
    fsHelpers.rimrafDir(path.resolve(".", "vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "vendor"));
  });

  test("should create the target directory when provided relative path", () => {
    const installDir = "vendor/modules";
    const retVals = backend.createTargetDirectory({
      directory: installDir,
    });
    expect(
      fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePathOfDir(installDir))
    ).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(fsHelpers.getAbsolutePathOfDir("vendor"));
    expect(retVals.saved).toBe(null);
  });

  test("should create the target directory when provided absolute path", () => {
    const installDir = path.resolve(".", "vendor/modules");
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
    const absInstallDir = fsHelpers.getAbsolutePathOfDir(installDir);
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
    fsHelpers.createDir(fsHelpers.getAbsolutePathOfDir(installDir + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePathOfDir(installDir));
    const retVals = backend.createTargetDirectory({ directory: installDir });
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  });
});
