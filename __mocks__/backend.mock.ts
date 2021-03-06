import chalk from 'chalk';
import { CliOptions } from '../src/shared/types';

function install(options: CliOptions): void {
  // console.log(`${JSON.stringify(options)}`);
  console.log(chalk.blue(`Plan: (${options.file}) --> (${options.directory})`));
}

export { install };
