import { install as defaultInstall, Backend } from '@jestaubach/terrafile-backend-lib';
import { install as mockedInstall } from '../../__mocks__/backend.mock';

const backendVersions: Record<string, Backend> = {
  '': { install: defaultInstall },
  './backend.mock.ts': { install: mockedInstall },
};

export { backendVersions };
