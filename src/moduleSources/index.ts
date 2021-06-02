import { Entry, Path, Status, Config, RetVal, RetString } from 'src/types';
import { modules } from 'src/moduleSources/modules';
import type { ModulesKeyType } from 'src/moduleSources/modules';

function getType(source: Path): ModulesKeyType {
  return source === undefined
    ? undefined
    : (Object.values(modules)
        .map((module) => module.match(source))
        .join(``) as ModulesKeyType);
}

async function fetch(
  params: Entry,
  dest: Path,
  fetcher: (_: Config) => Promise<RetString>,
  cloner: (_: Config) => Promise<RetVal>,
): Promise<Status> {
  const moduleType: ModulesKeyType = getType(params.source);
  console.log(`moduleType: ${params.source} | ${dest} | ${moduleType}`);
  const fetchResults = await modules[moduleType].fetch(params, dest, fetcher, cloner);
  console.log(`fetchResults: ${JSON.stringify(fetchResults)} | ${dest} | ${moduleType}`);
  return fetchResults;
}

function validateFieldsForEachModuleEntry(params: Entry): boolean {
  let notFoundOrNotValid = false;
  const sourceType = getType(params.source);
  if (sourceType === undefined) {
    notFoundOrNotValid = true;
  } else {
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
