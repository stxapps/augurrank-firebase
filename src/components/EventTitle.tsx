'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/solid';

import { useSelector, useDispatch } from '@/store';
import { fetchEvent } from '@/actions/common';
import {
  EVT_INIT, EVT_CLOSED, EVT_RESOLVED, EVT_PAUSED, EVT_DISPUTED, EVT_CANCELED,
} from '@/types/const';
import { getEventWthSts } from '@/selectors';
import { isFldStr, getFmtdVol, getFmtdDt } from '@/utils';

export function EventTitle() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const evt = useSelector(state => getEventWthSts(state, slug));
  const dispatch = useDispatch();

  const { fthSts } = evt;

  useEffect(() => {
    dispatch(fetchEvent(slug));
  }, [slug]);

  const renderContent = () => {
    let btmCnt = null;
    if (evt.status === EVT_INIT) {
      btmCnt = (
        <p className="inline-block bg-yellow-900 rounded text-xs font-medium text-yellow-500 px-1 py-0.5">Coming soon</p>
      );
    } else if (evt.status === EVT_CLOSED) {
      btmCnt = <p className="text-sm text-slate-400">Closed</p>;
    } else if (evt.status === EVT_RESOLVED) {
      btmCnt = <p className="text-sm text-slate-400">Resolved</p>;
    } else if (evt.status === EVT_PAUSED) {
      btmCnt = <p className="text-sm text-slate-400">Paused</p>;
    } else if (evt.status === EVT_DISPUTED) {
      btmCnt = <p className="text-sm text-slate-400">Disputed</p>;
    } else if (evt.status === EVT_CANCELED) {
      btmCnt = <p className="text-sm text-slate-400">Canceled</p>;
    } else {
      const fmtdVol = getFmtdVol(evt.valVol);
      const fmtdClsdDt = getFmtdDt(evt.closeDate);

      btmCnt = (
        <>
          {isFldStr(fmtdVol) ? <p className="text-sm text-slate-400">₳{fmtdVol} Vol.</p> : <p className="inline-block bg-yellow-900 rounded text-xs font-medium text-yellow-500 px-1 py-0.5">New</p>}
          <div className="flex space-x-1">
            <ClockIcon className="text-slate-400 size-5" />
            <p className="text-sm text-slate-400">{fmtdClsdDt}</p>
          </div>
        </>
      );
    }

    return (
      <div>
        <div className="flex items-center space-x-3.5">
          <div className="relative shrink-0 size-10 rounded bg-slate-700 overflow-hidden">
            {isFldStr(evt.img) && <Image className="object-cover" src={evt.img} alt="" fill={true} unoptimized={true} />}
          </div>
          <h1 className="text-slate-200 text-3xl text-left font-medium text-white">{evt.title}</h1>
        </div>
        <div className="mt-3 flex items-center space-x-3.5">
          {btmCnt}
        </div>
      </div>
    );
  };

  let content;
  if (fthSts === 2) { // show error
    content = (
      <h1 className="text-slate-200 text-3xl text-left font-medium text-red-500">Network or Server Error</h1>
    );
  } else if (fthSts === 1) {
    if (isFldStr(evt.title)) { // show content
      content = renderContent();
    } else { // not found
      content = (
        <h1 className="text-slate-200 text-3xl text-left font-medium text-red-500">Not found</h1>
      );
    }
  } else { // show loading
    content = (
      <div className="h-8 w-2/3 bg-slate-700 rounded animate-pulse" />
    );
  }

  return content;
}
