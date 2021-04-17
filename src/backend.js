const fs = require("fs");
const path = require("path");
//const { config } = require("process");
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
  fsHelpers.checkIfDirExists(dirToCreate);
  return createdDirsStartingAt;
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
/*
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
};
*/
function TerrafileJson(json) {
  return {
    contents: json,
    validateJsonContents: function () {
      let notValid = false;
      const keys = Object.keys(this.contents);
      for (const key of keys) {
        notValid =
          notValid || validateFieldsForEachModuleEntry(this.contents[key]);
      }
      return {
        success: !notValid,
        contents: notValid ? null : this.contents,
      };
    },
  };
}

function Json(json) {
  function isValidJson(contents) {
    return contents !== null;
  }

  return isValidJson(json)
    ? TerrafileJson(json).validateJsonContents()
    : { success: false, contents: json };
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

function JsonFile(absFilePath) {
  return Json(gulpJson(absFilePath));
}

function File(absFilePath) {
  function exists(filePath) {
    return fsHelpers.checkIfFileExists(filePath);
  }

  return exists(absFilePath)
    ? JsonFile(absFilePath)
    : { success: false, contents: null };
}

function Terrafile(options) {
  return validOptions(options, "file")
    ? File(fsHelpers.getAbsolutePath(options.file))
    : { success: false, contents: null };
}

exports.readFileContents = function (options) {
  return Terrafile(options);
};

function startsWith(str, start) {
  return start === str.slice(0, start.length);
}

function endsWith(str, end) {
  return end === str.slice(-1 * end.length);
}

function isGitHttps(source) {
  return startsWith(source, "https://") && endsWith(source, ".git")
    ? "git-https"
    : "";
}

function isGitSSH(source) {
  return startsWith(source, "git@") && endsWith(source, ".git")
    ? "git-ssh"
    : "";
}

function isLocalDir(source) {
  return startsWith(source, "/") ||
    startsWith(source, "./") ||
    startsWith(source, "../")
    ? "local-dir"
    : "";
}

function moduleSourceType(source) {
  return (
    [isGitHttps(source), isGitSSH(source), isLocalDir(source)].join("") ||
    "terraform-registry"
  );
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

// dirs = {saved: <path>|null, created: <path>|null}
//exports.restoreDirectories = function (dirs) {};
