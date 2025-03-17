'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { useSelector, useDispatch } from '@/store';
import { chooseWallet, signOut } from '@/actions';
import Logo from '@/images/logo.svg';
import { getSignInStatus } from '@/utils';

export function TopBar() {
  const signInStatus = useSelector(state => getSignInStatus(state.me));
  const pathname = usePathname();
  const dispatch = useDispatch();

  const onCwBtnClick = () => {
    dispatch(chooseWallet());
  };

  const onSignOutBtnClick = () => {
    dispatch(signOut());
  };

  let leftItem;
  if (pathname === '/') {
    leftItem = null;
  } else {
    leftItem = (
      <Link className="group flex items-center justify-center p-0.5 text-slate-100 hover:brightness-110 focus:outline-none" href="/">
        <div className="flex items-center justify-center rounded-full p-0.5 group-focus-visible:outline group-focus-visible:outline-1">
          <Image className="h-8 w-auto" width={32} height={32} src={Logo} alt="" placeholder="empty" priority={true} />
        </div>
      </Link>
    );
  }
  const leftPane = (
    <div className="relative flex shrink-0 grow items-center">
      {leftItem}
    </div>
  );

  const rightPane = (
    <div className="relative flex shrink-0 grow items-center justify-end space-x-5">
      {([2, 3].includes(signInStatus) && pathname !== '/profile') && <Link className="group px-0.5 py-1.5 text-lg font-medium text-slate-100 hover:text-orange-200 focus:outline-none" href="/profile" prefetch={false}>
        <div className="rounded-full px-2 py-0.5 group-focus-visible:outline group-focus-visible:outline-1">Profile</div>
      </Link>}
      {signInStatus === 1 && <button onClick={onCwBtnClick} className="rounded-full bg-orange-400 px-4 py-1.5 text-sm font-medium text-white hover:brightness-110">
        Connect Wallet
      </button>}
      {[2, 3].includes(signInStatus) && <button onClick={onSignOutBtnClick} className="rounded-full border border-slate-400 px-2.5 py-1.5 text-sm font-medium text-slate-100 hover:border-orange-300 hover:text-orange-200">
        Sign Out
      </button>}
    </div>
  );

  const doShowLeftPane = pathname !== '/';
  const doShowRightPane = signInStatus !== 0;

  return (
    <div className="relative mx-auto w-full max-w-6xl flex-none px-4 sm:px-6 lg:px-8 xl:px-12">
      <nav className="flex h-[3.75rem] items-center justify-between">
        {doShowLeftPane && leftPane}
        {doShowRightPane && rightPane}
      </nav>
    </div>
  );
}
