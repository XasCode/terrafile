import * as fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import { getSaveLocation } from 'src/backend/venDir';
import { Path, Status } from 'src/shared/types';

function restoreExistingDir(installDir: Path): Path {
  let retVal = null;
  const saveLocation = getSaveLocation(installDir);
  if (fsHelpers.checkIfDirExists(saveLocation)) {
    fsHelpers.rimrafDir(installDir);
    fsHelpers.renameDir(saveLocation, installDir);
    retVal = installDir;
  }
  return retVal;
}

function restoreDirectory(installDir: Path): Status {
  const retVals = { success: false, saved: null, created: null } as Status;
  const absInstallDir = fsHelpers.getAbsolutePath(installDir);
  const restored = restoreExistingDir(absInstallDir);
  if (restored !== null) {
    retVals.success = fsHelpers.checkIfDirExists(absInstallDir);
  }
  return retVals;
}

export { restoreDirectory };
