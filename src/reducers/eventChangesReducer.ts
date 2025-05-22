import { produce } from 'immer';

import { UPDATE_EVENT_CHANGES, UPDATE_SYNC } from '@/types/actionTypes';
import { isFldStr, isObject, randomString } from '@/utils';

/* key: evtId, value: fthSts, entries, quryCrsr, fthMoreSts */
const initialState = {};

const eventChangesReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_EVENT_CHANGES) {
    const {
      evtId, fthSts, eventChange, eventChanges, quryCrsr, fthMoreSts,
    } = action.payload;

    if (isFldStr(evtId)) {
      init(draft, evtId);

      if ([null, 0, 1, 2].includes(fthSts)) draft[evtId].fthSts = fthSts;

      if (isObject(eventChange)) {
        draft[evtId].entries[eventChange.id] = structuredClone(eventChange);
      }
      if (Array.isArray(eventChanges)) {
        for (const eventChange of eventChanges) {
          draft[evtId].entries[eventChange.id] = structuredClone(eventChange);
        }
      } else if (isObject(eventChanges)) {
        for (const eventChange of Object.values<any>(eventChanges)) {
          draft[evtId].entries[eventChange.id] = structuredClone(eventChange);
        }
      }

      if (quryCrsr === null || isFldStr(quryCrsr)) draft[evtId].quryCrsr = quryCrsr;
      if ([null, 0, 2].includes(fthMoreSts)) draft[evtId].fthMoreSts = fthMoreSts;
    }
  }

  if (action.type === UPDATE_SYNC) {
    const { evts } = action.payload;
    if (isObject(evts)) {
      for (const [evtId, evt] of Object.entries<any>(evts)) {
        if (!isObject(draft[evtId])) continue;

        let isEqual = false;
        for (const entry of Object.values<any>(draft[evtId].entries)) {
          if (evt.updateDate === entry.updateDate) {
            isEqual = true;
            break;
          }
        }
        if (!isEqual) {
          const eventChange = deriveEvtChg(evt);
          draft[evtId].entries[eventChange.id] = structuredClone(eventChange);
        }
      }
    }
  }
});

const init = (draft, evtId) => {
  if (!isObject(draft[evtId])) {
    draft[evtId] = { fthSts: null, entries: {}, quryCrsr: null, fthMoreSts: null };
  }
};

const deriveEvtChg = (evt) => {
  const evtChg = {
    id: `${evt.updateDate}${randomString(7)}`,
    beta: evt.beta,
    outcomes: evt.outcomes.map(oc => {
      return { id: oc.id, shareAmount: oc.shareAmount };
    }),
    qtyVol: evt.qtyVol,
    valVol: evt.valVol,
    nTraders: evt.nTraders,
    createDate: evt.updateDate,
    upateDate: evt.updateDate,
  };
  return evtChg;
};

export default eventChangesReducer;
