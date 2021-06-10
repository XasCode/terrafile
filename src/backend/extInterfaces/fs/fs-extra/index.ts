import { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync } from 'fs-extra';
import { sync as mkdirp } from 'mkdirp';
import { sync as rimraf } from 'rimraf';
import { sync as touch } from 'touch';

export default { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, mkdirp, rimraf, touch };
