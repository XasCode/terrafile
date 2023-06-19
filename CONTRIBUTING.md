# Release Process

Adapted from "Standard" Release Process described [here](https://cloudfour.com/thinks/how-to-publish-an-updated-version-of-an-npm-package/).

## Safety Checks

1. git pull
2. git status
3. npm ci
4. npm test

## Prepare the release

5. npm run build

## Update the version number

6. npm version [patch|minor|major]

## Publish to npm

7. npm publish --access=public

## git push

8. git push -u origin --tags

# Debugging

## Make changes available for use

1. npm run build
2. npm link

## Use as a dependency in another project

3. npm link ../terrafile
4. (test changes)

## Uninstall linked dependency

5. npm unlink ../terrafile
