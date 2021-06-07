import { ExecFileException } from 'child_process';
import { resolve } from 'path';

import { cli } from '__tests__/testUtils';
import { getAbsolutePath, rimrafDir } from 'src/fsHelpers';

import { helpContent, helpInstallContent, unknownCommand, unknownOptionLong, unknownOptionShort } from 'src/strings';

import { version } from '/package.json';

const defaultOpts = { directory: `vendor/modules`, file: `terrafile.json` };

// each of these commands will be execed to test cli output
const curatedCliCommands: Record<string, [string, string, ExecFileException]> = {
  help: [`${helpContent}\n`, ``, null],
  '--version': [`${version}\n`, ``, null],
  install: [`${JSON.stringify(defaultOpts)}\n`, ``, null],
  foo: [``, `${unknownCommand}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  '--error': [``, `${helpContent}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  'install --bar': [``, `${unknownOptionLong}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  'install -b': [``, `${unknownOptionShort}\n`, { name: ``, message: ``, code: 1 } as ExecFileException],
  'help install': [`${helpInstallContent}\n`, ``, null],
  'install -d <abc': [`{"directory":"<abc","file":"terrafile.json"}\n`, `Error resolving path: <abc\n`, null],
};

describe(`should execute 'terrafile' with a set of commands/options and verify the output`, () => {
  beforeEach(() => {
    rimrafDir(resolve(`.`, `./dist/vendor`));
  });

  afterEach(() => {
    rimrafDir(resolve(`.`, `./dist/vendor`));
  });

  test(`test currated set of cli commands synchronously`, async () => {
    for (const cliCommand of Object.keys(curatedCliCommands)) {
      const result = await cli(cliCommand.split(` `), `./dist/src`);
      expect(result.stdout).toBe(curatedCliCommands[cliCommand][0]);
      expect(result.stderr).toBe(curatedCliCommands[cliCommand][1]);
      expect(result.error === null ? result.error : result.error.code).toBe(
        curatedCliCommands[cliCommand][2] === null
          ? curatedCliCommands[cliCommand][2]
          : curatedCliCommands[cliCommand][2].code,
      );
    }
  });
});
