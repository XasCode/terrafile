import * as fs from 'fs-extra';
import * as path from 'path';
import * as fsHelpers from 'src/fsHelpers';
import { validOptions } from 'src/utils';
import { CliOptions, Option, Path, Status, Config, Response } from 'src/types';
import modules from 'src/moduleSources';

function Terrafile(options: CliOptions, altFetcher: (_: Config) => Response): Status {
  function validateOptions(): Status {
    if (!validOptions(this.options, `file` as Option)) {
      this.success = false;
      this.contents = null;
      this.error = `Error: Not valid options`;
    }
    return this;
  }

  function verifyFile(): Status {
    if (!fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(this.options?.file))) {
      this.success = false;
      this.contents = null;
      this.error = `Error: ${this.options?.file} does not exist`;
    }
    return this;
  }

  function readFile(): Status {
    try {
      this.json = JSON.parse(fs.readFileSync(fsHelpers.getAbsolutePath(this.options.file), `utf-8`));
    } catch (err) {
      this.success = false;
      this.contents = null;
      this.error = `Error: could not parse ${this.options?.file}`;
    }
    return this;
  }

  function parse(): Status {
    try {
      this.contents = Object.entries(this.json);
    } catch (err) {
      this.success = false;
      this.contents = [];
      this.error = `Error: could not parse json appropriately`;
    }
    return this;
  }

  function validateJson(): Status {
    const valid = this.contents.reduce(
      (acc: boolean, [, val]: [string, Record<string, string>]) => acc && !modules.validate(val),
      this.success,
    );
    this.success = valid;
    this.contents = valid ? this.contents : null;
    this.error = valid ? null : `Error: Not valid JSON format`;
    return this;
  }

  async function fetchModules(
    contents: [string, Record<string, string>][],
    dir: Path,
    fetcher: (_: Config) => Response,
  ): Promise<Status[]> {
    /*
    const retVals = [];
    for (const [key, val] of contents) {
      const dest = fsHelpers.getAbsolutePath(`${dir}${path.sep}${key}`);
      const retVal = await modules.fetch(val, dest);
      retVals.push(retVal);
    }
    return retVals;
    */
    return Promise.all(
      contents.map(([key, val]) => {
        const dest = fsHelpers.getAbsolutePath(`${dir}${path.sep}${key}`);
        return modules.fetch(val, dest, fetcher);
      }),
    );
  }

  async function process(): Promise<Status> {
    const retVal = { ...this };
    if (this.success) {
      const fetchResults = await fetchModules(this.contents, options.directory, this.fetcher);
      fetchResults.forEach((currentModuleRetVal) => {
        retVal.success = this.success && currentModuleRetVal.success;
        retVal.contents = currentModuleRetVal.contents;
        retVal.error = this.error || currentModuleRetVal.error;
      });
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
    fetcher: altFetcher,
  };
}

async function readFileContents(options: CliOptions, fetcher?: (_: Config) => Response): Promise<Status> {
  return Terrafile(options, fetcher).validateOptions().verifyFile().readFile().parse().validateJson().process();
}

export { readFileContents };
