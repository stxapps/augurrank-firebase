import { serializeCV, deserializeCV } from '@stacks/transactions';

import { ERR_NOT_FOUND } from '@/types/const';
import { getResErrMsg } from '@/utils';

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

const callReadOnly = async (cntrcAddr, cntrcName, funcName, sdrAddr, args) => {
  let url = 'https://api.hiro.so/v2/contracts/call-read/';
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
  if (network === 'testnet') {
    url = 'https://api.testnet.hiro.so/v2/contracts/call-read/';
  }

  url += `${cntrcAddr}/${cntrcName}/${funcName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

  return deserializeCV(obj.result);
};

const hiro = { fetchTxInfo, callReadOnly };

export default hiro;
