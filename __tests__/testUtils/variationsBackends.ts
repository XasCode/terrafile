import { Backend } from 'src/shared/types';
import { install as defaultInstall } from 'src/backend';
import { install as mockedInstall } from '../../__mocks__/backend.mock';

const backendVersions: Record<string, Backend> = {
  '': { install: defaultInstall },
  './backend.mock.ts': { install: mockedInstall },
};

export { backendVersions };
