#!/usr/bin/env node
import { Command, Option } from 'commander';
import { install, Backend } from '@jestaubach/terrafile-backend-lib';
import fsh from '@jestaubach/fs-helpers';

// eslint-disable-next-line
const version = configversion;

const fsHelpers = fsh.use(fsh.default);
const backend = { install };

async function main(myargs: string[], be?: Backend): Promise<void> {
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
  } catch (err) {
    // swallow the error
  }
}

function runIfMain(
  currentModule = module,
  runner: (args: string[]) => Promise<void> = main,
  mainModule = require.main,
): void {
  if (mainModule === currentModule) {
    void runner(process.argv);
  }
}

(async () => {
  runIfMain();
})();

export { main, runIfMain };
