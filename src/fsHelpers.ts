import * as fs from "fs";
import { sync as mkdirp } from "mkdirp";
import { sync as rimraf } from "rimraf";
import { sync as touch } from "touch";
import * as path from "path";
import { Path } from "./types";

function checkIfFileExists(filePath: Path): boolean {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
}

function checkIfDirExists(dir: Path): boolean {
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
}

function getAbsolutePath(dir: Path): Path {
  try {
    if (dir.match(/^[a-zA-Z0-9\-_./:\\]+$/g) === null) {
      throw Error(`Dir contains unsupported characters. Received ${dir}.`);
    }
    return path.normalize(path.resolve(dir));
  } catch (err) {
    console.error(`Error resolving path: ${dir}`);
  }
}

function createDir(dir: Path): Path {
  try {
    if (dir === undefined || getAbsolutePath(dir) !== dir) {
      throw Error(
        `Function "createDir" expected an absolute path. Recieved "${dir}".`
      );
    }
    return mkdirp(dir);
  } catch (err) {
    console.error(`Error creating dir: ${dir}`);
  }
}

function touchFile(filePath: Path, perms: number): void {
  touch(filePath);
  if (perms !== undefined) {
    fs.chmodSync(filePath, perms);
  }
}

function rimrafDir(dir: Path): Path {
  const absPath = getAbsolutePath(dir);
  if (absPath !== undefined && checkIfDirExists(dir)) {
    rimraf(dir, { maxBusyTries: 3000 });
    return dir;
  } else {
    console.error(`Error deleting dir: ${dir}`);
  }
}

function abortDirCreation(dir: Path): void {
  if (dir !== null && checkIfDirExists(dir)) {
    console.error(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        dir
      )}`
    );
    rimrafDir(dir);
  } else {
    console.error(`Cleaning up due to abort, no directory to clean up.`);
  }
}

function renameDir(oldPath: Path, newPath: Path): void {
  try {
    fs.renameSync(oldPath, newPath);
    console.log("Successfully renamed the directory.");
  } catch (err) {
    console.error(err.code);
  }
}

export {
  checkIfFileExists,
  checkIfDirExists,
  getAbsolutePath,
  createDir,
  touchFile,
  rimrafDir,
  abortDirCreation,
  renameDir,
};
