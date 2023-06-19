import { ExecFileException } from 'child_process';
import { readFileSync } from 'fs-extra';
import chalk from 'chalk';

import fsHelpers from '@jestaubach/fs-helpers';
const useFsHelpers = fsHelpers.use(fsHelpers.default);
const { getAbsolutePath } = useFsHelpers;

import { cartesian } from './cartesian';

import { CliArgs, CliOptions, ExecResult } from '@jestaubach/terrafile-backend-lib';
import { TestDefinition } from '../../src/cli/types';

import {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} from '../../src/cli/strings';

const helpCommands = [``, `help`];
const commands = [``, `install`, `foo`];
const helps = [``, `-h`, `--help`];
const versions = [``, `-V`, `--version`];
const directories = [``, `--directory bar`];
const files = [``, `--file foobar`];
const badOptions = [``, `-b`, `--bar`];

const { version } = JSON.parse(readFileSync(getAbsolutePath(`./package.json`).value, `utf-8`));

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
  if (args.badOption !== ``) {
    return {
      error: { name: ``, message: ``, code: 1 } as ExecFileException,
      stdout: ``,
      stderr: args.badOption[1] === `-` ? unknownOptionLong : unknownOptionShort,
    };
  }
  const options = getOptions({ directory: args.directory, file: args.file });
  return {
    error: null,
    stdout: chalk.blue(`Plan: (${options.file}) --> (${options.directory})`),
    stderr: ``,
  };
}

function noVerNoHelpNoCommandCheckOptions(args: CliArgs): ExecResult {
  const retVal = {
    error: { name: ``, message: ``, code: 1 } as ExecFileException,
    stdout: ``,
  };
  if (args.directory !== ``) {
    return {
      ...retVal,
      stderr: `error: unknown option '--directory'`,
    };
  }
  if (args.file !== ``) {
    return {
      ...retVal,
      stderr: `error: unknown option '--file'`,
    };
  }
  if (args.badOption !== ``) {
    return {
      ...retVal,
      stderr: args.badOption[1] === `-` ? unknownOptionLong : unknownOptionShort,
    };
  }
  return {
    ...retVal,
    stderr: helpContent,
  };
}

function noVerNoHelpCheckCommand(args: CliArgs): ExecResult {
  if (args.command === ``) {
    return noVerNoHelpNoCommandCheckOptions(args);
  }
  if (args.command !== `install`) {
    return {
      error: { name: ``, message: ``, code: 1 } as ExecFileException,
      stdout: ``,
      stderr: unknownCommand,
    };
  }
  return noVerNoHelpValidCommandCheckOptions(args);
}

function noVerYesHelpInvalidCommand(args: CliArgs): ExecResult {
  if (args.helpCommand !== ``) {
    return {
      error: { name: ``, message: ``, code: 1 } as ExecFileException,
      stdout: ``,
      stderr: helpContent,
    };
  }
  return {
    error: null,
    stdout: helpContent,
    stderr: ``,
  };
}

function noVerYesHelpCheckCommand(args: CliArgs): ExecResult {
  if (args.command === `install`) {
    return {
      error: null,
      stdout: helpInstallContent,
      stderr: ``,
    };
  }
  if (args.command === ``) {
    return {
      error: null,
      stdout: helpContent,
      stderr: ``,
    };
  }
  return noVerYesHelpInvalidCommand(args);
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
    .filter((cur) => {
      return cur.length > 0;
    })
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
