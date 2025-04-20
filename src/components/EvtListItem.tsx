'use client';
import Image from 'next/image';
import {
  ChevronDoubleDownIcon, ChevronDoubleUpIcon,
} from '@heroicons/react/24/solid';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor } from '@/actions/tx';
import { TradeEditor } from '@/components/TradeEditor';
import { doShowTradeEditor } from '@/selectors';

export function EvtListItemLdg() {
  return (
    <div className="max-w-md p-6 aanimate-pulsee rounded-lg bg-slate-800">
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

  if (doShowTrdEdtr) return <Edt />
  return <Cnt evt={evt} />
}

function Cnt(props) {
  const { evt } = props;

  const dispatch = useDispatch();

  const onYesBtnClick = () => {
    dispatch(updateTradeEditor({ evtId: evt.id, type: 'buy', ocId: 0 }));
  };

  const onNoBtnClick = () => {
    dispatch(updateTradeEditor({ evtId: evt.id, type: 'buy', ocId: 1 }));
  };

  return (
    <div className="max-w-md overflow-hidden rounded-lg border border-slate-700 bg-slate-800 sm:max-w-none">
      <div className="flex space-x-3.5 px-5 pt-5">
        <div className="shrink-0 size-10 rounded bg-slate-700">
          {/*<Image className="size-10" src="#" alt="" />*/}
        </div>
        <h4 className="grow text-base font-semibold text-slate-200">{evt.title}</h4>
        <div className="shrink-0 relative h-14 w-12 flex flex-col items-center justify-end overflow-hidden">
          <div className="absolute top-0 aspect-2/1 w-full overflow-hidden flex justify-center items-center rounded-t-full bg-green-400">
            <div className="absolute top-0 aspect-square w-full rotate-[calc(92deg)] bg-gradient-to-t from-transparent from-50% to-slate-500 to-50%" />
            <div className="absolute top-1/5 aspect-square w-4/5 rounded-full bg-slate-800" />
          </div>
          <p className="relative text-sm font-semibold text-slate-300">51%</p>
          <p className="relative text-sm text-slate-400">chance</p>
        </div>
      </div>
      <div className="mt-5 px-5 flex space-x-3">
        <button onClick={onYesBtnClick} className="w-full bg-green-200 rounded flex items-center justify-center py-2 rounded-full">
          <span className="text-sm text-gree-700 font-medium">Buy Yes</span>
          <ChevronDoubleUpIcon className="ml-1 mb-0.5 size-3 text-gree-700" />
        </button>
        <button onClick={onNoBtnClick} className="w-full bg-red-200 rounded flex items-center justify-center py-2 rounded-full">
          <span className="text-sm text-red-700 font-medium">Buy No</span>
          <ChevronDoubleDownIcon className="ml-1 size-3 text-red-700" />
        </button>
      </div>
      <p className="px-5 pb-3 text-sm text-slate-400 mt-3">₳1m Vol.</p>
    </div>
  );
}

function Edt() {
  return <TradeEditor />;
}
