'use client';
import Image from 'next/image';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor, trade } from '@/actions/tx';
import { getTrdEdtrEvt } from '@/selectors';
import { isObject, isFldStr } from '@/utils';

export function TradeEditor() {
  const type = useSelector(state => state.tradeEditor.type);
  const ocId = useSelector(state => state.tradeEditor.ocId);
  const costStr = useSelector(state => state.tradeEditor.costStr);
  const evt = useSelector(state => getTrdEdtrEvt(state));
  const dispatch = useDispatch();

  const onCloseBtnClick = () => {
    dispatch(updateTradeEditor({ evtId: null }));
  };

  const onOkBtnClick = () => {
    dispatch(trade());
  };

  const onInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      dispatch(updateTradeEditor({ costStr: value }));
    }
  };

  const onIncreaseBtnClick = (delta) => {
    const value = /^\d+$/.test(costStr) ? parseInt(costStr, 10) : 0;
    dispatch(updateTradeEditor({ costStr: `${value + delta}` }));
  };

  // check event status

  // check event state/condition

  // show unavailable button

  if (!isObject(evt)) return null;

  const rangeStyle = { backgroundSize: `${costStr}% 100%` };

  const okBtnCls = ocId === 0 ? 'bg-green-400' : 'bg-red-400';
  const okBtnTxt = ocId === 0 ? 'Buy Yes' : 'Buy No';

  const value = /^\d+$/.test(costStr) ? parseInt(costStr, 10) : 0;
  const amount = Math.floor(value / evt.shareCosts[ocId]);
  const okBtnWin = amount;

  return (
    <div className="max-w-md overflow-hidden rounded-lg border border-slate-700 bg-slate-800 sm:max-w-none">
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
          <input className="grow shrink w-full text-base text-slate-100 focus:outline-none" onChange={onInputChange} type="text" inputMode="numeric" pattern="\d*" value={costStr} />
          <button className="grow-0 shrink-0 bg-slate-600 rounded px-1 py-0.5 hover:brightness-110" onClick={() => onIncreaseBtnClick(1)}>
            <span className="text-sm text-slate-300">+1</span>
          </button>
          <button className="grow-0 shrink-0 ml-1 bg-slate-600 rounded px-1 py-0.5 hover:brightness-110" onClick={() => onIncreaseBtnClick(10)}>
            <span className="text-sm text-slate-300">+10</span>
          </button>
        </div>
        <div className="w-2/5 flex items-center justify-center">
          <input style={rangeStyle} className="w-full appearance-none rounded-full h-2 cursor-ew-resize accent-blue-500 bg-slate-500 bg-gradient-to-r from-blue-400 to-blue-400 bg-no-repeat" onChange={onInputChange} type="range" min="1" max="100" value={costStr} step="1" />
        </div>
      </div>
      <div className="mt-4 px-5 pb-4">
        <button onClick={onOkBtnClick} className={clsx('w-full rounded flex flex-col items-center justify-center py-2 rounded-full hover:brightness-110', okBtnCls)}>
          <div className="text-base text-white font-semibold">{okBtnTxt}</div>
          <div className="text-sm text-green-100 font-normal">To win ₳{okBtnWin}</div>
        </button>
      </div>
    </div>
  );
}
