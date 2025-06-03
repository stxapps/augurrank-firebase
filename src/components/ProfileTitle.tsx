'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { UserIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import { fetchProfile } from '@/actions/profile';
import { getProfileWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function ProfileTitle() {
  const params = useParams<{ stxAddr: string }>();
  const stxAddr = params.stxAddr;

  const meStxAddr = useSelector(state => state.me.stxAddr);
  const profile = useSelector(state => getProfileWthSts(state, stxAddr));
  const dispatch = useDispatch();

  const onRetryBtnClick = () => {

  };

  const { fthSts, username, avtThbnl, bio } = profile;

  useEffect(() => {
    dispatch(fetchProfile(stxAddr));
  }, [stxAddr, meStxAddr, dispatch]);

  const renderContent = () => {
    let avatarPane, stxAddrPane, bioPane;

    let addrUrl = `https://explorer.hiro.so/address/${stxAddr}`;
    const networkName = process.env.NEXT_PUBLIC_STACKS_NETWORK;
    if (networkName === 'testnet') {
      addrUrl += '?chain=testnet';
    }

    if (isFldStr(avtThbnl)) {
      avatarPane = (
        <Image className="size-32 rounded-full" width={128} height={128} src={avtThbnl} alt="User avatar" unoptimized={true} placeholder="empty" priority={true} />
      );
    } else {
      avatarPane = (
        <UserIcon className="size-32 text-slate-700" />
      );
    }
    const usernamePane = (
      <Link href={addrUrl} target="_blank" rel="noreferrer">
        <h1 className="truncate text-center text-4xl font-medium text-slate-100 sm:text-left sm:text-5xl sm:leading-tight">{isFldStr(username) ? username : 'Username'}</h1>
      </Link>
    );
    if (isFldStr(bio)) {
      bioPane = (
        <p className="mt-3 max-h-72 overflow-hidden whitespace-pre-wrap text-center text-base text-slate-400 sm:mt-1.5 sm:text-left">{bio}</p>
      );
    } else {
      stxAddrPane = (
        <div className="mt-3 flex sm:mt-0.5">
          <p className="w-0 grow truncate text-center text-base text-slate-400 sm:text-left">{stxAddr}</p>
        </div>
      );
    }

    return (
      <div className={clsx('flex flex-col items-center justify-start sm:flex-row sm:justify-center', isFldStr(bio) ? 'sm:items-start' : 'sm:items-center')}>
        <div className="rounded-full border-2 border-slate-800 p-2">{avatarPane}</div>
        <div className="mt-6 w-full max-w-md sm:ml-6 sm:mt-0 sm:w-auto sm:min-w-52">
          {usernamePane}
          {stxAddrPane}
          {bioPane}
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    const avatarPane = (
      <div className="size-32 rounded-full bg-slate-800 animate-pulse" />
    );
    const usernamePane = (
      <div className="flex items-center justify-center sm:justify-start">
        <div className="h-10 w-64 rounded bg-slate-800 animate-pulse" />
      </div>
    );
    const stxAddrPane = (
      <div className="flex items-center justify-center sm:justify-start">
        <div className="mt-4 h-6 w-40 rounded bg-slate-800 animate-pulse" />
      </div>
    );

    return (
      <div className={clsx('flex flex-col items-center justify-start sm:flex-row sm:justify-center', isFldStr(bio) ? 'sm:items-start' : 'sm:items-center')}>
        <div className="rounded-full border-2 border-slate-800 p-2">{avatarPane}</div>
        <div className="mt-6 w-full max-w-md sm:ml-6 sm:mt-0 sm:w-auto sm:min-w-52">
          {usernamePane}
          {stxAddrPane}
        </div>
      </div>
    );
  };

  let content;
  if (fthSts === 2) { // show error
    content = (
      <div className="border-2 border-transparent py-1 sm:py-2">
        <div className="flex h-60 flex-col items-center justify-center sm:h-32">
          <p className="text-center text-lg text-red-600">Something went wrong! Please wait and try again.</p>
          <button onClick={onRetryBtnClick} className="mt-3 rounded-full bg-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:brightness-110">Retry</button>
        </div>
      </div>
    );
  } else if (fthSts === 1) {
    content = renderContent();
  } else { // show loading
    content = renderLoading();
  }

  return content;
}
