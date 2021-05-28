import { readFileContents } from 'src/processFile';
import { restoreDirectory } from 'src/restore';
import { CliOptions, Path, Status } from 'src/types';
import { createTargetDirectory } from 'src/venDir';

// TODO: stop using this, instead use createTargetDirectory
// function createInstallDirectory(dir: Path): Path {
//   const dirToCreate = fsHelpers.getAbsolutePath(dir);
//   const createdDirsStartingAt = fsHelpers.createDir(dirToCreate);
//   fsHelpers.checkIfDirExists(dirToCreate);
//   return createdDirsStartingAt;
// }

async function install(options: CliOptions): Promise<void> {
  const createResult = createTargetDirectory(options);
  console.log(`${JSON.stringify(options)}`);
  if (!createResult.success) {
    if (createResult.saved !== null) {
      restoreDirectory(options.directory);
      return;
    }
  }
  await readFileContents(options);
}

export { install };
