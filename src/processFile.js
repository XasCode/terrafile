const fs = require("fs-extra");
const path = require("path");
const fsHelpers = require("./fsHelpers");
const { validOptions } = require("./utils");
const axios = require("axios").default;
const { run } = require("./run");

const registryURL = "https://registry.terraform.io/v1/modules";

exports.readFileContents = async function (options) {
  return await Terrafile(options).process();
};

function copyAbs(src, dest) {
  const retVal = false;
  try {
    fs.copySync(src, dest);
    retVal.success = true;
    retVal.error = null;
  } catch (err) {
    retVal.success = false;
    retVal.contents = null;
    retVal.error = `Error copying absolute from '${src}' to '${dest}'`;
  }
  return retVal;
}

function copyFromLocalDir(name, params, dest) {
  //console.log(
  //  `${name}: local-dir, ${fsHelpers.getAbsolutePath(params.source)}, ${dest}`
  //);
  const retVal = {};
  const src = fsHelpers.getAbsolutePath(params.source);
  const fullDest = fsHelpers.getAbsolutePath(`${dest}${path.sep}${name}`);
  if (fsHelpers.checkIfDirExists(src)) {
    return copyAbs(src, fullDest);
  } else {
    console.error();
    retVal.success = false;
    retVal.contents = null;
    retVal.error = `Error copying from local dir`;
  }
  return retVal;
}

function determineRef(ref) {
  const commit = ref;
  const branchOrTag = ref;
  return ref.length === 40 ? ["", commit] : [branchOrTag, ""];
}

function getPartsFromHttp(source) {
  const [url, rest] = source.split(".git");
  const repo = `${url}.git`;
  const [repoDir, ref] = rest.split("?ref=");
  const [branchOrTag, commit] = determineRef(ref);

  return [repo, repoDir, branchOrTag, commit];
}

function getRepoUrl(terraformRegistryGitUrl) {
  return terraformRegistryGitUrl.split("git::")[1];
}

async function copyFromTerraformRegistry(name, params, dest) {
  //console.log(`${name}: terraform-registry`);
  const retVal = {};
  const fullDest = fsHelpers.getAbsolutePath(`${dest}${path.sep}${name}`);
  const [ns, modName, provider] = params.source.split("/");
  const registryDownloadUrl = `${registryURL}/${ns}/${modName}/${provider}/${
    params?.version || ""
  }/download`;
  console.log(`${registryDownloadUrl} to ${dest}`);

  const response = await axios({
    method: "get",
    url: registryDownloadUrl,
  });
  if (response.status === 204) {
    const downloadUrl = response.headers["x-terraform-get"];
    const httpUrl = getRepoUrl(downloadUrl);
    const [repo, repoDir, branchOrTag, commit] = getPartsFromHttp(httpUrl);
    const cloneCmd = [
      `clone`,
      ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
      ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
      `${repo}.git`,
      fullDest,
    ];
    const sparseCmd = [`sparse-checkout`, `set`, repoDir];
    const commitCmd = [`checkout`, commit];
    const results1 = await run(cloneCmd, fullDest);
    const results2 = await (repoDir
      ? run(sparseCmd, fullDest)
      : { code: 0, error: null });
    const results3 = await (commit ? run(commitCmd) : { code: 0, error: null });
    console.log(`clone: ${cloneCmd.join(" ")} / ${results1}`);
    console.log(`sparse: ${repoDir ? sparseCmd.join(" ") : ""} / ${results2}`);
    console.log(`checkout: ${commit ? commitCmd.join(" ") : ""} / ${results3}`);
    if (
      results1.code + results2.code + results3.code === 0 &&
      results1.error === null &&
      results2.error === null &&
      results3.error === null
    ) {
      retVal.success = true;
      retVal.error = null;
    } else {
      retVal.success = false;
      retVal.contents = null;
      retVal.error = `Error copying from terraform registry`;
    }
  } else {
    console.log("!204");
  }
  return retVal;
}

function copyFromGitHttps(name, params, dest) {
  //console.log(`${name}: git-https`);
}

function copyFromGitSSH(name, parmas, dest) {
  //console.log(`${name}: git-ssh`);
}

function Terrafile(options) {
  async function process() {
    let retVal = {
      success: this.success,
      contents: this.contents,
      error: this.error,
    };
    if (this.success) {
      const dest = fsHelpers.getAbsolutePath(options.directory);
      for (const [key, val] of this.contents) {
        switch (moduleSourceType(val.source)) {
          case "local-dir": {
            retVal = { ...retVal, ...copyFromLocalDir(key, val, dest) };
            break;
          }
          case "terraform-registry": {
            retVal = {
              ...retVal,
              ...(await copyFromTerraformRegistry(key, val, dest)),
            };
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
    : {
        process,
        success: false,
        contents: null,
        error: `Error: Not valid options`,
      };
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
      error: valid ? null : `Error: Not valid format`,
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
    : { success: false, contents: null, error: "Error: not file" };
}

function File(absFilePath) {
  function exists(filePath) {
    return fsHelpers.checkIfFileExists(filePath);
  }

  return {
    success: exists(absFilePath),
    contents: null,
    error: exists(absFilePath) ? null : `Error: not exists`,
  };
}

function Json(json) {
  function isValidJson(contents) {
    return contents !== null;
  }

  return {
    success: isValidJson(json),
    contents: json,
    error: isValidJson(json) ? null : `Error: is not valid json`,
  };
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
  const acceptable = ["comment", "source", "version", "path"];
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
