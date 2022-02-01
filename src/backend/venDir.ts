import * as path from 'path';
import { validOptions } from 'src/backend/utils';
import { CliOptions, Option, Path, Status } from 'src/shared/types';

function cleanUpOldSaveLocation(dir: Path, options: CliOptions): void {
  options.fsHelpers.rimrafDir(dir);
}

function getSaveLocation(dir: Path): Path {
  return path.resolve(dir, `..`, `.terrafile.save`);
}

function renameExistingDir(installDir: Path, options: CliOptions): Path {
  let retVal = null;
  if (options.fsHelpers.checkIfDirExists(installDir).value) {
    const saveLocation = getSaveLocation(installDir);
    cleanUpOldSaveLocation(saveLocation, options);
    options.fsHelpers.renameDir(installDir, saveLocation);
    retVal = saveLocation;
  }
  return retVal;
}

function createNewDir(installDir: Path, options: CliOptions): Path {
  const createdStartingAt = options.fsHelpers.createDir(installDir).value;
  return createdStartingAt !== undefined ? createdStartingAt : null;
}

function createTargetDirectory(options: CliOptions): Status {
  const retVals: Status = { success: false, saved: null, created: null };
  const useCreateDir = options && options.createDir ? options.createDir : createNewDir;
  if (validOptions(options, `directory` as Option)) {
    const installDir = options.fsHelpers.getAbsolutePath(options.directory).value;
    retVals.saved = renameExistingDir(installDir, options);
    retVals.created = useCreateDir(installDir, options);
    retVals.success = options.fsHelpers.checkIfDirExists(installDir).value;
  }
  return retVals;
}

export { createTargetDirectory, getSaveLocation };
