const fs = require("fs-extra");
const path = require("path");
const fsHelpers = require("./fsHelpers");
const { validOptions } = require("./utils");
const axios = require("axios").default;

const registryURL = "https://registry.terraform.io/v1/modules";
const downloadRE = /git::https:\/\/github.com\/([^/]+)\/([^/]+)?ref=(.*)/;

exports.readFileContents = async function (options) {
  return await Terrafile(options).process();
};

function copyAbs(src, dest) {
  const retVal = false;
  try {
    fs.copySync(src, dest);
    retVal.success = true;
  } catch (err) {
    console.error(`Error copying from '${src}' to '${dest}'`);
    retVal.success = false;
    retVal.contents = null;
  }
  return retVal;
}

function copyFromLocalDir(name, params, dest) {
  //console.log(
  //  `${name}: local-dir, ${fsHelpers.getAbsolutePath(params.source)}, ${dest}`
  //);
  const retVal = {};
  const src = fsHelpers.getAbsolutePath(params.source);
  const fullDest = fsHelpers.getAbsolutePath(
    dest + path.sep + src.split(path.sep).slice(-1).join("")
  );
  if (fsHelpers.checkIfDirExists(src)) {
    return copyAbs(src, fullDest);
  } else {
    retVal.success = false;
    retVal.contents = null;
  }
  return retVal;
}

async function copyFromTerraformRegistry(name, params, dest) {
  console.log(`${name}: terraform-registry`);
  const [ns, modName, provider] = params.source.split("/");
  const registryDownloadUrl = `${registryURL}/${ns}/${modName}/${provider}/${params.version}/download`;
  console.log(`${registryDownloadUrl} to ${dest}`);

  const response = await axios({
    method: "get",
    url: registryDownloadUrl,
  });
  if (response.status === 204) {
    const downloadUrl = response.headers["x-terraform-get"];
    const [url, ver] = downloadUrl.split("git::")[1].split("?ref=");
    console.log(`${url} ${ver}`);
  }
  console.log(response.headers["x-terraform-get"]);
}

function copyFromGitHttps(name, params, dest) {
  //console.log(`${name}: git-https`);
}

function copyFromGitSSH(name, parmas, dest) {
  //console.log(`${name}: git-ssh`);
}

function Terrafile(options) {
  async function process() {
    let retVal = { success: this.success, contents: this.contents };
    if (this.success) {
      const dest = fsHelpers.getAbsolutePath(options.directory);
      for (const [key, val] of this.contents) {
        switch (moduleSourceType(val.source)) {
          case "local-dir": {
            retVal = { ...retVal, ...copyFromLocalDir(key, val, dest) };
            break;
          }
          case "terraform-registry": {
            await copyFromTerraformRegistry(key, val, dest);
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
      }
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

function JsonTerrafile(filepath) {
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
    ...JsonFile(filepath),
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
