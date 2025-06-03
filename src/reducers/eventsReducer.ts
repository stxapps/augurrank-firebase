import { produce } from 'immer';

import { UPDATE_EVENTS, UPDATE_SYNC } from '@/types/actionTypes';
import { isObject, isNumber, isFldStr } from '@/utils';

const initialState = {
  fthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  entries: {},
  quryCrsr: null,
  fthMoreSts: null, // null: not yet, 0: fetching, 2: error
  slugFthStses: {}, // key: slug, value: slugFthSts <same as fthSts>
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
    if (isFldStr(slug) && [null, 0, 1, 2].includes(slugFthSts)) {
      draft.slugFthStses[slug] = slugFthSts;
    }
  }

  if (action.type === UPDATE_SYNC) {
    const { evts } = action.payload;
    if (isObject(evts)) {
      for (const [evtId, evt] of Object.entries<any>(evts)) {
        if (!isObject(draft.entries[evtId])) continue;

        draft.entries[evtId].beta = evt.beta;
        draft.entries[evtId].status = evt.status;
        draft.entries[evtId].winOcId = evt.winOcId;

        const ocsPerId = toPerId(evt.outcomes);
        for (const oc of draft.entries[evtId].outcomes) {
          if (isObject(ocsPerId[oc.id]) && isNumber(ocsPerId[oc.id].shareAmount)) {
            oc.shareAmount = ocsPerId[oc.id].shareAmount;
          }
        }

        draft.entries[evtId].qtyVol = evt.qtyVol;
        draft.entries[evtId].valVol = evt.valVol;
        draft.entries[evtId].nTraders = evt.nTraders;
        draft.entries[evtId].updateDate = evt.updateDate;
      }
    }
  }
});

const toPerId = (ocs) => {
  const ocsPerId = {};
  if (Array.isArray(ocs)) {
    for (const oc of ocs) {
      ocsPerId[oc.id] = oc;
    }
  }
  return ocsPerId;
};

export default eventsReducer;
