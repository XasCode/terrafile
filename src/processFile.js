const fs = require("fs");

const fsHelpers = require("./fsHelpers");
const { validOptions } = require("./utils");

exports.readFileContents = function (options) {
  return Terrafile(options).process();
};

function copyFromLocalDir(name, params, dest) {
  console.log(`${name}: local-dir`);
}

function copyFromTerraformRegistry(name, params, dest) {
  console.log(`${name}: terraform-registry`);
}

function copyFromGitHttps(name, params, dest) {
  console.log(`${name}: git-https`);
}

function copyFromGitSSH(name, parmas, dest) {
  console.log(`${name}: git-ssh`);
}

function Terrafile(options) {
  function process() {
    const retVal = { success: this.success, contents: this.contents };
    if (this.success) {
      const dest = fsHelpers.getAbsolutePath(options.file);
      this.contents.map(([key, val]) => {
        switch (moduleSourceType(val.source)) {
          case "local-dir": {
            copyFromLocalDir(key, val, dest);
            break;
          }
          case "terraform-registry": {
            copyFromTerraformRegistry(key, val, dest);
            break;
          }
          case "git-https": {
            copyFromGitHttps(key, val, dest);
            break;
          }
          case "git-ssh": {
            copyFromGitSSH(key, val, dest);
            break;
          }
        }
      });
    }
    return retVal;
  }

  return validOptions(options, "file")
    ? {
        process,
        ...JsonTerrafile(
          fsHelpers.getAbsolutePath(options.file)
        ).validateFormat(),
      }
    : { process, success: false, contents: null };
}

function JsonTerrafile(path) {
  function parse(contents) {
    try {
      return Object.entries(contents);
    } catch (err) {
      return [];
    }
  }

  function validateFormat() {
    const moduleEntries = parse(this.contents);
    const valid = moduleEntries.reduce((acc, [key, val]) => {
      return acc && !validateFieldsForEachModuleEntry(val);
    }, this.success);
    return {
      success: valid,
      contents: valid ? parse(this.contents) : null,
    };
  }

  return {
    validateFormat,
    ...JsonFile(path),
  };
}

function JsonFile(absFilePath) {
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

  return File(absFilePath).success
    ? Json(gulpJson(absFilePath))
    : { success: false, contents: null };
}

function File(absFilePath) {
  function exists(filePath) {
    return fsHelpers.checkIfFileExists(filePath);
  }

  return {
    success: exists(absFilePath),
    contents: null,
  };
}

function Json(json) {
  function isValidJson(contents) {
    return contents !== null;
  }

  return { success: isValidJson(json), contents: json };
}

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
