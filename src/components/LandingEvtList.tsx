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
      <>
        <EvtListItemLdg />
        <EvtListItemLdg />
        <EvtListItemLdg />
      </>
    );
  } else if (fthSts === 2) { // show error and retry button
    content = (
      <div className="mt-2 flex items-center justify-between space-x-2">
        <p className="text-red-600">Something went wrong! Please wait and try again.</p>
        <button onClick={onRetryBtnClick} className="rounded-full bg-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:brightness-110">Retry</button>
      </div>
    );
  } else if (events.length === 0) { // show empty
    content = (
      <div className="mt-2 flex items-center justify-between space-x-2">
        <p className="text-slate-500">No live event. Check back later!</p>
      </div>
    );
  } else {
    content = events.map(evt => <EvtListItem key={evt.id} evt={evt} />);
  }

  return (
    <div className="mt-10 flex flex-col items-center sm:grid sm:grid-cols-2 sm:gap-4">
      {content}
    </div>
  );
}
