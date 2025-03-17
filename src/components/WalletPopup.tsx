'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  InformationCircleIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import { updateWalletPopup, connectWallet } from '@/actions';
import { dialogBgFMV, dialogFMV } from '@/types/animConfigs';
import { extractUrl } from '@/utils';

import { useSafeAreaFrame } from '.';

const infos = [
  {
    id: 'LeatherProvider',
    name: 'Leather',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iMjYuODM4NyIgZmlsbD0iIzEyMTAwRiIvPgo8cGF0aCBkPSJNNzQuOTE3MSA1Mi43MTE0QzgyLjQ3NjYgNTEuNTQwOCA5My40MDg3IDQzLjU4MDQgOTMuNDA4NyAzNy4zNzYxQzkzLjQwODcgMzUuNTAzMSA5MS44OTY4IDM0LjIxNTQgODkuNjg3MSAzNC4yMTU0Qzg1LjUwMDQgMzQuMjE1NCA3OC40MDYxIDQwLjUzNjggNzQuOTE3MSA1Mi43MTE0Wk0zOS45MTEgODMuNDk5MUMzMC4wMjU2IDgzLjQ5OTEgMjkuMjExNSA5My4zMzI0IDM5LjA5NjkgOTMuMzMyNEM0My41MTYzIDkzLjMzMjQgNDguODY2MSA5MS41NzY0IDUxLjY1NzMgODguNDE1N0M0Ny41ODY4IDg0LjkwMzggNDQuMjE0MSA4My40OTkxIDM5LjkxMSA4My40OTkxWk0xMDIuODI5IDc5LjI4NDhDMTAzLjQxIDk1Ljc5MDcgOTUuMDM2OSAxMDUuMDM5IDgwLjg0ODQgMTA1LjAzOUM3Mi40NzQ4IDEwNS4wMzkgNjguMjg4MSAxMDEuODc4IDU5LjMzMyA5Ni4wMjQ5QzU0LjY4MSAxMDEuMTc2IDQ1Ljg0MjMgMTA1LjAzOSAzOC41MTU0IDEwNS4wMzlDMTMuMjc4NSAxMDUuMDM5IDE0LjMyNTIgNzIuODQ2MyA0MC4wMjczIDcyLjg0NjNDNDUuMzc3MSA3Mi44NDYzIDQ5LjkxMjggNzQuMjUxMSA1NS43Mjc3IDc3Ljg4TDU5LjU2NTYgNjQuNDE3N0M0My43NDg5IDYwLjA4NjQgMzUuODQwNSA0Ny45MTE4IDQzLjYzMjYgMzAuNDY5M0g1Ni4xOTI5QzQ5LjIxNSA0Mi4wNTg2IDUzLjk4MzIgNTEuNjU3OCA2Mi44MjIgNTIuNzExNEM2Ny41OTAzIDM1LjczNzIgNzcuODI0NiAyMi41MDkgOTEuNDMxNiAyMi41MDlDOTkuMTA3NCAyMi41MDkgMTA1LjE1NSAyNy41NDI4IDEwNS4xNTUgMzYuNjczN0MxMDUuMTU1IDUxLjMwNjYgODYuMDgxOSA2My4yNDcxIDcxLjY2MDcgNjQuNDE3N0w2NS43Mjk1IDg1LjM3MjFDNzIuNDc0OCA5My4yMTUzIDkxLjE5OSAxMDAuODI0IDkxLjE5OSA3OS4yODQ4SDEwMi44MjlaIiBmaWxsPSIjRjVGMUVEIi8+Cjwvc3ZnPgo=',
    webUrl: 'https://leather.io',
    chromeWebStoreUrl:
      'https://chrome.google.com/webstore/detail/hiro-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj',
  },
  {
    id: 'XverseProviders.StacksProvider',
    name: 'Xverse Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNzE3MTciIGQ9Ik0wIDBoNjAwdjYwMEgweiIvPjxwYXRoIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTQ0MCA0MzUuNHYtNTFjMC0yLS44LTMuOS0yLjItNS4zTDIyMCAxNjIuMmE3LjYgNy42IDAgMCAwLTUuNC0yLjJoLTUxLjFjLTIuNSAwLTQuNiAyLTQuNiA0LjZ2NDcuM2MwIDIgLjggNCAyLjIgNS40bDc4LjIgNzcuOGE0LjYgNC42IDAgMCAxIDAgNi41bC03OSA3OC43Yy0xIC45LTEuNCAyLTEuNCAzLjJ2NTJjMCAyLjQgMiA0LjUgNC42IDQuNUgyNDljMi42IDAgNC42LTIgNC42LTQuNlY0MDVjMC0xLjIuNS0yLjQgMS40LTMuM2w0Mi40LTQyLjJhNC42IDQuNiAwIDAgMSA2LjQgMGw3OC43IDc4LjRhNy42IDcuNiAwIDAgMCA1LjQgMi4yaDQ3LjVjMi41IDAgNC42LTIgNC42LTQuNloiLz48cGF0aCBmaWxsPSIjRUU3QTMwIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGQ9Ik0zMjUuNiAyMjcuMmg0Mi44YzIuNiAwIDQuNiAyLjEgNC42IDQuNnY0Mi42YzAgNCA1IDYuMSA4IDMuMmw1OC43LTU4LjVjLjgtLjggMS4zLTIgMS4zLTMuMnYtNTEuMmMwLTIuNi0yLTQuNi00LjYtNC42TDM4NCAxNjBjLTEuMiAwLTIuNC41LTMuMyAxLjNsLTU4LjQgNTguMWE0LjYgNC42IDAgMCAwIDMuMiA3LjhaIi8+PC9nPjwvc3ZnPg==',
    webUrl: 'https://xverse.app',
    chromeWebStoreUrl:
      'https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg',
  },
];

export function WalletPopup() {
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const installedWalletIds = useSelector(state => state.display.installedWalletIds);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;
    dispatch(updateWalletPopup({ installedWalletIds: null }));
  };

  const onCwBtnClick = (id) => {
    if (didClick.current) return;
    didClick.current = true;

    dispatch(connectWallet(id));
    dispatch(updateWalletPopup({ installedWalletIds: null }));
  };

  useEffect(() => {
    if (Array.isArray(installedWalletIds)) didClick.current = false;
  }, [installedWalletIds]);

  const renderInfo = (info) => {
    return (
      <div key={info.id} className="flex items-stretch justify-start rounded-lg border border-slate-700 p-2.5">
        <Link className="group flex shrink-0 grow-0 items-center justify-start space-x-3" href={info.webUrl} target="_blank" rel="noreferrer">
          <Image className="size-10 rounded-lg" width={40} height={40} src={info.icon} alt="" placeholder="empty" />
          <div>
            <p className="text-base text-slate-200">{info.name}</p>
            <p className="text-sm text-slate-400 group-hover:underline">{extractUrl(info.webUrl).host}</p>
          </div>
        </Link>
        <div className="shrink grow"></div>
        {installedWalletIds.includes(info.id) && <button onClick={() => onCwBtnClick(info.id)} className="group flex shrink-0 grow-0 items-center justify-center">
          <div className="rounded-full bg-slate-600 px-3.5 py-1 group-hover:brightness-110">
            <span className="text-sm font-medium text-slate-300">Connect</span>
          </div>
        </button>}
        {!installedWalletIds.includes(info.id) && <Link className="group flex shrink-0 grow-0 items-center justify-center" href={info.chromeWebStoreUrl} target="_blank" rel="noreferrer">
          <div className="rounded-full bg-slate-600 px-3.5 py-1 group-hover:brightness-110">
            <span className="text-sm font-medium text-slate-300">Install</span>
          </div>
        </Link>}
      </div>
    );
  };

  if (!Array.isArray(installedWalletIds)) return <AnimatePresence key="AP_WP" />;

  const spanStyle = { height: safeAreaHeight };
  const didInstall = installedWalletIds.length > 0;

  let msg;
  if (didInstall) {
    msg = 'Select the wallet you want to connect to.';
  } else {
    msg = 'You don\'t have any wallets in your browser that support this app. You need to install a wallet to proceed.';
  }

  return (
    <AnimatePresence key="AP_WP">
      <div className="fixed inset-0 z-20 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div style={{ minHeight: safeAreaHeight }} className="px-4 text-center">
          <div className="fixed inset-0">
            <motion.button onClick={onCancelBtnClick} className="absolute inset-0 size-full cursor-default bg-black/25 focus:outline-none" variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <span style={spanStyle} className="inline-block align-middle" aria-hidden="true">&#8203;</span>
          <motion.div className="relative inline-block w-full max-w-sm overflow-hidden rounded-lg bg-slate-800 p-4 text-left align-middle ring-1 ring-white/25 sm:p-6" variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
            <h3 className="text-2xl font-medium leading-6 text-slate-100">Connect a wallet</h3>
            <p className="mt-4 text-base text-slate-400">{msg}</p>
            {!didInstall && <div className="mt-3 flex items-center justify-end">
              <Link className="flex items-center justify-end hover:brightness-110" href="https://docs.stacks.co/concepts/network-fundamentals/accounts" target="_blank" rel="noreferrer">
                <InformationCircleIcon className="size-4 text-slate-400" />
                <p className="ml-0.5 text-sm text-slate-400">What is a wallet?</p>
                <ArrowTopRightOnSquareIcon className="ml-0.5 size-3.5 text-slate-400" />
              </Link>
            </div>}
            <div className={clsx('space-y-3', didInstall ? 'mt-5' : 'mt-3')}>
              {infos.map(info => renderInfo(info))}
            </div>
            <button onClick={onCancelBtnClick} className="group absolute right-1 top-1 rounded-md p-1" type="button">
              <span className="sr-only">Dismiss</span>
              <svg className="size-5 text-slate-500 group-hover:text-slate-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
