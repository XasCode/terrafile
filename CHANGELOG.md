# Changelog

## [0.2.0](https://github.com/XasCode/terrafile/compare/terrafile-v0.1.36...terrafile-v0.2.0) (2026-10-11)


### ⚠ BREAKING CHANGES

* migrate CLI entry to ESM ([#352](https://github.com/XasCode/terrafile/issues/352))

### Code Refactoring

* migrate CLI entry to ESM ([#352](https://github.com/XasCode/terrafile/issues/352)) ([e0af88c](https://github.com/XasCode/terrafile/commit/e0af88c4d386feb3dd4f33ff3458b3a8844785f2))

## Changelog

All notable changes to this project are documented here.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Breaking Changes

- Make the package entry ESM-only; `require('terrafile')` is no longer supported.

### Changed

- Migrate the CLI runtime to ESM while keeping the `terrafile` command unchanged.
- Require Node.js 22 or newer and enable strict TypeScript checking.
- Enforce zero-warning linting and remove obsolete lint suppressions.

### Added

- Add a package smoke test for the built CLI entry point.
