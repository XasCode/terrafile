/* eslint-disable import/no-cycle */
import local from './local';
import gitHttps from './gitHttps';
import gitSSH from './gitSSH';
import terraformRegistry from './terraformRegistry';

const modules = {
  local,
  gitHttps,
  gitSSH,
  terraformRegistry,
};

type ModulesKeyType = keyof typeof modules;

export { modules, ModulesKeyType };
