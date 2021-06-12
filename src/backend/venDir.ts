import * as path from 'path';
import * as fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import { validOptions } from 'src/backend/utils';
import { CliOptions, Option, Path, Status } from 'src/shared/types';

function cleanUpOldSaveLocation(dir: Path): void {
  fsHelpers.rimrafDir(dir);
}

function getSaveLocation(dir: Path): Path {
  return path.resolve(dir, `..`, `.terrafile.save`);
}

function renameExistingDir(installDir: Path): Path {
  let retVal = null;
  if (fsHelpers.checkIfDirExists(installDir).value) {
    const saveLocation = getSaveLocation(installDir);
    cleanUpOldSaveLocation(saveLocation);
    fsHelpers.renameDir(installDir, saveLocation);
    retVal = saveLocation;
  }
  return retVal;
}

function createNewDir(installDir: Path): Path {
  const createdStartingAt = fsHelpers.createDir(installDir).value;
  return createdStartingAt !== undefined ? createdStartingAt : null;
}

function createTargetDirectory(options: CliOptions): Status {
  const retVals: Status = { success: false, saved: null, created: null };
  const useCreateDir = options && options.createDir ? options.createDir : createNewDir;
  if (validOptions(options, `directory` as Option)) {
    const installDir = fsHelpers.getAbsolutePath(options.directory).value;
    retVals.saved = renameExistingDir(installDir);
    retVals.created = useCreateDir(installDir);
    retVals.success = fsHelpers.checkIfDirExists(installDir).value;
  }
  return retVals;
}

export { createTargetDirectory, getSaveLocation };
