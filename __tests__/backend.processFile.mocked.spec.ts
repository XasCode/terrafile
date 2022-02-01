import { readFileSync } from 'fs-extra';
import { spy } from '__tests__/testUtils';

import { readFileContents } from 'src/backend/processFile';

import { CliOptions, ExecResult } from 'src/shared/types';

import fetcher from '@jestaubach/fetcher-axios';
import cloner from '@jestaubach/cloner-git';
import fsHelpers from '@jestaubach/fs-helpers';

const useFsHelpers = fsHelpers.use(fsHelpers.mock, [`__tests__/testFiles/terrafile.test.json`, `./__tests__/modules/test-module/main.tf`, `terrafile.sample.json`]);
const useFetcher = fetcher.use(fetcher.mock);
const useCloner = cloner.use(cloner.mock(useFsHelpers) as (_:string[],__:string) => Promise<ExecResult>);
const { 
  getAbsolutePath,
  createDir,
  touchFile,
  rimrafDirs,
  checkIfFileExists,
} = useFsHelpers;

const testDirs = [`err_vendor1`, `err_vendor2`, `err_vendor3`, `err_vendor4`, `err_vendor_lerror`, `err_vendor_2x`];

describe(`read file contents should read specified json file and validate its contents`, () => {
  beforeAll(() => {
    rimrafDirs(testDirs);
  });

  beforeEach(() => {
    spy.clear();
  });

  afterAll(() => {
    rimrafDirs(testDirs);
  });

  // expected result when provide bad file path
  async function expectFileIssue(options: CliOptions): Promise<void> {
    const retVals = await readFileContents(options);
    expect(retVals.success).toBe(false);
  }

  test(`should successfully read a valid terrafile when provided a relative path`, async () => {
    const configFile = `__tests__/testFiles/terrafile.test.json`;
    const retVals = await readFileContents({
      directory: `err_vendor1/modules`,
      file: configFile,
      fetcher: useFetcher,
      cloner: useCloner,
      fsHelpers: useFsHelpers,
    });
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(readFileSync(getAbsolutePath(configFile).value, `utf-8`));
    expect(Object.keys(testJson).length).toBe(31);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`err_vendor1/modules/${modName}/main.tf`).value).value).toBe(true);
    }
  });

  test(`should successfully read a valid terrafile when provided an absolute path`, async () => {
    const configFile = getAbsolutePath(`__tests__/testFiles/terrafile.test.json`).value;
    const retVals = await readFileContents({
      directory: `err_vendor2/modules`,
      file: configFile,
      fetcher: useFetcher,
      cloner: useCloner,
      fsHelpers: useFsHelpers,
    });
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(readFileSync(getAbsolutePath(configFile).value, `utf-8`));
    expect(Object.keys(testJson).length).toBe(31);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`err_vendor2/modules/${modName}/main.tf`).value).value).toBe(true);
    }
  });

  test(`ensure our sample file passes tests`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `err_vendor3/modules`;
    const retVals = await readFileContents({
      directory: destination,
      file: configFile,
      fetcher: useFetcher,
      cloner: useCloner,
      fsHelpers: useFsHelpers,
    });
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(readFileSync(getAbsolutePath(configFile).value, `utf-8`));
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}/main.tf`).value).value).toBe(true);
    }
  });

  test(`should err on lack read access to file`, async () => {
    const configFile = `err_vendor4/no_access_file`;
    createDir(getAbsolutePath(`${configFile}/..`).value);
    touchFile(getAbsolutePath(configFile).value, 0);
    await expectFileIssue({ file: configFile, fsHelpers: useFsHelpers });
  });

  // test various bad paths and files
  test.each([
    undefined, // options no provided - no module definition location
    {}, // no file option provided for a module definition
    { file: `` }, // no path provided to a module defintion file
    { file: getAbsolutePath(`.`).value }, // a directory provided as a module defintion file
    { file: `does_not_exist` }, // path to module definition file does not exist
    { file: `__tests__/testFiles/invalid.txt` }, // module definitions are not json
    { file: `__tests__/testFiles/invalid.json` }, // json - but doesn't provide valid module definitions
    { file: `__tests__/testFiles/invalid2.json` }, // local module definition includes invalid field
    { file: `__tests__/testFiles/invalid3.json` }, // gitHttps module definition includes invalid field
    { file: `__tests__/testFiles/invalid4.json` }, // terraform module definition includes invalid field
    { file: `__tests__/testFiles/invalid5.json` }, // gitSSH module definition includes invalid field
  ])(`should err when bad file provided: %s`, async (badFileOption) => {
    await expectFileIssue({ ...badFileOption, fsHelpers: useFsHelpers});
  });

  // valid local module definition - but location of module does not exist
  test(`should err on bad local dir`, async () => {
    const configFile = `__tests__/testFiles/localError.json`;
    await expectFileIssue({
      directory: `err_vendor_lerror/testFiles/modules`,
      file: configFile,
      fetcher: useFetcher,
      cloner: useCloner,
      fsHelpers: useFsHelpers,
    });
  });

  // two modules with same name and location collision
  test(`should err on copy 2x`, async () => {
    const configFile = `__tests__/testFiles/local2xError.json`;
    const options = {
      directory: `err_vendor_2x/modules`,
      file: configFile,
      fetcher: useFetcher,
      cloner: useCloner,
      fsHelpers: useFsHelpers,
    };
    await readFileContents(options); // 1st call to readFileContents
    await expectFileIssue(options); // 2nd call to readFileContents, tries to copy module to same location
  });
});
