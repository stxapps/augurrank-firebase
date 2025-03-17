import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

//Must not cache as it ignores header values
//export const dynamic = 'force-static';
//export const revalidate = 60;

export async function POST(request: NextRequest) {


  return NextResponse.json({}, {
    status: 200,
    headers: {
      // set only private is enough?
      //'Cache-Control': 'private, max-age=300', // Cache privately for 5 minutes
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    },
  });
}
