import {
  makeContractCall, broadcastTransaction, PostConditionMode, Cl,
} from '@stacks/transactions';

import { info } from '@/info';
import stxAccApi from '@/apis/server/stxAcc';
import { SENDER_KEY } from '@/keys';
import { isFldStr, isNumber } from '@/utils';

const prepend0x = (txId) => {
  if (!txId.startsWith('0x')) return '0x' + txId;
  return txId;
};

const setMarketsContract = async () => {
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.tokenContract,
    functionName: 'set-markets-contract',
    functionArgs: [Cl.principal(`${info.stxAddr}.${info.marketsContract}`)],
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

const setStoreContract = async () => {
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.tokenContract,
    functionName: 'set-store-contract',
    functionArgs: [Cl.principal(`${info.stxAddr}.${info.storeContract}`)],
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
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
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
  if (!isFldStr(recipient)) recipient = info.stxAddr;

  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
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

  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
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

const setEventBeta = async (evtId, beta) => {
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.marketsContract,
    functionName: 'set-event-beta',
    functionArgs: [Cl.uint(evtId), Cl.uint(beta)],
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

const setEventStatus = async (evtId, status, winOcId = null) => {
  const clWinOcId = isNumber(winOcId) ? Cl.uint(winOcId) : Cl.none();

  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.marketsContract,
    functionName: 'set-event-status',
    functionArgs: [Cl.uint(evtId), Cl.uint(status), clWinOcId],
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

const payRewards = async () => {

};

const refundFunds = async () => {

};

const enroll = async (stxAddr) => {
  const nonce = await stxAccApi.reserveNonce(info.stxAddr, info.network);
  const txOptions = {
    network: info.network,
    senderKey: SENDER_KEY,
    contractAddress: info.stxAddr,
    contractName: info.enrollContract,
    functionName: 'enroll',
    functionArgs: [Cl.principal(stxAddr)],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    fee: 3261,
    nonce,
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return { ...res, txId: prepend0x(res.txid), contract: info.enrollContract };
};

const sc = {
  setMarketsContract, setStoreContract, setTokenUri, mint, createEvent,
  setEventBeta, setEventStatus, payRewards, refundFunds, enroll,
};

export default sc;
