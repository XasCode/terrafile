import { readFileSync } from 'fs-extra';

import { readFileContents } from '../src/processFile';
import {
  rimrafDir,
  getAbsolutePath,
  checkIfFileExists,
} from '../src/fsHelpers';
import { beforeEach as _beforeEach } from './spy';
import { CliOptions } from '../src/types';

const testDirs = [
  'be_vendor_tfregistry_error',
  'be_vendor_empty',
  'be_vendor_live',
];
const cleanUpTestDirs = () =>
  testDirs.map((testDir) => rimrafDir(getAbsolutePath(testDir)));

describe('read file contents should read specified json file and validate its contents', () => {
  beforeEach(() => {
    cleanUpTestDirs();
    _beforeEach();
  });

  afterEach(() => {
    cleanUpTestDirs();
  });

  // expected result when provide bad file path
  async function expectFileIssue(options: CliOptions): Promise<void> {
    const retVals = await readFileContents(options);
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  }

  test('should err on bad terraform registry', async () => {
    const configFile = '__tests__/tfRegistryError.json';
    await expectFileIssue({
      directory: 'be_vendor_tfregistry_error/modules',
      file: configFile,
    });
  });

  test('should err on empty source', async () => {
    const configFile = '__tests__/tfRegistryEmptyError.json';
    const options = {
      directory: 'be_vendor_empty/modules',
      file: configFile,
    };
    await expectFileIssue(options);
  });

  test('run live against teeraform registry', async () => {
    const configFile = '__tests__/tfRegistryLive.json';
    const options = {
      directory: 'be_vendor_live/modules',
      file: configFile,
    };
    const retVals = await readFileContents(options);
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(
      readFileSync(getAbsolutePath('__tests__/tfRegistryLive.json'), 'utf-8')
    );
    expect(Object.keys(testJson).length).toBe(1);
    for (const modName of Object.keys(testJson)) {
      expect(
        checkIfFileExists(
          getAbsolutePath(`${options.directory}/${modName}/main.tf`)
        )
      ).toBe(true);
    }
  });
});

export {};
