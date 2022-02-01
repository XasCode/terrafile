import { getSaveLocation } from 'src/backend/venDir';
import { Path, Status, CliOptions } from 'src/shared/types';

function restoreExistingDir(installDir: Path, options: CliOptions): Path {
  let retVal = null;
  const saveLocation = getSaveLocation(installDir);
  if (options.fsHelpers.checkIfDirExists(saveLocation).value) {
    options.fsHelpers.rimrafDir(installDir);
    options.fsHelpers.renameDir(saveLocation, installDir);
    retVal = installDir;
  }
  return retVal;
}

function restoreDirectory(installDir: Path, options: CliOptions): Status {
  const retVals = { success: false, saved: null, created: null } as Status;
  const absInstallDir = options.fsHelpers.getAbsolutePath(installDir).value;
  const restored = restoreExistingDir(absInstallDir, options);
  if (restored !== null) {
    retVals.success = options.fsHelpers.checkIfDirExists(absInstallDir).value;
  }
  return retVals;
}

export { restoreDirectory };
