import * as path from 'path';
import * as fs from 'fs-extra';
import * as fsHelpers from 'src/fsHelpers';
import { spy } from '__tests__/testUtils';

describe(`checkIfDirExists checks for the existence of a directory`, () => {
  beforeEach(() => {
    spy.clear();
  });

  test(`should return true if directory exists`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`.`))).toBe(true);
  });

  test(`should return false if directory doesn't exist`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`./SoMeThInG/uNuSuAl`))).toBe(false);
  });
});

describe(`getAbsolutePath returns an absolute path from relative or abs path`, () => {
  beforeEach(() => {
    spy.clear();
  });

  test(`should return path relative to current direct if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(`sOmEtHiNg/UnUsUaL`)).toBe(path.resolve(`./sOmEtHiNg/UnUsUaL`));
  });

  test(`should return path if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(path.resolve(`.`, `sOmEtHiNg/UnUsUaL`))).toBe(path.resolve(`./sOmEtHiNg/UnUsUaL`));
  });
});

describe(`createDir should create a directory at the provided location`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`));
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`));
  });

  test(`should create a directory if provided an absolute path`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`));
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(`bar`))).toBe(true);
    expect(createdDirsStartingLocation).toBe(path.resolve(`.`, `bar`));
  });

  test(`should raise error if provided a path to a file`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`LICENSE`));
    expect(createdDirsStartingLocation).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error creating dir: ${fsHelpers.getAbsolutePath(`LICENSE`)}`);
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
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`));
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`));
  });

  test(`should delete a directory that exists`, () => {
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`vendor/modules`));
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`));
    expect(deletedDir).toBe(fsHelpers.getAbsolutePath(`vendor`));
    expect(console.error).not.toHaveBeenCalled();
    expect(fsHelpers.checkIfDirExists(`vendor`)).toBe(false);
  });

  test(`should error when attempting to delete a directory that doesn't exist`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`sOmEtHiNg`));
    expect(deletedDir).toBe(undefined);
    expect(console.error).not.toHaveBeenLastCalledWith(`Error deleting dir: ${`sOmEtHiNg`}`);
    expect(fsHelpers.checkIfDirExists(`sOmEtHiNg`)).toBe(false);
  });

  test(`should error when attempting to delete a directory that is not a dir`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`LICENSE`));
    expect(deletedDir).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error deleting dir: ${fsHelpers.getAbsolutePath(`LICENSE`)}`);
    expect(
      fs.existsSync(fsHelpers.getAbsolutePath(`LICENSE`)) &&
        !fs.lstatSync(fsHelpers.getAbsolutePath(`LICENSE`)).isDirectory(),
    ).toBe(true);
  });
});

describe(`abortDirCreation should delete dirs that were created`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`));
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`));
  });

  test(`should clean up any dirs created`, () => {
    const dirToDelete = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`));
    fsHelpers.abortDirCreation(dirToDelete);
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(fsHelpers.getAbsolutePath(`bar`))}`,
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
