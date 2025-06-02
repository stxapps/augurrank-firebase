'use client';
import { useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/20/solid';

import { useSelector, useDispatch } from '@/store';
import { updateNotiPopup } from '@/actions';
import { ERROR } from '@/types/const';
import { isFldStr } from '@/utils';

export function NotiPopup() {
  const type = useSelector(state => state.display.notiPopupType);
  const title = useSelector(state => state.display.notiPopupTitle);
  const body = useSelector(state => state.display.notiPopupBody);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const isShown = isFldStr(type) && isFldStr(title) && isFldStr(body);

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;
    dispatch(updateNotiPopup({ type: null, title: null, body: null }));
  };

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown]);

  if (!isShown) return null;

  let icon = (
    <CheckCircleIcon aria-hidden="true" className="size-6 text-green-400" />
  );
  if (type === ERROR) {
    icon = (
      <ExclamationCircleIcon aria-hidden="true" className="size-6 text-red-400" />
    );
  }

  return (
    <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex items-start px-4 py-14 sm:px-6 z-40">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition show={isShown}>
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-slate-800 ring-1 ring-white/25 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  {icon}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-slate-100">{title}</p>
                  <p className="mt-1 text-sm text-slate-400">{body}</p>
                </div>
                <div className="ml-4 flex shrink-0">
                  <button type="button" onClick={onCancelBtnClick} className="inline-flex rounded-md text-slate-400 hover:text-slate-300">
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}
