import { install as defaultInstall } from 'src/backend';
import { install as mockedInstall } from '__mocks__/backend.mock';

import { Backend } from 'src/types';

const backendVersions: Record<string, Backend> = {
  '': { install: defaultInstall },
  './backend.mock.ts': { install: mockedInstall },
};

export { backendVersions };
