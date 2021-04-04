const path = require("path");

const { main } = require("../src/terrafile");
const { getRandomInt, cli, cartesian } = require("../src/utils");
const {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} = require("../src/strings");

const backendVersions = {
  "": require("../src/backend"),
  "./backend.js": require("../src/backend.js"),
  "./backend.mock.js": require("../__mocks__/backend.mock.js"),
};

const version = require("../package.json").version;

const defaultOpts = { directory: "vendor/modules", file: "terrafile.json" };

const consoleSpyLog = jest.spyOn(console, "log").mockImplementation();
const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
const consoleSpyErr = jest.spyOn(console, "error").mockImplementation();
const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

const helpCommands = ["", "help"];
const commands = ["", "install", "foo"];
const helps = ["", "-h", "--help"];
const versions = ["", "-V", "--version"];
const directories = ["", "-d bar", "--directory bar"];
const files = ["", "-f foobar", "--file foobar"];
const badOptions = ["", "-b", "--bar"];

const combinations = cartesian(
  helpCommands,
  commands,
  helps,
  versions,
  directories,
  files,
  badOptions
);

// Specify the options that should be passed to the install command
function getOptions({ directory, file }) {
  return {
    ...defaultOpts,
    ...(directory !== "" ? { directory: directory.split(" ")[1] } : {}),
    ...(file !== "" ? { file: file.split(" ")[1] } : {}),
  };
}

// Specify the results for the CLI
function getResults({
  ver,
  helpCommand,
  command,
  help,
  badOption,
  directory,
  file,
}) {
  if (ver !== "") {
    // if -V/--version then will print version and return code = 0
    return {
      code: 0,
      stdOut: version,
      stdErr: "",
    };
  } else if ((helpCommand !== "" || help !== "") && command === "install") {
    // if help + valid command, i.e. "help install" return code = 0
    return {
      code: 0,
      stdOut: helpInstallContent,
      stdErr: "",
    };
  } else if ((helpCommand !== "" || help !== "") && command === "") {
    // if help and no command, return code = 0
    return {
      code: 0,
      stdOut: helpContent,
      stdErr: "",
    };
  } else if (helpCommand !== "") {
    // if help command and invalid command
    return {
      code: 1,
      stdOut: "",
      stdErr: helpContent,
    };
  } else if (help !== "") {
    // if invalid command and help
    return {
      code: 0,
      stdOut: helpContent,
      stdErr: "",
    };
  } else if (command === "") {
    // no command and no "help..."
    return {
      code: 1,
      stdOut: "",
      stdErr: helpContent,
    };
  } else if (command !== "install") {
    // if command not valid
    return {
      code: 1,
      stdOut: "",
      stdErr: unknownCommand,
    };
  } else if (badOption !== "" && command === "install") {
    // if command is valid (i.e. install) and invalid option flag
    return {
      code: 1,
      stdOut: "",
      stdErr: badOption[1] === "-" ? unknownOptionLong : unknownOptionShort,
    };
  } else {
    // do install,
    return {
      code: 0,
      stdOut: JSON.stringify(getOptions({ directory, file })),
      stdErr: "",
    };
  }
}

// Determines if the install command will be run
function getCommand({ command, helpCommand, ver, help, badOption }) {
  return command === "install" &&
    helpCommand === "" &&
    ver === "" &&
    help === "" &&
    badOption === ""
    ? "install"
    : "";
}

// Assembles the various options into a command
function getArgs({
  helpCommand,
  command,
  help,
  ver,
  directory,
  file,
  badOption,
}) {
  return `${helpCommand} ${command} ${help} ${ver} ${directory} ${file} ${badOption}`
    .split(" ")
    .filter((cur) => cur.length > 0)
    .join(" ");
}
const variations = combinations.map(
  ([helpCommand, command, help, ver, directory, file, badOption]) => {
    const allArgs = {
      helpCommand,
      command,
      help,
      ver,
      directory,
      file,
      badOption,
    };

    // Add each test case to variations list
    return {
      // run tests across a list of api implementations / mocks
      backends: Object.keys(backendVersions),
      args: getArgs(allArgs), // the test command
      command: getCommand(allArgs), // api command to run or ""
      options: {
        ...defaultOpts,
        ...(directory !== "" ? { directory: directory.split(" ")[1] } : {}),
        ...(file !== "" ? { file: file.split(" ")[1] } : {}),
      },
      ...getResults(allArgs),
    };
  }
);

// For each test case, we test both the implementations / mocks (BE) only
// and the results of running via the CLI with each implementaiton / mock
describe.each(variations)(
  `Iterate through test variations.`,
  async ({ backends, args, command, options, code, stdOut, stdErr }) => {
    beforeEach(() => {
      consoleSpyLog.mockClear();
      consoleSpyErr.mockClear();
      stdoutSpy.mockClear();
      stderrSpy.mockClear();
      mockExit.mockClear();
    });

    // test the implementations / mocks (BE)
    test.each(backends)(
      `Check BE output (BE="%s", args="${args}")`,
      async (backend) => {
        const { install } = backendVersions[backend];
        switch (command) {
          case "install": {
            install(options);
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenLastCalledWith(stdOut);
            break;
          }
          default: {
            expect(console.log).toBeCalledTimes(0);
          }
        }
      }
    );

    test.each(backends)(
      `Check CLI as module (BE="%s", args="${args}")`,
      async (backend) => {
        const myargs = [
          process.argv[0],
          path.resolve("./src/terrafile"),
          ...(args.length > 0 ? args.split(" ") : []),
        ];
        backend.length > 0
          ? main(myargs, backendVersions[backend])
          : main(myargs);

        // if we successfully are running the installl command,
        if (command === "install") {
          expect(console.log).toHaveBeenLastCalledWith(`${stdOut}`);
          expect(process.stdout.write).not.toHaveBeenCalled();
          expect(process.stderr.write).not.toHaveBeenCalled();
          expect(console.error).not.toHaveBeenCalled();
          expect(process.exit).not.toHaveBeenCalled();
        } else {
          // if the install command is not run
          if (stdOut !== "") {
            expect(process.stdout.write.mock.calls[0][0]).toBe(
              `${stdOut}${stdOut.length > 0 ? "\n" : ""}`
            );
          }
          if (stdErr !== "") {
            expect(process.stderr.write.mock.calls[0][0]).toBe(
              `${stdErr}${stdErr.length > 0 ? "\n" : ""}`
            );
          }
          expect(process.exit.mock.calls[0][0]).toBe(code);
        }
      }
    );

    // sample CLI commands
    if (getRandomInt(200) === 0) {
      test(`Sample CLI (BE="%s", args="${args}")`, async () => {
        const result = await cli(args.split(" "), ".");
        expect(result.stdout).toBe(`${stdOut}${stdOut.length > 0 ? "\n" : ""}`);
        expect(result.stderr).toBe(`${stdErr}${stdErr.length > 0 ? "\n" : ""}`);
        expect(result.code).toBe(code);
      });
    }
  }
);
