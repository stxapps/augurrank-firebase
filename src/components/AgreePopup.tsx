'use client';
import { useEffect, useRef } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '@/store';
import { agreeTerms, cancelAgreeTerms } from '@/actions/tx';
import { SM_WIDTH } from '@/types/const';
import { dialogBgFMV, dialogFMV } from '@/types/animConfigs';

import { useSafeAreaFrame } from '.';

export function AgreePopup() {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isAgreePopupShown);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;
    dispatch(cancelAgreeTerms());
  };

  const onOkBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;
    dispatch(agreeTerms());
  };

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown]);

  if (!isShown) return <AnimatePresence key="AP_AP" />;

  const spanStyle: any = {};
  if (safeAreaWidth >= SM_WIDTH) spanStyle.height = safeAreaHeight;

  return (
    <AnimatePresence key="AP_AP">
      <div className="fixed inset-0 z-20 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div style={{ minHeight: safeAreaHeight }} className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0">
            <motion.button onClick={onCancelBtnClick} className="absolute inset-0 size-full cursor-default bg-black/25 focus:outline-none" variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <span style={spanStyle} className="hidden sm:inline-block sm:align-middle" aria-hidden="true">&#8203;</span>
          <motion.div className="relative inline-block overflow-hidden rounded-lg bg-slate-800 px-4 pb-4 pt-5 text-left align-bottom ring-1 ring-white/25 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle" variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
            <div className="sm:flex sm:items-start">
              <InformationCircleIcon className="mx-auto size-12 shrink-0 text-slate-500 sm:mx-0 sm:size-10" />
              <div className="mt-3 text-center sm:ml-4 sm:mt-0.5 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-white" id="modal-title">Before you continue</h3>
                <div className="mt-2.5">
                  <p className="text-base text-slate-300">By clicking "Agree", you confirm that you accept our Game Details, Disclaimers, Terms of Service, and Privacy Policy.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:ml-10 sm:flex sm:pl-4">
              <button onClick={onOkBtnClick} type="button" className="inline-flex w-full justify-center rounded-full border border-slate-500 bg-slate-800 px-4 py-2 text-base font-medium text-slate-300 shadow-sm hover:border-slate-400 hover:text-slate-200 sm:w-auto sm:text-sm">Agree</button>
              <button onClick={onCancelBtnClick} type="button" className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-500 bg-slate-800 px-4 py-2 text-base font-medium text-slate-300 shadow-sm hover:border-slate-400 hover:text-slate-200 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
