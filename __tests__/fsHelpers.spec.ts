import path from 'path';
import fs from 'fs-extra';
import fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import { spy } from '__tests__/testUtils';

describe(`checkIfDirExists checks for the existence of a directory`, () => {
  beforeEach(() => {
    spy.clear();
  });

  test(`should return true if directory exists`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`.`)).value).toBe(true);
  });

  test(`should return false if directory doesn't exist`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`./SoMeThInG/uNuSuAl`)).value).toBe(false);
  });
});

describe(`getAbsolutePath returns an absolute path from relative or abs path`, () => {
  beforeEach(() => {
    spy.clear();
  });

  test(`should return path relative to current direct if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(`sOmEtHiNg/UnUsUaL`).value).toBe(path.resolve(`./sOmEtHiNg/UnUsUaL`));
  });

  test(`should return path if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(path.resolve(`.`, `sOmEtHiNg/UnUsUaL`)).value).toBe(
      path.resolve(`./sOmEtHiNg/UnUsUaL`),
    );
  });
});

describe(`createDir should create a directory at the provided location`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
  });

  test(`should create a directory if provided an absolute path`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`).value);
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(`bar`).value).value).toBe(true);
    expect(createdDirsStartingLocation).toBe(path.resolve(`.`, `bar`));
  });

  test(`should raise error if provided a path to a file`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`LICENSE`).value);
    expect(createdDirsStartingLocation).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error creating dir: ${fsHelpers.getAbsolutePath(`LICENSE`).value}`);
    expect(console.log).not.toHaveBeenCalled();
  });

  test(`should raise error if provided a relative path`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(`bar`);
    expect(console.error).toHaveBeenLastCalledWith(`Error creating dir: ${`bar`}`);
    expect(createdDirsStartingLocation).toBe(undefined);
  });
});

describe(`rimrafDir should delete a dir and its contents`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
  });

  test(`should delete a directory that exists`, () => {
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`vendor/modules`).value);
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
    expect(deletedDir).toBe(fsHelpers.getAbsolutePath(`vendor`).value);
    expect(console.error).not.toHaveBeenCalled();
    expect(fsHelpers.checkIfDirExists(`vendor`).value).toBe(false);
  });

  test(`should error when attempting to delete a directory that doesn't exist`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`sOmEtHiNg`).value);
    expect(deletedDir).toBe(undefined);
    expect(console.error).not.toHaveBeenLastCalledWith(`Error deleting dir: ${`sOmEtHiNg`}`);
    expect(fsHelpers.checkIfDirExists(`sOmEtHiNg`).value).toBe(false);
  });

  test(`should error when attempting to delete a directory that is not a dir`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`LICENSE`).value);
    expect(deletedDir).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error deleting dir: ${fsHelpers.getAbsolutePath(`LICENSE`).value}`);
    expect(
      fs.existsSync(fsHelpers.getAbsolutePath(`LICENSE`).value) &&
        !fs.lstatSync(fsHelpers.getAbsolutePath(`LICENSE`).value).isDirectory(),
    ).toBe(true);
  });
});

describe(`abortDirCreation should delete dirs that were created`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
  });

  test(`should clean up any dirs created`, () => {
    const dirToDelete = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`).value);
    fsHelpers.abortDirCreation(dirToDelete);
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        fsHelpers.getAbsolutePath(`bar`).value,
      )}`,
    );
  });

  test(`should do nothing if no dirs to cleanup`, () => {
    fsHelpers.abortDirCreation(null);
    expect(console.error).toHaveBeenLastCalledWith(`Cleaning up due to abort, no directory to clean up.`);
  });
});

describe(`rename`, () => {
  test(`should err on invalid dirs`, () => {
    fsHelpers.renameDir(`./doesNotExist`, `./doesNotExistEither`);
    expect(console.error).toHaveBeenLastCalledWith(`ENOENT`);
  });
});
