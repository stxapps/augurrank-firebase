'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserIcon, ExclamationCircleIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';

import { useSelector, useDispatch } from '@/store';
import { chooseWallet, updatePopup } from '@/actions';
import { TOP_BAR_MENU_POPUP, SCALE } from '@/types/const';
import Logo from '@/images/logo.svg';
import { getMeAvtWthObj } from '@/selectors';
import { isNumber, isFldStr, getSignInStatus, getAvtThbnl } from '@/utils';

export function TopBar() {
  const signInStatus = useSelector(state => getSignInStatus(state.me));
  const fthSts = useSelector(state => state.me.fthSts);
  const avtWthObj = useSelector(state => getMeAvtWthObj(state));
  const balance = useSelector(state => state.me.balance);
  const dispatch = useDispatch();

  const avtThbnl = getAvtThbnl(avtWthObj.obj);

  const onCwBtnClick = () => {
    dispatch(chooseWallet());
  };

  const onAvtBtnClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(updatePopup(TOP_BAR_MENU_POPUP, true, rect));
  };

  const leftPane = (
    <div className="relative flex shrink-0 grow items-center">
      <Link className="group flex items-center justify-center p-0.5 text-slate-100 hover:brightness-110 focus:outline-none" href="/">
        <div className="flex items-center justify-center rounded-full p-0.5 group-focus-visible:outline group-focus-visible:outline-1">
          <Image className="h-8 w-auto" width={32} height={32} src={Logo} alt="" placeholder="empty" priority={true} />
        </div>
      </Link>
    </div>
  );

  let rightCnt = null;
  if (signInStatus === 1) {
    rightCnt = (
      <button onClick={onCwBtnClick} className="rounded-full bg-orange-400 px-4 py-1.5 text-sm font-medium text-white hover:brightness-110">
        Connect Wallet
      </button>
    );
  } else if ([2, 3].includes(signInStatus)) {
    let blnCnt = null;
    if (signInStatus === 3) {
      if (fthSts === 1) { // show content
        if (isNumber(balance)) {
          blnCnt = (
            <div className="text-slate-300 text-md">₳{formatBalance(balance)}</div>
          );
        } else {
          blnCnt = (
            <div className="w-8 h-6 bg-slate-700 rounded animate-pulse" />
          );
        }
      } else if (fthSts === 2) { // show error
        blnCnt = (
          <ExclamationCircleIcon className="size-7.5 text-red-400" />
        );
      } else { // show loading
        blnCnt = (
          <ArrowDownTrayIcon className="size-6.5 text-slate-500 animate-pulse" />
        );
      }
    }

    let avtBtnCnt = (
      <UserIcon className="size-6 text-slate-700" />
    );
    if (isFldStr(avtThbnl)) {
      avtBtnCnt = (
        <Image className="size-10 rounded-full" width={128} height={128} src={avtThbnl} alt="User avatar" unoptimized={true} placeholder="empty" priority={true} />
      );
    }
    const avtCnt = (
      <button onClick={onAvtBtnClick} className="rounded-full border border-slate-400 p-1 hover:border-orange-300 hover:text-orange-200">
        {avtBtnCnt}
      </button>
    );

    rightCnt = (
      <>
        {blnCnt}
        {avtCnt}
      </>
    );
  }
  const rightPane = (
    <div className="relative flex shrink-0 grow items-center justify-end space-x-5">
      {rightCnt}
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl flex-none px-4 sm:px-6 lg:px-8 xl:px-12">
      <nav className="flex h-[3.75rem] items-center justify-between">
        {leftPane}
        {rightPane}
      </nav>
    </div>
  );
}

const formatBalance = (balance) => {
  let fmtdBal = '';
  if (isNumber(balance)) {
    const bal = balance / SCALE;
    if (bal >= 1000000) fmtdBal = Math.floor(bal / 1000000) + 'm';
    else if (bal >= 10000) fmtdBal = Math.floor(bal / 1000) + 'k';
    else fmtdBal = Math.floor(bal) + '';
  }
  return fmtdBal;
};
