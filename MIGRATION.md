# Migration Guide

## Unreleased

### Node.js requirement

Terrafile now requires Node.js 22 or newer. Upgrade the runtime used by your application and CI before updating this package.

### API compatibility

The CLI runtime and package entry are now ESM-only. The `terrafile` command, its options, and the Terrafile configuration format are unchanged.

If your code imports Terrafile's programmatic API, use ESM:

```js
import { main } from 'terrafile';
```

`require('terrafile')` is no longer supported. Migrate programmatic consumers to ESM before upgrading. Existing `terrafile.json` files and command-line usage remain supported.
