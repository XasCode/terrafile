import { CopyOptionsSync, Mode } from 'fs-extra';
import { PathLike, StatOptions, Stats } from 'node:fs';
import fs from 'src/backend/extInterfaces/fs/fs-extra';
import mkdirpImport from 'mkdirp';
import rimrafImport from 'rimraf';
import touchImport from 'touch';

function existsSync(path: PathLike): boolean {
  return fs.existsSync(path);
}

function lstatSync(path: PathLike, options?: StatOptions & { bigint?: false }): Stats {
  return fs.lstatSync(path, options);
}

function chmodSync(path: PathLike, mode: Mode): void {
  return fs.chmodSync(path, mode);
}

function renameSync(oldPath: PathLike, newPath: PathLike): void {
  return fs.renameSync(oldPath, newPath);
}

function readFileSync(path: number | PathLike, options?: { encoding?: null; flag?: string }): Buffer {
  return fs.readFileSync(path, options);
}

function copySync(src: string, dest: string, options?: CopyOptionsSync): void {
  return fs.copySync(src, dest, options);
}

function mkdirp(dir: string, opts?: mkdirpImport.Mode | mkdirpImport.OptionsSync): string {
  return fs.mkdirp(dir, opts);
}

function rimraf(path: string, options?: rimrafImport.Options): void {
  return fs.rimraf(path, options);
}

function touch(filename: string, options?: touchImport.Options): void {
  return fs.touch(filename, options);
}

export default { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, mkdirp, rimraf, touch };
