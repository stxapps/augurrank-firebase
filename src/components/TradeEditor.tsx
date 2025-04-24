'use client';
import Image from 'next/image';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor, trade } from '@/actions/tx';
import {
  EVT_INIT, EVT_OPENED, EVT_CLOSED, EVT_RESOLVED, EVT_PAUSED, EVT_DISPUTED,
  EVT_CANCELED, ERR_INVALID_ARGS, ERR_BALANCE_TOO_LOW, ERR_SHARES_TOO_LOW,
} from '@/types/const';
import { getTrdEdtrEvt } from '@/selectors';
import { isObject, isFldStr } from '@/utils';

const getMsgCnt = (msg) => {
  if (!isFldStr(msg)) return '';

  if (msg === ERR_INVALID_ARGS) {
    return 'Please fill in a positive whole number.';
  }
  if (msg === ERR_BALANCE_TOO_LOW) {
    return 'Your balance is too low. Please lower your spending.';
  }
  if (msg === ERR_SHARES_TOO_LOW) {
    return 'Not enough shares. Please lower your selling.';
  }
  return 'Unknown error. Please refresh the page.';
};

export function TradeEditor() {
  const type = useSelector(state => state.tradeEditor.type);
  const ocId = useSelector(state => state.tradeEditor.ocId);
  const value = useSelector(state => state.tradeEditor.value);
  const msg = useSelector(state => state.tradeEditor.msg);
  const doLoad = useSelector(state => state.tradeEditor.doLoad);
  const evt = useSelector(state => getTrdEdtrEvt(state));
  const dispatch = useDispatch();

  const prsdValue = /^\d+$/.test(value) ? parseInt(value, 10) : 0;

  const onCloseBtnClick = () => {
    dispatch(updateTradeEditor({ evtId: null }));
  };

  const onOkBtnClick = () => {
    dispatch(trade());
  };

  const onInputChange = (e) => {
    const tValue = e.target.value;
    if (tValue === '' || /^\d+$/.test(tValue)) {
      dispatch(updateTradeEditor({ value: tValue, msg: '' }));
    }
  };

  const onIncreaseBtnClick = (delta) => {
    dispatch(updateTradeEditor({ value: `${prsdValue + delta}`, msg: '' }));
  };

  if (!isObject(evt)) return null;

  const rangeStyle = { backgroundSize: `${prsdValue}% 100%` };
  const msgCnt = getMsgCnt(msg);

  let btn;
  if (evt.status === EVT_OPENED) {
    const cls = ocId === 0 ? 'bg-green-400' : 'bg-red-400';
    const txt = ocId === 0 ? 'Buy Yes' : 'Buy No';
    const amt = Math.floor(prsdValue / evt.shareCosts[ocId]);

    btn = (
      <button onClick={onOkBtnClick} className={clsx('w-full flex flex-col items-center justify-center py-2 rounded-full hover:brightness-110', cls)}>
        <div className="text-base text-white font-semibold">{txt}</div>
        <div className="text-sm text-green-100 font-normal">To win ₳{amt}</div>
      </button>
    );
  } else {
    let txt = 'Unavailable';
    if (evt.status === EVT_INIT) txt = 'Opening soon';
    else if (evt.status === EVT_CLOSED) txt = 'Closed';
    else if (evt.status === EVT_RESOLVED) txt = 'Resolved';
    else if (evt.status === EVT_PAUSED) txt = 'Paused';
    else if (evt.status === EVT_DISPUTED) txt = 'Disputed';
    else if (evt.status === EVT_CANCELED) txt = 'Canceled';

    btn = (
      <div className="w-full rounded-full flex items-center justify-center py-2 bg-slate-600">
        <p className="text-base text-slate-300 font-medium">{txt}</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-md overflow-hidden rounded-lg border border-slate-700 bg-slate-800 sm:max-w-none">
      <div className="relative flex items-center space-x-3.5 px-5 pt-4">
        <div className="relative shrink-0 size-8 rounded bg-slate-700 overflow-hidden">
          {isFldStr(evt.img) && <Image className="object-cover" src={evt.img} alt="" fill={true} unoptimized={true} />}
        </div>
        <h4 className="grow text-sm font-semibold text-slate-200 truncate mr-4">{evt.title}</h4>
        <button onClick={onCloseBtnClick} className="group absolute right-0 top-0 rounded-md p-2" type="button">
          <span className="sr-only">Dismiss</span>
          <svg className="size-5 text-slate-400 group-hover:text-slate-300" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
      <div className="mt-4 px-5 flex space-x-3">
        <div className="flex justify-start items-center border border-slate-600 rounded-md pl-2 pr-1 py-1 w-3/5">
          <span className="grow-0 shrink-0 text-slate-100">₳</span>
          <input className="grow shrink w-full text-base text-slate-100 focus:outline-none" onChange={onInputChange} type="text" inputMode="numeric" pattern="\d*" value={value} />
          <button className="grow-0 shrink-0 bg-slate-600 rounded px-1 py-0.5 hover:brightness-110" onClick={() => onIncreaseBtnClick(1)}>
            <span className="text-sm text-slate-300">+1</span>
          </button>
          <button className="grow-0 shrink-0 ml-1 bg-slate-600 rounded px-1 py-0.5 hover:brightness-110" onClick={() => onIncreaseBtnClick(10)}>
            <span className="text-sm text-slate-300">+10</span>
          </button>
        </div>
        <div className="w-2/5 flex items-center justify-center">
          <input style={rangeStyle} className="w-full appearance-none rounded-full h-2 cursor-ew-resize accent-blue-500 bg-slate-500 bg-gradient-to-r from-blue-400 to-blue-400 bg-no-repeat" onChange={onInputChange} type="range" min="1" max="100" value={value} step="1" />
        </div>
      </div>
      <div className={clsx('px-5 pb-4', msgCnt.length === 0 && 'mt-4')}>
        {msgCnt.length > 0 && <p className="py-2 text-sm text-red-500">{msgCnt}</p>}
        {btn}
      </div>
      {doLoad && <>
        <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="ball-clip-rotate-blk">
            <div />
          </div>
        </div>
      </>}
    </div>
  );
}
