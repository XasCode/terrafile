import { startsWith } from 'src/backend/moduleSources/common/startsWith';
import { Entry, Path } from 'src/shared/types';
import { fetch } from 'src/backend/moduleSources/common/git';
import type { ModulesKeyType } from 'src/backend/moduleSources/modules';

const acceptable = [`comment`, `source`, `version`, `path`];

function match(source: Path): ModulesKeyType | `` {
  return startsWith(source, `git@`) ? `gitSSH` : ``;
}

function validate(params: Entry): boolean {
  let notFoundOrNotValid = false;
  const paramKeys = Object.keys(params);
  for (const param of paramKeys) {
    if (!acceptable.includes(param)) {
      notFoundOrNotValid = true;
    }
  }
  return notFoundOrNotValid;
}

export default { match, fetch, validate };
