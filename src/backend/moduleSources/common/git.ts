import { Entry, Path, Status, Config, ExecResult, RetString } from 'src/shared/types';
import { cloneRepoToDest } from 'src/backend/moduleSources/common/cloneRepo';
import type { ModulesKeyType } from 'src/backend/moduleSources';
import { startsWith } from 'src/backend/moduleSources/common/startsWith';

function Git(acceptable?: string[], matchStart?: string, sourceType?: ModulesKeyType) {
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

  function match(source: Path): ModulesKeyType | `` {
    return startsWith(source, matchStart) ? sourceType : ``;
  }

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

  return { fetch, match, validate, testable, replaceUrlVersionIfVersionParam, replacePathIfPathParam };
}

export default Git;
