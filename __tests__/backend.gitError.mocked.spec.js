jest.mock("axios", () => ({
  default: jest.fn(() => {
    return {
      status: 204,
      headers: {
        "x-terraform-get":
          "git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0",
      },
    };
  }),
}));

jest.mock("../src/run", () => {
  return {
    run: jest.fn().mockImplementation(() => {
      return {
        code: -1,
        error: "oops!",
        stdout: "",
        stderr: "",
      };
    }),
  };
});

import { readFileContents } from "../src/processFile";
import { rimrafDir, getAbsolutePath } from "../src/fsHelpers";
import { beforeEach as _beforeEach } from "./spy";

const testDirs = ["vendor_tfregistry_error"];

const cleanUpTestDirs = () =>
  testDirs.map((testDir) => rimrafDir(getAbsolutePath(testDir)));

// expected result when provide bad file path
async function expectFileIssue(options) {
  const retVals = await readFileContents(options);
  expect(retVals.success).toBe(false);
  expect(retVals.contents).toBe(null);
}

describe("read file contents should read specified json file and validate its contents", () => {
  beforeEach(() => {
    // cleans up any dirs created from previous tests
    cleanUpTestDirs();
    _beforeEach();
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

export {};
