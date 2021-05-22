import { ExecFileException } from 'child_process';

type Path = string;

type Backend = {
  install(c: CliOptions): void;
};

type ExecResult = {
  error?: ExecFileException;
  stdout?: string;
  stderr?: string;
};

type CliArgs = {
  command?: string;
  helpCommand?: string;
  ver?: string;
  help?: string;
  badOption?: string;
  directory?: Path;
  file?: Path;
};

type TestDefinition = {
  // backends: string[];
  args: string;
  command: string;
  options: CliOptions;
  error: ExecFileException;
  stdOut: string;
  stdErr: string;
};

type CliOptions = {
  directory?: Path;
  file?: Path;
};

type Status = {
  success: boolean;
  saved?: Path;
  created?: Path;
  error?: string | null;
  contents?: [string, Record<string, string>][];
  options?: CliOptions;
  process?: () => Promise<Status>;
  validateFormat?: () => Status;
  validateOptions?: () => Status;
  verifyFile?: () => Status;
  readFile?: () => Status;
  parse?: () => Status;
  validateJson?: () => Status;
  proces?: () => Status;
};

enum Option {
  file = `file`,
  folder = `directory`,
}

type Entry = {
  source?: string;
  version?: string;
  path?: string;
};

type RepoLocation = [Path, Path, string, string];

type SourceParts = string[];

type RetVal = {
  success: boolean;
  error?: string;
};

interface RetString extends RetVal {
  value?: string;
}

export {
  Backend,
  CliArgs,
  CliOptions,
  Entry,
  ExecResult,
  Option,
  Path,
  RepoLocation,
  RetString,
  SourceParts,
  Status,
  TestDefinition,
};
