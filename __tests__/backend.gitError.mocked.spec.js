const path = require("path");
const fs = require("fs-extra");

jest.mock("axios", () => ({
  default: jest.fn((opts) => {
    return {
      status: 204,
      headers: {
        "x-terraform-get":
          "git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0",
      },
    };
  }),
}));

jest.mock("../dist/run", () => {
  return {
    run: jest.fn().mockImplementation((_args, _cwd) => {
      return {
        code: -1,
        error: "oops!",
        stdout: "",
        stderr: "",
      };
    }),
  };
});

//const venDir = require("../dist/venDir");
const terraFile = require("../dist/processFile");
const fsHelpers = require("../dist/fsHelpers");
const spy = require("./spy");
//const jestConfig = require("../jest.config");

const testDirs = ["vendor_tfregistry_error"];

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

  test("should err on bad terraform registry", async () => {
    const configFile = "__tests__/tfRegistryError.json";
    await expectFileIssue({
      directory: "vendor_tfregistry_error/modules",
      file: configFile,
    });
  });
});