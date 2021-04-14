const fsHelpers = require("../src/fsHelpers");
const path = require("path");
const spy = require("../__tests__/spy");
const fs = require("fs");

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

describe("getAbsolutePath returns an absolute path from relative or abs path", () => {
  beforeEach(() => {
    spy.beforeEach();
  });

  test("should return path relative to current direct if valid relative path", () => {
    expect(fsHelpers.getAbsolutePath("sOmEtHiNg/UnUsUaL")).toBe(
      path.resolve("./sOmEtHiNg/UnUsUaL")
    );
  });

  test("should return path if valid relative path", () => {
    expect(
      fsHelpers.getAbsolutePath(path.resolve(".", "sOmEtHiNg/UnUsUaL"))
    ).toBe(path.resolve("./sOmEtHiNg/UnUsUaL"));
  });

  test("should output error if invalid path", () => {
    const absPathOfDir = fsHelpers.getAbsolutePath(-1);
    expect(console.error).toHaveBeenLastCalledWith(
      `Error resolving path: ${-1}`
    );
  });
});

describe("createDir should create a directory at the provided location", () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "bar"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "bar"));
  });

  test("should create a directory if provided an absolute path", () => {
    const createdDirsStartingLocation = fsHelpers.createDir(
      path.resolve(".", "bar")
    );
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath("bar"))).toBe(
      true
    );
    expect(createdDirsStartingLocation).toBe(path.resolve(".", "bar"));
  });

  test("should raise error if provided a path to a file", () => {
    const createdDirsStartingLocation = fsHelpers.createDir(
      path.resolve(".", "LICENSE")
    );
    expect(createdDirsStartingLocation).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(
      `Error creating dir: ${path.resolve(".", "LICENSE")}`
    );
    expect(console.log).not.toHaveBeenCalled();
  });

  test("should raise error if provided a relative path", () => {
    const createdDirsStartingLocation = fsHelpers.createDir("bar");
    expect(console.error).toHaveBeenLastCalledWith(
      `Error creating dir: ${"bar"}`
    );
    expect(createdDirsStartingLocation).toBe(undefined);
  });

  test("should raise error when attempting to create a directory with bad path", () => {
    const createdDirsStartingLocation = fsHelpers.createDir(-1);
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(-1))).toBe(
      false
    );
    expect(createdDirsStartingLocation).toBe(undefined);
  });
});

describe("rimrafDir should delete a dir and its contents", () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "vendor"));
  });

  test("should delete a directory that exists", () => {
    fsHelpers.createDir(path.resolve(".", "vendor/modules"));
    const deletedDir = fsHelpers.rimrafDir(path.resolve(".", "vendor"));
    expect(deletedDir).toBe(path.resolve(".", "vendor"));
    expect(console.error).not.toHaveBeenCalled();
    expect(fsHelpers.checkIfDirExists("vendor")).toBe(false);
  });

  test("should error when attempting to delete a directory that doesn't exist", () => {
    const deletedDir = fsHelpers.rimrafDir(path.resolve(".", "sOmEtHiNg"));
    expect(deletedDir).toBe(undefined);
    expect(console.error).not.toHaveBeenLastCalledWith(
      `Error deleting dir: ${"sOmEtHiNg"}`
    );
    expect(fsHelpers.checkIfDirExists("sOmEtHiNg")).toBe(false);
  });

  test("should error when attempting to delete a directory with bad path", () => {
    const deletedDir = fsHelpers.rimrafDir(-1);
    expect(deletedDir).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error deleting dir: ${-1}`);
  });

  test("should error when attempting to delete a directory that is not a dir", () => {
    const deletedDir = fsHelpers.rimrafDir(path.resolve(".", "LICENSE"));
    expect(deletedDir).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(
      `Error deleting dir: ${path.resolve(".", "LICENSE")}`
    );
    expect(
      fs.existsSync(path.resolve(".", "LICENSE")) &&
        !fs.lstatSync(path.resolve(".", "LICENSE")).isDirectory()
    ).toBe(true);
  });
});

describe("abortDirCreation should delete dirs that were created", () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "bar"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "bar"));
  });

  test("should clean up any dirs created", () => {
    const dirToDelete = fsHelpers.createDir(fsHelpers.getAbsolutePath("bar"));
    fsHelpers.abortDirCreation(dirToDelete);
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        fsHelpers.getAbsolutePath("bar")
      )}`
    );
  });

  test("should do nothing if no dirs to cleanup", () => {
    fsHelpers.abortDirCreation(null);
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, no directory to clean up.`
    );
  });
});

describe("rename", () => {
  test("should err on invalid dirs", () => {
    fsHelpers.renameDir(-1, -2);
    expect(console.error).toHaveBeenLastCalledWith("ERR_INVALID_ARG_TYPE");
  });
});
