'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCircleIcon, LifebuoyIcon, ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid';

import { useSelector, useDispatch } from '@/store';
import { signOut, updatePopup } from '@/actions';
import { TOP_BAR_MENU_POPUP } from '@/types/const';
import { popupBgFMV, popupFMV } from '@/types/animConfigs';
import { computePositionStyle } from '@/utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets } from '.';

export function TopBarMenuPopup() {
  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isTopBarMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.topBarMenuPopupPosition);
  const stxAddr = useSelector(state => state.me.stxAddr);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(TOP_BAR_MENU_POPUP, false, null));
    didClick.current = true;
  };

  const onProfileBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(TOP_BAR_MENU_POPUP, false, null));
    router.push(`/profile/${stxAddr}`);
    didClick.current = true;
  };

  const onSupportBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(TOP_BAR_MENU_POPUP, false, null));
    router.push('/support');
    didClick.current = true;
  };

  const onSignOutBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(TOP_BAR_MENU_POPUP, false, null));
    dispatch(signOut());
    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      const s = popup.current.getBoundingClientRect();
      setPopupSize(s);

      cancelBtn.current.focus();
      didClick.current = false;
    } else {
      setPopupSize(null);
    }
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_tbmPopup" />
  );

  const buttons = (
    <div className="py-1">
      <button className="group flex w-full items-center px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover:text-slate-100" onClick={onProfileBtnClick} role="menuitem">
        <UserCircleIcon className="mr-3 h-5 w-5 text-slate-300 group-hover:text-slate-200" />
        Profile
      </button>
      <button className="group flex w-full items-center px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover:text-slate-100" onClick={onSupportBtnClick} role="menuitem">
        <LifebuoyIcon className="mr-3 h-5 w-5 text-slate-300 group-hover:text-slate-200" />
        Support
      </button>
      <button onClick={onSignOutBtnClick} className="group flex w-full items-center px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover:text-slate-100" role="menuitem">
        <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5 text-slate-300 group-hover:text-slate-200" />
        Sign out
      </button>
    </div>
  );

  const popupClassNames = 'fixed z-20 min-w-36 overflow-auto rounded-md bg-slate-800 ring-1 ring-white/25';

  let panel;
  if (popupSize) {
    const maxHeight = safeAreaHeight - 16;
    const posStyle = computePositionStyle(
      anchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { x: 0, y: 0, width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );
    const popupStyle = { ...posStyle, maxHeight };

    panel = (
      <motion.div key="TBMP_popup" ref={popup} style={popupStyle} className={popupClassNames} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="TBMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={popupClassNames} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_tbmPopup">
      <motion.button key="TBMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className="fixed inset-0 z-20 size-full cursor-default bg-black/25 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
}
