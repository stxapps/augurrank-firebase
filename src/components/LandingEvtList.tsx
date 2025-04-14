'use client';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@/store';
import { fetchEvents } from '@/actions/common';
import { EvtListItem } from '@/components/EvtListItem';
import { getEvents } from '@/selectors';

export function LandingEvtList() {
  const events = useSelector(state => getEvents(state));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  return (
    <div>
      {events.map(evt => <EvtListItem evt={evt} />)}
    </div>
  );
}
