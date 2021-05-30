// Mock call to Axios to retrieve Terraform download URL,
// we don't want to hit the API repeatedly
// function mockAxiosGetTerraformUrl(): void {
//   jest.mock(`axios`, () =>
const axios = jest.fn(({ _method, url }) => {
  switch (url) {
    case `terraform/500Error/aws`: {
      // Mock call to Axios to retrieve Terraform download URL,
      // simulate non-204 response
      return {
        status: 500,
      };
    }
    case `terraform/formatError/aws`: {
      // Mock call to Axious to retrieve Terraform download URL,
      // simulate 'x-terraform-get' doesn't contain git::
      return {
        status: 204,
        headers: {
          'x-terraform-get': `unexpectedformat`,
        },
      };
    }
    case `terraform/noXTFGetError/aws`: {
      // Mock call to Axious to retrieve Terraform download URL,
      // simulate 204 response, but no 'x-terraform-get' header
      return {
        status: 204,
        headers: {},
      };
    }
    case `terraform/Error/aws`:
    default: {
      // Mock call to Axios to retrieve Terraform download URL,
      // we don't want to hit the API repeatedly
      return {
        status: 204,
        headers: {
          'x-terraform-get': `git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0`,
        },
      };
    }
  }
});

export default axios;
