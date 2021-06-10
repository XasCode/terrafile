import {
  rimrafDir,
  getAbsolutePath,
  createDir,
  touchFile,
  checkIfDirExists,
  checkIfFileExists,
} from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import { restoreDirectory } from 'src/backend/restore';
import { getSaveLocation, createTargetDirectory } from 'src/backend/venDir';

const testDirs = [`restore`, `restore2`];

const cleanUpTestDirs = () =>
  testDirs.map((testDir) => {
    rimrafDir(getAbsolutePath(testDir));
    getSaveLocation(testDir);
  });

describe(`unit test restoreDirectory`, () => {
  beforeEach(() => {
    cleanUpTestDirs();
  });

  afterEach(() => {
    cleanUpTestDirs();
  });

  test(`should restore saved directory`, () => {
    const installDir = `restore/modules`;
    // create a directory at install location
    createDir(getAbsolutePath(installDir));
    // touch file in the install location
    touchFile(getAbsolutePath(`${installDir}/main.tf`));
    // create install location
    createTargetDirectory({ directory: installDir });
    // expect directory at install location
    const saveLocation = getSaveLocation(installDir);
    expect(checkIfDirExists(saveLocation)).toBe(true);
    // expect file at save location
    expect(checkIfFileExists(`${getAbsolutePath(saveLocation)}/main.tf`)).toBe(true);
    // expect file not to be at install location
    expect(checkIfFileExists(`${getAbsolutePath(installDir)}/main.tf`)).toBe(false);
    // restore install location
    restoreDirectory(installDir);
    // expect file at isntall directory
    expect(checkIfFileExists(`${getAbsolutePath(installDir)}/main.tf`)).toBe(true);
    // expect save location to be not found
    expect(checkIfDirExists(saveLocation)).toBe(false);
  });

  test(`should err if attempting to restore non-saved file`, () => {
    const installDir = `restore2/modules`;
    // create install location
    createTargetDirectory({ directory: installDir });
    // restore install location
    const { success } = restoreDirectory(installDir);
    // expect file at isntall directory
    expect(success).toBe(false);
  });
});
