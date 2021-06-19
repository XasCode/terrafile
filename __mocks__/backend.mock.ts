import { CliOptions } from '../src/shared/types';
import chalk from 'chalk';

function install(options: CliOptions): void {
  //console.log(`${JSON.stringify(options)}`);
  console.log(chalk.blue(`Plan: (${options.file}) --> (${options.directory})`));
}

export { install };
