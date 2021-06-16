import { spy } from '__tests__/testUtils';

import { readFileContents } from 'src/backend/processFile';
import { rimrafDir, getAbsolutePath } from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';

import { CliOptions } from 'src/shared/types';

import fetcher from 'src/backend/extInterfaces/fetcher/axios';
import cloner from 'src/backend/extInterfaces/cloner/git';
import mockedFetcher from 'src/backend/extInterfaces/fetcher/axios/mock';
import mockedCloner from 'src/backend/extInterfaces/cloner/git/mock';

const testDirs = [`vendor_tfregistry_NoXTFGetError`];

const cleanUpTestDirs = () => {
  return testDirs.forEach((testDir) => {
    return rimrafDir(getAbsolutePath(testDir).value);
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
    const configFile = `__tests__/testFiles/tfRegistryNoXTFGetError.json`;
    await expectFileIssue({
      directory: `vendor_tfregistry_NoXTFGetError/modules`,
      file: configFile,
      fetcher: fetcher.use(mockedFetcher.mock),
      cloner: cloner.use(mockedCloner.mock),
    });
  });
});
