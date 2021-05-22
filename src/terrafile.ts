#!/usr/bin/env node
import { Command, Option } from 'commander';
import * as backend from './backend';
import { version } from '../package.json';
import { Backend } from './types';

function main(myargs: string[], be?: Backend): void {
  const program = new Command();
  program
    .version(version, `-V, --version`, `Show version information for terrafile`)
    .description(`Manage vendored modules using a JSON file.`)
    .command(`install`)
    .description(`Installs the files in your terrafile.json`)
    .action((options) => (be === undefined ? backend.install(options) : be.install(options)))
    .addOption(new Option(`-d, --directory <string>`, `module directory`).default(`vendor/modules`))
    .addOption(new Option(`-f, --file <string>`, `config file`).default(`terrafile.json`));

  try {
    program.parse(myargs);
  } catch (err) {
    // swallow the error
  }
}

/* istanbul ignore if */
if (require.main === module) {
  main(process.argv);
}

export { main };
