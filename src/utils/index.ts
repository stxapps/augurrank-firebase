import Url from 'url-parse';
import {
  HTTP, PDG, SCS, ERR_INVALID_ARGS, ERR_NOT_FOUND, ERR_VRF_SIG,
} from '@/types/const';

export const isObject = (val) => {
  return typeof val === 'object' && val !== null;
};

export const isString = (val) => {
  return typeof val === 'string';
};

export const isNumber = (val) => {
  return typeof val === 'number' && isFinite(val);
};

export const isEqual = (x, y) => {
  if (x === y) return true;
  // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.

  for (const p in x) {
    if (!x.hasOwnProperty(p)) continue;
    // other properties were tested using x.constructor === y.constructor

    if (!y.hasOwnProperty(p)) return false;
    // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof (x[p]) !== 'object') return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!isEqual(x[p], y[p])) return false;
    // Objects and Arrays must be tested recursively
  }

  for (const p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
    // allows x[ p ] to be set to undefined
  }
  return true;
};

export const isFldStr = (val) => {
  return isString(val) && val.length > 0;
};

export const isZrOrPst = (number) => {
  return isNumber(number) && number >= 0;
};

export const isNotNullIn = (obj, key) => {
  return key in obj && obj[key] !== null;
};

export const areAllString = (...vals) => {
  for (const val of vals) {
    if (!isString(val)) return false;
  }
  return true;
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const newObject = (object, ignoreAttrs) => {
  const nObject: any = {};
  for (const attr in object) {
    if (ignoreAttrs.includes(attr)) continue;
    nObject[attr] = object[attr];
  }
  return nObject;
};

export const randBtw = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const randomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const containUrlProtocol = (url) => {
  const urlObj = new Url(url, {});
  return urlObj.protocol && urlObj.protocol !== '';
};

export const ensureContainUrlProtocol = (url) => {
  if (!containUrlProtocol(url)) return HTTP + url;
  return url;
};

export const extractUrl = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});
  return {
    host: urlObj.host,
    origin: urlObj.origin,
    pathname: urlObj.pathname,
    hash: urlObj.hash,
  };
};

export const removeTailingSlash = (url) => {
  if (url.slice(-1) === '/') return url.slice(0, -1);
  return url;
};

export const getReferrer = (request) => {
  let referrer = request.headers.get('referer');
  if (!referrer) referrer = request.headers.get('origin');
  return referrer;
};

export const getResErrMsg = async (res) => {
  let bodyText = '';
  try {
    const json = await res.json();
    bodyText = json.error;
  } catch (error) {
    console.log('No json error attr from http response body.');
  }

  let msg = `${res.status}`;
  if (isFldStr(res.statusText)) msg += ' ' + res.statusText;
  if (isFldStr(bodyText)) msg += ' ' + bodyText;
  return msg;
};

export const getWindowSize = () => {
  let width = null, height = null, visualWidth = null, visualHeight = null;
  if (typeof window !== 'undefined' && isObject(window)) {
    if (isNumber(window.innerWidth)) width = window.innerWidth;
    if (isNumber(window.innerHeight)) height = window.innerHeight;

    if (isObject(window.visualViewport)) {
      if (isNumber(window.visualViewport.width)) {
        visualWidth = window.visualViewport.width;
      }
      if (isNumber(window.visualViewport.height)) {
        visualHeight = window.visualViewport.height;
      }
    }
  }

  return { width, height, visualWidth, visualHeight };
};

export const getWindowInsets = () => {
  let top = null, right = null, bottom = null, left = null;
  if (
    typeof window !== 'undefined' &&
    isObject(window) &&
    isObject(document.documentElement)
  ) {
    const cs = window.getComputedStyle(document.documentElement);
    const st = cs.getPropertyValue('--env-safe-area-inset-top');
    const sr = cs.getPropertyValue('--env-safe-area-inset-right');
    const sb = cs.getPropertyValue('--env-safe-area-inset-bottom');
    const sl = cs.getPropertyValue('--env-safe-area-inset-left');

    // Assume always in pixels (px)
    const [nt, nr] = [parseFloat(st), parseFloat(sr)];
    const [nb, nl] = [parseFloat(sb), parseFloat(sl)];

    if (isNumber(nt)) top = nt;
    if (isNumber(nr)) right = nr;
    if (isNumber(nb)) bottom = nb;
    if (isNumber(nl)) left = nl;
  }

  return { top, right, bottom, left };
};

export const validateEmail = (email) => {
  if (!isString(email)) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateProfile = (profile) => {
  if (!isObject(profile)) return false;

  if ('username' in profile && !isString(profile.username)) return false;
  if ('avatar' in profile && !isString(profile.avatar)) return false;
  if ('bio' in profile) {
    if (!isString(profile.bio)) return false;
    if (profile.bio.length > 160) return false;
  }
  if ('noInLdb' in profile && ![true, false].includes(profile.noInLdb)) return false;
  if ('noPrflPg' in profile && ![true, false].includes(profile.noPrflPg)) return false;

  return true;
};

export const validateTxn = (stxAddr, txn) => {

};

export const getSignInStatus = (me) => {
  const { stxAddr, stxPubKey, stxSigStr } = me;
  if (stxAddr === null && stxPubKey === null && stxSigStr === null) return 0; // loading

  if (isFldStr(stxAddr)) {
    if (isFldStr(stxPubKey) && isFldStr(stxSigStr)) return 3; // signed in
    return 2; // connected
  }

  return 1; // not signed in
};

export const getWalletErrorText = (code) => {
  let title = 'Error', body = code;
  if (code === ERR_INVALID_ARGS) {
    title = 'Unknown Wallet';
    body = 'Please sign out and connect with a supported wallet.';
  } else if (code === ERR_NOT_FOUND) {
    title = 'Wallet Not Found';
    body = 'Please make sure the wallet is installed and enabled.';
  } else if (code === ERR_VRF_SIG) {
    title = 'Incorrect Signature';
    body = 'Please check if you signed a message using the same account connected to the wallet.';
  }

  return { title, body };
};

export const parseAvatar = (str) => {
  // str can be undefined, null, empty string, filled string
  let avatar: any = {};
  if (isFldStr(str)) {
    try {
      const obj = JSON.parse(str);
      if (isObject(obj)) avatar = obj;
    } catch (error) {
      console.log('In utils/parseAvatar, invalid str:', error);
    }
  }
  return avatar;
};

export const getAvtThbnl = (obj) => {
  if (isFldStr(obj.thumbnailAlt)) return obj.thumbnailAlt;
  if (isFldStr(obj.thumbnail)) return obj.thumbnail;
  if (isFldStr(obj.image)) return obj.image;
  return null;
};

export const mergeTxns = (...txns) => {
  const bin = {
    updateDate: 0,
    pStatus: { scs: null, updg: null },
    cStatus: { scs: null, updg: null },
  };

  let newTxn: any = {};
  for (const txn of txns) {
    if (!isObject(txn)) continue;

    if (isNumber(txn.updateDate)) {
      if (txn.updateDate > bin.updateDate) {
        bin.updateDate = txn.updateDate;
      }
    }
    if (isString(txn.pStatus)) {
      if (txn.pStatus === SCS) bin.pStatus.scs = txn.pStatus;
      else if (txn.pStatus !== PDG) bin.pStatus.updg = txn.pStatus;
    }
    if (isString(txn.cStatus)) {
      if (txn.cStatus === SCS) bin.cStatus.scs = txn.cStatus;
      else if (txn.cStatus !== PDG) bin.cStatus.updg = txn.cStatus;
    }

    newTxn = { ...newTxn, ...txn };
  }

  if (isNumber(bin.updateDate)) newTxn.updateDate = bin.updateDate;

  if (isString(bin.pStatus.scs)) newTxn.pStatus = bin.pStatus.scs;
  else if (isString(bin.pStatus.updg)) newTxn.pStatus = bin.pStatus.updg;

  if (isString(bin.cStatus.scs)) newTxn.cStatus = bin.cStatus.scs;
  else if (isString(bin.cStatus.updg)) newTxn.cStatus = bin.cStatus.updg;

  return newTxn;
};

export const isAvatarEqual = (strA, strB) => {
  let a = parseAvatar(strA);
  a = newObject(a, ['thumbnailAlt']);

  let b = parseAvatar(strB);
  b = newObject(b, ['thumbnailAlt']);

  return isEqual(a, b);
};
