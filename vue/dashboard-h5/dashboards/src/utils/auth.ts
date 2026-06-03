import { List } from "vant"

const TokenKey = 'merchantAdmin_jwt_token'
const userListKey = 'merchantAdmin_userListKey'
export function getToken(): string {
  return localStorage.getItem(TokenKey) || ''
}

export function setToken(token: string) {

  // 设置保存时间为一小时
  const expires = Date.now() + 1000 * 60 * 60;
  localStorage.setItem(TokenKey, token)
}

export function removeToken(): void {
  localStorage.removeItem(TokenKey)
}


export function getUserLists(): Array<UserInfo> {
  const listStr = localStorage.getItem(userListKey) || '' as string;
  let myMap: Map<any, any> = new Map();
  if (listStr == '')
    return [];
  myMap = convertJSObjToTSMap(JSON.parse(listStr));
  const array = new Array<UserInfo>();
  myMap.forEach(function (value, key) {
    array.push(new UserInfo(key, value));
  });

  return array;

}

export function addUsers(user: UserInfo): void {
  const listStr = localStorage.getItem(userListKey) || '' as string;
  let myMap: Map<any, any> = new Map();
  if (listStr == '') {
    myMap.set(user.username, user.password);
  }
  else {
    myMap = convertJSObjToTSMap(JSON.parse(listStr));
    myMap.set(user.username, user.password);

  }
  localStorage.setItem(userListKey, JSON.stringify(convertTSMapToJSObj(myMap)));
}

export function deleteUsers(username: string): void {
  const listStr = localStorage.getItem(userListKey) || '' as string;
  let myMap: Map<any, any> = new Map();
  if (listStr == '')
    return;
  myMap = convertJSObjToTSMap(JSON.parse(listStr));
  if (myMap.has(username))
    myMap.delete(username);
  localStorage.setItem(userListKey, JSON.stringify(convertTSMapToJSObj(myMap)));
}

export function deleteAll(): void {
  localStorage.setItem(userListKey, '');
}



function convertTSMapToJSObj(tsMap: Map<string, string>) {
  const jsObj: any = {};
  tsMap.forEach(function (value, key) {
    jsObj[key] = value;
  });
  return jsObj;
}

function convertJSObjToTSMap(jsObj: any) {
  const tsMap = new Map();
  const arrayOfMapEntries = new Map<any, any>(Object.entries(jsObj));
  for (const [key, value] of arrayOfMapEntries.entries()) {
    tsMap.set(key, value);
  }
  return tsMap;
}

export class UserInfo {

  username?: string;
  password?: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

}