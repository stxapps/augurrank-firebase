import { ERR_NOT_FOUND } from '@/types/const';
import { getResErrMsg } from '@/utils';

const fetchTxInfo = async (txId) => {
  let url = 'https://api.hiro.so/extended/v1/tx/';
  const networkName = process.env.NEXT_PUBLIC_STACKS_NETWORK;
  if (networkName === 'testnet') url = 'https://api.testnet.hiro.so/extended/v1/tx/';

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

const hiro = { fetchTxInfo };

export default hiro;
