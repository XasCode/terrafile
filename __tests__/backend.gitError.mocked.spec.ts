import { spy } from '__tests__/testUtils';

import { readFileContents } from 'src/backend/processFile';

import fsh from '@jestaubach/fs-helpers';
const fsHelpers = fsh.use(fsh.default);
const { rimrafDir, getAbsolutePath } = fsHelpers;
const mockedFsHelpers = fsh.use(fsh.mock);

import { CliOptions, ExecResult } from 'src/shared/types';

import fetcher from '@jestaubach/fetcher-axios';
import cloner from '@jestaubach/cloner-git';

const testDirs = [`vendor_tfregistry_error`];

const cleanUpTestDirs = () => {
  testDirs.forEach((testDir) => {
    rimrafDir(getAbsolutePath(testDir).value);
  });
};

// expected result when provide bad file path
async function expectFileIssue(options: CliOptions): Promise<void> {
  const retVals = await readFileContents(options);
  expect(retVals.success).toBe(false);
  expect(retVals.contents).toBe(null);
}

describe(`read file contents should read specified json file and validate its contents`, () => {
  beforeEach(() => {
    // cleans up any dirs created from previous tests
    cleanUpTestDirs();
    spy.clear();
  });

  afterEach(() => {
    // cleans up any dirs create by the test
    cleanUpTestDirs();
  });

  test(`should err on bad terraform registry`, async () => {
    const configFile = `__tests__/testFiles/tfRegistryError.json`;
    await expectFileIssue({
      directory: `vendor_tfregistry_error/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mockError() as (_:string[],__:string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });
  });
});
