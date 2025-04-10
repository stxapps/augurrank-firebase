import {
  makeContractCall, broadcastTransaction, PostConditionMode, Cl,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

import { SENDER_KEY } from '@/keys';
import { isFldStr, isNumber } from '@/utils';

const getStacksInfo = () => {
  const network = process.env.STACKS_NETWORK;
  if (network === 'mainnet') {
    return {
      network: STACKS_MAINNET,
      stxAddr: 'SP1ARJX5XDEYWNDX8JEKGTZNZ0YJHQAYDWVNBRXGM',
      tokenContract: 'augur-token-v1',
      marketsContract: 'augur-markets-v1',
      storeContract: 'augur-store-v1',
    };
  }
  if (network === 'testnet') {
    return {
      network: STACKS_TESTNET,
      stxAddr: 'ST1ARJX5XDEYWNDX8JEKGTZNZ0YJHQAYDWRSAB44M',
      tokenContract: 'augur-token-t1',
      marketsContract: 'augur-markets-t1',
      storeContract: 'augur-store-t1',
    };
  }

  throw new Error(`Invalid Stacks network: ${network}`);
};

const setMarketsContract = async () => {
  const info = getStacksInfo();

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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const setStoreContract = async () => {
  const info = getStacksInfo();

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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const setTokenUri = async (uri) => {
  const info = getStacksInfo();

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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const mint = async (amount, recipient = null) => {
  const info = getStacksInfo();
  if (!isFldStr(recipient)) recipient = info.stxAddr;

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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const createEvent = async (evt) => {
  const info = getStacksInfo();
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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const setEventBeta = async (evtId, beta) => {
  const info = getStacksInfo();

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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const setEventStatus = async (evtId, status, winOcId = null) => {
  const info = getStacksInfo();
  const clWinOcId = isNumber(winOcId) ? Cl.uint(winOcId) : Cl.none();

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
    validateWithAbi: true,
  };
  const transaction = await makeContractCall(txOptions);
  const res = await broadcastTransaction({ transaction, network: info.network });
  return res;
};

const payRewards = async () => {

};

const refundFunds = async () => {

};

const sc = {
  getStacksInfo, setMarketsContract, setStoreContract, setTokenUri, mint, createEvent,
  setEventBeta, setEventStatus, payRewards, refundFunds,
};

export default sc;
