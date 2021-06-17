import { Entry } from 'src/shared/types';

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
