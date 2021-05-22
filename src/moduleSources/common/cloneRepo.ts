import { ExecResult, Path, RepoLocation, SourceParts, Status } from '../../types';
import { git } from '../../run';

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

async function cloneRepo([repo, repoDir, branchOrTag]: RepoLocation, fullDest: Path): Promise<ExecResult> {
  const cloneCmd = [
    `clone`,
    ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
    ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
    `${repo}.git`,
    fullDest,
  ];
  const results = await git(cloneCmd);
  return results;
}

async function scopeRepo([, repoDir]: RepoLocation, fullDest: Path): Promise<ExecResult> {
  const sparseCmd = [`sparse-checkout`, `set`, repoDir];
  const results = await (repoDir ? git(sparseCmd, fullDest) : ({} as ExecResult));
  return results;
}

async function checkoutCommit([, , , commit]: RepoLocation, fullDest: Path): Promise<ExecResult> {
  const commitCmd = [`checkout`, commit];
  const results = await (commit ? git(commitCmd, fullDest) : ({} as ExecResult));
  return results;
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
  if (!results1.error && !results2.error && !results3.error) {
    retVal.success = true;
    retVal.error = null;
    delete retVal.contents;
  }
  return retVal;
}

export { cloneRepoToDest };
