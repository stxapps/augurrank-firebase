'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/react/24/solid';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor } from '@/actions/tx';
import { TradeEditor } from '@/components/TradeEditor';
import {
  EVT_INIT, EVT_CLOSED, EVT_RESOLVED, EVT_PAUSED, EVT_DISPUTED, EVT_CANCELED, TX_BUY,
} from '@/types/const';
import { doShowTradeEditor } from '@/selectors';
import { isFldStr } from '@/utils';

export function EvtListItemLdg() {
  return (
    <div className="max-w-xs p-6 animate-pulse rounded-lg bg-slate-800 sm:max-w-none">
      <div className="flex space-x-3.5">
        <div className="size-10 rounded bg-slate-700"></div>
        <div className="h-4 grow rounded bg-slate-700"></div>
        <div className="relative h-8.5 w-12 flex flex-col items-center justify-end">
          <div className="absolute top-0 inset-x-0 h-6.5 rounded-t-full overflow-hidden bg-slate-700 flex justify-center">
            <div className="absolute top-1/4 aspect-square w-3/4 rounded-full bg-slate-800"></div>
          </div>
          <div className="relative h-4 w-5 rounded bg-slate-700"></div>
        </div>
      </div>
      <div className="mt-6 flex space-x-3">
        <div className="h-8.5 w-full rounded bg-slate-700"></div>
        <div className="h-8.5 w-full rounded bg-slate-700"></div>
      </div>
    </div>
  );
}

export function EvtListItem(props) {
  const { evt } = props;
  const doShowTrdEdtr = useSelector(state => doShowTradeEditor(state, evt.id));

  if (doShowTrdEdtr) return <Edt />;
  return <Cnt evt={evt} />;
}

function Cnt(props) {
  const { evt } = props;
  const dispatch = useDispatch();

  const onTradeBtnClick = (ocId) => {
    dispatch(updateTradeEditor({ evtId: evt.id, type: TX_BUY, ocId, value: '10' }));
  };

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
    if (isFldStr(evt.fmtdVol)) {
      btmCnt = <p className="text-sm text-slate-400">₳{evt.fmtdVol} Vol.</p>;
    } else {
      btmCnt = (
        <p className="inline-block bg-yellow-900 rounded text-xs font-medium text-yellow-500 px-1 py-0.5">New</p>
      );
    }
  }

  return (
    <div className="max-w-xs overflow-hidden rounded-lg border border-slate-700 bg-slate-800 sm:max-w-none">
      <div className="flex space-x-3.5 px-5 pt-5">
        <div className="relative shrink-0 size-10 rounded bg-slate-700 overflow-hidden">
          {isFldStr(evt.img) && <Image className="object-cover" src={evt.img} alt="" fill={true} unoptimized={true} />}
        </div>
        <Link className="grow group" href={`/event/${evt.slug}`} prefetch={false}>
          <h4 className="text-base font-semibold text-slate-200 group-hover:underline">{evt.title}</h4>
        </Link>
        <div className="shrink-0 relative h-14 w-12 flex flex-col items-center justify-end overflow-hidden">
          <div className="absolute top-0 aspect-2/1 w-full overflow-hidden flex justify-center items-center rounded-t-full bg-green-400">
            <div style={{ rotate: `${evt.oc0Rot}deg` }} className="absolute top-0 aspect-square w-full bg-gradient-to-t from-transparent from-50% to-slate-500 to-50%" />
            <div className="absolute top-1/5 aspect-square w-4/5 rounded-full bg-slate-800" />
          </div>
          <p className="relative text-sm font-semibold text-slate-300">{evt.oc0Chance}%</p>
          <p className="relative text-sm text-slate-400">chance</p>
        </div>
      </div>
      <div className="mt-4.5 px-5 flex space-x-3">
        <button onClick={() => onTradeBtnClick(0)} className="w-full bg-green-200 rounded flex items-center justify-center py-2 rounded-full hover:brightness-110">
          <span className="text-sm text-gree-700 font-medium">Buy Yes</span>
          <ChevronDoubleUpIcon className="ml-1 mb-0.5 size-3 text-gree-700" />
        </button>
        <button onClick={() => onTradeBtnClick(1)} className="w-full bg-red-200 rounded flex items-center justify-center py-2 rounded-full hover:brightness-110">
          <span className="text-sm text-red-700 font-medium">Buy No</span>
          <ChevronDoubleDownIcon className="ml-1 size-3 text-red-700" />
        </button>
      </div>
      <div className="px-5 pb-3 mt-3">
        {btmCnt}
      </div>
    </div>
  );
}

function Edt() {
  return <TradeEditor />;
}
