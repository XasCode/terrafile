/* eslint-disable no-console */
import { afterEach, beforeEach, describe, it, expect, Mock, vi } from 'vitest';
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { Command } from 'commander';
import { resolve } from 'path';
import fsh from '@jestaubach/fs-helpers';
const fsHelpers = fsh.use(fsh.default);
const { rimrafDir } = fsHelpers;
import { main, runIfMain } from '../terrafile';
import { getRandomInt, cli, spy } from '../../utils';
import { variations } from './variationsCliOptions';
import { backendVersions } from './variationsBackends';

import { TestDefinition } from '../types';

const backends = Object.keys(backendVersions);

// spies on Command.prototype.parse
// forces it to throw
// calls main(...)
// asserts the function does not rethrow
it(`swallows commander parse errors`, () => {
  const parseSpy = vi.spyOn(Command.prototype, 'parse').mockImplementation(() => {
    throw new Error(`parse failed`);
  });

  expect(() => main([`node`, `terrafile`])).not.toThrow();
  expect(parseSpy).toHaveBeenCalled();

  parseSpy.mockRestore();
});

it(`uses the supplied backend install function`, () => {
  const installSpy = vi.fn();
  const backend = { install: installSpy };

  main([`node`, `terrafile`, `install`, `--file`, `custom.json`, `--directory`, `custom/modules`], backend as any);

  expect(installSpy).toHaveBeenCalledTimes(1);
  expect(installSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      file: `custom.json`,
      directory: `custom/modules`,
      fsHelpers: expect.any(Object),
    }),
  );
});

it(`runs main when the module is the entry point`, () => {
  const runner = vi.fn().mockResolvedValue(undefined);
  const fakeModule = { id: `fake-main-module` } as NodeModule;

  runIfMain(fakeModule, runner, fakeModule);

  expect(runner).toHaveBeenCalledWith(process.argv);
});

it(`runs the built CLI as the main script`, () => {
  const scriptPath = resolve(`./dist/terrafile.js`);

  expect(existsSync(scriptPath)).toBe(true);

  const output = execFileSync(process.execPath, [scriptPath, `--version`], {
    cwd: resolve(`.`),
    encoding: `utf8`,
  });

  expect(output).toMatch(/\d+\.\d+\.\d+/);
});

// Iterate over many different combinations of valid and invalid cli args.
//   'args' - the combination of args that is being tested.
//   'command' - the backend command to execute; derived from args.
//   'options' - the options to pass to the backend cmd; derived from args.
// Test to make sure the specified args execute the backend command as expected.
//   'error' - null, if not error; or object containing at a minimum an error 'code'.
//   'stdOut' - text expected to be written to stdOut.
//   'stdErr' - text expected to be written to stdErr.
describe.each(variations)(
  `Iterate through test variations.`,
  ({
    // backends,
    args,
    command,
    options,
    error,
    stdOut,
    stdErr,
  }: TestDefinition) => {
    //NOSONAR
    beforeEach(() => {
      rimrafDir(resolve(`.`, `vendor`));
      rimrafDir(resolve(`.`, `bar`));
      spy.clear();
    });

    afterEach(() => {
      rimrafDir(resolve(`.`, `vendor`));
      rimrafDir(resolve(`.`, `bar`));
    });

    // run each test against multiple backends
    // i.e. pass the options to the specified command() on the backend
    // backends include:
    //   1) default ('') which is the backend that normally gets called by the frontend,
    //      however we'll test the backends separate from the frontends.
    //   2) mocked ('__mocks__/backend.mock) - this mocks the backend so that we can test
    //      the frontend without actually running the backend. We run the tests against
    //      the default and mocked with the same inputs and expect the same outputs to make
    //      sure that our mock successfully simulates the actual implementation
    it.each(backends)(`Check BE output (BE="%s", args="${args}")`, (backend) => {
      const { install } = backendVersions[backend];
      switch (command) {
        case `install`: {
          install({ ...options, fsHelpers });
          expect(console.log).toHaveBeenCalledWith(stdOut);
          break;
        }
        default: {
          expect(console.log).toBeCalledTimes(0);
        }
      }
    });

    // Test the frontend and the backends. Essentially this tests
    // the frontend cli interface to ensure that it processes the
    // cli arguments, executes the commands with the given options,
    // and produces the same results as the backend tests.
    it.each(backends)(`Check CLI as module (BE="%s", args="${args}")`, (backend) => {
      const myargs = [process.argv[0], resolve(`./dist/terrafile`), ...(args ? args.split(` `) : [])];
      if (backend.length > 0) {
        main(myargs, backendVersions[backend]);
      } else {
        main(myargs);
      }

      // if we successfully are running the installl command,
      if (command === `install`) {
        expect(console.log).toHaveBeenCalledWith(`${stdOut}`);
        expect(process.stdout.write).not.toHaveBeenCalled();
        expect(process.stderr.write).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
      } else {
        // if the install command is not run
        [stdOut, stdErr].forEach((cur) => {
          if (cur !== ``) {
            expect(
              cur === stdOut
                ? (process.stdout.write as Mock).mock.calls[0][0]
                : (process.stderr.write as Mock).mock.calls[0][0],
            ).toBe(`${cur}${cur.length > 0 ? `\n` : ``}`);
          }
        });
        const exitCode = (process.exit as unknown as Mock).mock.calls[0][0];
        expect(exitCode).toBe(error === null ? 0 : error.code); // no error (null) --> exit(0)
      }
    });

    // Actually executing the CLI commands is time consuming. So we only
    // execute a small sample of the tests.
    if (getRandomInt(0) === 0) {
      it(`Sample CLI (BE="%s", args="${args}")`, async () => {
        const result = await cli(`./dist/terrafile`, args ? args.split(` `) : []);
        [
          { actual: result.stdout, expected: stdOut },
          { actual: result.stderr, expected: stdErr },
        ].forEach((cur) => {
          // note that actually execing node appears to strip colors
          expect(cur.actual).toContain(`${cur.expected}`.replace(`[34m`, ``).replace(`[39m`, ``));
        });
        expect(result.error === null || result.error === undefined ? result.error : result.error.code).toBe(
          error === null ? error : error.code,
        );
      });
    }
  },
);
