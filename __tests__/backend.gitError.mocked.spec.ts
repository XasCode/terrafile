import { mockAxiosGetTerraformUrl, mockCliError, spy } from './testUtils';

mockAxiosGetTerraformUrl();
mockCliError();

import { readFileContents } from '../src/processFile';
import { rimrafDir, getAbsolutePath } from '../src/fsHelpers';

import { CliOptions } from '../src/types';

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
    });
  });
});
