import { produce } from 'immer';

import { UPDATE_EVENTS } from '../types/actionTypes';
import { isObject } from '@/utils';

const initialState = {
  didFetch: null,
  data: {},
};

const eventsReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_EVENTS) {
    const { didFetch, event, events, removeSlugs } = action.payload;

    if ([null, true, false].includes(didFetch)) draft.didFetch = didFetch;

    if (isObject(event)) {
      Object.assign(draft.data[event.slug], event);
    }
    if (Array.isArray(events)) {
      for (const event of events) {
        Object.assign(draft.data[event.slug], event);
      }
    } else if (isObject(events)) {
      for (const event of Object.values<any>(events)) {
        Object.assign(draft.data[event.slug], event);
      }
    }
    if (Array.isArray(removeSlugs)) {
      for (const slug of removeSlugs) delete draft.data[slug];
    }
  }
});

export default eventsReducer;
