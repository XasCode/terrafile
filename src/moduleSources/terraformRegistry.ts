import axios from 'axios';
import { startsWith } from 'src/utils';
import { Entry, Path, RetString, Status, Config, RetVal } from 'src/types';
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

async function myFetcher({ url }: Record<string, string>): Promise<RetString> {
  let response;
  try {
    response = await useAxios({
      method: `get`,
      url,
    });
    if (response.status !== 204) {
      return { success: false, error: `Expected status 204 from ${url}, recieved ${response.status}` };
    } else if (response.headers === undefined || response.headers[`x-terraform-get`] === undefined) {
      return { success: false, error: `Response from ${url} did not include 'x-terraform-get' header.` };
    }
    return { success: true, error: null, value: response.headers[`x-terraform-get`] };
  } catch (err) {
    return {
      success: false,
      error: `Exception ecountered fetching ${url} from terraform registry. ${JSON.stringify(err)}`,
    };
  }
}

async function getRegRepoUrl(downloadPointerUrl: Path, fetcher: (_: Config) => Promise<RetString>): Promise<RetString> {
  console.log(`getRegRepoUrl: ${downloadPointerUrl} | ${__dirname} ${fetcher}`);
  const fetcherResult = await myFetcher({ url: downloadPointerUrl });
  if (fetcherResult.success) {
    return getRepoUrl(fetcherResult.value);
  }
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  const [ns, modName, provider] = source.split(`/`);
  return `${registryURL}/${ns || ``}/${modName || ``}/${provider || ``}/${version}/download`;
}

async function copyFromTerraformRegistry(
  params: Entry,
  dest: Path,
  fetcher: (_: Config) => Promise<RetString>,
  _cloner: (_: Config) => Promise<RetVal>,
): Promise<Status> {
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
