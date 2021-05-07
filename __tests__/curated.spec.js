const path = require("path");

const { cli } = require("./utils");
const fsHelpers = require("../dist/src/fsHelpers");

const {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} = require("../dist/src/strings");

const version = require("../package.json").version;
const { beforeEach } = require("./spy");

const defaultOpts = { directory: "vendor/modules", file: "terrafile.json" };

// each of these commands will be execed to test cli output
const curatedCliCommands = {
  help: [`${helpContent}\n`, "", 0],
  "--version": [`${version}\n`, "", 0],
  install: [`${JSON.stringify(defaultOpts)}\n`, "", 0],
  foo: ["", `${unknownCommand}\n`, 1],
  "--error": ["", `${helpContent}\n`, 1],
  "install --bar": ["", `${unknownOptionLong}\n`, 1],
  "install -b": ["", `${unknownOptionShort}\n`, 1],
  "help install": [`${helpInstallContent}\n`, "", 0],
  "install -d <abc": [
    `{"directory":"<abc","file":"terrafile.json"}\n`,
    `Error resolving path: <abc\nError creating dir: ${fsHelpers.getAbsolutePath(
      "src/<abc"
    )}\n`,
    0,
  ],
};

describe.each(Object.keys(curatedCliCommands))(
  `should execute 'terrafile' with a set of commands/options and verify the output`,
  (cliCommand) => {
    beforeEach(() => {
      fsHelpers.rimrafDir(path.resolve(".", "./dist/vendor"));
    });

    afterEach(() => {
      fsHelpers.rimrafDir(path.resolve(".", "./dist/vendor"));
    });

    test(`check cli: ${cliCommand}`, async () => {
      const result = await cli(cliCommand.split(" "), "./dist");
      expect(result.stdout).toBe(curatedCliCommands[cliCommand][0]);
      expect(result.stderr).toBe(curatedCliCommands[cliCommand][1]);
      expect(result.code).toBe(curatedCliCommands[cliCommand][2]);
    });
  }
);
