import tomlJson from '../src';

let config = tomlJson({ fileUrl: './example/config.toml' });
console.log(config);

config = tomlJson({ data: 'title = "TOML Example 2"' });
console.log(config);
