import { ExecFileException } from 'child_process';
import { CliOptions } from '@jestaubach/terrafile-backend-lib';

type TestDefinition = {
  args: string;
  command: string;
  options: CliOptions;
  error: ExecFileException;
  stdOut: string;
  stdErr: string;
};

export type { TestDefinition };
