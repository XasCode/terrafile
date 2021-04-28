const { replacePathIfPathParam } = require("../src/processFile");

test.each([
  {
    comment: "Local directory module",
    source: "./__tests__/modules/test-module",
  },
  {
    comment: "Terraform registry module",
    source: "terraform-aws-modules/vpc/aws",
  },
  {
    comment: "Terraform registry module + tag",
    source: "terraform-aws-modules/vpc/aws",
    version: "2.78.0",
  },
  {
    comment: "Git module (HTTPS)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
  },
  {
    comment: "Git module (HTTPS + tag)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "v2.78.0",
  },
  {
    comment: "Git module (HTTPS + branch)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "master",
  },
  {
    comment: "Git module (HTTPS + commit)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "43edd4400e5e596515f8d787603c37e08b99abd5",
  },
  {
    comment: "Git module (HTTPS + tag) alternate syntax",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0",
  },
  {
    comment: "Git module (HTTPS + branch) alternate syntax",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=master",
  },
  {
    comment: "Git module (HTTPS + commit) alternate syntax",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=43edd4400e5e596515f8d787603c37e08b99abd5",
  },
  {
    comment: "Git module (SSH)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
  },
  {
    comment: "Git module (SSH + tag)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "v2.78.0",
  },
  {
    comment: "Git module (SSH + branch)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "master",
  },
  {
    comment: "Git module (SSH + commit)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "43edd4400e5e596515f8d787603c37e08b99abd5",
  },
  {
    comment: "Git module (SSH + tag) alternate syntax",
    source:
      "git@github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0",
  },
  {
    comment: "Git module (SSH + branch) alternate syntax",
    source: "git@github.com/xascode/terraform-modules.git?ref=master",
  },
  {
    comment: "Git module (SSH + commit) alternate syntax",
    source:
      "git@github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=43edd4400e5e596515f8d787603c37e08b99abd5",
  },
  {
    comment: "Git monorepo module (HTTPS + tag) alternate syntax",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0",
  },
  {
    comment: "Git monorepo module (HTTPS + branch) alternate syntax",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=master",
  },
  {
    comment: "Git monorepo module (HTTPS + commit) alternate syntax",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=43edd4400e5e596515f8d787603c37e08b99abd5",
  },
  {
    comment: "Git monorepo module (SSH + tag) alternate syntax",
    source:
      "git@github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0",
  },
  {
    comment: "Git monorepo module (SSH + branch) alternate syntax",
    source:
      "git@github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=master",
  },
  {
    comment: "Git monorepo module (SSH + commit) alternate syntax",
    source:
      "git@github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=43edd4400e5e596515f8d787603c37e08b99abd5",
  },
])("should return source unchanged - %s", ({ source, path }) => {
  expect(replacePathIfPathParam(source, path)).toBe(source);
});

test.each([
  {
    comment: "Git monorepo module (HTTPS)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    path: "/examples/simple-vpc",
  },
  {
    comment: "Git monorepo module (HTTPS + tag)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "v2.78.0",
    path: "/examples/simple-vpc",
  },
  {
    comment: "Git monorepo module (HTTPS + branch)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "master",
    path: "/examples/simple-vpc",
  },
  {
    comment: "Git monorepo module (HTTPS + commit)",
    source: "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "43edd4400e5e596515f8d787603c37e08b99abd5",
    path: "/examples/simple-vpc",
  },
  {
    comment: "Git monorepo module (SSH)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
    path: "/examples/simple-vpc",
  },
  {
    comment: "Git monorepo module (SSH + branch)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "master",
    path: "/examples/simple-vpc",
  },
  {
    comment: "Git monorepo module (SSH + commit)",
    source: "git@github.com/terraform-aws-modules/terraform-aws-vpc.git",
    version: "43edd4400e5e596515f8d787603c37e08b99abd5",
    path: "/examples/simple-vpc",
  },
])("should append path - %s", ({ source, path }) => {
  expect(replacePathIfPathParam(source, path)).toBe(`${source}/${path}`);
});

test.each([
  {
    comment: "Git monorepo module (SSH + tag)",
    source:
      "git@github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me",
    version: "v2.78.0",
    path: "/examples/simple-vpc",
    rewritten:
      "git@github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc",
  },
  {
    comment: "...",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me?ref=v2.78.0",
    path: "/examples/simple-vpc",
    rewritten:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0",
  },
  {
    comment: "...",
    source:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0",
    path: "/examples/simple-vpc",
    rewritten:
      "https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0",
  },
])("", ({ source, path, rewritten }) => {
  expect(replacePathIfPathParam(source, path)).toBe(rewritten);
});
