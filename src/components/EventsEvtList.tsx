'use client';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@/store';
import { fetchEvents } from '@/actions/common';
import { EvtListItem } from '@/components/EvtListItem';
import { getEvents } from '@/selectors';
import { isObject } from '@/utils';

export function EventsEvtList() {
  const events = useSelector(state => getEvents(state));

  const dispatch = useDispatch();

  // fetch more

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  if (!isObject(events)) {
    // place holders as loading
    return null;
  }

  return (
    <div>
      {events.map(evt => <EvtListItem key={evt.id} evt={evt} />)}
    </div>
  );
}
