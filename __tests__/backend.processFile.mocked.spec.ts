import { readFileSync } from 'fs-extra';
import { mockAxiosGetTerraformUrl, mockCliSuccess, spy } from './testUtils';
import * as fsHelpers from '../src/fsHelpers';

// mock so that we don't actually fetch from remote locations
mockAxiosGetTerraformUrl();
mockCliSuccess();

import { readFileContents } from '../src/processFile';
import { getAbsolutePath, createDir, touchFile, rimrafDirs, checkIfFileExists } from '../src/fsHelpers';

import { CliOptions } from '../src/types';

const testDirs = [`err_vendor1`, `err_vendor2`, `err_vendor3`, `err_vendor_lerror`, `err_vendor_2x`];

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

  test(`should successfully read a valid terrafile when provided a relative path`, async () => {
    const configFile = `terrafile.sample.json`;
    const retVals = await readFileContents({
      directory: `err_vendor1/modules`,
      file: configFile,
    });
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(readFileSync(getAbsolutePath(`terrafile.sample.json`), `utf-8`));
    expect(Object.keys(testJson).length).toBe(31);
    for (const modName of Object.keys(testJson)) {
      const usePath = testJson[modName].path !== undefined ? testJson[modName].path : '';
      expect(
        checkIfFileExists(getAbsolutePath(`err_vendor1/modules/${modName}${usePath}/main.tf`))
          ? checkIfFileExists(getAbsolutePath(`err_vendor1/modules/${modName}${usePath}/main.tf`))
          : fsHelpers.createDir(getAbsolutePath(`err_vendor1/modules/${modName}${usePath}`)),
      ).toBe(true);
    }
  });

  test(`should successfully read a valid terrafile when provided an absolute path`, async () => {
    const configFile = getAbsolutePath(`terrafile.sample.json`);
    const retVals = await readFileContents({
      directory: `err_vendor2/modules`,
      file: configFile,
    });
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
  });

  test(`should err on lack read access to file`, async () => {
    const configFile = `err_vendor3/no_access_file`;
    createDir(getAbsolutePath(`${configFile}/..`));
    touchFile(getAbsolutePath(configFile), 0);
    await expectFileIssue({ file: configFile });
  });

  // test various bad paths and files
  test.each([
    undefined, // options no provided - no module definition location
    {}, // no file option provided for a module definition
    { file: `` }, // no path provided to a module defintion file
    { file: getAbsolutePath(`.`) }, // a directory provided as a module defintion file
    { file: `does_not_exist` }, // path to module definition file does not exist
    { file: `__tests__/testFiles/invalid.txt` }, // module definitions are not json
    { file: `__tests__/testFiles/invalid.json` }, // json - but doesn't provide valid module definitions
    { file: `__tests__/testFiles/invalid2.json` }, // local module definition includes invalid field
    { file: `__tests__/testFiles/invalid3.json` }, // gitHttps module definition includes invalid field
    { file: `__tests__/testFiles/invalid4.json` }, // terraform module definition includes invalid field
    { file: `__tests__/testFiles/invalid5.json` }, // gitSSH module definition includes invalid field
  ])(`should err when bad file provided: %s`, async (badFileOption) => {
    await expectFileIssue(badFileOption);
  });

  // valid local module definition - but location of module does not exist
  test(`should err on bad local dir`, async () => {
    const configFile = `__tests__/testFiles/localError.json`;
    await expectFileIssue({
      directory: `err_vendor_lerror/testFiles/modules`,
      file: configFile,
    });
  });

  // two modules with same name and location collision
  test(`should err on copy 2x`, async () => {
    const configFile = `__tests__/testFiles/local2xError.json`;
    const options = {
      directory: `err_vendor_2x/modules`,
      file: configFile,
    };
    await readFileContents(options); // 1st call to readFileContents
    await expectFileIssue(options); // 2nd call to readFileContents, tries to copy module to same location
  });
});
