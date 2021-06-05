import { readFileSync } from 'fs-extra';

import { readFileContents } from 'src/processFile';
import { rimrafDirs, getAbsolutePath, checkIfFileExists } from 'src/fsHelpers';
import { spy } from '__tests__/testUtils';
import { CliOptions } from 'src/types';

import fetcher from 'src/libs/fetcher/axios';
import cloner from 'src/libs/cloner/git';

const testDirs = [`be_vendor_tfregistry_error`, `be_vendor_empty`, `be_vendor_live`];

describe(`read file contents should read specified json file and validate its contents`, () => {
  beforeEach(() => {
    rimrafDirs(testDirs);
    spy.clear();
  });

  afterEach(() => {
    rimrafDirs(testDirs);
  });

  // expected result when provide bad file path
  async function expectFileIssue(options: CliOptions): Promise<void> {
    const retVals = await readFileContents(options);
    expect(retVals.success).toBe(false);
    expect(retVals.contents).toBe(null);
  }

  // module definition source points to non-existent terraform module
  test(`should err on bad terraform registry`, async () => {
    const configFile = `__tests__/testFiles/tfRegistryError.json`;
    await expectFileIssue({
      directory: `be_vendor_tfregistry_error/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.default),
      cloner: cloner.use(cloner.default),
    });
  });

  // modude definition source contains empty string (non-existent terraform module)
  test(`should err on empty source`, async () => {
    const configFile = `__tests__/testFiles/tfRegistryEmptyError.json`;
    const options = {
      directory: `be_vendor_empty/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.default),
      cloner: cloner.use(cloner.default),
    };
    await expectFileIssue(options);
  });

  // perform actual (not mocked) test of fetching module from terraform registry
  test(`run live against teraform registry`, async () => {
    const configFile = `__tests__/testFiles/tfRegistryLive.json`;
    const options = {
      directory: `be_vendor_live/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.default),
      cloner: cloner.use(cloner.default),
    };
    const retVals = await readFileContents(options);
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(readFileSync(getAbsolutePath(`__tests__/testFiles/tfRegistryLive.json`), `utf-8`));
    expect(Object.keys(testJson).length).toBe(1);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`${options.directory}/${modName}/main.tf`))).toBe(true);
    }
  });

  // TODO: test live gitSSH

  // TODO: test live gitHTTPS
});
