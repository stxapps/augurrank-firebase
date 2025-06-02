import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import dataApi from '@/apis/server/data';
import { ALLOWED_ORIGINS } from '@/types/const';
import { getReferrer, randomString, removeTailingSlash, isFldStr } from '@/utils';

export async function GET(
  req: NextRequest,
  { searchParams }: { searchParams: Promise<{ stxAddr: string, quryCusr: string }> },
) {
  const logKey = randomString(12);
  console.log(`(${logKey}) /api/txs receives a get request`);

  const referrer = getReferrer(req);
  console.log(`(${logKey}) Referrer: ${referrer}`);
  if (!referrer || !ALLOWED_ORIGINS.includes(removeTailingSlash(referrer))) {
    console.log(`(${logKey}) Not expected referrer.`);
  }

  const { stxAddr, quryCusr } = await searchParams;
  if (!isFldStr(stxAddr)) {

  }

  const res = await dataApi.queryTxs(stxAddr, quryCusr);

  console.log(`(${logKey}) /api/txs finished`);
  return NextResponse.json({ txs: res.txs, quryCusr: res.quryCrsr }, {
    status: 200, headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
