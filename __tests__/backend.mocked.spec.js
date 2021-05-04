const path = require("path");
const fs = require("fs-extra");

jest.mock("axios", () => ({
  default: jest.fn((opts) => {
    //console.log(opts);
    return {
      status: 204,
      headers: {
        "x-terraform-get":
          "git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0",
      },
    };
  }),
}));
//const axios = require("axios");

jest.mock("../dist/run", () => {
  return {
    run: jest.fn().mockImplementation((args, cwd) => {
      const fsHelpersLocal = require("../dist/fsHelpers");
      const pathLocal = require("path");
      const fullDest = fsHelpersLocal.getAbsolutePath(cwd || args.slice(-1)[0]);
      if (!fsHelpersLocal.checkIfDirExists(fullDest)) {
        fsHelpersLocal.createDir(fullDest);
        fsHelpersLocal.touchFile(`${fullDest}${pathLocal.sep}main.tf`);
      }
      return {
        code: 0,
        error: null,
        stdout: "",
        stderr: "",
      };
    }),
  };
});

const venDir = require("../dist/venDir");
const terraFile = require("../dist/processFile");
const fsHelpers = require("../dist/fsHelpers");
const spy = require("./spy");
const jestConfig = require("../jest.config");

/* createTargetDirectory({"directory": <path>, ...})
 * Args: Expects an object with the <path> to the "directory" that is needed
 * Returns: {success: bool, created: <abs path>|null, saved: <abs path>|null }
 *   {success: true,  created: null, saved:<path>/../.terrafile.save} if the directory already esists
 *   {success: true,  created: <absolute path to the dir closest to the root created>, saved: null} if created
 *   {success: false, created: <abs path of created>, saved: <abs path of saved>} if error
 *      + if error, created? delete created, saved: delete <path>, restore saved to <path>
 */
describe("createTargetDirectory should create a directory for vendor modules", () => {
  beforeEach(() => {
    // before each test clean up any dirs created in previous tests
    cleanUpTestDirs();
    spy.beforeEach();
  });

  afterEach(() => {
    // clean up any dirs created by the test
    cleanUpTestDirs();
  });

  test("should create the target directory when provided a relative path", () => {
    const installDir = "ok_vendor_a/modules";
    const retVals = venDir.createTargetDirectory({
      directory: installDir,
    });
    //expect(console.error).toHaveBeenCalledWith("");
    expect(
      fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(installDir))
    ).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(fsHelpers.getAbsolutePath("ok_vendor_a"));
    expect(retVals.saved).toBe(null);
  });

  test("should create the target directory when provided an absolute path", () => {
    const installDir = fsHelpers.getAbsolutePath("ok_vendor_b/modules");
    const retVals = venDir.createTargetDirectory({
      directory: installDir,
    });
    //expect(console.error).toHaveBeenCalledWith("");
    expect(fsHelpers.checkIfDirExists(installDir)).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(path.resolve(installDir, ".."));
    expect(retVals.saved).toBe(null);
  });

  test("should create the target directory and save <path> when directory already exists", () => {
    const installDir = "ok_vendor_c/modules";
    const absInstallDir = fsHelpers.getAbsolutePath(installDir);
    fsHelpers.createDir(absInstallDir);
    const retVals = venDir.createTargetDirectory({
      directory: installDir,
    });
    expect(fsHelpers.checkIfDirExists(absInstallDir)).toBe(true);
    expect(
      fsHelpers.checkIfDirExists(
        path.resolve(absInstallDir, "..", ".terrafile.save")
      )
    ).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(absInstallDir);
    expect(retVals.saved).toBe(
      path.resolve(absInstallDir, "..", ".terrafile.save")
    );
  });

  // expected output when bad input provided to createTargetDirectory
  function expectDirIssue(options) {
    const retVals = venDir.createTargetDirectory(options);
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  }

  test("should not create the target directory when path is to a file", () => {
    const installDir = "err_vendor/modules";
    fsHelpers.createDir(fsHelpers.getAbsolutePath(installDir + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(installDir));
    expectDirIssue({ directory: installDir });
  });

  // try various bad inputs
  test.each([undefined, -1, {}, { directory: -1 }, { directory: "" }])(
    "should not create the target directory when provided a bad path %s",
    (badDirOption) => {
      expectDirIssue(badDirOption);
    }
  );
});

const testDirs = [
  "ok_vendor_a",
  "ok_vendor_b",
  "ok_vendor_c",
  "err_vendor1",
  "err_vendor2",
  "err_vendor3",
  "err_vendor_lerror",
  "err_vendor_2x",
];
const cleanUpTestDirs = () =>
  testDirs.map((testDir) =>
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(testDir))
  );

// expected result when provide bad file path
async function expectFileIssue(options) {
  const retVals = await terraFile.readFileContents(options);
  expect(retVals.success).toBe(false);
  expect(retVals.contents).toBe(null);
}

describe("read file contents should read specified json file and validate its contents", () => {
  beforeEach(() => {
    // cleans up any dirs created from previous tests
    cleanUpTestDirs();
    spy.beforeEach();
  });

  afterEach(() => {
    // cleans up any dirs create by the test
    cleanUpTestDirs();
  });

  test("should successfully read a valid terrafile when provided a relative path", async () => {
    const configFile = "terrafile.sample.json";
    const retVals = await terraFile.readFileContents({
      directory: "err_vendor1/modules",
      file: configFile,
    });
    //expect(console.log).toHaveBeenLastCalledWith("");
    expect(retVals.error).toBe(null);
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
    const testJson = JSON.parse(
      fs.readFileSync(
        fsHelpers.getAbsolutePath("terrafile.sample.json"),
        "utf-8"
      )
    );
    expect(Object.keys(testJson).length).toBe(31);
    for (const modName of Object.keys(testJson)) {
      expect(
        fsHelpers.checkIfFileExists(
          fsHelpers.getAbsolutePath(`err_vendor1/modules/${modName}/main.tf`)
        )
      ).toBe(true);
    }
  });

  test("should successfully read a valid terrafile when provided an absolute path", async () => {
    const configFile = fsHelpers.getAbsolutePath("terrafile.sample.json");
    const retVals = await terraFile.readFileContents({
      directory: "err_vendor2/modules",
      file: configFile,
    });
    //expect(console.log).toHaveBeenCalledWith("");
    expect(retVals.success).toBe(true);
    expect(retVals.contents).not.toBe(null);
  });

  test("should err on lack read access to file", async () => {
    const configFile = "err_vendor3/no_access_file";
    fsHelpers.createDir(fsHelpers.getAbsolutePath(configFile + "/.."));
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(configFile), 0);
    await expectFileIssue({ file: configFile });
  });

  // test various bad paths and files
  test.each([
    undefined,
    -1,
    {},
    { file: -1 },
    { file: "" },
    { file: fsHelpers.getAbsolutePath(".") },
    { file: "does_not_exist" },
    { file: "__tests__/invalid.txt" },
    { file: "__tests__/invalid.json" },
    { file: "__tests__/invalid2.json" },
  ])("should err when bad file provided: %s", async (badFileOption) => {
    await expectFileIssue(badFileOption);
  });

  test("should err on bad local dir", async () => {
    const configFile = "__tests__/localError.json";
    await expectFileIssue({
      directory: "err_vendor_lerror/modules",
      file: configFile,
    });
  });

  test("should err on copy 2x", async () => {
    const configFile = "__tests__/local2xError.json";
    const options = {
      directory: "err_vendor_2x/modules",
      file: configFile,
    };
    await terraFile.readFileContents(options);
    await expectFileIssue(options);
  });
});
