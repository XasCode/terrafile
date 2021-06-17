import Git from 'src/backend/moduleSources/common/git';

const { replaceUrlVersionIfVersionParam } = Git().testable;

test.each([
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0`,
    version: `v2.79.0`,
    rewritten: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.79.0`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me?ref=v2.78.0`,
    version: `v2.79.0`,
    rewritten: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me?ref=v2.79.0`,
  },
  {
    source: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0`,
    version: `v2.79.0`,
    rewritten: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git?ref=v2.79.0`,
  },
  {
    source: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me?ref=v2.78.0`,
    version: `v2.79.0`,
    rewritten: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me?ref=v2.79.0`,
  },
])(`replaceUrlVersionIfVersionParam should replace version - %s`, ({ source, version, rewritten }) => {
  expect(replaceUrlVersionIfVersionParam(source, version)).toBe(rewritten);
});

export {};
