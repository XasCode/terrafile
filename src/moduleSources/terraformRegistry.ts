import axios from 'axios';
import { startsWith } from 'src/utils';
import { Entry, Path, RetString, Status, Config, Response } from 'src/types';
import { cloneRepoToDest } from 'src/moduleSources/common/cloneRepo';
import type { ModulesKeyType } from 'src/moduleSources/modules';

const registryURL = `https://registry.terraform.io/v1/modules`;

function match(source: Path): ModulesKeyType | `` {
  return !startsWith(source, `/`) &&
    !startsWith(source, `./`) &&
    !startsWith(source, `../`) &&
    !startsWith(source, `git@`) &&
    !startsWith(source, `https://`)
    ? `terraformRegistry`
    : ``;
}

function stripGitPrefixFromRepoUrl(terraformRegistryGitUrl: Path): RetString {
  if (terraformRegistryGitUrl.includes(`git::`)) {
    return { success: true, value: terraformRegistryGitUrl.split(`git::`)[1] };
  }
  return { success: false, error: `Expected location '${terraformRegistryGitUrl}' to begin with 'git::'` };
}

function getRepoUrl(terraformRegistryGitUrl: Path): RetString {
  if (terraformRegistryGitUrl !== undefined) {
    return stripGitPrefixFromRepoUrl(terraformRegistryGitUrl);
  }
  return { success: false, error: `Attempt to retrieve location of repo from terraform registry returned undefined` };
}

async function getRegRepoUrl(downloadPointerUrl: Path, fetcher: (_: Config) => Response): Promise<RetString> {
  console.log(`getRegRepoUrl: ${downloadPointerUrl} | ${__dirname} ${fetcher}`);
  const useAxios = fetcher !== undefined ? fetcher : axios;
  try {
    const response = await useAxios({
      method: `get`,
      url: downloadPointerUrl,
    });
    if (response.status === 204) {
      const downloadUrl = response.headers[`x-terraform-get`];
      return getRepoUrl(downloadUrl);
    }
    return { success: false, error: `Expected status 204 from ${downloadPointerUrl}, recieved ${response.status}` };
  } catch (err) {
    return {
      success: false,
      error: `Exception ecountered fetching ${downloadPointerUrl} from terraform registry. ${JSON.stringify(err)}`,
    };
  }
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  const [ns, modName, provider] = source.split(`/`);
  return `${registryURL}/${ns || ``}/${modName || ``}/${provider || ``}/${version}/download`;
}

async function copyFromTerraformRegistry(params: Entry, dest: Path, fetcher: (_: Config) => Response): Promise<Status> {
  if (params.source.length === 0) {
    return Promise.resolve({
      success: false,
      contents: null,
      error: `Repo URL empty string`,
    });
  }
  const downloadPointerUrl = getRegDownloadPointerUrl(params.source, params.version || ``);
  console.log(`downloadPointerUrl: ${downloadPointerUrl} | ${dest}`);
  const regRepoUrl = await getRegRepoUrl(downloadPointerUrl, fetcher);
  console.log(`regRepoUrl: ${JSON.stringify(regRepoUrl)} | ${dest}`);
  if (regRepoUrl.success) {
    return cloneRepoToDest(regRepoUrl.value, dest);
  } else {
    return {
      success: false,
      contents: null,
      error: `Repo URL not found in Terraform registry. ${dest}`,
    };
  }
}

const acceptable = [`comment`, `source`, `version`];

function validate(params: Entry): boolean {
  let notFoundOrNotValid = false;
  const paramKeys = Object.keys(params);
  for (const param of paramKeys) {
    if (!acceptable.includes(param)) {
      notFoundOrNotValid = true;
    }
  }
  return notFoundOrNotValid;
}

export default { match, fetch: copyFromTerraformRegistry, validate };
