import { CliOptions } from '../src/types';

function install(options: CliOptions): void {
  console.log(`${JSON.stringify(options)}`);
}

export { install };