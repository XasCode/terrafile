import fs from 'src/backend/extInterfaces/fs/fs-extra';
import path from 'path';
import { Path, RetBool, RetPath, RetString, RetVal, Status } from 'src/shared/types';

export function checkIfFileExists(filePath: Path): RetBool {
  if (!fs.existsSync(filePath)) {
    return {
      success: true,
      value: false,
      error: null,
    };
  } else if (!fs.lstatSync(filePath).isFile()) {
    return {
      success: false,
      value: false,
      error: `checkIfFileExists: '${filePath}' is not a file.`,
    };
  } else {
    return {
      success: true,
      value: true,
      error: null,
    };
  }
}

export function checkIfDirExists(dir: Path): RetBool {
  if (!fs.existsSync(dir)) {
    return {
      success: true,
      value: false,
      error: null,
    };
  } else if (!fs.lstatSync(dir).isDirectory()) {
    return {
      success: false,
      value: false,
      error: `checkIfDirExists: '${dir}' is not a directory.`,
    };
  } else {
    return {
      success: true,
      value: true,
      error: null,
    };
  }
}

export function getAbsolutePath(dir: Path): RetPath {
  try {
    if (dir.match(/^[\.a-zA-Z0-9\-_src/:\\]+$/g) === null) {
      throw Error(`Dir contains unsupported characters. Received ${dir}.`);
    }
    const absPath = path.normalize(path.resolve(dir));
    return {
      success: true,
      value: absPath,
      error: null,
    };
  } catch (err) {
    console.error(`Error resolving path: ${dir}`);
    return {
      success: false,
      value: undefined,
      error: `Error resolving path: '${dir}'. Received error: '${err}'`,
    };
  }
}

export function createDir(dir: Path): RetPath {
  try {
    if (dir === undefined || getAbsolutePath(dir).value !== dir) {
      throw Error(`Function "createDir" expected an absolute path. Recieved "${dir}".`);
    }
    return {
      success: true,
      value: fs.mkdirp(dir),
      error: null,
    };
  } catch (err) {
    console.error(`Error creating dir: ${dir}`);
    return {
      success: false,
      value: undefined,
      error: `Error creating dir: '${dir}'`,
    };
  }
}

export function touchFile(filePath: Path, perms?: number): RetVal {
  fs.touch(filePath);
  if (perms !== undefined) {
    fs.chmodSync(filePath, perms);
  }
  return {
    success: true,
    error: null,
  };
}

export function rimrafDir(dir: Path): RetPath {
  const absPath = getAbsolutePath(dir).value;
  if (absPath !== undefined && checkIfDirExists(dir).value) {
    fs.rimraf(dir, { maxBusyTries: 3000 });
    return {
      success: true,
      value: dir,
      error: null,
    };
  }
  console.error(`Error deleting dir: ${dir}`);
  return {
    success: false,
    value: undefined,
    error: `Error deleting dir: '${dir}'`,
  };
}

export function rimrafDirs(dirs: Path[]): RetPath[] {
  return dirs.map((dir) => rimrafDir(getAbsolutePath(dir).value));
}

export function abortDirCreation(dir: Path): void {
  if (dir !== null && checkIfDirExists(dir).value) {
    console.error(`Cleaning up due to abort, directories created starting at: ${JSON.stringify(dir)}`);
    rimrafDir(dir);
  } else {
    console.error(`Cleaning up due to abort, no directory to clean up.`);
  }
}

export function renameDir(oldPath: Path, newPath: Path): RetString {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true, value: `Successfully renamed the directory.` };
  } catch (err) {
    console.error(err.code);
    return { success: false, error: `renameDir from '${oldPath}' to '${newPath} failed.` };
  }
}

export function readFile(dir: Path): string {
  return fs.readFileSync(getAbsolutePath(dir).value, `utf-8`);
}

export function copyDirAbs(src: Path, dest: Path): Status {
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

export default {
  getAbsolutePath,
  abortDirCreation,
  checkIfDirExists,
  copyDirAbs,
  createDir,
  renameDir,
  rimrafDir,
  rimrafDirs,
  checkIfFileExists,
  readFile,
  touchFile,
};
