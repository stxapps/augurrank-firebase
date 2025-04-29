import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import authApi from '@/apis/server/auth';
import dataApi from '@/apis/server/data';
import {
  ALLOWED_ORIGINS, PDG, SCS, ENRL_ID_SUFFIX, TX_ENROLL, TX_BUY, TX_SELL,
} from '@/types/const';
import {
  isObject, areAllString, getReferrer, randomString, removeTailingSlash, validateTx,
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

  if (tx.type === TX_ENROLL) {
    const enrlId = `${stxAddr}${ENRL_ID_SUFFIX}`;
    if (tx.id !== enrlId || tx.cTxSts === PDG) {
      const error = 'Invalid enroll tx';
      console.log(`(${logKey}) ${error}, return ERROR`);
      return NextResponse.json({ error }, { status: 400 });
    }

    const user = { balance: 1000000000 };
    await dataApi.updateUsrShrTx(logKey, stxAddr, user, null, tx);
  } else if (tx.type === TX_BUY) {
    const { evtId, ocId, amount, cost } = tx;
    const shrId = `${stxAddr}-${evtId}-${ocId}`;

    let user = null, share = null;
    if (tx.cTxSts === SCS) {
      user = { balance: cost * -1 };
      share = { id: shrId, evtId, ocId, amount, cost };
    }
    await dataApi.updateUsrShrTx(logKey, stxAddr, user, share, tx);
  } else if (tx.type === TX_SELL) {
    const { evtId, ocId, amount, cost } = tx;
    const shrId = `${stxAddr}-${evtId}-${ocId}`;

    let user = null, share = null;
    if (tx.cTxSts === SCS) {
      user = { balance: cost };
      share = { id: shrId, evtId, ocId, amount: amount * -1, cost: cost * -1 };
    }
    await dataApi.updateUsrShrTx(logKey, stxAddr, user, share, tx);
  } else {
    const error = 'Invalid tx type';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  console.log(`(${logKey}) /api/txs/[id] finished`);
  return new NextResponse(null, { status: 204 });
}
