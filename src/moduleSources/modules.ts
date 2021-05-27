/* eslint-disable import/no-cycle */
import local from 'src/moduleSources/local';
import gitHttps from 'src/moduleSources/gitHttps';
import gitSSH from 'src/moduleSources/gitSSH';
import terraformRegistry from 'src/moduleSources/terraformRegistry';

const modules = {
  local,
  gitHttps,
  gitSSH,
  terraformRegistry,
};

type ModulesKeyType = keyof typeof modules;

export { modules, ModulesKeyType };
