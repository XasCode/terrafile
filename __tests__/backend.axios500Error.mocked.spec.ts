import { mockAxiosGetTerraformUrl500Error, spy } from './testUtils';

mockAxiosGetTerraformUrl500Error();

import { readFileContents } from '../src/processFile';
import { rimrafDir, getAbsolutePath } from '../src/fsHelpers';

import { CliOptions } from '../src/types';

const testDirs = [`vendor_tfregistry_500Error`];

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
    const configFile = `__tests__/testFiles/tfRegistry500Error.json`;
    await expectFileIssue({
      directory: `vendor_tfregistry_500Error/modules`,
      file: configFile,
    });
  });
});
