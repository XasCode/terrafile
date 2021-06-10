import { readFileContents } from 'src/backend/processFile';
import { restoreDirectory } from 'src/backend/restore';
import { CliOptions } from 'src/shared/types';
import { createTargetDirectory } from 'src/backend/venDir';

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
