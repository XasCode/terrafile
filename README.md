# terrafile

`terrafile` is a [node.js](https://nodejs.org) cli application written in [typescript](https://typescriptlang.org) for managing [modules](https://www.terraform.io/docs/language/modules/index.html) for use with [Terraform](https://www.terraform.io/docs/language/modules/index.html).

Specify Terraform module locations within a `.json` file and retrieve the modules to a local directory.

## About The Project

### Terraform Modules

Terraform is a popular open-source infrastructure as code software tool that enables you to safely and predictably create, change, and improve infrastructure. Terraform _modules_ are containers for multiple resources that are used together.

It is possible to publish modules for others to use, and to use modules that others have published via:

- A local filesystem.
- A registry: [Terraform Registry](https://registry.terraform.io) is an example of a public regsitry that hosts a broad collection of publicly available Terraform modules for configuring many kinds of common infrastructure. [Terraform Cloud and Terraform Enterprise](https://www.terraform.io/docs/cloud/index.html) both include a private module registry for sharing modules internally within your organization.
- A [git](https://git-scm.com/) repository: For example [GitHub](https://github.com) public or private repositories over https or ssh.

### Problems Addressed

1. [DRY](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001745#s5): Everywhere that a module is used the source is specified, even if already used elsewhere.
2. Change management: Managing changes to potentially very many modules throughout the code base can be labor intensive and error prone.

### Solution Approach

1. Define module dependencies in a single place, a `.json` file.
2. Use `terrafile` to retrieve modules and save them locally where they are committed into the codebase under your version control.
3. Reference the local versions under version control as the source of modules used in your codebase.

## Installation

`terrafile` can be added as a project dependency:

```shell
 npm install --save-dev terrafile
```

You may also find it useful to add a script to your `package.json` for refreshing the locally cached modules:

```json
{
  ...
  "scripts": {
    ...
    "terrafile": "terrafile install",
  }
}
```

Alternatively, you could run terrafile via [npx](https://docs.npmjs.com/cli/v7/commands/npx) without including terrafile as a dependency for your project:

```shell
npx terrafile install
```

## How to use

### Input

`terrafile` expects a `.json` file as input defining module sources. By default, `terrafile` will use `terrafile.json` in the current working directory. However, you can specify another location using the `-f` or `--file` cli options for the `install` command.

```shell
terrafile install -f terrafile.sample.json
```

### Output

`terrafile` downloads the specified modules to the local filesystem 'cache'. By default modules will be downloaded to `vendor/modules/<module-name>`. However, you can specify another base directory instead of `vendor/modules` using the `-d` or `--directory` cli options for the `install` command.

```shell
terrafile install -f terrafile.sample.json -d my_modules
```

### Example `.json` module source definition file contents ([terrafile.sample.json](https://github.com/XasCode/terrafile/terrafile.sample.json))

```json
{
  "test-module": {
    "comment": "Local directory module; source begins with absolute or relative paths ('/' or './' or '../').",
    "source": "./__tests__/modules/test-module"
  },
  "terraform-aws-vpc": {
    "comment": "Terraform Registry Module; if version is not specified, fetches the latest version.",
    "source": "terraform-aws-modules/vpc/aws",
    "version": "2.78.0"
  },
  "terraform-aws-vpc2": {
    "comment": "Git module over HTTPS; if version is not specified, fecthes the default branch. Version can also be a tag or commit SHA.",
    "source": "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    "version": "master"
  },
  "terraform-aws-vpc3": {
    "comment": "Git module over HTTPS using alternative '?ref=' syntax to specify version.",
    "source": "git@github.com:terraform-aws-modules/terraform-aws-vpc.git?ref=43edd4400e5e596515f8d787603c37e08b99abd5"
  },
  "terraform-aws-vpc4": {
    "comment": "Git module over SSH; note ssh-agent needed with appropriate key.",
    "source": "https://github.com/terraform-aws-modules/terraform-aws-vpc.git",
    "version": "v2.78.0"
  },
  "terraform-aws-vpc5": {
    "comment": "Specify path to module, e.g. within a Git repo/monorepo containing multiple modules.",
    "source": "git@github.com:terraform-aws-modules/terraform-aws-vpc.git",
    "path": "/examples/simple-vpc",
    "version": "v2.78.0"
  },
  "terraform-aws-vpc6": {
    "comment": "Specify path to module using alternate path syntax.",
    "source": "git@github.com:terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0"
  }
}
```

#### source

Module definitions using Terraform's [Module Sources](https://www.terraform.io/docs/modules/sources.html).

- Mercurial not supported
- AWS buckets not supported
- GCS buckets not supproted

#### version

The `version` can be a tag, a branch or a commit hash. By default, the repository default branch, e.g. `main` will be used.

#### path

The sub-directory within a specified source repository where module sources are located. Useful for mono-repos with multiple modules in one repository.

#### comment

`terrafile` ignores the `comment` field.

### Example Usage

```shell
Usage: terrafile --help

Manage vendored modules using a JSON file.

Options:
  -V, --version      Show version information for terrafile
  -h, --help         display help for command

Commands:
  install [options]  Installs the files in your terrafile.json
  help [command]     display help for command
```

```shell
Usage: terrafile install --help

Installs the files in your terrafile.json

Options:
  -d, --directory <string>  module directory (default: "vendor/modules")
  -f, --file <string>       config file (default: "terrafile.json")
  -h, --help                display help for command
```

## Acknowledgements

This project was inspired by [Terraform Design Patterns: the Terrafile](http://bensnape.com/2016/01/14/terraform-design-patterns-the-terrafile/).

## Badges

[![Test Coverage](https://api.codeclimate.com/v1/badges/aeb900c903f86a5c2200/test_coverage)](https://codeclimate.com/github/XasCode/terrafile/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/aeb900c903f86a5c2200/maintainability)](https://codeclimate.com/github/XasCode/terrafile/maintainability)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/519d8d6060754c078cadace24b194986)](https://www.codacy.com/gh/XasCode/terrafile/dashboard?utm_source=github.com&utm_medium=referral&utm_content=XasCode/terrafile&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/519d8d6060754c078cadace24b194986)](https://www.codacy.com/gh/XasCode/terrafile/dashboard?utm_source=github.com&utm_medium=referral&utm_content=XasCode/terrafile&utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/xascode/terrafile/badge.svg)](https://snyk.io/test/github/xascode/terrafile)
