import * as fs from 'fs-extra';
import * as path from 'path';
import * as fsHelpers from './fsHelpers';
import { validOptions } from './utils';
import { CliOptions, Option, Status } from './types';
import modules from './moduleSources';

async function readFileContents(options: CliOptions): Promise<Status> {
  return await Terrafile(options);
}

function TerrafileImplementation(options: CliOptions): Status {
  function validateOptions(): Status {
    if (!validOptions(this.options, 'file' as Option)) {
      this.success = false;
      this.contents = null;
      this.error = `Error: Not valid options`;
    }
    return this;
  }

  function verifyFile(): Status {
    if (
      !fsHelpers.checkIfFileExists(
        fsHelpers.getAbsolutePath(this.options?.file)
      )
    ) {
      this.success = false;
      this.contents = null;
      this.error = `Error: ${this.options?.file} does not exist`;
    }
    return this;
  }

  function readFile(): Status {
    try {
      this.json = JSON.parse(
        fs.readFileSync(fsHelpers.getAbsolutePath(this.options.file), 'utf-8')
      );
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
      (acc: boolean, [, val]: [string, Record<string, string>]) => {
        return acc && !modules.validate(val);
      },
      this.success
    );
    this.success = valid;
    this.contents = valid ? this.contents : null;
    this.error = valid ? null : `Error: Not valid JSON format`;
    return this;
  }

  async function process(): Promise<Status> {
    const retVal = { ...this };

    if (this.success) {
      for (const [key, val] of this.contents) {
        const dest = fsHelpers.getAbsolutePath(
          `${options.directory}${path.sep}${key}`
        );
        const currentModuleRetVal = await modules.fetch(val, dest);
        retVal.success = this.success && currentModuleRetVal.success;
        retVal.contents = currentModuleRetVal.contents;
        retVal.error = this.error || currentModuleRetVal.error;
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

async function Terrafile(options: CliOptions): Promise<Status> {
  return TerrafileImplementation(options)
    .validateOptions()
    .verifyFile()
    .readFile()
    .parse()
    .validateJson()
    .process();
}

export { readFileContents };

/*
function Terrafile(options: CliOptions): Status {
  async function process(): Promise<Status> {
    const retVal = { ...this };

    if (this.success) {
      for (const [key, val] of this.contents) {
        const dest = fsHelpers.getAbsolutePath(
          `${options.directory}${path.sep}${key}`
        );
        const currentModuleRetVal = await modules.fetch(val, dest);
        retVal.success = this.success && currentModuleRetVal.success;
        retVal.contents = currentModuleRetVal.contents;
        retVal.error = this.error && currentModuleRetVal.error;
      }
    }
    return retVal;
  }

  return validOptions(options, 'file' as Option)
    ? {
        process,
        ...JsonTerrafile(
          fsHelpers.getAbsolutePath(options.file)
        ).validateFormat(),
      }
    : {
        process,
        success: false,
        contents: null,
        error: `Error: Not valid options`,
      };
}

function JsonTerrafile(filepath: Path): Status {
  function parse(
    c: Record<string, Record<string, string>>
  ): [string, Record<string, string>][] {
    try {
      return Object.entries(c);
    } catch (err) {
      return [];
    }
  }

  function validateFormat(): Status {
    const moduleEntries = parse(this.contents);
    const valid = moduleEntries.reduce((acc, [, val]) => {
      return acc && !validateFieldsForEachModuleEntry(val);
    }, this.success);
    return {
      success: valid,
      //contents: parse(this.contents),
      contents: valid ? parse(this.contents) : null,
      error: valid ? null : `Error: Not valid format`,
    };
  }

  return {
    validateFormat,
    ...JsonFile(filepath),
  };
}

function JsonFile(absFilePath: Path): Status {
  function gulpJson(file: Path): [string, Record<string, string>][] | null {
    try {
      return JSON.parse(
        fs.readFileSync(fsHelpers.getAbsolutePath(file), 'utf-8')
      );
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  return File(absFilePath).success
    ? Json(gulpJson(absFilePath))
    : { success: false, contents: null, error: 'Error: not file' };
}

function File(absFilePath: Path): Status {
  function exists(filePath: Path): boolean {
    return fsHelpers.checkIfFileExists(filePath);
  }

  return {
    success: exists(absFilePath),
    //contents: null,
    error: exists(absFilePath) ? null : `Error: not exists`,
  };
}

function Json(json: [string, Record<string, string>][] | null): Status {
  function isValidJson(
    contents: [string, Record<string, string>][] | null
  ): boolean {
    return contents !== null;
  }

  return {
    success: isValidJson(json),
    contents: json,
    error: isValidJson(json) ? null : `Error: is not valid json`,
  };
}
*/
