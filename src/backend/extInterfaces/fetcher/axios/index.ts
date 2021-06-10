import axios from 'axios';
import { Request, Response, RetString } from 'src/shared/types';

function use(fetchLibrary: (_: Request) => Promise<Response>): (_: Record<string, string>) => Promise<RetString> {
  return async function fetcher({ url }: Record<string, string>): Promise<RetString> {
    try {
      const response: Response = await fetchLibrary({
        method: `get`,
        url,
      } as Request);
      if (response.status !== 204) {
        return { success: false, error: `Expected status 204 from ${url}, recieved ${response.status}` };
      } else if (response.headers === undefined) {
        return { success: false, error: `Response from ${url} did not include headers.` };
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

export default { use, default: axios };
