//const fsHelpers = require("../dist/fsHelpers");
//const restore = require("../dist/restore");
//const venDir = require("../dist/venDir");
//import * as fsHelpers from "../dist/fsHelpers";
//import * as restore from "../dist/restore";
//import * as venDir from "../dist/venDir";
const fsHelpers = require("../dist/fsHelpers");
const restore = require("../dist/restore");
const venDir = require("../dist/venDir");

const testDirs = ["restore", "restore2"];

const cleanUpTestDirs = () =>
  testDirs.map((testDir) => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(testDir));
    venDir.getSaveLocation(testDir);
  });

describe("unit test restoreDirectory", () => {
  beforeEach(() => {
    cleanUpTestDirs();
    //spy.beforeEach();
  });

  afterEach(() => {
    cleanUpTestDirs();
  });

  test("should restore saved directory", () => {
    const installDir = "restore/modules";
    //create a directory at install location
    fsHelpers.createDir(fsHelpers.getAbsolutePath(installDir));
    //touch file in the install location
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(installDir + "/main.tf"));
    //create install location
    venDir.createTargetDirectory({ directory: installDir });
    //expect directory at install location
    const saveLocation = venDir.getSaveLocation(installDir);
    expect(fsHelpers.checkIfDirExists(saveLocation)).toBe(true);
    //expect file at save location
    expect(
      fsHelpers.checkIfFileExists(
        fsHelpers.getAbsolutePath(saveLocation) + "/main.tf"
      )
    ).toBe(true);
    //expect file not to be at install location
    expect(
      fsHelpers.checkIfFileExists(
        fsHelpers.getAbsolutePath(installDir) + "/main.tf"
      )
    ).toBe(false);
    //restore install location
    restore.restoreDirectory(installDir);
    //expect file at isntall directory
    expect(
      fsHelpers.checkIfFileExists(
        fsHelpers.getAbsolutePath(installDir) + "/main.tf"
      )
    ).toBe(true);
    //expect save location to be not found
    expect(fsHelpers.checkIfDirExists(saveLocation)).toBe(false);
  });

  test("should err if attempting to restore non-saved file", () => {
    const installDir = "restore2/modules";
    //create install location
    venDir.createTargetDirectory({ directory: installDir });
    //restore install location
    const { success } = restore.restoreDirectory(installDir);
    //expect file at isntall directory
    expect(success).toBe(false);
  });
});
