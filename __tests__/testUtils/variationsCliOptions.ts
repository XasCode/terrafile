import { ExecFileException } from 'child_process';
import { readFileSync } from 'fs-extra';

import { getAbsolutePath } from '../../src/fsHelpers';
import { cartesian } from './cartesian';

import { CliArgs, CliOptions, ExecResult, TestDefinition } from '../../src/types';

import {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} from '../../src/strings';

const helpCommands = [``, `help`];
const commands = [``, `install`, `foo`];
const helps = [``, `-h`, `--help`];
const versions = [``, `-V`, `--version`];
const directories = [``, `-d bar`, `--directory bar`];
const files = [``, `-f foobar`, `--file foobar`];
const badOptions = [``, `-b`, `--bar`];

const { version } = JSON.parse(readFileSync(getAbsolutePath(`./package.json`), `utf-8`));

const defaultOpts = { directory: `vendor/modules`, file: `terrafile.json` };

const combinations = cartesian(helpCommands, commands, helps, versions, directories, files, badOptions);

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
        stderr: args.badOption[1] === `-` ? unknownOptionLong : unknownOptionShort,
      }
    : {
        error: null,
        stdout: JSON.stringify(getOptions({ directory: args.directory, file: args.file })),
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
  return args.helpCommand !== `` || args.help !== `` ? noVerYesHelpCheckCommand(args) : noVerNoHelpCheckCommand(args);
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
function getCommand({ command, helpCommand, ver, help, badOption }: CliArgs): string {
  return command === `install` && helpCommand === `` && ver === `` && help === `` && badOption === `` ? `install` : ``;
}

// Assembles the various options into a command
function getArgs({ helpCommand, command, help, ver, directory, file, badOption }: CliArgs): string {
  return `${helpCommand} ${command} ${help} ${ver} ${directory} ${file} ${badOption}`
    .split(` `)
    .filter((cur) => cur.length > 0)
    .join(` `);
}

const variations = combinations.map(
  ([helpCommand, command, help, ver, directory, file, badOption]: unknown[]): TestDefinition => {
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
      args: getArgs(allArgs), // the test command
      command: getCommand(allArgs), // api command to run or ""
      options: getOptions(allArgs),
      error: results.error,
      stdOut: results.stdout,
      stdErr: results.stderr,
    };
  },
);

export { variations };
