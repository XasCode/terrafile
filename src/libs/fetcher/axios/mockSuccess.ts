import { RetString } from 'src/types';

async function fetcher({ url: _unused }: Record<string, string>): Promise<RetString> {
  return {
    success: true,
    error: null,
    value: `git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0`,
  };
}

export default fetcher;
