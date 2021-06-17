import { Entry, Path, Status, FetchParams } from 'src/shared/types';

import local from 'src/backend/moduleSources/local';
import gitHttps from 'src/backend/moduleSources/gitHttps';
import gitSSH from 'src/backend/moduleSources/gitSSH';
import terraformRegistry from 'src/backend/moduleSources/terraformRegistry';

const modules = {
  local,
  gitHttps,
  gitSSH,
  terraformRegistry,
};

type ModulesKeyType = keyof typeof modules;

function getType(source: Path): ModulesKeyType {
  return source === undefined
    ? undefined
    : (Object.values(modules)
        .map((module) => {
          return module.match(source);
        })
        .join(``) as ModulesKeyType);
}

async function fetch({ params, dest, fetcher, cloner }: FetchParams): Promise<Status> {
  const moduleType: ModulesKeyType = getType(params.source);
  return modules[moduleType].fetch({ params, dest, fetcher, cloner });
}

function validate(params: Entry): boolean {
  let notFoundOrNotValid = false;
  const sourceType = getType(params.source);
  if (sourceType === undefined) {
    notFoundOrNotValid = true;
  } else {
    notFoundOrNotValid = notFoundOrNotValid || modules[sourceType].validate(params);
  }
  return notFoundOrNotValid;
}

export { getType, fetch, modules, ModulesKeyType, validate };
