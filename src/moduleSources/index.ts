import { Entry, Path, Status } from '../types';
import { modules, ModulesKeyType } from './modules';

function getType(source: Path): ModulesKeyType {
  return source === undefined
    ? undefined
    : (Object.values(modules)
        .map((module) => module.match(source))
        .join('') as ModulesKeyType);
}

async function fetch(params: Entry, dest: Path): Promise<Status> {
  const moduleType: ModulesKeyType = getType(params.source);
  return moduleType
    ? await modules[moduleType].fetch(params, dest)
    : ({} as Status);
}

export default { getType, fetch, modules };
