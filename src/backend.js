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
    return JSON.parse(fs.readFileSync(path.resolve(".", file), "utf-8"));
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
    console.log(absFilePath);

    if (fsHelpers.checkIfFileExists(absFilePath)) {
      const configFileContents = gulpJson(absFilePath);
      if (
        configFileContents !== null &&
        validateJsonContents(configFileContents)
      ) {
        retVals.success = true;
        retVals.contents = configFileContents;
      }
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

function getModuleSourceType(source) {
  let returnValue = undefined;
  if (source !== undefined) {
    returnValue = "terraform-registry";
    if (source.slice(0, 8) === "https://" && source.slice(-4) === ".git") {
      returnValue = "git-https";
    }
    if (source.slice(0, 4) === "git@" && source.slice(-4) === ".git") {
      returnValue = "git-ssh";
    }
    if (
      source.slice(0, 1) === "/" ||
      source.slice(0, 2) === "./" ||
      source.slice(0, 3) === "../"
    ) {
      returnValue = "local-dir";
    }
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
  const keys = Object.keys(contents);
  for (const key of keys) {
    notFoundOrNotValid =
      notFoundOrNotValid || validateFieldsForEachModuleEntry(contents[key]);
  }
  return !notFoundOrNotValid;
}

// dirs = {saved: <path>|null, created: <path>|null}
exports.restoreDirectories = function (dirs) {};
