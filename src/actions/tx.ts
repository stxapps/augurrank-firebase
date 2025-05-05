import { PostConditionMode, Cl, Pc } from '@stacks/transactions/dist/esm';

import { AppDispatch, AppGetState } from '@/store';
import { getInfo } from '@/info';
import idxApi from '@/apis';
import walletApi from '@/apis/wallet';
import {
  chooseWallet, signStxTstStr, updateNotiPopup, updateErrorPopup, updateMe, refreshTxs,
} from '@/actions';
import { UPDATE_TRADE_EDITOR } from '@/types/actionTypes';
import {
  EVT_OPENED, TX_BUY, TX_SELL, SCS, ABT_BY_RES, ERROR, ERR_BALANCE_NOT_FOUND,
  ERR_INVALID_ARGS, ERR_INVALID_AMT, ERR_COST_TOO_LOW, ERR_BALANCE_TOO_LOW,
  ERR_SHARES_TOO_LOW, SCALE,
} from '@/types/const';
import {
  isObject, isNumber, isFldStr, randomString, getSignInStatus, getWalletErrorText,
  getShare, mergeTxs, getScEvtId,
} from '@/utils';
import { getShareCosts, getBuyAmount, getSellCost } from '@/utils/lmsr';

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

  const { stxAddr, stxPubKey, balance, shares } = getState().me;

  if (type === TX_BUY) {
    if (!isNumber(balance)) {
      dispatch(updateTradeEditor({ msg: ERR_BALANCE_NOT_FOUND }));
      return;
    }
    if (balance < prsdValue) {
      dispatch(updateTradeEditor({ msg: ERR_BALANCE_TOO_LOW }));
      return;
    }
  } else if (type === TX_SELL) {
    const share = getShare(shares, evtId, ocId);
    if (!isObject(share) || share.amount < prsdValue) {
      dispatch(updateTradeEditor({ msg: ERR_SHARES_TOO_LOW }));
      return;
    }
  }

  const info = getInfo();
  const scEvtId = getScEvtId(evtId);
  const scldValue = prsdValue * SCALE;

  let functionName, functionArgs, postConditions;
  if (type === TX_BUY) {
    const shareCosts = getShareCosts(evt);
    const shareCost = shareCosts[ocId];
    const startAmt = Math.floor(scldValue / shareCost) * SCALE;

    const scldAmt1 = getBuyAmount(evt, ocId, scldValue, startAmt);
    const amt1 = scldAmt1 / SCALE;
    const amt2 = Math.min(Math.floor(amt1 * 0.985), amt1 - 1);
    const amt3 = Math.min(Math.floor(amt1 * 0.95), amt2 - 1);
    if (amt1 <= 0) {
      dispatch(updateTradeEditor({ msg: ERR_INVALID_AMT }));
      return;
    }

    functionName = 'buy-shares-a';
    functionArgs = [Cl.uint(scEvtId), Cl.uint(ocId), Cl.uint(scldAmt1)];
    if (amt2 > 0) {
      functionName = 'buy-shares-b';
      functionArgs.push(Cl.uint(amt2 * SCALE));
    }
    if (amt3 > 0) {
      functionName = 'buy-shares-c';
      functionArgs.push(Cl.uint(amt3 * SCALE));
    }
    functionArgs.push(Cl.uint(scldValue));

    const condition = Pc.principal(stxAddr).willSendLte(scldValue).ft(
      `${info.stxAddr}.${info.tokenContract}`, 'Augur',
    );
    postConditions = [condition];
  } else if (type === TX_SELL) {
    const cost = getSellCost(evt, ocId, scldValue) / SCALE;
    const slpgCost = cost * 0.95; // slippage 5%
    const minCost = slpgCost > 0 ? slpgCost : cost;
    if (minCost <= 0) {
      dispatch(updateTradeEditor({ msg: ERR_COST_TOO_LOW }));
      return;
    }

    const scldMinCost = Math.floor(minCost * SCALE);
    const condition = Pc.principal(info.stxAddr).willSendGte(scldMinCost).ft(
      `${info.stxAddr}.${info.tokenContract}`, 'Augur',
    );

    functionName = 'sell-shares-a';
    functionArgs = [
      Cl.uint(scEvtId), Cl.uint(ocId), Cl.uint(scldValue), Cl.uint(scldMinCost),
    ];
    postConditions = [condition];
  }

  const now = Date.now();
  const id = `${stxAddr}-${now}${randomString(7)}`;
  const [contract, createDate, updateDate] = [info.marketsContract, now, now];
  const tx = { id, type, contract, createDate, updateDate };
  dispatch(updateTradeEditor({ msg: '', doLoad: true }));
  dispatch(updateMe({ tx }));

  let data, isError, error;
  try {
    data = await walletApi.contractCall({
      stxAddress: stxAddr,
      publicKey: stxPubKey,
      sponsored: false,
      network: info.network,
      contractAddress: info.stxAddr,
      contractName: contract,
      functionName,
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions,
    });
  } catch (err) {
    console.log('trade.contractCall error:', err);
    [isError, error] = [true, err];
  }

  if (getState().me.stxAddr !== stxAddr) return;

  if (isError) {
    dispatch(updateTradeEditor({ doLoad: false }));
    dispatch(updateMe({ removeTxIds: [tx.id] }));
    if (
      (isObject(error.error) && [4001, -32000].includes(error.error.code)) ||
      error === 'cancel'
    ) {
      return;
    }

    dispatch(updateErrorPopup(getWalletErrorText(error)));
    return;
  }

  const newTx = mergeTxs(tx, { cTxId: data.txId, updateDate: Date.now() });
  dispatch(updateTradeEditor({ evtId: null }));
  dispatch(updateMe({ tx: newTx }));
  dispatch(updateNotiPopup({
    title: 'Call the smart contract successfully!',
    body: 'Your transaction should be committed within 5 seconds.',
  }));

  newTx.pTxSts = SCS;
  try {
    data = await idxApi.patchTx(newTx);
  } catch (error) {
    console.log('trade.patchTx error:', error);
    isError = true;
  }

  if (getState().me.stxAddr !== stxAddr) return;

  if (isError) {
    newTx.pTxSts = ABT_BY_RES;
    dispatch(updateMe({ tx: newTx }));
    setTimeout(() => {
      dispatch(refreshTxs());
    }, 5 * 1000); // Wait a while before calling refreshPreds.
    return;
  }

  dispatch(updateMe({ ...data }));
  setTimeout(() => {
    dispatch(refreshTxs());
  }, 5 * 1000); // Wait a while before calling refreshPreds.
};
