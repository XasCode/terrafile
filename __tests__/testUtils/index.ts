import {
  mockAxiosGetTerraformUrl,
  mockAxiosGetTerraformUrl500Error,
  mockAxiosGetTerraformUrlNoXTFGetError,
  mockAxiosGetTerraformUrlFormatError,
  mockCliError,
  mockCliSuccess,
} from './mock';
import * as spy from './spy';
import { cartesian } from './cartesian';
import { cli } from './cli';
import { getRandomInt, randomizeOrder } from './randomFunctions';
import { variations } from './variationsCliOptions';
import { backendVersions } from './variationsBackends';

export {
  backendVersions,
  cartesian,
  cli,
  getRandomInt,
  mockAxiosGetTerraformUrl,
  mockAxiosGetTerraformUrl500Error,
  mockAxiosGetTerraformUrlNoXTFGetError,
  mockAxiosGetTerraformUrlFormatError,
  mockCliError,
  mockCliSuccess,
  randomizeOrder,
  spy,
  variations,
};
