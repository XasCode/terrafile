# Changelog

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
