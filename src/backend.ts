import * as fsHelpers from './fsHelpers';
import { readFileContents } from './processFile';
import { restoreDirectory } from './restore';
import { CliOptions, Path, Status } from './types';
import { createTargetDirectory } from './venDir';

// TODO: stop using this, instead use createTargetDirectory
// function createInstallDirectory(dir: Path): Path {
//   const dirToCreate = fsHelpers.getAbsolutePath(dir);
//   const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
//   fsHelpers.checkIfDirExists(dirToCreate);
//   return createdDirsStartingAt;
// }

async function install(options: CliOptions): Promise<void> {
  // createInstallDirectory(options.directory);
  const createResult = createTargetDirectory(options);
  console.log(`${JSON.stringify(options)}`);
  if (!createResult.success) {
    if (createResult.saved !== null) {
      restoreDirectory(options.directory);
      return;
    }
  }
  await readFileContents(options);
  //restoreDirectory(options.directory);
}

export { install };
