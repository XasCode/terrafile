import { startsWith } from '../utils';
import { Entry, Path, Status } from '../types';
import fs from 'fs-extra';
import * as fsHelpers from '../fsHelpers';
import { ModulesKeyType } from './modules';

function match(source: Path): ModulesKeyType | '' {
  return startsWith(source, '/') ||
    startsWith(source, './') ||
    startsWith(source, '../')
    ? 'local'
    : '';
}

function copyAbs(src: Path, dest: Path): Status {
  const retVal = { success: true, contents: undefined, error: null } as Status;
  try {
    fs.copySync(src, dest, { overwrite: false, errorOnExist: true });
  } catch (err) {
    retVal.success = false;
    retVal.contents = null;
    retVal.error = `Error copying absolute from '${src}' to '${dest}'`;
  }
  return retVal;
}

function copyFromLocalDir(params: Entry, dest: Path): Status {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from local dir`,
  } as Status;
  const src = fsHelpers.getAbsolutePath(params.source);
  if (fsHelpers.checkIfDirExists(src)) {
    return copyAbs(src, dest);
  }
  console.error('error');
  return retVal;
}

export default { match, fetch: copyFromLocalDir };
