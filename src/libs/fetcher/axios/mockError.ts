import { RetString } from 'src/types';

async function fetcher({ url }: Record<string, string>): Promise<RetString> {
  return {
    success: false,
    error: `Mocking error result from fetcher({url: '${url}'}).`,
    value: null,
  };
}

export default fetcher;
