import * as fsHelpers from './fsHelpers';
import { CliOptions, Option } from './types';

function validOptions(options: CliOptions, fileOrFolder: Option): boolean {
  return (
    typeof options === 'object' &&
    options !== null &&
    Object.keys(options).includes(fileOrFolder) &&
    fsHelpers.getAbsolutePath(options[fileOrFolder]) !== undefined
  );
}

export { validOptions };
