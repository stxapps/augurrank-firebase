import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import dataApi from '@/apis/server/data';

import { ALLOWED_ORIGINS } from '@/types/const';
import {
  getReferrer, randomString, removeTailingSlash, isObject, validateEmail,
} from '@/utils';

export async function POST(req: NextRequest) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/letters/joins receives a post request`);

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

  const { email } = reqBody;
  if (!validateEmail(email)) {
    const error = 'Invalid email';
    console.log(`(${logKey}) ${error}, return ERROR`);
    return NextResponse.json({ error }, { status: 400 });
  }

  await dataApi.addLetterJoin(logKey, email);

  console.log(`(${logKey}) /api/letters/joins finished`);
  return new NextResponse(null, { status: 204 });
}
