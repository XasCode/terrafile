import { readFileContents } from 'src/backend/processFile';
import { restoreDirectory } from 'src/backend/restore';
import { CliOptions } from 'src/shared/types';
import { createTargetDirectory } from 'src/backend/venDir';
import chalk from 'chalk';

async function install(options: CliOptions): Promise<void> {
  console.log(chalk.blue(`Plan: (${options.file}) --> (${options.directory})`));
  const createResult = createTargetDirectory(options);
  if (!createResult.success) {
    console.error(chalk.red(`  ! Failed - create target directory: ${options.directory}`));
    if (createResult.saved !== null) {
      console.error(chalk.blue(`    Restoring ${options.directory}`));
      restoreDirectory(options.directory);
    }
    return;
  }
  console.log(chalk.green(`  + Success - create target directory: ${options.directory}`));
  const retVals = await readFileContents(options);
  if (!retVals.success) {
    console.log(chalk.red(`  ! Failed - process terrafile: ${options.file}`));
    if (createResult.saved !== null) {
      console.log(chalk.blue(`    Restoring ${options.directory}`));
      restoreDirectory(options.directory);
    }
    return;
  }
  console.log(chalk.green(`  + Success - process terrafile: ${options.file}`));
}

export { install };
