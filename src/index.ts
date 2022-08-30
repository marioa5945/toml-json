const fs = require('fs');
import { resolve } from 'path';

interface ifsJson {
  [key: string]: string | number | boolean | Array<ifsJson> | ifsJson;
}

/**
 * TOML to JSON
 * @param source
 */
const tomlJson = <T extends object>(source: { fileUrl?: string; data?: string }): T | undefined => {
  let arr: Array<string> = [];
  if (source.fileUrl) {
    arr = fs.readFileSync(resolve('.', source.fileUrl)).toString().split('\n');
  } else if (source.data) {
    arr = source.data.split('\n');
  } else {
    return;
  }

  const obj: ifsJson = {};
  let key = '';

  /**
   * The key is array of Line breaks
   */
  let keyArrayB = '';

  /**
   * The value is array of Line breaks
   */
  let valueArrayB = '';

  for (let str of arr) {
    if(str.indexOf('#') === 0){
      continue;
    }
    if (str.indexOf('#') !== -1) {
      str = str.slice(0, str.indexOf('#') - 1);
    }
    let noSpace = str.replace(/(^ +)|( +$)/g, '');

    if (noSpace !== '') {
      if (valueArrayB !== '') {
        valueArrayB += str.replace(/(^ +)|( +$)/g, '');
      }

      if (valueArrayB === '' || (valueArrayB !== '' && str === ']')) {
        // Synthesize array string
        if (valueArrayB !== '') {
          noSpace = `${keyArrayB} = ${valueArrayB}`;
        }

        const value = /^\[(.+)\]$/.exec(noSpace);
   

        // if it's obj
        if (value && valueArrayB === '') {
         
          if (value[1].indexOf('.') === -1) {
            key = value[1];
            obj[key] = {};
          } else {
            objAdd(obj, value[1]);
          }
        } else {
          valueArrayB = '';
          keyArrayB = '';

          const sttr = /^(.+) = (.+)/.exec(noSpace);
          if (sttr) {
            // It's array of Line breaks
            if (sttr[2] === '[') {
              keyArrayB = sttr[1];
              valueArrayB = '[';
            } else {
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
    }
  }
  return obj as T;
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

  // boolen
  if (str === 'true') {
    return true;
  } else if (str === 'false') {
    return false;
  }

  // number
  const numStr = /([\d\.]+)/.exec(str);
  if (
    numStr &&
    numStr[1] === str &&
    str.indexOf('.') === str.lastIndexOf('.')
  ) {
    return Number(str);
  }

  // Convert array string to array object
  if( str === '[]') {
    return []
  }

  const arr = /^\[(.+)\]$/.exec(str);
  if (arr) {
    return strToArr(arr[1]);
  }

  return str;
};

/**
 * Convert string to array
 * @param str
 */
const strToArr = (str: string): Array<any> => {
  let list: Array<any> = [];
  if (str.indexOf('[') === -1) {
    const valueArr = str.split(',');
    for(const value of valueArr) {
      list.push(value.replace(/(^ +)|( +$)/g, ''));
    }
  } else {
    const cArr = str.split('');
    let startNum = 0;
    let value = '';
    for (const c of cArr) {
      if (c === '[') {
        startNum++;
      } else if (c === ']') {
        startNum--;
      }

      if (startNum === 0 && c === ',') {
        list.push(value.replace(/(^ +)|( +$)/g, ''));
        value = '';
      } else {
        value += c;
      }
    }
 
    list.push(value.replace(/(^ +)|( +$)/g, ''));
  }

  const arr: Array<any> = [];
  for (const n of list) {
    arr.push(attrValueGet(n));
  }

  return arr;
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
