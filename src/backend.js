const fs = require("fs");
const path = require("path");
//const { pathToFileURL } = require("url");
const fsHelpers = require("./fsHelpers");

exports.install = function (options) {
  createInstallDirectory(options.directory);
  console.log(`${JSON.stringify(options)}`);
};

function createInstallDirectory(dir) {
  const dirToCreate = fsHelpers.getAbsolutePathOfDir(dir);
  const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
  const isDirCreated = fsHelpers.checkIfDirExists(dirToCreate);
  return createdDirsStartingAt;
}

function gulpJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(".", file), "utf-8"));
}

function renameDir(oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath);
    console.log("Successfully renamed the directory.");
  } catch (err) {
    console.log(err);
  }
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
    fsHelpers.getAbsolutePathOfDir(options.directory) !== undefined;

  if (optionsValid) {
    const installDir = fsHelpers.getAbsolutePathOfDir(options.directory);
    if (fsHelpers.checkIfDirExists(installDir)) {
      const saveLocation = getSaveLocation(installDir);
      cleanUpOldSaveLocation(saveLocation);
      renameDir(installDir, saveLocation);
      retVals.saved = saveLocation;
    }

    const createdStartingAt = createInstallDirectory(installDir);
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
  const configFileContents = gulpJson(options.file);
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
