const fsHelpers = require("../src/fsHelpers");
const path = require("path");
const spy = require("../__tests__/spy");

// test randomization of array order
describe("unit tests of fsHelpers functions", () => {
  beforeEach(() => {
    spy.beforeEach();
  });

  test("should return true if directory exists", () => {
    expect(fsHelpers.checkIfDirExists(path.resolve("."))).toBe(true);
  });

  test("should return false if directory doesn't exist", () => {
    expect(
      fsHelpers.checkIfDirExists(path.resolve("./SoMeThInG/uNuSuAl"))
    ).toBe(false);
  });

  test("should return path relative to current direct if valid relative path", () => {
    expect(fsHelpers.getDirToCreate("sOmEtHiNg/UnUsUaL")).toBe(
      path.resolve("./sOmEtHiNg/UnUsUaL")
    );
  });

  test("should return path if valid relative path", () => {
    expect(
      fsHelpers.getDirToCreate(path.resolve(".", "sOmEtHiNg/UnUsUaL"))
    ).toBe(path.resolve("./sOmEtHiNg/UnUsUaL"));
  });

  test("should output error if invalid path", () => {
    const foo = fsHelpers.getDirToCreate(-1);
    expect(console.error).toHaveBeenLastCalledWith(
      JSON.stringify(`Error resolving path: ${JSON.stringify(-1)}`)
    );
  });

  test("should create a directory relative to current path", () => {
    fsHelpers.createDir("bar");
    expect(fsHelpers.checkIfDirExists(fsHelpers.getDirToCreate("bar"))).toBe(
      true
    );
  });

  test("should raise error when attempting to create a directory with bad path", () => {
    fsHelpers.createDir("<abc");
    expect(fsHelpers.checkIfDirExists(fsHelpers.getDirToCreate("<abc"))).toBe(
      false
    );
  });

  test("should clean up any dirs created", () => {
    fsHelpers.abortDirCreation(fsHelpers.getDirToCreate("bar"));
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        fsHelpers.getDirToCreate("bar")
      )}`
    );
  });

  test("should do nothing if no dirs to cleanup", () => {
    fsHelpers.abortDirCreation(
      fsHelpers.createDir(fsHelpers.getDirToCreate(path.resolve(".")))
    );
    expect(console.error).not.toHaveBeenCalled();
  });
});
