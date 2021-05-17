import * as fsHelpers from './fsHelpers';
import { CliOptions, Path } from './types';

// TODO: stop using this, instead use createTargetDirectory
function createInstallDirectory(dir: Path): Path {
  const dirToCreate = fsHelpers.getAbsolutePath(dir);
  const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
  fsHelpers.checkIfDirExists(dirToCreate);
  return createdDirsStartingAt;
}

function install(options: CliOptions): void {
  createInstallDirectory(options.directory);
  console.log(`${JSON.stringify(options)}`);
}

export { install };
