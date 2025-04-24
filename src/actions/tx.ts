import { AppDispatch, AppGetState } from '@/store';
//import idxApi from '@/apis';
//import txApi from '@/apis/tx';
import { chooseWallet, signStxTstStr } from '@/actions';
import { UPDATE_TRADE_EDITOR } from '@/types/actionTypes';
import {
  EVT_OPENED, TX_BUY, TX_SELL, ERROR, ERR_INVALID_ARGS, ERR_BALANCE_TOO_LOW,
  ERR_SHARES_TOO_LOW,
} from '@/types/const';
import { isObject, isNumber, isFldStr, getSignInStatus } from '@/utils';

export const agreeTerms = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const cancelAgreeTerms = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const updateTradeEditor = (payload) => {
  return { type: UPDATE_TRADE_EDITOR, payload };
};

export const trade = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const { evtId, type, ocId, value } = getState().tradeEditor;
  if (!isFldStr(evtId) || ![TX_BUY, TX_SELL].includes(type) || !isNumber(ocId)) {
    console.log('In trade, invalid evtId, type, or ocId');
    dispatch(updateTradeEditor({ msg: ERROR }));
    return;
  }
  if (!(/^\d+$/.test(value))) {
    console.log('In trade, invalid value');
    dispatch(updateTradeEditor({ msg: ERR_INVALID_ARGS }));
    return;
  }

  const prsdValue = parseInt(value, 10);
  if (prsdValue <= 0) {
    console.log('In trade, invalid parsed value');
    dispatch(updateTradeEditor({ msg: ERR_INVALID_ARGS }));
    return;
  }

  const evt = getState().events.entries[evtId];
  if (!isObject(evt) || evt.status !== EVT_OPENED) {
    console.log('In trade, invalid event with id:', evtId);
    dispatch(updateTradeEditor({ msg: ERROR }));
    return;
  }

  const signInStatus = getSignInStatus(getState().me);
  if (signInStatus !== 3) {
    if (signInStatus === 1) dispatch(chooseWallet());
    else if (signInStatus === 2) dispatch(signStxTstStr());
    return;
  }

  if (type === TX_BUY) {
    const { balance } = getState().me;
    if (!isNumber(balance)) {
      // show message telling 1000 tokens incoming
      dispatch(updateNotiPopup());
      return;
    }
    if (balance < prsdValue) {
      dispatch(updateTradeEditor({ msg: ERR_BALANCE_TOO_LOW }));
      return;
    }
  } else if (type === TX_SELL) {
    const shares = getState().me.shares;

    let share;
    for (const shr of Object.values<any>(shares)) {
      if (shr.evtId === evtId && shr.ocId === ocId) {
        share = shr;
        break;
      }
    }
    if (!isObject(share) || share.amount < prsdValue) {
      dispatch(updateTradeEditor({ msg: ERR_SHARES_TOO_LOW }));
      return;
    }
  }

  dispatch(updateTradeEditor({ doLoad: true }));



  // if buy, convert cost to amount and slippage

  // if sell, set min cost?


  dispatch(updateTradeEditor({ evtId: null }));
};
