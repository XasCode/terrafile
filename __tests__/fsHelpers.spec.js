const fsHelpers = require("../src/fsHelpers");
const path = require("path");
const spy = require("../__tests__/spy");

describe("checkIfDirExists checks for the existence of a directory", () => {
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

  test("should return false if not a valid path", () => {
    expect(fsHelpers.checkIfDirExists(-1)).toBe(false);
  });
});

describe("getAbsolutePathOfDir returns an absolute path from a provide relative or abs path", () => {
  beforeEach(() => {
    spy.beforeEach();
  });

  test("should return path relative to current direct if valid relative path", () => {
    expect(fsHelpers.getAbsolutePathOfDir("sOmEtHiNg/UnUsUaL")).toBe(
      path.resolve("./sOmEtHiNg/UnUsUaL")
    );
  });

  test("should return path if valid relative path", () => {
    expect(
      fsHelpers.getAbsolutePathOfDir(path.resolve(".", "sOmEtHiNg/UnUsUaL"))
    ).toBe(path.resolve("./sOmEtHiNg/UnUsUaL"));
  });

  test("should output error if invalid path", () => {
    const foo = fsHelpers.getAbsolutePathOfDir(-1);
    expect(console.error).toHaveBeenLastCalledWith(
      JSON.stringify(`Error resolving path: ${JSON.stringify(-1)}`)
    );
  });
});

describe("createDir should create a directory at the provided location", () => {
  beforeEach(() => {
    spy.beforeEach();
  });

  //TODO: Should test with absolute path

  //TODO: Should we make sure that we have a dir and not a file? like an isDir?

  //TODO: Do we want to ensure that we're working with an absolute path?
  test("should create a directory relative to current path", () => {
    fsHelpers.createDir("bar");
    expect(
      fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePathOfDir("bar"))
    ).toBe(true);
  });

  test("should raise error when attempting to create a directory with bad path", () => {
    fsHelpers.createDir(-1);
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePathOfDir(-1))).toBe(
      false
    );
  });
});

// TODO: review these
describe("abortDirCreation should delete dirs that were created", () => {
  beforeEach(() => {
    spy.beforeEach();
  });

  test("should clean up any dirs created", () => {
    fsHelpers.abortDirCreation(fsHelpers.getAbsolutePathOfDir("bar"));
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        fsHelpers.getAbsolutePathOfDir("bar")
      )}`
    );
  });

  test("should do nothing if no dirs to cleanup", () => {
    fsHelpers.abortDirCreation(
      fsHelpers.createDir(fsHelpers.getAbsolutePathOfDir(path.resolve(".")))
    );
    expect(console.error).not.toHaveBeenCalled();
  });
});
