import { ExecFileException } from "child_process";

type Path = string | null;

type ExecResult = {
  code: number;
  error: ExecFileException;
  stdout: string;
  stderr: string;
};

type CliOptions = {
  directory: Path | undefined;
  file: Path | undefined;
};

type Status = {
  success: boolean;
  saved?: Path;
  created?: Path;
  error?: string | null;
  contents?: string;
};

enum Option {
  file = "file",
  folder = "directory",
}

type Entry = {
  source?: string;
};

export { CliOptions, Entry, ExecResult, Option, Path, Status };
