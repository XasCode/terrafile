import { Entry, Path, Status, Config, ExecResult, RetString } from 'src/shared/types';
import { cloneRepoToDest } from 'src/backend/moduleSources/common/cloneRepo';

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
  return `${beforeGit}${source.includes(`.git`) ? `.git` : ``}${beforePathSep}${newPath}${newQrefPart}`;
}

async function fetch(
  params: Entry,
  dest: Path,
  _fetcher: (_: Config) => Promise<RetString>,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<Status> {
  const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
  const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
  return cloneRepoToDest(regRepoUrl, dest, cloner);
}

const testable = {
  replacePathIfPathParam,
  replaceUrlVersionIfVersionParam,
};

export { fetch, testable, replaceUrlVersionIfVersionParam, replacePathIfPathParam };