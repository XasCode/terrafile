import { readFileContents } from 'src/processFile';
import { restoreDirectory } from 'src/restore';
import { CliOptions } from 'src/types';
import { createTargetDirectory } from 'src/venDir';

async function install(options: CliOptions): Promise<void> {
  const createResult = createTargetDirectory(options);
  console.log(`${JSON.stringify(options)}`);
  if (!createResult.success) {
    if (createResult.saved !== null) {
      restoreDirectory(options.directory);
    }
    return;
  }
  const retVals = await readFileContents(options);
  if (!retVals.success) {
    if (createResult.saved !== null) {
      restoreDirectory(options.directory);
    }
  }
}

export { install };
