const fsHelpers = require("./fsHelpers");

exports.validOptions = function (options, fileOrFolder) {
  return (
    typeof options === "object" &&
    options !== null &&
    Object.keys(options).includes(fileOrFolder) &&
    fsHelpers.getAbsolutePath(options[fileOrFolder]) !== undefined
  );
};
