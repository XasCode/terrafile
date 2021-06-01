const git = jest.fn().mockImplementation(async (args, cwd) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fsHelpersLocal = require(`src/fsHelpers`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pathLocal = require(`path`);
  const fullDest = fsHelpersLocal.getAbsolutePath(cwd || args.slice(-1)[0]);
  const usePath: string =
    args.filter((cur: string) => cur === 'sparse-checkout').length > 0
      ? pathLocal.resolve(fsHelpersLocal.getAbsolutePath(fullDest), args.slice(-1)[0].slice(1))
      : fullDest;
  if (!fsHelpersLocal.checkIfDirExists(usePath)) {
    await fsHelpersLocal.createDir(fsHelpersLocal.getAbsolutePath(usePath));
    await fsHelpersLocal.touchFile(`${usePath}${pathLocal.sep}main.tf`);
  }
  return {
    error: null,
    stdout: ``,
    stderr: ``,
  };
});

export { git };
