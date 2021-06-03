import axios from 'axios';
import { RetString } from 'src/types';

type Request = {
  method: `get`;
  url: string;
};

type Response = {
  status: number;
  headers?: Record<string, string>;
};

function use(fetchLibrary: (_: Request) => Promise<Response>): (_: Record<string, string>) => Promise<RetString> {
  return async function fetcher({ url }: Record<string, string>): Promise<RetString> {
    try {
      const response: Response = await fetchLibrary({
        method: `get`,
        url,
      } as Request);
      if (response.status !== 204) {
        return { success: false, error: `Expected status 204 from ${url}, recieved ${response.status}` };
      } else if (response.headers === undefined || response.headers[`x-terraform-get`] === undefined) {
        return { success: false, error: `Response from ${url} did not include 'x-terraform-get' header.` };
      }
      return { success: true, error: null, value: response.headers[`x-terraform-get`] };
    } catch (err) {
      return {
        success: false,
        error: `Exception ecountered fetching ${url} from terraform registry. ${JSON.stringify(err)}`,
      };
    }
  };
}

const mock = jest.fn(({ _method, url }): Promise<Response> => {
  console.error(`axios url: ${url}`);
  switch (true) {
    case /terraform\/500Error\/aws/.test(url): {
      // Mock call to Axios to retrieve Terraform download URL,
      // simulate non-204 response
      return Promise.resolve({ status: 500 });
    }
    case /terraform\/formatError\/aws/.test(url): {
      // Mock call to Axious to retrieve Terraform download URL,
      // simulate 'x-terraform-get' doesn't contain git::
      return Promise.resolve({ status: 204, headers: { 'x-terraform-get': `unexpectedformat` } });
    }
    case /terraform\/noXTFGetError\/aws/.test(url): {
      // Mock call to Axious to retrieve Terraform download URL,
      // simulate 204 response, but no 'x-terraform-get' header
      return Promise.resolve({ status: 204, headers: {} });
    }
    case /terraform\/Error\/aws/.test(url):
    default: {
      // Mock call to Axios to retrieve Terraform download URL,
      // we don't want to hit the API repeatedly
      return Promise.resolve({
        status: 204,
        headers: {
          'x-terraform-get': `git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0`,
        },
      });
    }
  }
});

export default { use, mock, default: axios };
