'use client';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@/store';
import { fetchEvents } from '@/actions/common';
import { EvtListItemLdg, EvtListItem } from '@/components/EvtListItem';
import { getEvents } from '@/selectors';

export function LandingEvtList() {
  const fthSts = useSelector(state => state.events.fthSts);
  const events = useSelector(state => getEvents(state));
  const dispatch = useDispatch();

  const onRetryBtnClick = () => {
    dispatch(fetchEvents(true));
  };

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  let content;
  if ([null, 0].includes(fthSts)) { // show loading
    content = (
      <div className="mt-10 grid grid-cols-1 gap-4 justify-items-center sm:grid-cols-2">
        <EvtListItemLdg />
        <EvtListItemLdg />
        <EvtListItemLdg />
      </div>
    );
  } else if (fthSts === 2) { // show error and retry button
    content = (
      <div className="mt-24 flex items-center justify-between space-x-2 max-w-sm mx-auto">
        <p className="text-red-600">Something went wrong! Please wait and try again.</p>
        <button onClick={onRetryBtnClick} className="rounded-full bg-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:brightness-110">Retry</button>
      </div>
    );
  } else if (events.length === 0) { // show empty
    content = (
      <div className="mt-24">
        <h3 className="text-slate-200 text-center">No live event. Check back later!</h3>
      </div>
    );
  } else {
    content = (
      <div className="mt-10 grid grid-cols-1 gap-4 justify-items-center sm:grid-cols-2">
        {events.map(evt => <EvtListItem key={evt.id} evt={evt} />)}
      </div>
    );
  }

  return content;
}
