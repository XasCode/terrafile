const fs = require("fs");
const path = require("path");
const { config } = require("process");
//const { pathToFileURL } = require("url");
const fsHelpers = require("./fsHelpers");

exports.install = function (options) {
  createInstallDirectory(options.directory);
  console.log(`${JSON.stringify(options)}`);
};

// TODO: stop using this, instead use createTargetDirectory
function createInstallDirectory(dir) {
  const dirToCreate = fsHelpers.getAbsolutePath(dir);
  const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
  const isDirCreated = fsHelpers.checkIfDirExists(dirToCreate);
  return createdDirsStartingAt;
}

function gulpJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(".", file), "utf-8"));
}

function cleanUpOldSaveLocation(dir) {
  fsHelpers.rimrafDir(dir);
}

function getSaveLocation(dir) {
  return path.resolve(dir, "..", ".terrafile.save");
}

exports.createTargetDirectory = function (options) {
  const retVals = { success: false, saved: null, created: null };
  const optionsValid =
    typeof options === "object" &&
    options !== null &&
    Object.keys(options).includes("directory") &&
    fsHelpers.getAbsolutePath(options.directory) !== undefined;

  if (optionsValid) {
    const installDir = fsHelpers.getAbsolutePath(options.directory);
    if (fsHelpers.checkIfDirExists(installDir)) {
      const saveLocation = getSaveLocation(installDir);
      cleanUpOldSaveLocation(saveLocation);
      fsHelpers.renameDir(installDir, saveLocation);
      retVals.saved = saveLocation;
    }

    const createdStartingAt = fsHelpers.createDir(installDir);
    retVals.created =
      createdStartingAt !== undefined ? createdStartingAt : retVals.created;

    //retVals.created = createInstallDirectory(installDir);
    if (fsHelpers.checkIfDirExists(installDir)) {
      retVals.success = true;
    }
  }
  return retVals;
};

// options = {file: <path>, ...}
exports.readFileContents = function (options) {
  const retVals = { success: false, contents: null };
  const optionsValid =
    typeof options === "object" &&
    options !== null &&
    Object.keys(options).includes("file") &&
    fsHelpers.getAbsolutePath(options.file) !== undefined;

  if (optionsValid) {
    const absFilePath = fsHelpers.getAbsolutePath(options.file);
    if (fsHelpers.checkIfFileExists(absFilePath)) {
      const configFileContents = gulpJson(absFilePath);
      retVals.contents = configFileContents;
      retVals.success = true;
    }
  }
  return retVals;

  // verify config version
  //   validate file format looks reaonable.
  //   determine source
  //   switch(source)
  //      local
  //      terraform registry
  //      git
  //
};

// dirs = {saved: <path>|null, created: <path>|null}
exports.restoreDirectories = function (dirs) {};
