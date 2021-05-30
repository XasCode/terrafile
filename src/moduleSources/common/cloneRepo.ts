import { ExecResult, Path, RepoLocation, SourceParts, Status } from 'src/types';
import { git } from 'src/run';

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
  console.error(`Source parts: ${source}`);
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
  const httpsRepo = repo.includes('git@github.com:') ? repo.replace('git@github.com:', 'https://github.com/') : repo;
  const cloneCmd = [
    `clone`,
    ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
    ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
    `${httpsRepo}`,
    fullDest,
  ];
  return git(cloneCmd);
}

async function scopeRepo([, repoDir]: RepoLocation, fullDest: Path): Promise<ExecResult> {
  const sparseCmd = [`sparse-checkout`, `set`, repoDir.slice(1)];
  if (repoDir) {
    return git(sparseCmd, fullDest);
  }
  return {} as ExecResult;
}

async function checkoutCommit([, , , commit]: RepoLocation, fullDest: Path): Promise<ExecResult> {
  const commitCmd = [`checkout`, commit];
  if (commit) {
    return git(commitCmd, fullDest);
  }
  return {} as ExecResult;
}

async function cloneRepoToDest(repoUrl: Path, fullDest: Path): Promise<Status> {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from terraform registry ${repoUrl} - ${fullDest}`,
  } as Status;
  // console.error(`before getPartsFromHttp: ${repoUrl} ${fullDest}`);
  const [a, b, c, d]: RepoLocation = getPartsFromHttp(repoUrl);
  // console.error(`after getPartsFromHttp: ${a}, ${b}, ${c}, ${d} - ${fullDest}`);
  const results1 = await cloneRepo([a, b, c, d], fullDest);
  const results2 = await scopeRepo([a, b, c, d], fullDest);
  const results3 = await checkoutCommit([a, b, c, d], fullDest);
  if (!results1.error && !results2.error && !results3.error) {
    retVal.success = true;
    retVal.error = null;
    delete retVal.contents;
  }
  // retVal.error = `${results1.error}, ${results2.error}, ${results3.error}`;
  return retVal;
}

export { cloneRepoToDest, getPartsFromHttp };
