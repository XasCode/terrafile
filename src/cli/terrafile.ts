#!/usr/bin/env node
import { Command, Option } from 'commander';
import { install, Backend } from '@jestaubach/terrafile-backend-lib';
import fsh from '@jestaubach/fs-helpers';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const version = configversion;

const fsHelpers = fsh.use(fsh.default);
const backend = { install };

function main(myargs: string[], be?: Backend): void {
  const program = new Command();
  program
    .version(version, `-V, --version`, `Show version information for terrafile`)
    .description(`Manage vendored modules using a JSON file.`)
    .command(`install`)
    .description(`Installs the files in your terrafile.json`)
    .action((options): void => {
      if (be === undefined) {
        backend.install({ ...options, fsHelpers });
        return;
      }
      be.install({ ...options, fsHelpers });
    })
    .addOption(new Option(`-d, --directory <string>`, `module directory`).default(`vendor/modules`))
    .addOption(new Option(`-f, --file <string>`, `config file`).default(`terrafile.json`));
  try {
    program.parse(myargs);
  } catch {
    // swallow the error
  }
}

function runIfMain(
  currentPath = fileURLToPath(import.meta.url),
  runner: (args: string[]) => void | Promise<void> = main,
  mainPath = process.argv[1],
): void {
  if (mainPath !== undefined && resolve(mainPath) === resolve(currentPath)) {
    void runner(process.argv);
  }
}

runIfMain();

export { main, runIfMain };
