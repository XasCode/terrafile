import * as fs from 'fs-extra';
import * as path from 'path';
import * as fsHelpers from './fsHelpers';
import { validOptions } from './utils';
import { CliOptions, Option, Path, Status } from './types';

async function readFileContents(options: CliOptions): Promise<Status> {
  return await Terrafile(options).process();
}

function Terrafile(options: CliOptions): Status {
  async function process(): Promise<Status> {
    const retVal = {
      success: this.success,
      contents: this.contents,
      error: this.error,
    };
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

import modules from './moduleSources';

function validateEachField(moduleDef: Record<string, string>): boolean {
  let notFoundOrNotValid = false;
  const acceptable = ['comment', 'source', 'version', 'path'];
  const params = Object.keys(moduleDef);
  for (const param of params) {
    if (!acceptable.includes(param)) {
      notFoundOrNotValid = true;
    }
  }
  return notFoundOrNotValid;
}

function validateFieldsForEachModuleEntry(
  moduleDef: Record<string, string>
): boolean {
  let notFoundOrNotValid = false;
  const sourceType = modules.getType(moduleDef['source']);
  if (sourceType === undefined) {
    notFoundOrNotValid = true;
  } else {
    notFoundOrNotValid = notFoundOrNotValid || validateEachField(moduleDef);
  }
  return notFoundOrNotValid;
}

export { readFileContents };
