import { spy } from '__tests__/testUtils';

import { readFileContents } from 'src/backend/processFile';
import { rimrafDir, getAbsolutePath } from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';

import { CliOptions } from 'src/shared/types';

import fetcher from 'src/backend/extInterfaces/fetcher/axios';
import cloner from 'src/backend/extInterfaces/cloner/git';
import mockedFetcher from 'src/backend/extInterfaces/fetcher/axios/mock';
import mockedCloner from 'src/backend/extInterfaces/cloner/git/mock';

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
      fetcher: fetcher.use(mockedFetcher.mock),
      cloner: cloner.use(mockedCloner.mockError),
    });
  });
});
