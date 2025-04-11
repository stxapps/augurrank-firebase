import { produce } from 'immer';

import { UPDATE_EVENTS } from '@/types/actionTypes';
import { isFldStr, isObject } from '@/utils';

const initialState = {
  fthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  entries: {},
  quryCrsr: null,
  fthMoreSts: null, // null: not yet, 0: fetching, 2: error
  slug: null,
  slugFthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
};

const eventsReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_EVENTS) {
    const {
      fthSts, event, events, quryCrsr, fthMoreSts, slug, slugFthSts,
    } = action.payload;

    if ([null, 0, 1, 2].includes(fthSts)) draft.fthSts = fthSts;

    if (isObject(event)) {
      draft.entries[event.id] = structuredClone(event);
    }
    if (Array.isArray(events)) {
      for (const event of events) {
        draft.entries[event.id] = structuredClone(event);
      }
    } else if (isObject(events)) {
      for (const event of Object.values<any>(events)) {
        draft.entries[event.id] = structuredClone(event);
      }
    }

    if (quryCrsr === null || isFldStr(quryCrsr)) draft.quryCrsr = quryCrsr;
    if ([null, 0, 2].includes(fthMoreSts)) draft.fthMoreSts = fthMoreSts;
    if (slug === null || isFldStr(slug)) draft.slug = slug;
    if ([null, 0, 1, 2].includes(slugFthSts)) draft.slugFthSts = slugFthSts;
  }
});

export default eventsReducer;
