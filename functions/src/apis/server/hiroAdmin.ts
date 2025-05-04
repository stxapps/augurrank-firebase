import { serializeCV, deserializeCV } from '@stacks/transactions';
import { createApiKeyMiddleware, createFetchFn } from "@stacks/common";

import { getResErrMsg } from '@/utils';

let fetchFn;
const getFetchFn = () => {
  if (fetchFn) return fetchFn;

  const apiMiddleware = createApiKeyMiddleware({
    apiKey: process.env.HIRO_API_KEY,
  });
  fetchFn = createFetchFn(apiMiddleware);
  return fetchFn
};

const callReadOnly = async (cntrcAddr, cntrcName, funcName, sdrAddr, args) => {
  let url = 'https://api.hiro.so/v2/contracts/call-read/';
  const networkName = process.env.NEXT_PUBLIC_STACKS_NETWORK;
  if (networkName === 'testnet') {
    url = 'https://api.testnet.hiro.so/v2/contracts/call-read/';
  }

  url += `${cntrcAddr}/${cntrcName}/${funcName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.HIRO_API_KEY,
    },
    body: JSON.stringify({
      sender: sdrAddr, arguments: args.map(arg => serializeCV(arg)),
    }),
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }

  const obj = await res.json();
  if (obj.okay !== true) {
    throw new Error(obj.cause);
  }

  const data = deserializeCV(obj.result);
  return data;
};

const hiroAdmin = { getFetchFn, callReadOnly };

export default hiroAdmin;
