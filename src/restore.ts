const fsHelpers = require("./fsHelpers");
//import * as fsHelpers from "./fsHelpers";
const { getSaveLocation } = require("./venDir");

function restoreExistingDir(installDir) {
  let retVal = null;
  const saveLocation = getSaveLocation(installDir);
  if (fsHelpers.checkIfDirExists(saveLocation)) {
    fsHelpers.rimrafDir(installDir);
    fsHelpers.renameDir(saveLocation, installDir);
    retVal = installDir;
  }
  return retVal;
}

exports.restoreDirectory = function (installDir) {
  const retVals = { success: false };
  const absInstallDir = fsHelpers.getAbsolutePath(installDir);
  const restored = restoreExistingDir(absInstallDir);
  if (restored !== null) {
    retVals.success = fsHelpers.checkIfDirExists(absInstallDir);
  }
  return retVals;
};
