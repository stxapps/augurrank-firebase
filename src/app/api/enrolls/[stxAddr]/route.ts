import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import authApi from '@/apis/server/auth';
import dataApi from '@/apis/server/data';
import scApi from '@/apis/server/sc';
import { ALLOWED_ORIGINS, SCS, PDG, ENRL_ID_SUFFIX, TX_ENROLL } from '@/types/const';
import {
  isObject, areAllString, getReferrer, randomString, removeTailingSlash, validateTx,
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

  const enrlId = `${stxAddr}${ENRL_ID_SUFFIX}`;
  let enrlTx = await dataApi.getTx(stxAddr, enrlId);

  if (!isObject(enrlTx)) {
    const res = await scApi.enroll(stxAddr);
    console.log(`(${logKey}) enroll with txId: ${res.txId}`);

    enrlTx = {
      id: enrlId, type: TX_ENROLL, contract: res.contract, cTxId: res.txId,
      pTxSts: SCS, cTxSts: PDG,
    };
    await dataApi.updateTx(logKey, stxAddr, enrlTx);
  }

  console.log(`(${logKey}) /api/enrolls/[stxAddr] finished`);
  return NextResponse.json(enrlTx, {
    status: 200, headers: { 'Cache-Control': 'private' },
  });
}

export async function PATCH(
  req: NextRequest, { params }: { params: Promise<{ stxAddr: string }> },
) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/enrolls/[stxAddr] receives a patch request`);

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

  if (tx.cTxSts !== PDG) {
    const user = tx.cTxSts === SCS ? { balance: 1000000000 } : null;
    await dataApi.updateUsrShrTx(logKey, stxAddr, user, null, tx);
  }

  console.log(`(${logKey}) /api/enrolls/[stxAddr] finished`);
  return new NextResponse(null, { status: 204 });
}
