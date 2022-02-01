import { Entry } from 'src/shared/types';

// Very simplistic validation of terrafile entries.
// If a list of allowed params is provided, this returns a function that
// will check a terrafile entry to make sure that an entry does not have other params.
function Validate(acceptable?: string[]): (_: Entry) => boolean {
  function validate(params: Entry): boolean {
    let notFoundOrNotValid = false;
    const paramKeys = Object.keys(params);
    for (const param of paramKeys) {
      if (!acceptable.includes(param)) {
        notFoundOrNotValid = true;
      }
    }
    return notFoundOrNotValid;
  }
  return validate;
}

export default Validate;
