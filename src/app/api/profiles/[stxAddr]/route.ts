import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import authApi from '@/apis/server/auth';
import dataApi from '@/apis/server/data';

import { ALLOWED_ORIGINS } from '@/types/const';
import {
  getReferrer, randomString, removeTailingSlash, isObject, areAllString,
  validateProfile,
} from '@/utils';

export async function GET(
  req: NextRequest, { params }: { params: Promise<{ stxAddr: string }> },
) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/profiles/[stxAddr] receives a get request`);

  const referrer = getReferrer(req);
  console.log(`(${logKey}) Referrer: ${referrer}`);
  if (!referrer || !ALLOWED_ORIGINS.includes(removeTailingSlash(referrer))) {
    console.log(`(${logKey}) Not expected referrer.`);
  }

  const { stxAddr } = await params;

  const user = await dataApi.getUser(stxAddr);
  const shares = isObject(user) ? await dataApi.getShares(stxAddr) : null;

  const profile = toProfile(user, shares);

  console.log(`(${logKey}) /api/profiles/[stxAddr] finished`);
  return NextResponse.json({ profile }, {
    status: 200, headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
    },
  });
}

const toProfile = (user, shares) => {
  const attrs = ['username', 'avatar', 'bio', 'balance', 'noInLdb'];

  const profile: any = {
    username: '', avatar: '', bio: '', balance: null,
  };
  if (isObject(user) && user.noPrflPg !== true) {
    for (const attr of attrs) {
      if (!(attr in user)) continue;
      profile[attr] = user[attr];
    }
  }
  if (Array.isArray(shares)) profile.shares = shares;

  return profile;
};

export async function PATCH(
  req: NextRequest, { params }: { params: Promise<{ stxAddr: string }> },
) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/profiles/[stxAddr] receives a patch request`);

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
    console.log(`(${logKey}) ${error} return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const { profile } = reqBody;
  if (!validateProfile(profile)) {
    const error = 'Invalid profile';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const verifyResult = authApi.verify(stxAddr, stxPubKey, stxTstStr, stxSigStr);
  if (!verifyResult) {
    const error = 'Invalid authApi.verify';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 401 });
  }

  await dataApi.updateProfile(logKey, stxAddr, profile);

  console.log(`(${logKey}) /api/profiles/[stxAddr] finished`);
  return new NextResponse(null, { status: 204 });
}
