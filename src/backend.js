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
  try {
    return JSON.parse(
      fs.readFileSync(fsHelpers.getAbsolutePath(file), "utf-8")
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}

function cleanUpOldSaveLocation(dir) {
  fsHelpers.rimrafDir(dir);
}

function getSaveLocation(dir) {
  return path.resolve(dir, "..", ".terrafile.save");
}

function validOptions(options, fileOrFolder) {
  return (
    typeof options === "object" &&
    options !== null &&
    Object.keys(options).includes(fileOrFolder) &&
    fsHelpers.getAbsolutePath(options[fileOrFolder]) !== undefined
  );
}

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

// options = {file: <path>, ...}
exports.readFileContents = function (options) {
  let retVals = { success: false, contents: null };
  if (validOptions(options, "file")) {
    const absFilePath = fsHelpers.getAbsolutePath(options.file);
    if (fsHelpers.checkIfFileExists(absFilePath)) {
      const configFileContents = gulpJson(absFilePath);
      retVals = { ...retVals, ...validateJsonContents(configFileContents) };
    }
  }
  return retVals;

  // verify config version
  //   determine source
  //   switch(source)
  //      local
  //      terraform registry
  //      git
  //
};

function startsWith(str, start) {
  return start === str.slice(0, start.length);
}

function endsWith(str, end) {
  return end === str.slice(-1 * end.length);
}

function isGitHttps(source) {
  return startsWith(source, "https://") && endsWith(source, ".git");
}

function isGitSSH(source) {
  return startsWith(source, "git@") && endsWith(source, ".git");
}

function isLocalDir(source) {
  return (
    startsWith(source, "/") ||
    startsWith(source, "./") ||
    startsWith(source, "../")
  );
}

function moduleSourceType(source) {
  return isGitHttps(source)
    ? "git-https"
    : isGitSSH(source)
    ? "git-ssh"
    : isLocalDir(source)
    ? "local-dir"
    : "terraform-registry";
}

function getModuleSourceType(source) {
  let returnValue = undefined;
  if (source !== undefined) {
    returnValue = moduleSourceType(source);
  }
  return returnValue;
}

function validateEachField(moduleDef) {
  let notFoundOrNotValid = false;
  const acceptable = ["source", "version"];
  const params = Object.keys(moduleDef);
  for (const param of params) {
    if (!acceptable.includes(param)) {
      notFoundOrNotValid = true;
    }
  }
  return notFoundOrNotValid;
}

function validateFieldsForEachModuleEntry(moduleDef) {
  let notFoundOrNotValid = false;
  const sourceType = getModuleSourceType(moduleDef["source"]);
  if (sourceType === undefined) {
    notFoundOrNotValid = true;
  } else {
    notFoundOrNotValid = notFoundOrNotValid || validateEachField(moduleDef);
  }
  return notFoundOrNotValid;
}

function validateJsonContents(contents) {
  let notFoundOrNotValid = false;
  if (contents !== null) {
    const keys = Object.keys(contents);
    for (const key of keys) {
      notFoundOrNotValid =
        notFoundOrNotValid || validateFieldsForEachModuleEntry(contents[key]);
    }
  }
  return {
    success: contents !== null ? !notFoundOrNotValid : false,
    contents: notFoundOrNotValid ? null : contents,
  };
}

// dirs = {saved: <path>|null, created: <path>|null}
//exports.restoreDirectories = function (dirs) {};
