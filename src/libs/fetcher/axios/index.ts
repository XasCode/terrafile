import axios from 'axios';
import { RetString } from 'src/types';

async function fetcher({ url }: Record<string, string>): Promise<RetString> {
  let response;
  try {
    response = await axios({
      method: `get`,
      url,
    });
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
}

export default fetcher;
