import { Entry, Path, Status } from '../../types';
import { cloneRepoToDest } from './cloneRepo';

function replaceUrlVersionIfVersionParam(source: Path, version: string): Path {
  return version ? [source.split(`?ref=`)[0], version].join(`?ref=`) : source;
}

function replacePathIfPathParam(source: Path, repoPath: Path): Path {
  const [beforeGit, afterGit] = source.split(`.git`);
  const newAfterGit = afterGit || ``;
  const [beforeQref, afterQref] = newAfterGit.split(`?ref=`);
  const newQrefPart = afterQref ? `?ref=${afterQref}` : ``;
  const [beforePathSep, afterPathSep] = beforeQref.split(`//`);
  const newPathPart = afterPathSep ? `//${afterPathSep}` : ``;
  const newPath = repoPath ? `/${repoPath}` : newPathPart;
  return `${beforeGit}${
    source.includes(`.git`) ? `.git` : ``
  }${beforePathSep}${newPath}${newQrefPart}`;
}

async function fetch(params: Entry, dest: Path): Promise<Status> {
  const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
  const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
  return cloneRepoToDest(regRepoUrl, dest);
}

const testable = {
  replacePathIfPathParam,
  replaceUrlVersionIfVersionParam,
};

export { fetch, testable };
