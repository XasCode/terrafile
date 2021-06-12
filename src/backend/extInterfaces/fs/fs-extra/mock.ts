import { CopyOptionsSync, Mode } from 'fs-extra';
import { PathLike, StatOptions } from 'node:fs';
import fs from 'src/backend/extInterfaces/fs/fs-extra';
import mkdirpImport from 'mkdirp';
import rimrafImport from 'rimraf';
import touchImport from 'touch';

function existsSync(path: PathLike) {
  return fs.existsSync(path);
}

function lstatSync(path: PathLike, options?: StatOptions & { bigint?: false }) {
  return fs.lstatSync(path, options);
}

function chmodSync(path: PathLike, mode: Mode) {
  return fs.chmodSync(path, mode);
}

function renameSync(oldPath: PathLike, newPath: PathLike) {
  return fs.renameSync(oldPath, newPath);
}

function readFileSync(path: number | PathLike, options?: { encoding?: null; flag?: string }) {
  return fs.readFileSync(path, options);
}

function copySync(src: string, dest: string, options?: CopyOptionsSync) {
  return fs.copySync(src, dest, options);
}

function mkdirp(dir: string, opts?: mkdirpImport.Mode | mkdirpImport.OptionsSync) {
  return fs.mkdirp(dir, opts);
}

function rimraf(path: string, options?: rimrafImport.Options) {
  return fs.rimraf(path, options);
}

function touch(filename: string, options?: touchImport.Options) {
  return fs.touch(filename, options);
}

export default { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, mkdirp, rimraf, touch };
