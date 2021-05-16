/* eslint-disable no-console */
import { ExecFileException } from 'child_process';
import { resolve } from 'path';
import { readFileSync } from 'fs-extra';

import { rimrafDir, getAbsolutePath } from '../src/fsHelpers';
import { main } from '../src/terrafile';
import {
  getRandomInt, cli, cartesian, spy,
} from './testUtils';
import {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} from '../src/strings';

import {
  Backend,
  CliArgs,
  CliOptions,
  ExecResult,
  TestDefinition,
} from '../src/types';

import { install as defaultInstall } from '../src/backend';
import { install as mockedInstall } from '../__mocks__/backend.mock';

const backendVersions: Record<string, Backend> = {
  '': { install: defaultInstall },
  './backend.mock.ts': { install: mockedInstall },
};

const { version } = JSON.parse(
  readFileSync(getAbsolutePath(`./package.json`), `utf-8`),
);

const defaultOpts = { directory: `vendor/modules`, file: `terrafile.json` };

const helpCommands = [``, `help`];
const commands = [``, `install`, `foo`];
const helps = [``, `-h`, `--help`];
const versions = [``, `-V`, `--version`];
const directories = [``, `-d bar`, `--directory bar`];
const files = [``, `-f foobar`, `--file foobar`];
const badOptions = [``, `-b`, `--bar`];

const combinations = cartesian(
  helpCommands,
  commands,
  helps,
  versions,
  directories,
  files,
  badOptions,
);

// Specify the options that should be passed to the install command
function getOptions({ directory, file }: CliOptions): CliOptions {
  return {
    ...defaultOpts,
    ...(directory !== `` ? { directory: directory.split(` `)[1] } : {}),
    ...(file !== `` ? { file: file.split(` `)[1] } : {}),
  };
}

function noVerNoHelpValidCommandCheckOptions(args: CliArgs): ExecResult {
  return args.badOption !== ``
    ? {
      error: { name: ``, message: ``, code: 1 } as ExecFileException,
      stdout: ``,
      stderr:
          args.badOption[1] === `-` ? unknownOptionLong : unknownOptionShort,
    }
    : {
      error: null,
      stdout: JSON.stringify(
        getOptions({ directory: args.directory, file: args.file }),
      ),
      stderr: ``,
    };
}

function noVerNoHelpCheckCommand(args: CliArgs): ExecResult {
  // eslint-disable-next-line no-nested-ternary
  return args.command === ``
    ? {
      error: { name: ``, message: ``, code: 1 } as ExecFileException,
      stdout: ``,
      stderr: helpContent,
    }
    : args.command !== `install`
      ? {
        error: { name: ``, message: ``, code: 1 } as ExecFileException,
        stdout: ``,
        stderr: unknownCommand,
      }
      : noVerNoHelpValidCommandCheckOptions(args);
}

function noVerYesHelpInvalidCommand(args: CliArgs): ExecResult {
  return args.helpCommand !== ``
    ? {
      error: { name: ``, message: ``, code: 1 } as ExecFileException,
      stdout: ``,
      stderr: helpContent,
    }
    : {
      error: null,
      stdout: helpContent,
      stderr: ``,
    };
}
function noVerYesHelpCheckCommand(args: CliArgs): ExecResult {
  // eslint-disable-next-line no-nested-ternary
  return args.command === `install`
    ? {
      error: null,
      stdout: helpInstallContent,
      stderr: ``,
    }
    : args.command === ``
      ? {
        error: null,
        stdout: helpContent,
        stderr: ``,
      }
      : noVerYesHelpInvalidCommand(args);
}

function noVerCheckHelp(args: CliArgs): ExecResult {
  return args.helpCommand !== `` || args.help !== ``
    ? noVerYesHelpCheckCommand(args)
    : noVerNoHelpCheckCommand(args);
}

// Specify the results for the CLI
function getResults(args: CliArgs): ExecResult {
  return args.ver !== ``
    ? {
      error: null,
      stdout: version,
      stderr: ``,
    }
    : noVerCheckHelp(args);
}

// Determines if the install command will be run
function getCommand({
  command,
  helpCommand,
  ver,
  help,
  badOption,
}: CliArgs): string {
  return command === `install`
    && helpCommand === ``
    && ver === ``
    && help === ``
    && badOption === ``
    ? `install`
    : ``;
}

// Assembles the various options into a command
function getArgs({
  helpCommand,
  command,
  help,
  ver,
  directory,
  file,
  badOption,
}: CliArgs): string {
  return `${helpCommand} ${command} ${help} ${ver} ${directory} ${file} ${badOption}`
    .split(` `)
    .filter((cur) => cur.length > 0)
    .join(` `);
}

const variations = combinations.map(
  ([
    helpCommand,
    command,
    help,
    ver,
    directory,
    file,
    badOption,
  ]: unknown[]): TestDefinition => {
    const allArgs = {
      helpCommand,
      command,
      help,
      ver,
      directory,
      file,
      badOption,
    } as CliArgs;

    const results = getResults(allArgs);

    // Add each test case to variations list
    return {
      // run tests across a list of api implementations / mocks
      backends: Object.keys(backendVersions),
      args: getArgs(allArgs), // the test command
      command: getCommand(allArgs), // api command to run or ""
      options: getOptions(allArgs),
      code: results.error, // results.error === null ? null : results.error.code,
      stdOut: results.stdout,
      stdErr: results.stderr,
    };
  },
);

// For each test case, we test both the implementations / mocks (BE) only
// and the results of running via the CLI with each implementaiton / mock
describe.each(variations)(
  `Iterate through test variations.`,
  ({
    backends,
    args,
    command,
    options,
    code,
    stdOut,
    stdErr,
  }: TestDefinition) => {
    beforeEach(() => {
      rimrafDir(resolve(`.`, `vendor`));
      rimrafDir(resolve(`.`, `bar`));
      spy.clear();
    });

    afterEach(() => {
      rimrafDir(resolve(`.`, `vendor`));
      rimrafDir(resolve(`.`, `bar`));
    });

    // test the implementations / mocks (BE)
    test.each(backends)(
      `Check BE output (BE="%s", args="${args}")`,
      async (backend) => {
        const { install } = backendVersions[backend];
        switch (command) {
          case `install`: {
            install(options);
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenLastCalledWith(stdOut);
            break;
          }
          default: {
            expect(console.log).toBeCalledTimes(0);
          }
        }
      },
    );

    test.each(backends)(
      `Check CLI as module (BE="%s", args="${args}")`,
      async (backend) => {
        const myargs = [
          process.argv[0],
          resolve(`./dist/terrafile`),
          ...(args ? args.split(` `) : []),
        ];
        if (backend.length > 0) {
          main(myargs, backendVersions[backend]);
        } else {
          main(myargs);
        }

        // if we successfully are running the installl command,
        if (command === `install`) {
          expect(console.log).toHaveBeenLastCalledWith(`${stdOut}`);
          expect(process.stdout.write).not.toHaveBeenCalled();
          expect(process.stderr.write).not.toHaveBeenCalled();
          expect(console.error).not.toHaveBeenCalled();
          expect(process.exit).not.toHaveBeenCalled();
        } else {
          // if the install command is not run
          [stdOut, stdErr].forEach((cur) => {
            if (cur !== ``) {
              expect(
                cur === stdOut
                  ? (process.stdout.write as jest.Mock).mock.calls[0][0]
                  : (process.stderr.write as jest.Mock).mock.calls[0][0],
              ).toBe(`${cur}${cur.length > 0 ? `\n` : ``}`);
            }
          });
          const exitCode = ((process.exit as unknown) as jest.Mock).mock.calls[0][0];
          expect(exitCode).toBe(code === null ? 0 : code.code);
        }
      },
    );

    // sample CLI commands
    if (getRandomInt(200) === 0) {
      // if (true) {
      test(`Sample CLI (BE="%s", args="${args}")`, async () => {
        const result = await cli(args ? args.split(` `) : []);
        [
          { actual: result.stdout, expected: stdOut },
          { actual: result.stderr, expected: stdErr },
        ].forEach((cur) => {
          expect(cur.actual).toBe(
            `${cur.expected}${cur.expected.length > 0 ? `\n` : ``}`,
          );
        });
        expect(result.error === null ? result.error : result.error.code).toBe(
          code === null ? code : code.code,
        );
      });
    }
  },
);
