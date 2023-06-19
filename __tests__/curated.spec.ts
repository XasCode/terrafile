import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { ExecFileException } from 'child_process';
import { resolve } from 'path';
import chalk from 'chalk';

import { cli } from './testUtils';

import fsHelpers from '@jestaubach/fs-helpers';
const { rimrafDir } = fsHelpers.use(fsHelpers.default);

import {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} from '../src/cli/strings';

import { version } from '../package.json';

const defaultOpts = { directory: `vendor/modules`, file: `terrafile.json` };

// each of these commands will be execed to test cli output
const curatedCliCommands: Record<string, [string | RegExp, string | RegExp, ExecFileException]> = {
  help: [`${helpContent}\n`, ``, null],
  '--version': [`${version}\n`, ``, null],
  //install: [`${chalk.blue(`Plan: (${defaultOpts.file}) --> (${defaultOpts.directory})`)}\n`, ``, null],
  install: [`${`Plan: (${defaultOpts.file}) --> (${defaultOpts.directory})`}`, ``, null],
  foo: [``, `${unknownCommand}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  '--bar': [``, `${unknownOptionLong}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  'install --bar': [``, `${unknownOptionLong}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  'install -b': [``, `${unknownOptionShort}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  'help install': [`${helpInstallContent}\n`, ``, null],
  'install -d <abc': [/Plan: \(terrafile.json\) --> \(<abc\)/, /Error resolving path: <abc\n/, null],
};

describe(`should execute 'terrafile' with a set of commands/options and verify the output`, () => {
  beforeEach(() => {
    rimrafDir(resolve(`.`, `dist/src/vendor`));
  });

  afterEach(() => {
    rimrafDir(resolve(`.`, `dist/src/vendor`));
  });

  it(`test currated set of cli commands synchronously`, async () => {
    /* eslint-disable no-await-in-loop */
    for (const cliCommand of Object.keys(curatedCliCommands)) {
      const result = await cli(cliCommand.split(` `), `./dist`);
      expect(result.stdout).toMatch(curatedCliCommands[cliCommand][0]);
      expect(result.stderr).toMatch(curatedCliCommands[cliCommand][1]);
      expect(result.error === null ? result.error : result.error.code).toBe(
        curatedCliCommands[cliCommand][2] === null
          ? curatedCliCommands[cliCommand][2]
          : curatedCliCommands[cliCommand][2].code,
      );
    }
  });
});
