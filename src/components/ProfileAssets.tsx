'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

import { useSelector } from '@/store';
import { getProfileWthSts } from '@/selectors';
import { SCALE } from '@/types/const';
import { isFldStr } from '@/utils';

export function ProfileAssets() {
  const params = useParams<{ stxAddr: string }>();
  const stxAddr = params.stxAddr;

  const profile = useSelector(state => getProfileWthSts(state, stxAddr));

  const { fthSts, shares } = profile;

  const renderEmpty = () => {
    return (
      <div className="mt-10 flex flex-col items-center justify-center text-center">
        <ArrowTrendingUpIcon className="size-12 text-slate-400" />
        <h3 className="mt-3 text-base font-semibold text-slate-100">There are no predictions yet.</h3>
        <p className="mt-1 text-sm text-slate-400">Get started by buying a share.</p>
        <Link className="mt-4 rounded-full bg-orange-400 px-4 py-2 text-sm font-medium text-white hover:brightness-110" href="/" prefetch={false}>Home</Link>
      </div>
    );
  };

  const renderItems = () => {
    return (
      <div className="mt-10 max-w-sm mx-auto">
        <h4 className="text-slate-300 font-medium">Assets</h4>
        {shares.map(share => {
          return (
            <div key={share.id} className="divide-y divide-slate-700 py-3">
              <Link className="flex items-center justify-between space-x-2 group" href={`/event/${share.evtSlug}`} prefetch={false}>
                <div className="relative shrink-0 grow-0 size-10 rounded bg-slate-700 overflow-hidden">
                  {isFldStr(share.evtImg) && <Image className="object-cover" src={share.evtImg} alt="" fill={true} unoptimized={true} />}
                </div>
                <div className="shrink grow">
                  <p className="text-base font-semibold text-slate-200 text-right group-hover:underline">{share.evtTitle}</p>
                  <p className="text-slate-300 text-right mt-1">{share.ocDesc} {Math.floor(share.amount / SCALE)} shares</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  let content;
  if (fthSts === 2) { // show error
    content = null;
  } else if (fthSts === 1) {
    if (shares.length === 0) content = renderEmpty();
    else content = renderItems();
  } else { // show loading
    content = null;
  }

  return content;
}
