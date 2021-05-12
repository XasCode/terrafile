import { resolve } from 'path';
import { readFileSync } from 'fs-extra';

import { rimrafDir, getAbsolutePath } from '../src/fsHelpers';
import { beforeEach as _beforeEach } from './spy';
import { main } from '../src/terrafile';
import { getRandomInt, cli, cartesian } from './utils';
import {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} from '../src/strings';

import { CliArgs, CliOptions, ExecResult, TestDefinition } from '../src/types';

const backendVersions: Record<string, any> = {
  '': require('../src/backend'),
  './backend.mock.ts': require('../__mocks__/backend.mock.ts'),
};

const { version } = JSON.parse(
  readFileSync(getAbsolutePath('./package.json'), 'utf-8')
);

const defaultOpts = { directory: 'vendor/modules', file: 'terrafile.json' };

const helpCommands = ['', 'help'];
const commands = ['', 'install', 'foo'];
const helps = ['', '-h', '--help'];
const versions = ['', '-V', '--version'];
const directories = ['', '-d bar', '--directory bar'];
const files = ['', '-f foobar', '--file foobar'];
const badOptions = ['', '-b', '--bar'];

const combinations = cartesian(
  helpCommands,
  commands,
  helps,
  versions,
  directories,
  files,
  badOptions
);

// Specify the options that should be passed to the install command
function getOptions({ directory, file }: CliOptions): CliOptions {
  return {
    ...defaultOpts,
    ...(directory !== '' ? { directory: directory.split(' ')[1] } : {}),
    ...(file !== '' ? { file: file.split(' ')[1] } : {}),
  };
}

// Specify the results for the CLI
function getResults(args: CliArgs): ExecResult {
  return args.ver !== ''
    ? { code: 0, stdout: version, stderr: '' }
    : noVerCheckHelp(args);
}

function noVerCheckHelp(args: CliArgs): ExecResult {
  return args.helpCommand !== '' || args.help !== ''
    ? noVerYesHelpCheckCommand(args)
    : noVerNoHelpCheckCommand(args);
}

function noVerYesHelpCheckCommand(args: CliArgs): ExecResult {
  return args.command === 'install'
    ? { code: 0, stdout: helpInstallContent, stderr: '' }
    : args.command === ''
    ? { code: 0, stdout: helpContent, stderr: '' }
    : noVerYesHelpInvalidCommand(args);
}

function noVerYesHelpInvalidCommand(args: CliArgs): ExecResult {
  return args.helpCommand !== ''
    ? { code: 1, stdout: '', stderr: helpContent }
    : { code: 0, stdout: helpContent, stderr: '' };
}

function noVerNoHelpCheckCommand(args: CliArgs): ExecResult {
  return args.command === ''
    ? { code: 1, stdout: '', stderr: helpContent }
    : args.command !== 'install'
    ? { code: 1, stdout: '', stderr: unknownCommand }
    : noVerNoHelpValidCommandCheckOptions(args);
}

function noVerNoHelpValidCommandCheckOptions(args: CliArgs): ExecResult {
  return args.badOption !== ''
    ? {
        code: 1,
        stdout: '',
        stderr:
          args.badOption[1] === '-' ? unknownOptionLong : unknownOptionShort,
      }
    : {
        code: 0,
        stdout: JSON.stringify(
          getOptions({ directory: args.directory, file: args.file })
        ),
        stderr: '',
      };
}

// Determines if the install command will be run
function getCommand({
  command,
  helpCommand,
  ver,
  help,
  badOption,
}: CliArgs): string {
  return command === 'install' &&
    helpCommand === '' &&
    ver === '' &&
    help === '' &&
    badOption === ''
    ? 'install'
    : '';
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
    .split(' ')
    .filter((cur) => cur.length > 0)
    .join(' ');
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
      code: results.code,
      stdOut: results.stdout,
      stdErr: results.stderr,
    };
  }
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
      rimrafDir(resolve('.', 'vendor'));
      rimrafDir(resolve('.', 'bar'));
      _beforeEach();
    });

    afterEach(() => {
      rimrafDir(resolve('.', 'vendor'));
      rimrafDir(resolve('.', 'bar'));
    });

    // test the implementations / mocks (BE)
    test.each(backends)(
      `Check BE output (BE="%s", args="${args}")`,
      async (backend) => {
        const { install } = backendVersions[backend];
        switch (command) {
          case 'install': {
            install(options);
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenLastCalledWith(stdOut);
            break;
          }
          default: {
            expect(console.log).toBeCalledTimes(0);
          }
        }
      }
    );

    test.each(backends)(
      `Check CLI as module (BE="%s", args="${args}")`,
      async (backend) => {
        const myargs = [
          process.argv[0],
          resolve('./dist/terrafile'),
          ...(args ? args.split(' ') : []),
        ];
        backend.length > 0
          ? main(myargs, backendVersions[backend])
          : main(myargs);

        // if we successfully are running the installl command,
        if (command === 'install') {
          expect(console.log).toHaveBeenLastCalledWith(`${stdOut}`);
          expect(process.stdout.write).not.toHaveBeenCalled();
          expect(process.stderr.write).not.toHaveBeenCalled();
          expect(console.error).not.toHaveBeenCalled();
          expect(process.exit).not.toHaveBeenCalled();
        } else {
          // if the install command is not run
          [stdOut, stdErr].map((cur) => {
            if (cur != '') {
              expect(
                cur === stdOut
                  ? (process.stdout.write as jest.Mock).mock.calls[0][0]
                  : (process.stderr.write as jest.Mock).mock.calls[0][0]
              ).toBe(`${cur}${cur.length > 0 ? '\n' : ''}`);
            }
          });
          expect(
            ((process.exit as unknown) as jest.Mock).mock.calls[0][0]
          ).toBe(code);
        }
      }
    );

    // sample CLI commands
    if (getRandomInt(200) === 0) {
      //if (true) {
      test(`Sample CLI (BE="%s", args="${args}")`, async () => {
        const result = await cli(args ? args.split(' ') : []);
        [
          { actual: result.stdout, expected: stdOut },
          { actual: result.stderr, expected: stdErr },
        ].map((cur) => {
          expect(cur.actual).toBe(
            `${cur.expected}${cur.expected.length > 0 ? '\n' : ''}`
          );
        });
        expect(result.code).toBe(code);
      });
    }
  }
);

export {};
