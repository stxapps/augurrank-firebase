import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import authApi from '@/apis/server/auth';
import dataApi from '@/apis/server/data';

import { ALLOWED_ORIGINS } from '@/types/const';
import {
  isObject, areAllString, getReferrer, randomString, removeTailingSlash,
} from '@/utils';

export async function POST(req: NextRequest) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/me receives a post request`);

  const referrer = getReferrer(req);
  console.log(`(${logKey}) Referrer: ${referrer}`);
  if (!referrer || !ALLOWED_ORIGINS.includes(removeTailingSlash(referrer))) {
    console.log(`(${logKey}) Not expected referrer.`);
  }

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

  const verifyResult = authApi.verify(stxAddr, stxPubKey, stxTstStr, stxSigStr);
  if (!verifyResult) {
    const error = 'Invalid authApi.verify';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 401 });
  }

  const user = await dataApi.getUser(stxAddr);
  const shares = isObject(user) ? await dataApi.getShares(stxAddr) : null;

  const me = toMe(user, shares);

  console.log(`(${logKey}) /api/me finished`);
  return NextResponse.json(me, {
    status: 200, headers: { 'Cache-Control': 'private' },
  });
}

const toMe = (user, shares) => {
  const attrs = [
    'username', 'avatar', 'bio', 'didAgreeTerms', 'balance', 'noInLdb', 'noPrflPg',
  ];

  const me: any = {
    username: '', avatar: '', bio: '', didAgreeTerms: null, balance: null,
  };
  if (isObject(user)) {
    for (const attr of attrs) {
      if (!(attr in user)) continue;
      me[attr] = user[attr];
    }
  }
  if (Array.isArray(shares)) me.shares = shares;

  return me;
};
