import { ExecResult, Path, RepoLocation, SourceParts, Status } from 'src/shared/types';
import gitCloner from 'src/backend/extInterfaces/cloner/git';

const defaultGitCloner = gitCloner.use(gitCloner.default);

function determineRef(ref: string): string[] {
  const commit = ref;
  const branchOrTag = ref;
  return ref?.length === 40 ? [``, commit] : [branchOrTag, ``];
}

function insertGit(source: Path): Path {
  const parts = source.split(`?ref=`);
  return parts.length < 2 || source.includes(`.git`) ? source : [parts[0], `.git`, `?ref=`, ...parts.slice(1)].join(``);
}

function sourceParts(source: Path): SourceParts {
  const tempSource = insertGit(source);
  const [beforeGit, afterGit] = tempSource.split(`.git`);
  const newSource = `${beforeGit}${source.includes(`.git`) ? `.git` : ``}`;
  const newAfterGit = afterGit || ``;
  const [beforeQref, afterQref] = newAfterGit.split(`?ref=`);
  const [, afterPathSep] = beforeQref.split(`//`);
  const newPathPart = afterPathSep ? `//${afterPathSep}` : ``;
  return [newSource, newPathPart, afterQref];
}

function getPartsFromHttp(source: Path): RepoLocation {
  const [repo, repoDir, ref] = sourceParts(source);
  const [branchOrTag, commit] = determineRef(ref);
  return [repo, repoDir, branchOrTag, commit];
}

async function cloneRepo(
  [repo, repoDir, branchOrTag]: RepoLocation,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<ExecResult> {
  const cloneCmd = [
    `clone`,
    ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
    ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
    `${repo}`,
    fullDest,
  ];
  return cloner(cloneCmd);
}

async function scopeRepo(
  [, repoDir]: RepoLocation,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<ExecResult> {
  const sparseCmd = [`sparse-checkout`, `set`, repoDir.slice(1)];
  if (repoDir) {
    return cloner(sparseCmd, fullDest);
  }
  return {} as ExecResult;
}

async function checkoutCommit(
  [, , , commit]: RepoLocation,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<ExecResult> {
  const commitCmd = [`checkout`, commit];
  if (commit) {
    return cloner(commitCmd, fullDest);
  }
  return {} as ExecResult;
}

async function cloneRepoToDest(
  repoUrl: Path,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<Status> {
  const retVal = {
    success: false,
    contents: null,
    error: `Error cloning repo to destination ${repoUrl} - ${fullDest}`,
  } as Status;
  const useCloner = cloner || defaultGitCloner;
  const [a, b, c, d]: RepoLocation = getPartsFromHttp(repoUrl);
  const successful =
    !(await cloneRepo([a, b, c, d], fullDest, useCloner)).error &&
    !(await scopeRepo([a, b, c, d], fullDest, useCloner)).error &&
    !(await checkoutCommit([a, b, c, d], fullDest, useCloner)).error;
  if (successful) {
    retVal.success = true;
    retVal.error = null;
    delete retVal.contents;
  }
  return retVal;
}

export { cloneRepoToDest, getPartsFromHttp };
