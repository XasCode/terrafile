import { Entry, Path, Status } from '../types';
import { modules, ModulesKeyType } from './modules';

function getType(source: Path): ModulesKeyType {
  return source === undefined
    ? undefined
    : (Object.values(modules)
      .map((module) => module.match(source))
      .join(``) as ModulesKeyType);
}

async function fetch(params: Entry, dest: Path): Promise<Status> {
  const moduleType: ModulesKeyType = getType(params.source);
  return modules[moduleType].fetch(params, dest);
}

function validateFieldsForEachModuleEntry(params: Entry): boolean {
  let notFoundOrNotValid = false;
  const sourceType = getType(params.source);
  if (sourceType === undefined) {
    notFoundOrNotValid = true;
  } else {
    // const moduleType: ModulesKeyType = getType(params.source);
    notFoundOrNotValid = notFoundOrNotValid || modules[sourceType].validate(params);
  }
  return notFoundOrNotValid;
}

export default {
  getType,
  fetch,
  modules,
  validate: validateFieldsForEachModuleEntry,
};
