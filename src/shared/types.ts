import { ExecFileException } from 'child_process';

type Path = string;

type Backend = {
  install(_: CliOptions): void;
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
  args: string;
  command: string;
  options: CliOptions;
  error: ExecFileException;
  stdOut: string;
  stdErr: string;
};

type FsHelpers = {
  getAbsolutePath: (_:string) => RetPath,
  checkIfFileExists: (_:string) => RetBool,
  checkIfDirExists: (_:string) => RetBool,
  createDir: (_:string) => RetPath,
  renameDir: (_:string, __:string) => RetVal,
  rimrafDir: (_:string) => RetVal,
  readFile: (_:string) => RetString,
  copyDirAbs: (_:string, __:string) => RetVal,
  touchFile: (_:string) => RetVal,
}

type CliOptions = {
  directory?: Path;
  file?: Path;
  fetcher?: (_: Config) => Promise<RetString>;
  cloner?: (_: string[], __?: Path) => Promise<ExecResult>;
  fsHelpers?: FsHelpers;
  createDir?: (_: Path) => Path;
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
  verifyFile?: (_:CliOptions) => Status;
  readFile?: (_:CliOptions) => Status;
  parse?: () => Status;
  validateJson?: () => Status;
  fetcher?: (_: Config) => Promise<RetString>;
  cloner?: (_: string[], __?: Path) => Promise<ExecResult>;
  fsHelpers?: FsHelpers;
};

type Option = `file` | `directory`;

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

interface RetBool extends RetVal {
  value?: boolean;
}

interface RetPath extends RetVal {
  value?: Path;
}

type Config = Record<string, string>;

type Request = {
  method: `get`;
  url: string;
};

type Response = {
  status: number;
  headers?: Record<string, string>;
};

type FetchParams = {
  params: Entry;
  dest: Path;
  fetcher: (_: Config) => Promise<RetString>;
  cloner: (_: string[], __?: Path) => Promise<ExecResult>;
  fsHelpers: FsHelpers;
};

export {
  Backend,
  CliArgs,
  CliOptions,
  Config,
  Entry,
  ExecResult,
  FetchParams,
  FsHelpers,
  Option,
  Path,
  RepoLocation,
  Request,
  Response,
  RetBool,
  RetString,
  RetVal,
  RetPath,
  SourceParts,
  Status,
  TestDefinition,
};
