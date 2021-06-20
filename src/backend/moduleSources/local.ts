import { startsWith } from 'src/backend/moduleSources/common/startsWith';
import { Path, Status, FetchParams } from 'src/shared/types';
import fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import type { ModulesKeyType } from 'src/backend/moduleSources';
import Validate from 'src/backend/moduleSources/common/validate';

function match(source: Path): ModulesKeyType | `` {
  return startsWith(source, `/`) || startsWith(source, `./`) || startsWith(source, `../`) ? `local` : ``;
}

function copyFromLocalDir({ params, dest }: FetchParams): Status {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from local dir`,
  } as Status;
  const src = fsHelpers.getAbsolutePath(params.source).value;
  if (fsHelpers.checkIfDirExists(src).value) {
    const copyResult = fsHelpers.copyDirAbs(src, dest);
    retVal.success = copyResult.success;
    retVal.contents = [params as [string, Record<string, string>]];
    retVal.error = copyResult.error;
  }
  return retVal;
}

const acceptable = [`comment`, `source`];

const validate = Validate(acceptable);

export default { match, fetch: copyFromLocalDir, validate };
