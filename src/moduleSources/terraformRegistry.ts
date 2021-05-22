import axios from 'axios';
import { startsWith } from '../utils';
import {
  Entry, Path, RetString, Status,
} from '../types';
import { cloneRepoToDest } from './common/cloneRepo';
import type { ModulesKeyType } from './modules';

const registryURL = `https://registry.terraform.io/v1/modules`;

function match(source: Path): ModulesKeyType | `` {
  return !startsWith(source, `/`)
    && !startsWith(source, `./`)
    && !startsWith(source, `../`)
    && !startsWith(source, `git@`)
    && !startsWith(source, `https://`)
    ? `terraformRegistry`
    : ``;
}

function stripGitPrefixFromRepoUrl(terraformRegistryGitUrl: Path): RetString {
  if (terraformRegistryGitUrl.includes(`git::`)) {
    return { success: true, value: terraformRegistryGitUrl.split(`git::`)[1] };
  }
  return { success: false, error: `Expected location '${terraformRegistryGitUrl}' to begin with 'git::'` };
}

function getRepoUrl(terraformRegistryGitUrl: Path):RetString {
  if (terraformRegistryGitUrl !== undefined) {
    return stripGitPrefixFromRepoUrl(terraformRegistryGitUrl);
  }
  return { success: false, error: `Attempt to retrieve location of repo from terraform registry returned undefined` };
}

async function getRegRepoUrl(downloadPointerUrl: Path): Promise<RetString> {
  try {
    const response = await axios({
      method: `get`,
      url: downloadPointerUrl,
    });
    if (response.status === 204) {
      const downloadUrl = response.headers[`x-terraform-get`];
      return getRepoUrl(downloadUrl);
    }
    return { success: false, error: `Expected status 204 from ${downloadPointerUrl}, recieved ${response.status}` };
  } catch (err) {
    return { success: false, error: `Exception ecountered fetching ${downloadPointerUrl} from terraform registry.` };
  }
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  const [ns, modName, provider] = source.split(`/`);
  return `${registryURL}/${ns || ``}/${modName || ``}/${provider || ``}/${version}/download`;
}

async function copyFromTerraformRegistry(
  params: Entry,
  dest: Path,
): Promise<Status> {
  const downloadPointerUrl = getRegDownloadPointerUrl(
    params.source,
    params.version || ``,
  );
  const regRepoUrl = await getRegRepoUrl(downloadPointerUrl);
  return regRepoUrl.success
    ? cloneRepoToDest(regRepoUrl.value, dest)
    : {
      success: false,
      contents: null,
      // eslint-disable-next-line max-len
      error: `Repo URL not found in Terraform registry. ${dest}`,
    };
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
