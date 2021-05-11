import * as fs from "fs-extra";
import * as path from "path";
import * as fsHelpers from "./fsHelpers";
import { validOptions } from "./utils";
import axios from "axios";
import { run } from "./run";
import {
  CliOptions,
  Entry,
  ExecResult,
  Option,
  Path,
  RepoLocation,
  SourceParts,
  Status,
} from "./types";

const registryURL = "https://registry.terraform.io/v1/modules";

async function readFileContents(options: CliOptions): Promise<Status> {
  //console.log(`readFileContents: ${JSON.stringify(options)}`);
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
  console.error("error");
  return retVal;
}

function determineRef(ref: string): string[] {
  const commit = ref;
  const branchOrTag = ref;
  return ref?.length === 40 ? ["", commit] : [branchOrTag, ""];
}

function getPartsFromHttp(source: Path): RepoLocation {
  const [repo, repoDir, ref] = sourceParts(source);
  const [branchOrTag, commit] = determineRef(ref);
  return [repo, repoDir, branchOrTag, commit];
}

function getRepoUrl(terraformRegistryGitUrl: Path) {
  return terraformRegistryGitUrl.split("git::")[1];
}

async function cloneRepo(
  [repo, repoDir, branchOrTag]: RepoLocation,
  fullDest: Path
): Promise<ExecResult> {
  const cloneCmd = [
    `clone`,
    ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
    ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
    `${repo}.git`,
    fullDest,
  ];
  const results = await run(cloneCmd);
  //console.log(`clone: ${cloneCmd.join(" ")} / ${results}`);
  return results;
}

async function scopeRepo(
  [, repoDir]: RepoLocation,
  fullDest: Path
): Promise<ExecResult> {
  const sparseCmd = [`sparse-checkout`, `set`, repoDir];
  const results = await (repoDir
    ? run(sparseCmd, fullDest)
    : ({ code: 0, error: null } as ExecResult));
  //console.log(
  //  `sparse: ${repoDir ? sparseCmd.join(" ") : ""} / ${JSON.stringify(results)}`
  //);
  return results;
}

async function checkoutCommit(
  [, , , commit]: RepoLocation,
  fullDest: Path
): Promise<ExecResult> {
  const commitCmd = [`checkout`, commit];
  const results = await (commit
    ? run(commitCmd, fullDest)
    : ({ code: 0, error: null } as ExecResult));
  //console.log(
  //  `checkout: ${commit ? commitCmd.join(" ") : ""} / ${JSON.stringify(
  //    results
  //  )}`
  //);
  return results;
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  const [ns, modName, provider] = source.split("/");
  const registryDownloadUrl = `${registryURL}/${ns || ""}/${modName || ""}/${
    provider || ""
  }/${version}/download`;
  return registryDownloadUrl;
}

async function getRegRepoUrl(downloadPointerUrl: Path): Promise<Path> {
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

async function cloneRepoToDest(repoUrl: Path, fullDest: Path): Promise<Status> {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from terraform registry ${repoUrl} - ${fullDest}`,
  } as Status;
  const [a, b, c, d]: RepoLocation = getPartsFromHttp(repoUrl);
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

async function copyFromTerraformRegistry(
  params: Entry,
  dest: Path
): Promise<Status> {
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
        // eslint-disable-next-line max-len
        error: `Repo URL not found in Terraform registry. ${dest}, ${JSON.stringify(
          params
        )}, ${downloadPointerUrl}, ${regRepoUrl}, ${isGitHttps(
          params.source
        )}, ${isGitSSH(params.source)}, ${isLocalDir(params.source)}`,
      };
}

function replaceUrlVersionIfVersionParam(source: Path, version: string): Path {
  return version ? [source.split("?ref=")[0], version].join("?ref=") : source;
}

function insertGit(source: Path): Path {
  const parts = source.split("?ref=");
  return parts.length < 2
    ? source
    : source.includes(".git")
    ? parts.join("?ref=")
    : [parts[0], ".git", "?ref=", ...parts.slice(1)].join("");
}

function sourceParts(source: Path): SourceParts {
  const tempSource = insertGit(source);
  const [beforeGit, afterGit] = tempSource.split(".git");
  const newSource = `${beforeGit}${source.includes(".git") ? ".git" : ""}`;
  const newAfterGit = afterGit ? afterGit : "";
  const [beforeQref, afterQref] = newAfterGit.split("?ref=");
  const [, afterPathSep] = beforeQref.split("//");
  const newPathPart = afterPathSep ? `//${afterPathSep}` : "";
  return [newSource, newPathPart, afterQref];
}

function replacePathIfPathParam(source: Path, repoPath: Path): Path {
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

async function copyFromGit(params: Entry, dest: Path): Promise<Status> {
  const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
  const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
  return await cloneRepoToDest(regRepoUrl, dest);
}

function Terrafile(options: CliOptions): Status {
  async function process(): Promise<Status> {
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
              ...(await copyFromTerraformRegistry(val, dest)),
            };
            break;
          }
          case "git-https":
          case "git-ssh": {
            retVal = {
              ...retVal,
              ...(await copyFromGit(val, dest)),
            };
            break;
          }
        }
      }
    }
    return retVal;
  }

  return validOptions(options, "file" as Option)
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

function JsonTerrafile(filepath: Path): Status {
  function parse(
    c: Record<string, Record<string, string>>
  ): [string, Record<string, string>][] {
    try {
      return Object.entries(c);
    } catch (err) {
      return [];
    }
  }

  function validateFormat(): Status {
    const moduleEntries = parse(this.contents);
    const valid = moduleEntries.reduce((acc, [, val]) => {
      return acc && !validateFieldsForEachModuleEntry(val);
    }, this.success);
    return {
      success: valid,
      //contents: parse(this.contents),
      contents: valid ? parse(this.contents) : null,
      error: valid ? null : `Error: Not valid format`,
    };
  }

  return {
    validateFormat,
    ...JsonFile(filepath),
  };
}

function JsonFile(absFilePath: Path): Status {
  function gulpJson(file: Path): [string, Record<string, string>][] | null {
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

function File(absFilePath: Path): Status {
  function exists(filePath: Path): boolean {
    return fsHelpers.checkIfFileExists(filePath);
  }

  return {
    success: exists(absFilePath),
    //contents: null,
    error: exists(absFilePath) ? null : `Error: not exists`,
  };
}

function Json(json: [string, Record<string, string>][] | null): Status {
  function isValidJson(
    contents: [string, Record<string, string>][] | null
  ): boolean {
    return contents !== null;
  }

  return {
    success: isValidJson(json),
    contents: json,
    error: isValidJson(json) ? null : `Error: is not valid json`,
  };
}

function startsWith(str: string, start: string): boolean {
  return start === str.slice(0, start.length);
}

//function endsWith(str: string, end: string): boolean {
//  return end === str.slice(-1 * end.length);
//}

function isGitHttps(source: Path): string {
  return startsWith(source, "https://") ? "git-https" : "";
}

function isGitSSH(source: Path): string {
  return startsWith(source, "git@") ? "git-ssh" : "";
}

function isLocalDir(source: Path): string {
  return startsWith(source, "/") ||
    startsWith(source, "./") ||
    startsWith(source, "../")
    ? "local-dir"
    : "";
}

function moduleSourceType(source: Path): string {
  return (
    [isGitHttps(source), isGitSSH(source), isLocalDir(source)].join("") ||
    "terraform-registry"
  );
}

function getModuleSourceType(source: Path): string {
  let returnValue = undefined;
  if (source !== undefined) {
    returnValue = moduleSourceType(source);
  }
  return returnValue;
}

function validateEachField(moduleDef: Record<string, string>): boolean {
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

function validateFieldsForEachModuleEntry(
  moduleDef: Record<string, string>
): boolean {
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
