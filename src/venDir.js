const path = require("path");

const fsHelpers = require("./fsHelpers");
const { validOptions } = require("./utils");

function cleanUpOldSaveLocation(dir) {
  fsHelpers.rimrafDir(dir);
}

function getSaveLocation(dir) {
  return path.resolve(dir, "..", ".terrafile.save");
}
exports.getSaveLocation = getSaveLocation;

function renameExistingDir(installDir) {
  let retVal = null;
  if (fsHelpers.checkIfDirExists(installDir)) {
    const saveLocation = getSaveLocation(installDir);
    cleanUpOldSaveLocation(saveLocation);
    fsHelpers.renameDir(installDir, saveLocation);
    retVal = saveLocation;
  }
  return retVal;
}

function createNewDir(installDir) {
  const createdStartingAt = fsHelpers.createDir(installDir);
  return createdStartingAt !== undefined ? createdStartingAt : null;
}

exports.createTargetDirectory = function (options) {
  let retVals = { success: false, saved: null, created: null };
  if (validOptions(options, "directory")) {
    const installDir = fsHelpers.getAbsolutePath(options.directory);
    retVals.saved = renameExistingDir(installDir);
    retVals.created = createNewDir(installDir);
    retVals.success = fsHelpers.checkIfDirExists(installDir);
  }
  return retVals;
};
