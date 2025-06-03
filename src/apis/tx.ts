import { TXS_PATH } from '@/types/const';
import { getResErrMsg } from '@/utils';

const fetchTxs = async (stxAddr: string, quryCrsr: string) => {
  const params = new URLSearchParams();
  params.append('stxAddr', stxAddr);
  params.append('quryCrsr', quryCrsr);

  const res = await fetch(`${TXS_PATH}?${params.toString()}`, {
    method: 'GET',
    referrerPolicy: 'strict-origin',
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }

  const obj = await res.json();
  return obj;
};

const tx = { fetchTxs };

export default tx;
