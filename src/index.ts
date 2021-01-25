const fs = require('fs');
import { resolve } from 'path';

interface ifsJson {
  [key: string]: string | number | boolean | Array<ifsJson> | ifsJson;
}

/**
 * TOML to JSON
 * @param fileUrl TOML file url
 */
const tomlJson = (fileUrl: string): ifsJson => {
  const arr = fs
    .readFileSync(resolve(__dirname, fileUrl))
    .toString()
    .split('\n');

  const obj: ifsJson = {};
  let key = '';

  for (let str of arr) {
    if (str.indexOf('#') !== -1) {
      str = str.slice(0, str.indexOf('#') - 1);
    }
    const noSpace = str.replace(/(^ +)|( +$)/g, '');

    if (noSpace !== '') {
      const value = /^\[(.+)\]$/.exec(noSpace);

      // if it's obj
      if (value) {
        if (value[1].indexOf('.') === -1) {
          key = value[1];
          obj[key] = {};
        } else {
          objAdd(obj, value[1]);
        }
      } else {
        const sttr = /^(.+) = (.+)/.exec(noSpace);

        if (sttr) {
          const sttrValue = attrValueGet(sttr[2]);
          if (key === '') {
            obj[sttr[1]] = sttrValue;
          } else {
            setAttrValue(obj, sttr[1], sttrValue);
          }
        }
      }
    }
  }
  return obj;
};

/**
 * set value for object attribute of last
 * @param obj
 * @param sttrKey
 * @param sttrValue
 */
const setAttrValue = (obj: ifsJson, sttrKey: string, sttrValue: any) => {
  const keys = Object.keys(obj);
  let keyValue: string = '';
  for (const str of keys) {
    if (typeof obj[str] === 'object' && !Array.isArray(obj[str])) {
      keyValue = str;
    }
  }

  if (keyValue === '') {
    obj[sttrKey] = sttrValue;
  } else {
    setAttrValue(obj[keyValue] as ifsJson, sttrKey, sttrValue);
  }
};

/**
 * get attribute value
 * @param str
 */
const attrValueGet = (str: string): any => {
  str = str.replace(/\"/g, '');

  // boolen type
  if (str === 'true') {
    return true;
  } else if (str === 'false') {
    return false;
  }

  return str;
};

/**
 * obj add
 * @param obj
 * @param str
 */
const objAdd = (obj: ifsJson, str: string) => {
  const value = /^(.+)\.(.+)/.exec(str);
  if (value) {
    if (obj[value[1]]) {
      objAdd(obj[value[1]] as ifsJson, value[2]);
    }
  } else {
    obj[str] = {};
  }
};

export default tomlJson;
