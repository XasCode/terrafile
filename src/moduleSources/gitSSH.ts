import { startsWith } from '../utils';
import { Path } from '../types';
import { fetch } from './common/git';
import { ModulesKeyType } from './modules';

function match(source: Path): ModulesKeyType | '' {
  return startsWith(source, 'git@') ? 'gitSSH' : '';
}

export default { match, fetch };
