import { fetchNonce } from '@stacks/transactions';

import hrAmApi from '@/apis/server/hiroAdmin';
import { getFstoreAdmin, stxAccToDoc } from '@/apis/server/fbaseAdmin';
import { STX_ACCS } from '@/types/const';
import { docToStxAcc } from '@/utils/fbase';

const reserveNonce = async (stxAddr, network) => {
  const db = getFstoreAdmin();
  const ref = db.collection(STX_ACCS).doc(stxAddr);

  const value = await db.runTransaction(async (t) => {
    let cNonce: bigint, newStxAcc;
    const now = Date.now();

    const snapshot = await t.get(ref);
    if (snapshot.exists) {
      const oldStxAcc = docToStxAcc(stxAddr, snapshot.data());
      cNonce = oldStxAcc.nonce;
      newStxAcc = { ...oldStxAcc, updateDate: now };
    } else {
      cNonce = BigInt(0);
      newStxAcc = { stxAddr, createDate: now, updateDate: now };
    }

    const fNonce = await fetchNonce({
      address: stxAddr, network, client: { fetch: hrAmApi.getFetchFn() },
    });
    if (fNonce > cNonce) cNonce = fNonce;

    newStxAcc.nonce = BigInt(cNonce) + BigInt(1);
    t.set(ref, stxAccToDoc(newStxAcc));

    return cNonce;
  });

  return value;
};

const stxAcc = { reserveNonce };

export default stxAcc;
