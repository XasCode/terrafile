const fsHelpers = require("./fsHelpers");

exports.install = function (options) {
  const dirToCreate = fsHelpers.getDirToCreate(options.directory);
  const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
  const isDirCreated = fsHelpers.checkIfDirExists(dirToCreate);
  console.log(`${JSON.stringify(options)}`);
};
