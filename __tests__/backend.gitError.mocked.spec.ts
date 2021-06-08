import { spy } from '__tests__/testUtils';

import { readFileContents } from 'src/processFile';
import { rimrafDir, getAbsolutePath } from 'src/fsHelpers';

import { CliOptions } from 'src/types';

import fetcher from 'src/libs/fetcher/axios';
import cloner from 'src/libs/cloner/git';
import mockedFetcher from 'src/libs/fetcher/axios/mock';
import mockedCloner from 'src/libs/cloner/git/mock';

const testDirs = [`vendor_tfregistry_error`];

const cleanUpTestDirs = () => testDirs.map((testDir) => rimrafDir(getAbsolutePath(testDir)));

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
      fetcher: fetcher.use(mockedFetcher.mock),
      cloner: cloner.use(mockedCloner.mockError),
    });
  });
});
