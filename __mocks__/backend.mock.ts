import chalk from '@xascode/chalk';
import { CliOptions } from '@jestaubach/terrafile-backend-lib';

function install(options: CliOptions): void {
  console.log(chalk.blue(`Plan: (${options.file}) --> (${options.directory})`));
}

export { install };
