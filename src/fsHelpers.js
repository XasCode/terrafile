const fs = require("fs");
const mkdirp = require("mkdirp").sync;
const rimraf = require("rimraf").sync;
const touch = require("touch").sync;
const path = require("path");

const checkIfFileExists = function (filePath) {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};
exports.checkIfFileExists = checkIfFileExists;

const checkIfDirExists = function (dir) {
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
};
exports.checkIfDirExists = checkIfDirExists;

const getAbsolutePath = function (dir) {
  try {
    if (dir.match(/^[a-zA-Z0-9\-_./:\\]+$/g) === null) {
      throw Error(`Dir contains unsupported characters. Received ${dir}.`);
    }
    return path.normalize(path.resolve(dir));
  } catch (err) {
    console.error(`Error resolving path: ${dir}`);
  }
};
exports.getAbsolutePath = getAbsolutePath;

exports.createDir = function (dir) {
  try {
    if (dir === undefined || getAbsolutePath(dir) !== dir) {
      throw Error(
        `Function "createDir" expected an absolute path. Recieved "${dir}".`
      );
    }
    return mkdirp(dir);
  } catch (err) {
    console.error(`Error creating dir: ${dir}`);
  }
};

exports.touchFile = function (filePath, perms) {
  touch(filePath);
  if (perms !== undefined) {
    fs.chmodSync(filePath, perms);
  }
};

const rimrafDir = function (dir) {
  const absPath = getAbsolutePath(dir);
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

exports.renameDir = function (oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath);
    console.log("Successfully renamed the directory.");
  } catch (err) {
    console.error(err.code);
  }
};
