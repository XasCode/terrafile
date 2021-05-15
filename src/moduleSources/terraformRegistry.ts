import { startsWith } from '../utils';
import { Entry, Path, Status } from '../types';
import axios from 'axios';
import { cloneRepoToDest } from './common/cloneRepo';
import { ModulesKeyType } from './modules';

function match(source: Path): ModulesKeyType | '' {
  return !startsWith(source, '/') &&
    !startsWith(source, './') &&
    !startsWith(source, '../') &&
    !startsWith(source, 'git@') &&
    !startsWith(source, 'https://')
    ? 'terraformRegistry'
    : '';
}

////////////

const registryURL = 'https://registry.terraform.io/v1/modules';

function getRepoUrl(terraformRegistryGitUrl: Path) {
  return terraformRegistryGitUrl.split('git::')[1];
}

async function getRegRepoUrl(downloadPointerUrl: Path): Promise<Path> {
  try {
    const response = await axios({
      method: 'get',
      url: downloadPointerUrl,
    });
    if (response.status === 204) {
      const downloadUrl = response.headers['x-terraform-get'];
      return getRepoUrl(downloadUrl);
    } else {
      console.log('!204');
    }
  } catch (err) {
    console.error(`Error fetching download URL from terraform registry.`);
  }
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  const [ns, modName, provider] = source.split('/');
  const registryDownloadUrl = `${registryURL}/${ns || ''}/${modName || ''}/${
    provider || ''
  }/${version}/download`;
  return registryDownloadUrl;
}

async function copyFromTerraformRegistry(
  params: Entry,
  dest: Path
): Promise<Status> {
  const downloadPointerUrl = getRegDownloadPointerUrl(
    params.source,
    params.version || ''
  );
  const regRepoUrl = await getRegRepoUrl(downloadPointerUrl);
  return regRepoUrl
    ? await cloneRepoToDest(regRepoUrl, dest)
    : {
        success: false,
        contents: null,
        // eslint-disable-next-line max-len
        error: `Repo URL not found in Terraform registry. ${dest}`,
      };
}

const acceptable = ['comment', 'source', 'version'];

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
