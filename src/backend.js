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

exports.doInstall = function (options) {
  const createdDirsStartingAt = createInstallDirectory(options.directory);
  if (createdDirsStartingAt === null) {
    const saveLocation = getSaveLocation(createdDirsStartingAt);
    cleanUpOldSaveLocation(saveLocation);
    renameDir(createdDirsStartingAt, saveLocation);
    createInstallDirectory(options.directory);
  }
  const configFileContents = gulpJson(options.file);
  // verify config version
  //   validate file format looks reaonable.
  //   determine source
  //   switch(source)
  //      local
  //      terraform registry
  //      git
  //

  // Cleanup
  //   if all successful, delete backup location
  //   if issues, delete locatation, restore backup if already existed
  //   if issues, delete created dirs, if didn't already exist
};
