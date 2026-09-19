declare module '@jestaubach/terrafile-backend-lib' {
  import type { ExecFileException } from 'child_process';

  export type Path = string;

  export type Backend = {
    install(_: CliOptions): void;
  };

  export type ExecResult = {
    error?: ExecFileException | null;
    stdout?: string;
    stderr?: string;
  };

  export type CliArgs = {
    command?: string;
    helpCommand?: string;
    ver?: string;
    help?: string;
    badOption?: string;
    directory?: Path;
    file?: Path;
  };

  export type CliOptions = {
    directory?: Path;
    file?: Path;
    fetcher?: (_: Config) => Promise<RetString>;
    cloner?: (_: string[], __?: Path) => Promise<ExecResult>;
    fsHelpers?: FsHelpers;
    createDir?: (_: Path) => Path;
  };

  export type FsHelpers = {
    getAbsolutePath: (_: string) => RetPath;
    checkIfFileExists: (_: string) => RetBool;
    checkIfDirExists: (_: string) => RetBool;
    createDir: (_: string) => RetPath;
    renameDir: (_: string, __: string) => RetVal;
    rimrafDir: (_: string) => RetVal;
    readFile: (_: string) => RetString;
    copyDirAbs: (_: string, __: string) => RetVal;
    touchFile: (_: string) => RetVal;
  };

  export type RetVal = {
    success: boolean;
    error?: string;
  };

  export interface RetString extends RetVal {
    value?: string;
  }

  export interface RetBool extends RetVal {
    value?: boolean;
  }

  export interface RetPath extends RetVal {
    value?: Path;
  }

  export type Config = Record<string, string>;

  export function install(_options: CliOptions): void;
}
