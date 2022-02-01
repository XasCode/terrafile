import { spy } from '__tests__/testUtils';

import { readFileContents } from 'src/backend/processFile';

import fsh from '@jestaubach/fs-helpers';
const fsHelpers = fsh.use(fsh.default);
const { rimrafDir, getAbsolutePath } = fsHelpers;
const mockedFsHelpers = fsh.use(fsh.mock);

import { CliOptions, ExecResult } from 'src/shared/types';

import fetcher from '@jestaubach/fetcher-axios';
import cloner from '@jestaubach/cloner-git';

const testDirs = [`vendor_tfregistry_500Error`];

const cleanUpTestDirs = () => {
  testDirs.forEach((testDir) => {
    rimrafDir(getAbsolutePath(testDir).value);
  });
};

// expected result when error encountered
async function expectFileIssue(options: CliOptions): Promise<void> {
  const retVals = await readFileContents(options);
  expect(retVals.success).toBe(false);
  expect(retVals.contents).toBe(null);
}

describe(`read file contents should read specified json file and validate its contents`, () => {
  beforeEach(() => {
    cleanUpTestDirs();
    spy.clear();
  });

  afterEach(() => {
    cleanUpTestDirs();
  });

  test(`should err on terraform registry 500`, async () => {
    const configFile = `__tests__/testFiles/tfRegistry500Error.json`;
    await expectFileIssue({
      directory: `vendor_tfregistry_500Error/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mock(mockedFsHelpers) as (_:string[],__:string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });
  });
});
