# generated-jest-runner

## Usage

### Install

Install `jest`_(it needs Jest 21+)_ and `jest-runner-eslint`

```bash
yarn add --dev jest generated-jest-runner

# or with NPM

npm install --save-dev jest generated-jest-runner
```

## Add your runner to Jest config

Once you have your Jest runner you can add it to your Jest config.

In your `package.json`

```json
{
  "jest": {
    "runner": "generated-jest-runner"
  }
}
```

Or in `jest.config.js`

```js
module.exports = {
  runner: 'generated-jest-runner',
};
```

### Run Jest

```bash
yarn jest
```