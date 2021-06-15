import { readFileSync } from 'fs-extra';
import { rimrafDir, getAbsolutePath, checkIfFileExists } from 'src/backend/extInterfaces/fs/fs-extra/fsHelpers';
import { getPartsFromHttp } from 'src/backend/moduleSources/common/cloneRepo';
import { replacePathIfPathParam, replaceUrlVersionIfVersionParam } from 'src/backend/moduleSources/common/git';
import { Path } from 'src/shared/types';

import { install } from 'src/backend';

import fetcher from 'src/backend/extInterfaces/fetcher/axios';
import cloner from 'src/backend/extInterfaces/cloner/git';
import mockedFetcher from 'src/backend/extInterfaces/fetcher/axios/mock';
import mockedCloner from 'src/backend/extInterfaces/cloner/git/mock';

const useFetcher = fetcher.use(mockedFetcher.mock);
const useCloner = cloner.use(mockedCloner.mock);

describe(`test backend's ability to revert on error`, () => {
  beforeAll(() => {
    rimrafDir(`vendor`);
  });

  afterAll(() => {
    rimrafDir(`vendor`);
  });

  test(`1st install successfull, then 2nd install to same loc. should fail processing file and revert dir`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `vendor/revert1`;

    // 1st install
    await install({
      file: configFile,
      directory: destination,
      fetcher: useFetcher,
      cloner: useCloner,
    });

    // verify expected directories exist
    const testJson = JSON.parse(readFileSync(getAbsolutePath(configFile).value, `utf-8`));
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      const params = testJson[modName];
      const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
      const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
      const [, repoDir] = getPartsFromHttp(regRepoUrl);
      const usePath = repoDir ? repoDir.slice(1) : '';
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}${usePath}/main.tf`).value).value).toBe(true);
    }

    // 2nd install, w/ error
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(mockedFetcher.mock),
      cloner: cloner.use(mockedCloner.mockError),
    });

    // verify expected directories exist; re-use testJson
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      const params = testJson[modName];
      const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
      const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
      const [, repoDir] = getPartsFromHttp(regRepoUrl);
      const usePath = repoDir ? repoDir.slice(1) : '';
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}${usePath}/main.tf`).value).value).toBe(true);
    }
  });

  test(`should fail creating dir`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `vendor/revert2`;

    // install, err on createDir
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(mockedFetcher.mock),
      cloner: cloner.use(mockedCloner.mockError),
      createDir: (_: Path) => null,
    });

    // verify expected directories exist; re-use testJson
    const testJson = JSON.parse(readFileSync(getAbsolutePath(configFile).value, `utf-8`));
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      const params = testJson[modName];
      const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
      const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
      const [, repoDir] = getPartsFromHttp(regRepoUrl);
      const usePath = repoDir ? repoDir.slice(1) : '';
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}${usePath}/main.tf`).value).value).toBe(false);
    }
  });

  test(`1st install successfull, then 2nd install to same location should fail creating dir and revert`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `vendor/revert3`;

    // 1st install
    await install({
      file: configFile,
      directory: destination,
      fetcher: useFetcher,
      cloner: useCloner,
    });

    // verify expected directories exist
    const testJson = JSON.parse(readFileSync(getAbsolutePath(configFile).value, `utf-8`));
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      const params = testJson[modName];
      const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
      const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
      const [, repoDir] = getPartsFromHttp(regRepoUrl);
      const usePath = repoDir ? repoDir.slice(1) : '';
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}${usePath}/main.tf`).value).value).toBe(true);
    }

    // 2nd install, w/ error
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(mockedFetcher.mock),
      cloner: cloner.use(mockedCloner.mockError),
      createDir: (_: Path) => null,
    });

    // verify expected directories exist; re-use testJson
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      const params = testJson[modName];
      const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
      const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
      const [, repoDir] = getPartsFromHttp(regRepoUrl);
      const usePath = repoDir ? repoDir.slice(1) : '';
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}${usePath}/main.tf`).value).value).toBe(true);
    }
  });
});
