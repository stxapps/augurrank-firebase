import { serializeCV, postConditionToHex } from '@stacks/transactions/dist/esm';
import {
  verifyMessageSignatureRsv, verifyMessageSignature, verifyECDSA,
} from '@stacks/encryption/dist/esm';
import { networkFrom } from '@stacks/network/dist/esm';
import { request as xRequest, AddressPurpose } from 'sats-connect';
import { createUnsecuredToken } from 'jsontokens';

import lsgApi from '@/apis/localSg';
import {
  WALLET_ID, ID_LEATHER, ID_XVERSE, ERR_INVALID_ARGS, ERR_NOT_FOUND, ERR_VRF_SIG,
} from '@/types/const';
import { isObject, isString } from '@/utils';

const getWalletId = () => {
  let id = null;

  const str = lsgApi.getItemSync(WALLET_ID);
  if (isString(str)) id = str;

  return id;
};

const putWalletId = (id) => {
  lsgApi.setItemSync(WALLET_ID, id);
};

const deleteWalletId = () => {
  lsgApi.removeItemSync(WALLET_ID);
};

const getWallet = (id) => {
  let acc: any = window;
  for (const part of id.split('.')) {
    if (!isObject(acc)) break;
    acc = acc[part];
  }
  return acc;
};

const getInstalledWalletIds = () => {
  const ltWlt = getWallet(ID_LEATHER);
  const xvWlt = getWallet(ID_XVERSE);

  const ids = [];
  if (isObject(ltWlt)) ids.push(ID_LEATHER);
  if (isObject(xvWlt)) ids.push(ID_XVERSE);

  return ids;
};

const connectLeather = async () => {
  const wallet = getWallet(ID_LEATHER);
  if (!isObject(wallet)) throw new Error(ERR_NOT_FOUND);

  const res = await wallet.request('getAddresses');
  const stxRes = res.result.addresses.find(obj => obj.symbol === 'STX');
  putWalletId(ID_LEATHER);

  return { stxAddr: stxRes.address, stxPubKey: stxRes.publicKey };
};

const connectXverse = async () => {
  const wallet = getWallet(ID_XVERSE);
  if (!isObject(wallet)) throw new Error(ERR_NOT_FOUND);

  const res = await xRequest('wallet_connect', { addresses: [AddressPurpose.Stacks] });
  if (res.status !== 'success') throw res;

  const stxRes = res.result.addresses.find(obj => obj.addressType === 'stacks');
  putWalletId(ID_XVERSE);

  return { stxAddr: stxRes.address, stxPubKey: stxRes.publicKey };
};

const connect = (id) => {
  if (id === ID_LEATHER) return connectLeather();
  if (id === ID_XVERSE) return connectXverse();

  throw new Error(ERR_INVALID_ARGS);
};

const signMessageLeather = async (msg, networkName) => {
  const wallet = getWallet(ID_LEATHER);
  if (!isObject(wallet)) throw new Error(ERR_NOT_FOUND);

  const res = await wallet.request('stx_signMessage', {
    message: msg, messageType: 'utf8', network: networkName,
  });
  return { stxSigStr: res.result.signature };
};

const signMessageXverse = async (stxPubKey, msg) => {
  const wallet = getWallet(ID_XVERSE);
  if (!isObject(wallet)) throw new Error(ERR_NOT_FOUND);

  const res = await xRequest('stx_signMessage', { publicKey: stxPubKey, message: msg });
  if (res.status !== 'success') throw res;

  return { stxSigStr: res.result.signature };
};

const signMessage = async (stxPubKey, msg, networkName) => {
  const id = getWalletId();

  let res;
  if (id === ID_LEATHER) {
    res = await signMessageLeather(msg, networkName);
  } else if (id === ID_XVERSE) {
    res = await signMessageXverse(stxPubKey, msg);
  } else {
    throw new Error(ERR_INVALID_ARGS);
  }

  let vRes = false;
  try {
    vRes = verifyMessageSignatureRsv({
      publicKey: stxPubKey, message: msg, signature: res.stxSigStr,
    });
  } catch (error) {}
  if (vRes === true) return res;

  try {
    vRes = verifyMessageSignature({
      publicKey: stxPubKey, message: msg, signature: res.stxSigStr,
    });
  } catch (error) {}
  if (vRes === true) return res;

  try {
    vRes = verifyECDSA(msg, stxPubKey, res.stxSigStr);
  } catch (error) {}
  if (vRes === true) return res;

  throw new Error(ERR_VRF_SIG);
};

const contractCallLeather = async (opts) => {
  const wallet = getWallet(ID_LEATHER);
  if (!isObject(wallet)) throw new Error(ERR_NOT_FOUND);

  const { functionArgs, postConditions, network, ...restOpts } = opts;
  const args = functionArgs.map(arg => {
    if (typeof arg === 'string') return arg;
    return serializeCV(arg);
  });
  const pcs = postConditions.map(postConditionToHex);
  const ntw = networkFrom(network);

  const payload = {
    ...restOpts,
    functionArgs: args,
    postConditions: pcs,
    network: ntw,
    txType: 'contract_call',
  };
  const token = createUnsecuredToken(payload);
  const res = await wallet.transactionRequest(token);

  let txId = res.txId;
  if (!txId.startsWith('0x')) txId = '0x' + txId;
  return { txId };
};

const contractCallXverse = async (opts) => {
  const wallet = getWallet(ID_XVERSE);
  if (!isObject(wallet)) throw new Error(ERR_NOT_FOUND);

  const { functionArgs, postConditions, network, ...restOpts } = opts;
  const args = functionArgs.map(arg => {
    if (typeof arg === 'string') return arg;
    return serializeCV(arg);
  });
  const pcs = postConditions.map(postConditionToHex);
  const ntw = networkFrom(network);

  const payload = {
    ...restOpts,
    functionArgs: args,
    postConditions: pcs,
    network: ntw,
    txType: 'contract_call',
  };
  const token = createUnsecuredToken(payload);
  const res = await wallet.transactionRequest(token);

  let txId = res.txId;
  if (!txId.startsWith('0x')) txId = '0x' + txId;
  return { txId };
};

const contractCall = (opts) => {
  const id = getWalletId();
  if (id === ID_LEATHER) return contractCallLeather(opts);
  if (id === ID_XVERSE) return contractCallXverse(opts);

  throw new Error(ERR_INVALID_ARGS);
};

const disconnectLeather = async () => {
  deleteWalletId();
};

const disconnectXverse = async () => {
  await xRequest('wallet_disconnect', null);
  deleteWalletId();
};

const disconnect = () => {
  const id = getWalletId();
  if (id === ID_LEATHER) return disconnectLeather();
  if (id === ID_XVERSE) return disconnectXverse();

  throw new Error(ERR_INVALID_ARGS);
};

const wallet = { getInstalledWalletIds, connect, signMessage, contractCall, disconnect };

export default wallet;
