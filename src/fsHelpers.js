const fs = require("fs");
const mkdirp = require("mkdirp").sync;
const rimraf = require("rimraf").sync;
const path = require("path");

const checkIfDirExists = function (dir) {
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
};
exports.checkIfDirExists = checkIfDirExists;

const getAbsolutePathOfDir = function (dir) {
  try {
    return path.normalize(path.resolve(dir));
  } catch (err) {
    console.error(`Error resolving path: ${dir}`);
  }
};
exports.getAbsolutePathOfDir = getAbsolutePathOfDir;

exports.createDir = function (dir) {
  try {
    if (getAbsolutePathOfDir(dir) !== dir) {
      throw Error(
        `Function "createDir" expected an absolute path. Recieved "${dir}".`
      );
    }
    return mkdirp(dir);
  } catch (err) {
    console.error(`Error creating dir: ${dir}`);
  }
};

const rimrafDir = function (dir) {
  const absPath = getAbsolutePathOfDir(dir);
  if (absPath !== undefined && checkIfDirExists(dir)) {
    retval = rimraf(dir);
    return dir;
  } else {
    console.error(`Error deleting dir: ${dir}`);
  }
};
exports.rimrafDir = rimrafDir;

exports.abortDirCreation = function (dir) {
  if (dir !== null && checkIfDirExists(dir)) {
    console.error(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        dir
      )}`
    );
    rimrafDir(dir);
  } else {
    console.error(`Cleaning up due to abort, no directory to clean up.`);
  }
};
