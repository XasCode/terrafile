import { ExecFileException } from "child_process";

type Path = string | null;

type ExecResult = {
  code: number;
  error: ExecFileException;
  stdout: string;
  stderr: string;
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
  process?: () => Promise<Status>;
  validateFormat?: () => Status;
};

enum Option {
  file = "file",
  folder = "directory",
}

type Entry = {
  source?: string;
  version?: string;
  path?: string;
};

type RepoLocation = [Path, Path, string, string];

type SourceParts = string[];

export {
  CliOptions,
  Entry,
  ExecResult,
  Option,
  Path,
  RepoLocation,
  SourceParts,
  Status,
};
