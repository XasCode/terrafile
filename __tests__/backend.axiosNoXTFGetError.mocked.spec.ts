import { mockAxiosGetTerraformUrlNoXTFGetError, spy } from '__tests__/testUtils';

//mockAxiosGetTerraformUrlNoXTFGetError();
jest.mock(`axios`, mockAxiosGetTerraformUrlNoXTFGetError);

import { readFileContents } from 'src/processFile';
import { rimrafDir, getAbsolutePath } from 'src/fsHelpers';

import { CliOptions } from 'src/types';

const testDirs = [`vendor_tfregistry_NoXTFGetError`];

const cleanUpTestDirs = () => testDirs.map((testDir) => rimrafDir(getAbsolutePath(testDir)));

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
    });
  });
});
