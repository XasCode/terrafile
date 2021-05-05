import * as fs from "fs-extra";
import * as path from "path";
import * as fsHelpers from "./fsHelpers";
import { validOptions } from "./utils";
import axios from "axios";
import { run } from "./run";
import { CliOptions, Entry, Path, Status } from "./types";

const registryURL = "https://registry.terraform.io/v1/modules";

async function readFileContents(options: CliOptions): Promise<Status> {
  return await Terrafile(options).process();
}

function copyAbs(src: Path, dest: Path): Status {
  const retVal = { success: true, contents: undefined, error: null } as Status;
  try {
    fs.copySync(src, dest, { overwrite: false, errorOnExist: true });
  } catch (err) {
    retVal.success = false;
    retVal.contents = null;
    retVal.error = `Error copying absolute from '${src}' to '${dest}'`;
  }
  return retVal;
}

function copyFromLocalDir(params: Entry, dest: Path): Status {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from local dir`,
  } as Status;
  const src = fsHelpers.getAbsolutePath(params.source);
  if (fsHelpers.checkIfDirExists(src)) {
    return copyAbs(src, dest);
  }
  console.error();
  return retVal;
}

function determineRef(ref: string): string[] {
  const commit = ref;
  const branchOrTag = ref;
  return ref?.length === 40 ? ["", commit] : [branchOrTag, ""];
}

function getPartsFromHttp(source: Path): string[] {
  const [repo, repoDir, ref] = sourceParts(source);
  const [branchOrTag, commit] = determineRef(ref);
  return [repo, repoDir, branchOrTag, commit];
}

function getRepoUrl(terraformRegistryGitUrl) {
  return terraformRegistryGitUrl.split("git::")[1];
}

async function cloneRepo([repo, repoDir, branchOrTag, _commit], fullDest) {
  const cloneCmd = [
    `clone`,
    ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
    ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
    `${repo}.git`,
    fullDest,
  ];
  const results = await run(cloneCmd);
  console.log(`clone: ${cloneCmd.join(" ")} / ${results}`);
  return results;
}

async function scopeRepo([_repo, repoDir, _branchOrTag, _commit], fullDest) {
  const sparseCmd = [`sparse-checkout`, `set`, repoDir];
  const results = await (repoDir
    ? run(sparseCmd, fullDest)
    : { code: 0, error: null });
  console.log(
    `sparse: ${repoDir ? sparseCmd.join(" ") : ""} / ${JSON.stringify(results)}`
  );
  return results;
}

async function checkoutCommit(
  [_repo, _repoDir, _branchOrTag, commit],
  fullDest
) {
  const commitCmd = [`checkout`, commit];
  const results = await (commit
    ? run(commitCmd, fullDest)
    : { code: 0, error: null });
  console.log(
    `checkout: ${commit ? commitCmd.join(" ") : ""} / ${JSON.stringify(
      results
    )}`
  );
  return results;
}

function getRegDownloadPointerUrl(source, version) {
  const [ns, modName, provider] = source.split("/");
  const registryDownloadUrl = `${registryURL}/${ns || ""}/${modName || ""}/${
    provider || ""
  }/${version}/download`;
  return registryDownloadUrl;
}

async function getRegRepoUrl(downloadPointerUrl) {
  try {
    const response = await axios({
      method: "get",
      url: downloadPointerUrl,
    });
    if (response.status === 204) {
      const downloadUrl = response.headers["x-terraform-get"];
      return getRepoUrl(downloadUrl);
    } else {
      console.log("!204");
    }
  } catch (err) {
    console.error(`Error fetching download URL from terraform registry.`);
  }
}

async function cloneRepoToDest(repoUrl, fullDest) {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from terraform registry ${repoUrl} - ${fullDest}`,
  };
  const [a, b, c, d] = getPartsFromHttp(repoUrl);
  const results1 = await cloneRepo([a, b, c, d], fullDest);
  const results2 = await scopeRepo([a, b, c, d], fullDest);
  const results3 = await checkoutCommit([a, b, c, d], fullDest);
  if (
    results1.code + results2.code + results3.code === 0 &&
    results1.error === null &&
    results2.error === null &&
    results3.error === null
  ) {
    retVal.success = true;
    retVal.error = null;
    delete retVal.contents;
  }
  return retVal;
}

async function copyFromTerraformRegistry(name, params, dest) {
  const downloadPointerUrl = getRegDownloadPointerUrl(
    params.source,
    params?.version || ""
  );
  const regRepoUrl = await getRegRepoUrl(downloadPointerUrl);
  return regRepoUrl
    ? await cloneRepoToDest(regRepoUrl, dest)
    : {
        success: false,
        contents: null,
        error: `Repo URL not found in Terraform registry.`,
      };
}

function replaceUrlVersionIfVersionParam(source, version) {
  return version ? [source.split("?ref=")[0], version].join("?ref=") : source;
}

function insertGit(source) {
  const parts = source.split("?ref=");
  return parts.length < 2
    ? source
    : source.includes(".git")
    ? parts.join("?ref=")
    : [parts[0], ".git", "?ref=", ...parts.slice(1)].join("");
}

function sourceParts(source) {
  const tempSource = insertGit(source);
  const [beforeGit, afterGit] = tempSource.split(".git");
  const newSource = `${beforeGit}${source.includes(".git") ? ".git" : ""}`;
  const newAfterGit = afterGit ? afterGit : "";
  const [beforeQref, afterQref] = newAfterGit.split("?ref=");
  const [, afterPathSep] = beforeQref.split("//");
  const newPathPart = afterPathSep ? `//${afterPathSep}` : "";
  return [newSource, newPathPart, afterQref];
}

function replacePathIfPathParam(source, repoPath) {
  const [beforeGit, afterGit] = source.split(".git");
  const newAfterGit = afterGit ? afterGit : "";
  const [beforeQref, afterQref] = newAfterGit.split("?ref=");
  const newQrefPart = afterQref ? `?ref=${afterQref}` : "";
  const [beforePathSep, afterPathSep] = beforeQref.split("//");
  const newPathPart = afterPathSep ? `//${afterPathSep}` : "";
  const newPath = repoPath ? `/${repoPath}` : newPathPart;
  return `${beforeGit}${
    source.includes(".git") ? ".git" : ""
  }${beforePathSep}${newPath}${newQrefPart}`;
}

async function copyFromGit(name, params, dest) {
  const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
  const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
  return await cloneRepoToDest(regRepoUrl, dest);
}

function Terrafile(options) {
  async function process() {
    let retVal = {
      success: this.success,
      contents: this.contents,
      error: this.error,
    };
    if (this.success) {
      for (const [key, val] of this.contents) {
        const dest = fsHelpers.getAbsolutePath(
          `${options.directory}${path.sep}${key}`
        );
        switch (moduleSourceType(val.source)) {
          case "local-dir": {
            retVal = { ...retVal, ...copyFromLocalDir(val, dest) };
            break;
          }
          case "terraform-registry": {
            retVal = {
              ...retVal,
              ...(await copyFromTerraformRegistry(key, val, dest)),
            };
            break;
          }
          case "git-https":
          case "git-ssh": {
            retVal = {
              ...retVal,
              ...(await copyFromGit(key, val, dest)),
            };
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

const testable = {
  replacePathIfPathParam,
  replaceUrlVersionIfVersionParam,
};

export { testable, readFileContents };
