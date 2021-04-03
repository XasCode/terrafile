const path = require("path");

const { main } = require("./terrafile");
const { getRandomInt, cli } = require("./utils");
const {
  helpContent,
  helpInstallContent,
  unknownCommand,
  unknownOptionLong,
  unknownOptionShort,
} = require("./strings");

const backendVersions = {
  "": require("./backend"),
  "./backend.js": require("./backend.js"),
  "./backend.mock.js": require("./backend.mock.js"),
};

const consoleSpyLog = jest.spyOn(console, "log").mockImplementation();
const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
const consoleSpyErr = jest.spyOn(console, "error").mockImplementation();
const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

const defaultOpts = { directory: "vendor/modules", file: "terrafile.json" };

const version = require("../package.json").version;

const helpCommands = ["", "help"];
const commands = ["", "install", "foo"];
const helps = ["", "-h", "--help"];
const versions = ["", "-V", "--version"];
const directories = ["", "-d bar", "--directory bar"];
const files = ["", "-f foobar", "--file foobar"];
const badOptions = ["", "-b", "--bar"];

const variations = [];

for (helpCommand of helpCommands) {
  for (command of commands) {
    for (help of helps) {
      for (ver of versions) {
        for (directory of directories) {
          for (file of files) {
            for (badOption of badOptions) {
              // Specify the options that should be passed to the install command
              function getOptions() {
                return {
                  ...defaultOpts,
                  ...(directory !== ""
                    ? { directory: directory.split(" ")[1] }
                    : {}), // -d/--directory override default directory
                  // -f/--file override default config file
                  ...(file !== "" ? { file: file.split(" ")[1] } : {}),
                };
              }
              // Specify the return code for the CLI
              function getCode() {
                // if -V/--version then will print version and return code = 0
                if (ver !== "") {
                  return 0;
                }
                // if help + valid command, i.e. "help install" return code = 0
                if (helpCommand !== "" && command === "install") {
                  return 0;
                }
                // if help and no command, return code = 0
                if (helpCommand !== "" && command === "") {
                  return 0;
                }
                // if help and invalid command, i.e. "help foo" return code = 1
                if (helpCommand !== "") {
                  return 1;
                }
                // "-h/--help" flag return code = 0
                if (help !== "") {
                  return 0;
                }
                // if command not valid (i.e. not install) and no "help...", then return code = 1
                if (helpCommand === "" && command !== "install") {
                  return 1;
                }
                // if command is valid (i.e. install) and an invalid option flag specified return code = 1
                if (badOption !== "" && command === "install") {
                  return 1;
                }
                return 0; // anything else,
              }
              // Determines if the install command will be run
              function getCommand() {
                return command === "install" &&
                  helpCommand === "" &&
                  ver === "" &&
                  help === "" &&
                  badOption === ""
                  ? "install"
                  : "";
              }
              // Assembles the various options into a command
              function getArgs() {
                return `${helpCommand} ${command} ${help} ${ver} ${directory} ${file} ${badOption}`
                  .split(" ")
                  .filter((cur) => cur.length > 0)
                  .join(" ");
              }

              // Add each test case to variations list
              variations.push({
                // run tests across a list of api implementations / mocks
                backends: Object.keys(backendVersions),
                args: getArgs(), // the test command
                command: getCommand(), // api command to run or ""
                options: {
                  // arguments to be passed to the api command
                  ...defaultOpts,
                  ...(directory !== ""
                    ? { directory: directory.split(" ")[1] }
                    : {}),
                  ...(file !== "" ? { file: file.split(" ")[1] } : {}),
                },
                code: getCode(), // the expected cli return code
                stdOut:
                  getArgs() === ""
                    ? "" // the expected cli stdout output
                    : ver !== ""
                    ? version // -V/--version
                    : command !== "install" &&
                      command !== "" &&
                      helpCommand !== ""
                    ? "" // help foo (error unknown command)
                    : command !== "install" && command !== "" && help === ""
                    ? "" // foo (error unknown command)
                    : command === "install" && helpCommand !== ""
                    ? helpInstallContent // help install (show command help)
                    : command === "install" && help !== ""
                    ? helpInstallContent // install -h/--help (show command help)
                    : getCommand() !== "install" &&
                      (helpCommand === "help" || help !== "")
                    ? helpContent // install command not run and help/-h/--help (display help usage)
                    : command === "install" && badOption !== ""
                    ? "" // install -b/--bar (error unknown option)
                    : getCommand() !== "install" && help === ""
                    ? "" // install command not run and not -h/--help (error no command)
                    : getCommand() === "install" &&
                      helpCommand === "" &&
                      help === "" &&
                      badOption === ""
                    ? JSON.stringify(getOptions()) // output from running install!!!
                    : "", // otherwise, no output to stdout
                stdErr:
                  getArgs() === ""
                    ? helpContent // the expected cli stderr output
                    : ver !== ""
                    ? "" // -V/--version (not error)
                    : command !== "install" &&
                      command !== "" &&
                      helpCommand !== ""
                    ? helpContent // help foo (error display usage)
                    : command !== "install" && command !== "" && help === ""
                    ? unknownCommand // foo (error unknown command)
                    : command === "install" && helpCommand !== ""
                    ? "" // help install (not error)
                    : command === "install" && help !== ""
                    ? "" // install -h/--help (not error)
                    : getCommand() !== "install" &&
                      (helpCommand === "help" || help !== "")
                    ? "" // install command not run and help/-h/--help (not error)
                    : command === "install" && badOption !== ""
                    ? badOption[1] === "-"
                      ? unknownOptionLong
                      : unknownOptionShort //install -b/--bar (error unknown option)
                    : getCommand() !== "install" && help === ""
                    ? helpContent // install command not run and not -h/--help (error no command)
                    : getCommand() === "install" &&
                      helpCommand === "" &&
                      help === "" &&
                      badOption === ""
                    ? "" // output from running install!!!
                    : "", // otherwise, no output to stderr
              });
            }
          }
        }
      }
    }
  }
}

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
        const result = await cli(
          args.split(" "),
          //randomizeOrder(args.split(" ")),
          "."
        );
        expect(result.stdout).toBe(`${stdOut}${stdOut.length > 0 ? "\n" : ""}`);
        expect(result.stderr).toBe(`${stdErr}${stdErr.length > 0 ? "\n" : ""}`);
        expect(result.code).toBe(code);
      });
    }
  }
);

// each of these commands will be execed to test cli output
const curatedCliCommands = {
  help: [`${helpContent}\n`, "", 0],
  "--version": [`${version}\n`, "", 0],
  install: [`${JSON.stringify(defaultOpts)}\n`, "", 0],
  foo: ["", `${unknownCommand}\n`, 1],
  "--error": ["", `${helpContent}\n`, 1],
  "install --bar": ["", `${unknownOptionLong}\n`, 1],
};

describe.each(Object.keys(curatedCliCommands))(
  `should execute 'terrafile' with a set of commands/options and verify the output`,
  (cliCommand) => {
    test(`check cli: ${cliCommand}`, async () => {
      const result = await cli(cliCommand.split(" "), "./src");
      expect(result.stdout).toBe(curatedCliCommands[cliCommand][0]);
      expect(result.stderr).toBe(curatedCliCommands[cliCommand][1]);
      expect(result.code).toBe(curatedCliCommands[cliCommand][2]);
    });
  }
);
