const helpContent = `Usage: terrafile [options] [command]

Manage vendored modules using a JSON file.

Options:
  -V, --version      Show version information for terrafile
  -h, --help         display help for command

Commands:
  install [options]  Installs the files in your terrafile.json
  help [command]     display help for command`;

const helpInstallContent = `Usage: terrafile install [options]

Installs the files in your terrafile.json

Options:
  -d, --directory <string>  module directory (default: "vendor/modules")
  -f, --file <string>       config file (default: "terrafile.json")
  -h, --help                display help for command`;

const unknownCommand = `error: unknown command 'foo'. See 'terrafile --help'.`;

const unknownOptionShort = `error: unknown option '-b'`;
const unknownOptionLong = `error: unknown option '--bar'`;

export {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
};
