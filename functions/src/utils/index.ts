import Url from 'url-parse';
import {
  HTTP, TX_INIT, TX_IN_MEMPOOL, TX_PUT_OK, TX_PUT_ERROR, TX_CONFIRMED_OK,
  TX_CONFIRMED_ERROR, PDG, SCS, ERR_INVALID_ARGS, ERR_NOT_FOUND, ERR_USER_NOT_FOUND,
  ERR_VRF_SIG,
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
  return function () { // eslint-disable-line
    const context = this; // eslint-disable-line
    const args = arguments; // eslint-disable-line
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () { // eslint-disable-line
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

export const getSignInStatus = (me) => {
  const { stxAddr, stxPubKey, stxSigStr } = me;
  if (stxAddr === null && stxPubKey === null && stxSigStr === null) return 0; // loading

  if (isFldStr(stxAddr)) {
    if (isFldStr(stxPubKey) && isFldStr(stxSigStr)) return 3; // signed in
    return 2; // connected
  }

  return 1; // not signed in
};

const getWalletErrorMsg = (error) => {
  if (isFldStr(error)) return error;
  if (isObject(error)) {
    if (isFldStr(error.message)) return error.message;
    if (isObject(error.error)) {
      if (isFldStr(error.error.message)) return error.error.message;
    }
  }
  return 'There is an unknown error.';
};

export const getWalletErrorText = (error) => {
  const msg = getWalletErrorMsg(error);

  let title = 'Error', body = msg;
  if (msg === ERR_INVALID_ARGS) {
    title = 'Unknown Wallet';
    body = 'Please sign out and connect with a supported wallet.';
  } else if (msg === ERR_NOT_FOUND) {
    title = 'Wallet Not Found';
    body = 'Please make sure the wallet is installed and enabled.';
  } else if (msg === ERR_USER_NOT_FOUND) {
    title = 'Account Not Found';
    body = 'Please ensure that you are signed in to your wallet.';
  } else if (msg === ERR_VRF_SIG) {
    title = 'Incorrect Signature';
    body = 'Please check if you signed a message using the same account connected to the wallet.';
  }

  return { title, body };
};

export const getShare = (shares, evtId, ocId) => {
  for (const shr of Object.values<any>(shares)) {
    if (shr.evtId === evtId && shr.ocId === ocId) {
      return shr;
    }
  }
  return null;
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

export const deriveTxInfo = (txInfo) => {
  const obj = {
    txId: txInfo.tx_id,
    status: txInfo.tx_status,
    height: null,
    burnHeight: null,
    result: null,
    vls: null,
  };
  if (isNumber(txInfo.block_height)) obj.height = txInfo.block_height;
  if (isNumber(txInfo.burn_block_height)) obj.burnHeight = txInfo.burn_block_height;
  if (isObject(txInfo.tx_result) && isString(txInfo.tx_result.repr)) {
    obj.result = txInfo.tx_result.repr;
  }
  if (Array.isArray(txInfo.events)) {
    obj.vls = [];
    for (const evt of txInfo.events) {
      try {
        obj.vls.push(evt.contract_log.value.repr);
      } catch (error) {
        // might be other event types.
      }
    }
  }
  return obj;
};

const getTxNumber = (regex, txInfo) => {
  try {
    const match = txInfo.result.match(regex);
    if (match) {
      const nmbr = parseInt(match[1]);
      if (isNumber(nmbr)) return nmbr;
    }
  } catch (error) {
    // txInfo.result might not be string.
  }

  return -1;
};

export const getTxAmount = (txInfo) => {
  const regex = /amount\s+u(\d+)/; // (ok (tuple (amount u10, cost u5)))
  return getTxNumber(regex, txInfo);
};

export const getTxCost = (txInfo) => {
  const regex = /cost\s+u(\d+)/; // (ok (tuple (amount u10, cost u5)))
  return getTxNumber(regex, txInfo);
};

export const validateTx = (stxAddr, tx) => {
  if (!isObject(tx)) return false;

  if (!isFldStr(tx.id)) return false;
  if (!isFldStr(tx.type)) return false;
  if (!isFldStr(tx.contract)) return false;

  if (!isNumber(tx.createDate)) return false;
  if (!isNumber(tx.updateDate)) return false;

  if ('evtId' in tx && !isFldStr(tx.evtId)) return false;
  if ('ocId' in tx && !isNumber(tx.ocId)) return false;
  if ('amount' in tx && !isNumber(tx.amount)) return false;
  if ('cost' in tx && !isNumber(tx.cost)) return false;

  if ('cTxId' in tx && !isFldStr(tx.cTxId)) return false;
  if ('pTxSts' in tx && !isFldStr(tx.pTxSts)) return false;
  if ('cTxSts' in tx && !isFldStr(tx.cTxSts)) return false;

  return true;
};

export const mergeTxs = (...txs) => {
  const bin = {
    updateDate: 0,
    pTxSts: { scs: null, updg: null },
    cTxSts: { scs: null, updg: null },
  };

  let newTx: any = {};
  for (const tx of txs) {
    if (!isObject(tx)) continue;

    if (isNumber(tx.updateDate)) {
      if (tx.updateDate > bin.updateDate) {
        bin.updateDate = tx.updateDate;
      }
    }
    if (isString(tx.pTxSts)) {
      if (tx.pTxSts === SCS) bin.pTxSts.scs = tx.pTxSts;
      else if (tx.pTxSts !== PDG) bin.pTxSts.updg = tx.pTxSts;
    }
    if (isString(tx.cTxSts)) {
      if (tx.cTxSts === SCS) bin.cTxSts.scs = tx.cTxSts;
      else if (tx.cTxSts !== PDG) bin.cTxSts.updg = tx.cTxSts;
    }

    newTx = { ...newTx, ...tx };
  }

  if (isNumber(bin.updateDate)) newTx.updateDate = bin.updateDate;

  if (isString(bin.pTxSts.scs)) newTx.pTxSts = bin.pTxSts.scs;
  else if (isString(bin.pTxSts.updg)) newTx.pTxSts = bin.pTxSts.updg;

  if (isString(bin.cTxSts.scs)) newTx.cTxSts = bin.cTxSts.scs;
  else if (isString(bin.cTxSts.updg)) newTx.cTxSts = bin.cTxSts.updg;

  return newTx;
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

export const isAvatarEqual = (strA, strB) => {
  let a = parseAvatar(strA);
  a = newObject(a, ['thumbnailAlt']);

  let b = parseAvatar(strB);
  b = newObject(b, ['thumbnailAlt']);

  return isEqual(a, b);
};

export const rectifyUser = (oldUser, newUser) => {
  if (newUser.balance < 0) {
    throw new Error(`In rectifyUser, invalid balance of User: ${newUser.stxAddr}`);
  }
  return newUser;
};

export const rectifyShare = (oldShare, newShare) => {
  if (newShare.amount < 0) {
    throw new Error(`In rectifyShare, invalid amount of share: ${newShare.id}`);
  }
  if (!isNumber(newShare.cost)) {
    throw new Error(`In rectifyShare, invalid cost of share: ${newShare.id}`);
  }
  return newShare;
};

export const rectifyTx = (oldTx, newTx) => {
  /*
    required: must always in tx
    fixed: if exists, cannot change
      attr          required   fixed
      id            true       true
      type          true       true
      contract      true       true
      createDate    true       true
      updateDate    true       false
      evtId         false      true
      ocId          false      true
      amount        false      true
      cost          false      true
      cTxid         false      true
      pTxSts        false      false
      cTxSts        false      false
  */
  const rfAttrs = ['id', 'type', 'contract', 'createDate'];
  const rAttrs = ['updateDate'];
  const fAttrs = ['evtId', 'ocId', 'amount', 'cost', 'cTxId'];

  for (const attr of rfAttrs) {
    if (!isFldStr(newTx[attr]) && !isNumber(newTx[attr])) {
      throw new Error(`In rectifyTx, invalid rfAttr: ${attr} of tx: ${newTx.id}`);
    }
    if (isObject(oldTx)) {
      if (newTx[attr] !== oldTx[attr]) {
        throw new Error(`In rectifyTx, invalid rfAttr: ${attr} of tx: ${newTx.id}`);
      }
    }
  }
  for (const attr of rAttrs) {
    if (!isFldStr(newTx[attr]) && !isNumber(newTx[attr])) {
      throw new Error(`In rectifyTx, invalid rAttr: ${attr} of tx: ${newTx.id}`);
    }
  }
  for (const attr of fAttrs) {
    if (isObject(oldTx) && attr in oldTx) {
      if (newTx[attr] !== oldTx[attr]) {
        throw new Error(`In rectifyTx, invalid fAttr: ${attr} of tx: ${newTx.id}`);
      }
    }
  }

  if ('amount' in newTx) {
    if (newTx.amount < 0) {
      throw new Error(`In rectifyTx, invalid amount of tx: ${newTx.id}`);
    }
  }
  if ('cost' in newTx) {
    if (!isNumber(newTx.cost)) {
      throw new Error(`In rectifyTx, invalid cost of tx: ${newTx.id}`);
    }
  }
  return newTx;
};

export const getTxState = (tx) => {
  if ('pTxSts' in tx && ![PDG, SCS].includes(tx.pTxSts)) {
    return TX_PUT_ERROR;
  }
  if ('cTxSts' in tx && ![PDG, SCS].includes(tx.cTxSts)) {
    return TX_CONFIRMED_ERROR;
  }

  if (tx.cTxSts === SCS) return TX_CONFIRMED_OK;
  if (tx.pTxSts === SCS) return TX_PUT_OK;
  if ('cTxId' in tx) return TX_IN_MEMPOOL;
  return TX_INIT;
};
