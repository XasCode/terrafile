import { testable } from '../../src/moduleSources/common/git';
const { replaceUrlVersionIfVersionParam } = testable;

test.each([
  {
    source: 'terraform-aws-modules/vpc/aws',
    version: '2.78.0',
  },
  {
    source: 'https://github.com/terraform-aws-modules/terraform-aws-vpc.git',
    version: 'v2.78.0',
  },
  {
    source: 'git@github.com/terraform-aws-modules/terraform-aws-vpc.git',
    version: 'v2.78.0',
  },
  {
    source:
      'https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc',
    version: 'v2.78.0',
  },
  {
    source:
      'git@github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc',
    version: 'v2.78.0',
  },
])(
  'replaceUrlVersionIfVersionParam should append version - %s',
  ({ source, version }) => {
    expect(replaceUrlVersionIfVersionParam(source, version)).toBe(
      `${source}?ref=${version}`
    );
  }
);

export {};
