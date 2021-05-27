import { startsWith } from 'src/utils';
import { Entry, Path } from 'src/types';
import { fetch } from 'src/moduleSources/common/git';
import type { ModulesKeyType } from 'src/moduleSources/modules';

const acceptable = [`comment`, `source`, `version`, `path`];

function match(source: Path): ModulesKeyType | `` {
  return startsWith(source, `https://`) ? `gitHttps` : ``;
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
