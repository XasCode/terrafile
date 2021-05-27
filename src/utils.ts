import * as fsHelpers from 'src/fsHelpers';
import { CliOptions, Option } from 'src/types';

function validOptions(options: CliOptions, fileOrFolder: Option): boolean {
  return (
    typeof options === `object` &&
    options !== null &&
    Object.keys(options).includes(fileOrFolder) &&
    fsHelpers.getAbsolutePath(options[fileOrFolder]) !== undefined
  );
}

function startsWith(str: string, start: string): boolean {
  return start === str.slice(0, start.length);
}

export { validOptions, startsWith };
