/* eslint-disable import/no-cycle */
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

export { modules, ModulesKeyType };
