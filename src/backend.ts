(function () {
  const fsHelpers = require("./fsHelpers");

  exports.install = function (options) {
    createInstallDirectory(options.directory);
    console.log(`${JSON.stringify(options)}`);
  };

  // TODO: stop using this, instead use createTargetDirectory
  function createInstallDirectory(dir) {
    const dirToCreate = fsHelpers.getAbsolutePath(dir);
    const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
    fsHelpers.checkIfDirExists(dirToCreate);
    return createdDirsStartingAt;
  }
})();
