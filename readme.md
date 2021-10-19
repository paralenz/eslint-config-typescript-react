# @paralenz/eslint-config-typescript-react
To have a unified codeing standard we've created this library.

## Installation

```sh
yarn add @paralenz/eslint-config-typescript-react --dev
// or
npm install -D @paralenz/eslint-config-react-typescript
```

### Prerequisits
Since we are using the github package registry you need to have a `.npmrc`-file in your project.

If you do not have this file you can create it by running the following command in the project you'd like to install this package into
```sh
echo "@paralenz:registry=https://npm.pkg.github.com/" > .npmrc
```

This will tell npm & yarn to look in the github package registry too, when installing packages.

## Usage

In `.eslintrc`:

```json
{ 
  "extends": "@paralenz/eslint-config-typescript-react", 
} 
```

## Publishing
This is a repo that all Paralenz developers should contribute to and because of that it should be easy-peasy to publish a new version of this package.

To publish a new version all you need to do is:
1. Change the version number in `package.json`. Either by manually changing it or by running `yarn version`.
2. When you push to the master branch the [Publish release](https://github.com/paralenz/eslint-config-typescript-react/blob/master/.github/workflows/publish-release.yml) workflow will start. This workflow will create a new tag and publish a new release

