#!/usr/bin/env node

const { Command, Option } = require('commander');
const program = new Command();
program
  .version(require('./package.json').version, '-V, --version', 'Show version information for terrafile')
  .description(`Manage vendored modules using a JSON file.`);

program
  .command('install')
  .description('Installs the files in your terrafile.json')
  .action((options) => {
    //console.log(`options: ${JSON.stringify(options)}`);
    const backend = `${process.env.terrafile_be_api ? process.env.terrafile_be_api : './include'}`;
    const { install } = require(backend);
    install(options);
  })
  .addOption(new Option('-d, --directory <string>', 'module directory').default('vendor/modules'))
  .addOption(new Option('-f, --file <string>', 'config file').default('terrafile.json'));

program.parse(process.argv);
