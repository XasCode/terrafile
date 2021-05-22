import * as path from 'path';
import * as fsHelpers from './fsHelpers';
import { validOptions } from './utils';
import { CliOptions, Option, Path, Status } from './types';

function cleanUpOldSaveLocation(dir: Path): void {
  fsHelpers.rimrafDir(dir);
}

function getSaveLocation(dir: Path): Path {
  return path.resolve(dir, `..`, `.terrafile.save`);
}

function renameExistingDir(installDir: Path): Path {
  let retVal = null;
  if (fsHelpers.checkIfDirExists(installDir)) {
    const saveLocation = getSaveLocation(installDir);
    cleanUpOldSaveLocation(saveLocation);
    fsHelpers.renameDir(installDir, saveLocation);
    retVal = saveLocation;
  }
  return retVal;
}

function createNewDir(installDir: Path): Path {
  const createdStartingAt = fsHelpers.createDir(installDir);
  return createdStartingAt !== undefined ? createdStartingAt : null;
}

function createTargetDirectory(options: CliOptions): Status {
  const retVals: Status = { success: false, saved: null, created: null };
  if (validOptions(options, `directory` as Option)) {
    const installDir = fsHelpers.getAbsolutePath(options.directory);
    retVals.saved = renameExistingDir(installDir);
    retVals.created = createNewDir(installDir);
    retVals.success = fsHelpers.checkIfDirExists(installDir);
  }
  return retVals;
}

export { createTargetDirectory, getSaveLocation };
