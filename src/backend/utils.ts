import * as fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import { CliOptions, Option } from 'src/shared/types';

function validOptions(options: CliOptions, fileOrFolder: Option): boolean {
  return (
    typeof options === `object` &&
    options !== null &&
    Object.keys(options).includes(fileOrFolder) &&
    fsHelpers.getAbsolutePath(options[fileOrFolder]) !== undefined
  );
}

export { validOptions };
