import { startsWith } from 'src/backend/moduleSources/common/startsWith';
import { Entry, Path, RetString, Status, Config, ExecResult } from 'src/shared/types';
import { cloneRepoToDest } from 'src/backend/moduleSources/common/cloneRepo';
import type { ModulesKeyType } from 'src/backend/moduleSources/modules';
import axiosFetcher from 'src/backend/extInterfaces/fetcher/axios';

const defaultAxiosFetcher = axiosFetcher.use(axiosFetcher.default);

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
  return {
    success: false,
    error: `Attempt to retrieve location of repo from terraform registry returned undefined, may be missing 'x-terraform-get' header.`,
  };
}

async function getRegRepoUrl(downloadPointerUrl: Path, fetcher: (_: Config) => Promise<RetString>): Promise<RetString> {
  console.log(`getRegRepoUrl: ${downloadPointerUrl} | ${__dirname}`);
  const useFetcher = fetcher ? fetcher : defaultAxiosFetcher;
  const fetcherResult = await useFetcher({ url: downloadPointerUrl });
  if (fetcherResult.success) {
    return getRepoUrl(fetcherResult.value);
  }
  return fetcherResult;
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  // https://www.terraform.io/docs/internals/module-registry-protocol.html
  const [namespace, name, system] = source.split(`/`);
  return `${registryURL}/${namespace}/${name}/${system}/${version}/download`;
}

async function copyFromTerraformRegistry(
  params: Entry,
  dest: Path,
  fetcher: (_: Config) => Promise<RetString>,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
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
    return cloneRepoToDest(regRepoUrl.value, dest, cloner);
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
