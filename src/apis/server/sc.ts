import {
  makeContractCall, broadcastTransaction, PostConditionMode, Cl,
} from '@stacks/transactions';

import { getInfo } from '@/info';
import hrAmApi from '@/apis/server/hiroAdmin';
import stxAccApi from '@/apis/server/stxAcc';
import { isFldStr, isNumber } from '@/utils';

const prepend0x = (txId) => {
  if (!txId.startsWith('0x')) return '0x' + txId;
  return txId;
};

const addAllowedContract = async (value) => {
  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.tokenContract,
    functionName: 'add-allowed-contract',
    functionArgs: [Cl.principal(value)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const deleteAllowedContract = async (value) => {
  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.tokenContract,
    functionName: 'delete-allowed-contract',
    functionArgs: [Cl.principal(value)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const setTokenUri = async (uri) => {
  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.tokenContract,
    functionName: 'set-token-uri',
    functionArgs: [Cl.stringUtf8(uri)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const mint = async (amount, recipient = null) => {
  const info = getInfo();
  if (!isFldStr(recipient)) recipient = info.stxAddr;

  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.tokenContract,
    functionName: 'mint',
    functionArgs: [Cl.uint(amount), Cl.principal(recipient), Cl.none()],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const createEvent = async (evt) => {
  const args = [
    Cl.stringAscii(evt.title),
    Cl.stringAscii(evt.desc),
    Cl.uint(evt.beta),
    Cl.uint(evt.status),
    isNumber(evt.winOcId) ? Cl.uint(evt.winOcId) : Cl.none(),
    Cl.list(evt.outcomes.map(oc => {
      return Cl.tuple({
        desc: Cl.stringAscii(oc.desc), 'share-amount': Cl.uint(oc.shareAmount),
      });
    })),
  ];

  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.marketsContract,
    functionName: 'create-event',
    functionArgs: args,
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const setEventBeta = async (scEvtId, beta) => {
  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.marketsContract,
    functionName: 'set-event-beta',
    functionArgs: [Cl.uint(scEvtId), Cl.uint(beta)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const setEventStatus = async (scEvtId, status, winOcId = null) => {
  const clWinOcId = isNumber(winOcId) ? Cl.some(Cl.uint(winOcId)) : Cl.none();

  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.marketsContract,
    functionName: 'set-event-status',
    functionArgs: [Cl.uint(scEvtId), Cl.uint(status), clWinOcId],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const payRewards = async (keys) => {
  const clKeys = keys.map(key => {
    return Cl.tuple({
      'event-id': Cl.uint(key.evtId), 'user-id': Cl.principal(key.userId),
    });
  })

  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.marketsContract,
    functionName: 'pay-rewards',
    functionArgs: [Cl.list(clKeys)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid) };
};

const refundFunds = async () => {

};

const enroll = async (stxAddr) => {
  const info = getInfo();
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: process.env.SC_SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.enrollContract,
    functionName: 'enroll',
    functionArgs: [Cl.principal(stxAddr)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
    client: { fetch: hrAmApi.getFetchFn() },
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid), contract: info.enrollContract };
};

const sc = {
  addAllowedContract, deleteAllowedContract, setTokenUri, mint, createEvent,
  setEventBeta, setEventStatus, payRewards, refundFunds, enroll,
};

export default sc;
