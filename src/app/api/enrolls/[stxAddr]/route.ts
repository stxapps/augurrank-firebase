import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import authApi from '@/apis/server/auth';
import dataApi from '@/apis/server/data';
import scApi from '@/apis/server/sc';
import { ALLOWED_ORIGINS, SCS, ENRL_ID_SUFFIX, TX_ENROLL } from '@/types/const';
import {
  isObject, areAllString, getReferrer, randomString, removeTailingSlash,
} from '@/utils';

export async function POST(
  req: NextRequest, { params }: { params: Promise<{ stxAddr: string }> },
) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/enrolls/[stxAddr] receives a post request`);

  const referrer = getReferrer(req);
  console.log(`(${logKey}) Referrer: ${referrer}`);
  if (!referrer || !ALLOWED_ORIGINS.includes(removeTailingSlash(referrer))) {
    console.log(`(${logKey}) Not expected referrer.`);
  }

  const { stxAddr } = await params;

  const reqBody = await req.json();
  console.log(`(${logKey}) Request body: ${JSON.stringify(reqBody)}`);
  if (!isObject(reqBody)) {
    const error = 'Invalid reqBody';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const { stxPubKey, stxTstStr, stxSigStr } = reqBody;
  if (!areAllString(stxPubKey, stxTstStr, stxSigStr)) {
    const error = 'Invalid stx[PubKey, TstStr or SigStr]';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const verifyResult = authApi.verify(stxAddr, stxPubKey, stxTstStr, stxSigStr);
  if (!verifyResult) {
    const error = 'Invalid authApi.verify';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 401 });
  }

  const id = `${stxAddr}${ENRL_ID_SUFFIX}`;
  let tx = await dataApi.getTx(stxAddr, id);

  if (!isObject(tx)) {
    const res = await scApi.enroll(stxAddr);
    console.log(`(${logKey}) enroll with txId: ${res.txId}`);

    const now = Date.now();
    tx = {
      id, type: TX_ENROLL, contract: res.contract, createDate: now, updateDate: now,
      cTxId: res.txId, pTxSts: SCS,
    };
    const { rctdTx } = await dataApi.updateUsrShrTx(logKey, stxAddr, null, null, tx);
    tx = rctdTx;
  }

  console.log(`(${logKey}) /api/enrolls/[stxAddr] finished`);
  return NextResponse.json({ tx }, {
    status: 200, headers: { 'Cache-Control': 'private' },
  });
}
