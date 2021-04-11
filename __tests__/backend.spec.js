const fs = require("fs");
const path = require("path");

const backend = require("../src/backend");
const fsHelpers = require("../src/fsHelpers");
const spy = require("./spy");

describe("create the target directory", () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "vendor"));
    spy.beforeEach();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(path.resolve(".", "vendor"));
  });

  test("should create the specified directory", () => {
    backend.doInstall({
      directory: "vendor/modules",
      file: "terrafile.json.sample",
    });
  });
  //test("should", () =);
});
