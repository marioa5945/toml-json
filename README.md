# toml-json

Convert TOML files to JSON.

- convention over configuration
- concise yet expressive

## Installation

```sh
# Locally in your project
yarn add toml-json --dev

npm install -D toml-json
```

## Usage

```ts
import tomlJson from 'toml-json';

const config = tomlJson('configFileUrl');
console.log(config);
```

## License

ISC
