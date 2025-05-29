'use client';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor, trade } from '@/actions/tx';
import {
  EVENTS, EVENT, EVT_INIT, EVT_OPENED, EVT_CLOSED, EVT_RESOLVED, EVT_PAUSED,
  EVT_DISPUTED, EVT_CANCELED, TX_BUY, TX_SELL, ERR_INVALID_ARGS, ERR_BALANCE_NOT_FOUND,
  ERR_BALANCE_TOO_LOW, ERR_SHARES_TOO_LOW, SCALE,
} from '@/types/const';
import { getTrdEdtrEvt } from '@/selectors';
import { isObject, isFldStr } from '@/utils';

const getMsgCnt = (msg) => {
  if (!isFldStr(msg)) return '';

  if (msg === ERR_INVALID_ARGS) {
    return 'Please fill in a positive whole number.';
  }
  if (msg === ERR_BALANCE_NOT_FOUND) {
    return 'Your bag is empty, but your ₳1,000 is on the way. Please wait!';
  }
  if (msg === ERR_BALANCE_TOO_LOW) {
    return 'Your balance is too low. Please add more or spend less.';
  }
  if (msg === ERR_SHARES_TOO_LOW) {
    return 'Not enough shares. Please lower your selling.';
  }
  return 'Unknown error. Please refresh the page.';
};

export function TradeEditor() {
  const page = useSelector(state => state.tradeEditor.page);
  const type = useSelector(state => state.tradeEditor.type);
  const ocId = useSelector(state => state.tradeEditor.ocId);
  const value = useSelector(state => state.tradeEditor.value);
  const shdwValue = useSelector(state => state.tradeEditor.shdwValue);
  const msg = useSelector(state => state.tradeEditor.msg);
  const doLoad = useSelector(state => state.tradeEditor.doLoad);
  const evt = useSelector(state => getTrdEdtrEvt(state));
  const [trltX, setTrltX] = useState(144);
  const hSpnRef = useRef(null);
  const dispatch = useDispatch();

  const valueRef = useRef(value);
  const trltXRef = useRef(trltX);

  const prsdValue = /^\d+$/.test(value) ? parseInt(value, 10) : 0;

  const onCloseBtnClick = () => {
    dispatch(updateTradeEditor({ evtId: null }));
  };

  const onOkBtnClick = () => {
    dispatch(trade());
  };

  const onInputChange = (e) => {
    let tValue = e.target.value;
    tValue = tValue.replace(/^(0+)(?=[1-9])|^(0+)(?=0$)/, '');

    if (tValue === '' || /^\d+$/.test(tValue)) {
      if (page === EVENT && type === TX_BUY) {
        dispatch(updateTradeEditor({ shdwValue: tValue }));
      } else {
        dispatch(updateTradeEditor({ value: tValue, msg: '' }));
      }
    }
  };

  const onIncreaseBtnClick = (delta) => {
    const tValue = `${prsdValue + delta}`;
    if (page === EVENT && type === TX_BUY) {
      dispatch(updateTradeEditor({ shdwValue: tValue }));
    } else {
      dispatch(updateTradeEditor({ value: tValue, msg: '' }));
    }
  };

  const onOcBtnClick = (ocId) => {
    dispatch(updateTradeEditor({ ocId, value: '', msg: '' }));
  };

  const onTypeBtnClick = (type) => {
    dispatch(updateTradeEditor({ type, value: '', msg: '' }));
  };

  useEffect(() => {
    valueRef.current = value;
    trltXRef.current = trltX;
  }, [value, trltX]);

  useEffect(() => {
    if (hSpnRef.current) {
      const newTrltX = hSpnRef.current.clientWidth + 1;
      if (newTrltX !== trltXRef.current) setTrltX(newTrltX);
    }
    if (shdwValue !== valueRef.current) {
      dispatch(updateTradeEditor({ value: shdwValue, msg: '' }));
    }
  }, [shdwValue, setTrltX, dispatch]);

  if (!isObject(evt)) return null;

  const msgCnt = getMsgCnt(msg);

  let btn;
  if (evt.status === EVT_OPENED) {
    let cls = 'bg-blue-400';
    if (page === EVENTS) cls = ocId === 0 ? 'bg-green-400' : 'bg-red-400';

    let txt = type === TX_BUY ? 'Buy' : type === TX_SELL ? 'Sell' : 'Trade';
    txt += ' ' + evt.outcomes[ocId].desc;

    let amt = Math.floor(prsdValue * SCALE / evt.costs[ocId]);
    if (type === TX_SELL) {
      amt = Math.round(prsdValue * evt.costs[ocId] / SCALE * 100) / 100;
    }

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

  const renderMini = () => {
    const rangeStyle = { backgroundSize: `${prsdValue}% 100%` };

    return (
      <div className="relative max-w-xs overflow-hidden rounded-lg border border-slate-700 bg-slate-800 sm:max-w-none">
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
  };

  const renderFull = () => {
    const cent0 = Math.round(evt.costs[0] / SCALE * 100) + '¢';
    const cent1 = Math.round(evt.costs[1] / SCALE * 100) + '¢';

    const aSpanStyle = { transform: `translateX(-${trltX}px)` };

    return (
      <div className="relative max-w-xs overflow-hidden rounded-lg border border-slate-700 bg-slate-800 sm:max-w-none">
        <div className="relative flex items-center border-b border-slate-700 pt-2">
          <button className={clsx('relative px-4 py-2')} onClick={() => onTypeBtnClick(TX_BUY)}>
            <span className={clsx(type === TX_BUY ? 'text-slate-200 font-medium' : 'text-slate-500')}>Buy</span>
            <div className={clsx(type === TX_BUY ? 'absolute inset-x-0 bottom-0 h-px w-full px-3' : 'hidden')}>
              <div className="h-full w-full bg-slate-300" />
            </div>
          </button>
          <button className={clsx('relative px-4 py-2')} onClick={() => onTypeBtnClick(TX_SELL)}>
            <span className={clsx(type === TX_SELL ? 'text-slate-200 font-medium' : 'text-slate-500')}>Sell</span>
            <div className={clsx(type === TX_SELL ? 'absolute inset-x-0 bottom-0 h-px w-full px-3' : 'hidden')}>
              <div className="h-full w-full bg-slate-300" />
            </div>
          </button>
        </div>
        <div className="pt-4.5 px-5 flex space-x-3">
          <button onClick={() => onOcBtnClick(evt.outcomes[0].id)} className={clsx('w-full rounded flex items-center justify-center py-2 rounded-full hover:brightness-110', ocId === 0 ? 'bg-green-400' : 'bg-slate-600')}>
            <span className={clsx('text-sm font-medium', ocId === 0 ? 'text-slate-200' : 'text-slate-300')}>{evt.outcomes[0].desc}</span>&nbsp;<span className={clsx('text-sm font-medium', ocId === 0 ? 'text-slate-100' : 'text-slate-300')}>{cent0}</span>
          </button>
          <button onClick={() => onOcBtnClick(evt.outcomes[1].id)} className={clsx('w-full rounded flex items-center justify-center py-2 rounded-full hover:brightness-110', ocId === 1 ? 'bg-red-400' : 'bg-slate-600')}>
            <span className={clsx('text-sm font-medium', ocId === 1 ? 'text-slate-200' : 'text-slate-300')}>{evt.outcomes[1].desc}</span>&nbsp;<span className={clsx('text-sm font-medium', ocId === 1 ? 'text-slate-100' : 'text-slate-300')}>{cent1}</span>
          </button>
        </div>
        <div className="mt-5 px-5 flex space-x-3">
          <p className="text-sm text-slate-200 font-medium">{type === TX_SELL ? 'Share' : 'Amount'}</p>
          <div className="relative overflow-hidden">
            {(type === TX_BUY && prsdValue > 0) && <span style={aSpanStyle} className="absolute top-0 right-0 text-4xl text-slate-100">₳</span>}
            <input className="grow shrink w-full text-4xl text-slate-100 focus:outline-none text-right" onChange={onInputChange} type="text" inputMode="numeric" pattern="\d*" value={value} placeholder={type === TX_BUY ? '₳0' : '0'} />
            <span ref={hSpnRef} className="absolute top-full left-full text-4xl">{shdwValue}</span>
          </div>
        </div>
        <div className="mt-3 px-5 flex justify-end">
          <button className="grow-0 shrink-0 bg-slate-600 rounded px-1 py-0.5 hover:brightness-110" onClick={() => onIncreaseBtnClick(1)}>
            <span className="text-sm text-slate-300">+1</span>
          </button>
          <button className="grow-0 shrink-0 ml-1 bg-slate-600 rounded px-1 py-0.5 hover:brightness-110" onClick={() => onIncreaseBtnClick(10)}>
            <span className="text-sm text-slate-300">+10</span>
          </button>
        </div>
        <div className={clsx('px-5 pb-4', msgCnt.length === 0 && 'mt-5')}>
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
  };

  if (page === EVENTS) return renderMini();
  if (page === EVENT) return renderFull();
  return null;
}
