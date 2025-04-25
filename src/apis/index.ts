import lsgApi from '@/apis/localSg';
import {
  ME_OBJ, NFT_METAS, STX_TST_STR, ME_PATH, ENROLLS_PATH, TXS_PATH, ERR_NOT_FOUND,
} from '@/types/const';
import { isString, isFldStr, newObject, getResErrMsg } from '@/utils';

const getLocalMe = () => {
  let data: any = { stxAddr: '', stxPubKey: '', stxSigStr: '' };

  const str = lsgApi.getItemSync(ME_OBJ);
  if (isString(str)) {
    try {
      const obj = JSON.parse(str);
      data = newObject(obj, ['fthSts', 'enrlFthSts']);
    } catch (error) {
      // Ignore if cache value invalid
    }
  }

  return data;
};

const putLocalMe = (me) => {
  const obj = newObject(me, ['fthSts', 'enrlFthSts']);
  lsgApi.setItemSync(ME_OBJ, JSON.stringify(obj));
};

const deleteLocalFiles = () => {
  const keys = lsgApi.listKeysSync();
  for (const key of keys) {
    if (key.startsWith(`${NFT_METAS}/`)) {
      lsgApi.removeItemSync(key);
    }
  }

  // Delete files in IndexedDB here if needed
};

const getAuthData = () => {
  const { stxAddr, stxPubKey, stxSigStr } = getLocalMe();
  if (!isFldStr(stxAddr) || !isFldStr(stxPubKey) || !isFldStr(stxSigStr)) {
    let msg = `Invalid stxAddr: ${stxAddr}`;
    msg += `, stxPubKey: ${stxPubKey}`;
    msg += `, or stxSigStr: ${stxSigStr}`;
    throw new Error(msg);
  }

  return { stxAddr, stxTstStr: STX_TST_STR, stxPubKey, stxSigStr };
};

const fetchMe = async () => {
  const authData = getAuthData();

  const res = await fetch(ME_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'strict-origin',
    body: JSON.stringify({ ...authData }),
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }

  const obj = await res.json();
  return obj;
};

const applyEnroll = async () => {
  const authData = getAuthData();

  const res = await fetch(`${ENROLLS_PATH}/${authData.stxAddr}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'strict-origin',
    body: JSON.stringify({ ...authData }),
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }

  const obj = await res.json();
  return obj;
};

const patchTx = async (tx) => {
  const authData = getAuthData();

  const res = await fetch(`${TXS_PATH}/${tx.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'strict-origin',
    body: JSON.stringify({ ...authData, tx }),
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }
};

const fetchTxInfo = async (txId) => {
  let url = 'https://api.hiro.so/extended/v1/tx/';
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
  if (network === 'testnet') url = 'https://api.testnet.hiro.so/extended/v1/tx/';

  const res = await fetch(`${url}${txId}`);
  if (res.status === 404) {
    throw new Error(ERR_NOT_FOUND);
  }
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }
  const obj = await res.json();
  return obj;
};

const index = {
  getLocalMe, putLocalMe, deleteLocalFiles, getAuthData, fetchMe, applyEnroll,
  patchTx, fetchTxInfo,
};

export default index;
