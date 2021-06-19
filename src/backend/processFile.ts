import path from 'path';
import fsHelpers from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import chalk from 'chalk';

import { validOptions } from 'src/backend/utils';
import { CliOptions, Option, Path, Status, Config, ExecResult, RetString } from 'src/shared/types';
import { validate, fetch } from 'src/backend/moduleSources';

function Terrafile(options: CliOptions): Status {
  function validateOptions(): Status {
    if (!validOptions(this.options, `file` as Option)) {
      this.success = false;
      this.contents = null;
      this.error = `Error: Not valid options`;
      console.log(chalk.red(`  ! Failed - validate options`));
    }
    console.log(chalk.green(`  + Success - validate options`));
    return this;
  }

  function verifyFile(): Status {
    if (!fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(this.options?.file).value).value) {
      this.success = false;
      this.contents = null;
      this.error = `Error: ${this.options?.file} does not exist`;
      console.log(chalk.red(`  ! Failed - verify file: ${this.options?.file}`));
    } else {
      console.log(chalk.green(`  + Success - verify file: ${this.options?.file}`));
    }
    return this;
  }

  function readFile(): Status {
    try {
      this.json = JSON.parse(fsHelpers.readFile(this.options.file).value);
      console.log(chalk.green(`  + Success - read file: ${this.options.file}`));
    } catch (err) {
      this.success = false;
      this.contents = null;
      this.error = `Error: could not parse ${this.options?.file}`;
      console.log(chalk.red(`  ! Failed - read file: ${this.options.file}`));
    }
    return this;
  }

  function parse(): Status {
    try {
      this.contents = Object.entries(this.json);
      console.log(chalk.green(`  + Success - parse json`));
    } catch (err) {
      this.success = false;
      this.contents = [];
      this.error = `Error: could not parse json appropriately`;
      console.log(chalk.red(`  ! Failed - parse json`));
    }
    return this;
  }

  function validateJson(): Status {
    const valid = this.contents.reduce((acc: boolean, [, val]: [string, Record<string, string>]) => {
      const result = !validate(val);
      if (result) {
        console.log(chalk.green(`    + Success - validate - ${val}`));
      } else {
        console.log(chalk.red(`    ! Failed - validate - ${val}`));
      }
      return acc && result;
    }, this.success);
    this.success = valid;
    this.contents = valid ? this.contents : null;
    if (valid) {
      this.error = null;
      console.log(chalk.green(`  + Success - validate json`));
    } else {
      this.error = `Error: Not valid JSON format`;
      console.log(chalk.red(`  ! Failed - validate json`));
    }
    return this;
  }

  async function fetchModules(
    contents: [string, Record<string, string>][],
    dir: Path,
    fetcher: (_: Config) => Promise<RetString>,
    cloner: (_: string[], __?: Path) => Promise<ExecResult>,
  ): Promise<Status[]> {
    return Promise.all(
      contents.map(([key, val]) => {
        const dest = fsHelpers.getAbsolutePath(`${dir}${path.sep}${key}`).value;
        return fetch({ params: val, dest, fetcher, cloner });
      }),
    );
  }

  async function process(): Promise<Status> {
    const retVal = { ...this };
    if (this.success) {
      const fetchResults = await fetchModules(this.contents, options.directory, options.fetcher, options.cloner);
      fetchResults.forEach((currentModuleRetVal) => {
        retVal.success = this.success && currentModuleRetVal.success;
        retVal.contents = currentModuleRetVal.contents;
        retVal.error = this.error || currentModuleRetVal.error;
      });
      if (retVal.success) {
        console.log(chalk.green(`  + Success - process: ${options.file}`));
      } else {
        console.log(chalk.red(`  ! Failed - process: ${options.file}`));
      }
    }
    return retVal;
  }

  return {
    options,
    success: true,
    contents: null,
    error: null,
    validateOptions,
    verifyFile,
    readFile,
    parse,
    validateJson,
    process,
  };
}

async function readFileContents(options: CliOptions): Promise<Status> {
  return Terrafile(options).validateOptions().verifyFile().readFile().parse().validateJson().process();
}

export { readFileContents };
