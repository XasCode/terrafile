import { CliOptions } from '../src/shared/types';

function install(options: CliOptions): void {
  console.log(`${JSON.stringify(options)}`);
}

export { install };
