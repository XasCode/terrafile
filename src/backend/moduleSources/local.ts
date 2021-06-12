import { startsWith } from 'src/backend/moduleSources/common/startsWith';
import { Entry, Path, Status, Config, ExecResult, RetString } from 'src/shared/types';
import fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import type { ModulesKeyType } from 'src/backend/moduleSources';

function match(source: Path): ModulesKeyType | `` {
  return startsWith(source, `/`) || startsWith(source, `./`) || startsWith(source, `../`) ? `local` : ``;
}

function copyFromLocalDir(
  params: Entry,
  dest: Path,
  _fetcher: (_: Config) => Promise<RetString>,
  _cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Status {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from local dir`,
  } as Status;
  const src = fsHelpers.getAbsolutePath(params.source).value;
  if (fsHelpers.checkIfDirExists(src).value) {
    return fsHelpers.copyDirAbs(src, dest);
  }
  return retVal;
}

const acceptable = [`comment`, `source`];

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

export default { match, fetch: copyFromLocalDir, validate };
