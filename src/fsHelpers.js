const fs = require("fs");
const mkdirp = require("mkdirp").sync;
const path = require("path");

exports.checkIfDirExists = function (dir) {
  return fs.existsSync(dir);
};

exports.getDirToCreate = function (dir) {
  try {
    return path.resolve(dir);
  } catch (err) {
    console.error(
      JSON.stringify(`Error resolving path: ${JSON.stringify(dir)}`)
    );
  }
};

exports.createDir = function (dir) {
  try {
    return mkdirp(dirToCreate);
  } catch (err) {
    console.error(JSON.stringify(`Error creating dir: ${JSON.stringify(dir)}`));
  }
};

exports.abortDirCreation = function (dir) {
  if (!isNull(dir)) {
    console.error(
      `Cleaning up due to abort, directories created starting at: ${dir}`
    );
  }
};
