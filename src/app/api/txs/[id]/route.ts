import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getInfo } from '@/info';
import authApi from '@/apis/server/auth';
import dataApi from '@/apis/server/data';
import taskApi from '@/apis/server/task';
import {
  ALLOWED_ORIGINS, SCS, ENRL_ID_SUFFIX, TX_ENROLL, TX_BUY, TX_SELL,
} from '@/types/const';
import {
  isObject, areAllString, getReferrer, randomString, removeTailingSlash, validateTx,
  isTxConfirmed,
} from '@/utils';

export async function PATCH(
  req: NextRequest, { params }: { params: Promise<{ id: string }> },
) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/txs/[id] receives a patch request`);

  const referrer = getReferrer(req);
  console.log(`(${logKey}) Referrer: ${referrer}`);
  if (!referrer || !ALLOWED_ORIGINS.includes(removeTailingSlash(referrer))) {
    console.log(`(${logKey}) Not expected referrer.`);
  }

  const { id } = await params;

  const reqBody = await req.json();
  console.log(`(${logKey}) Request body: ${JSON.stringify(reqBody)}`);
  if (!isObject(reqBody)) {
    const error = 'Invalid reqBody';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const { stxAddr, stxPubKey, stxTstStr, stxSigStr } = reqBody;
  if (!areAllString(stxAddr, stxPubKey, stxTstStr, stxSigStr)) {
    const error = 'Invalid stx[Addr, PubKey, TstStr or SigStr]';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const { tx } = reqBody;
  if (!validateTx(stxAddr, tx)) {
    const error = 'Invalid tx';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const verifyResult = authApi.verify(stxAddr, stxPubKey, stxTstStr, stxSigStr);
  if (!verifyResult) {
    const error = 'Invalid authApi.verify';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 401 });
  }

  tx.id = id;

  let data;
  if (tx.type === TX_ENROLL) {
    const id = `${stxAddr}${ENRL_ID_SUFFIX}`;
    if (tx.id !== id || !isTxConfirmed(tx)) {
      const error = 'Invalid enroll tx';
      console.log(`(${logKey}) ${error}, return ERROR`);
      return NextResponse.json({ error }, { status: 400 });
    }

    const user = { balance: getInfo().enrollBonus, updateDate: tx.updateDate };
    const { isToScs, udtdUser, udtdTx } = await dataApi.updateUsrShrTx(
      logKey, stxAddr, user, null, tx
    );
    data = { tx: udtdTx };
    if (isToScs) {
      data = { balance: udtdUser.balance, tx: udtdTx };
    }
  } else if ([TX_BUY, TX_SELL].includes(tx.type)) {
    const { evtId, ocId, amount, cost, updateDate } = tx;
    const shrId = `${stxAddr}-${evtId}-${ocId}`;

    let user = null, share = null;
    if (tx.cTxSts === SCS) {
      user = { balance: cost, updateDate };
      if (tx.type === TX_BUY) user.balance *= -1;

      share = { id: shrId, evtId, ocId, amount, cost, updateDate };
      if (tx.type === TX_SELL) {
        share.amount *= -1;
        share.cost *= -1;
      }
    }

    const { isToScs, udtdUser, udtdShare, utdtTx } = await dataApi.updateUsrShrTx(
      logKey, stxAddr, user, share, tx,
    );
    data = { tx: utdtTx };
    if (isToScs) {
      data = { balance: udtdUser.balance, share: udtdShare, tx: utdtTx };
      await taskApi.addSyncEvtTask(evtId);
    }
  } else {
    const error = 'Invalid tx type';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  console.log(`(${logKey}) /api/txs/[id] finished`);
  return new NextResponse(data, {
    status: 200, headers: { 'Cache-Control': 'private' },
  });
}
