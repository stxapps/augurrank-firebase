import { AppDispatch, AppGetState } from '@/store';
import { getInfo } from '@/info';
import idxApi from '@/apis';
import walletApi from '@/apis/wallet';
import hiroApi from '@/apis/hiro';
import {
  INIT, UPDATE_WINDOW, UPDATE_POPUP, UPDATE_WALLET_POPUP, UPDATE_NOTI_POPUP,
  UPDATE_ERROR_POPUP, UPDATE_ME, RESET_STATE,
} from '@/types/actionTypes';
import {
  STX_TST_STR, TX_ENROLL, TX_BUY, TX_SELL, TX_IN_MEMPOOL, TX_PUT_OK,
  TX_PUT_ERROR, TX_CONFIRMED_OK, TX_CONFIRMED_ERROR, SCS, PDG, ABT_BY_NF, ERROR,
  ERR_NOT_FOUND, ERR_USER_NOT_FOUND,
} from '@/types/const';
import {
  isObject, isNumber, throttle, getWindowInsets, getWalletErrorText, getSignInStatus,
  deriveTxInfo, getTxAmount, getTxCost, mergeTxs, getTxState,
} from '@/utils';
import vars from '@/vars';

let _didInit: boolean;
export const init = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  if (_didInit) return;
  _didInit = true;

  const localMe = idxApi.getLocalMe();
  dispatch({ type: INIT, payload: { ...localMe } });

  window.addEventListener('resize', throttle(() => {
    const insets = getWindowInsets();
    dispatch({
      type: UPDATE_WINDOW,
      payload: {
        width: window.innerWidth,
        height: window.innerHeight,
        insetTop: insets.top,
        insetRight: insets.right,
        insetBottom: insets.bottom,
        insetLeft: insets.left,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      const insets = getWindowInsets();
      dispatch({
        type: UPDATE_WINDOW,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
          insetTop: insets.top,
          insetRight: insets.right,
          insetBottom: insets.bottom,
          insetLeft: insets.left,
        },
      });
    }, 16));
  }

  dispatch(fetchMe());
};

export const signOut = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  const payload = { stxAddr: '', stxPubKey: '', stxSigStr: '' };
  await resetState(payload, dispatch);

  try {
    await walletApi.disconnect();
  } catch (error) {
    console.log('In signOut, error:', error);
  }
};

export const chooseWallet = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const installedWalletIds = walletApi.getInstalledWalletIds();
  if (installedWalletIds.length === 1) {
    dispatch(connectWallet(installedWalletIds[0]));
    return;
  }

  dispatch(updateWalletPopup({ installedWalletIds }));
};

export const connectWallet = (walletId) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  let data;
  try {
    data = await walletApi.connect(walletId);
  } catch (error) {
    console.log('In connectWallet, error:', error);
    if (isObject(error.error) && [4001, -32000].includes(error.error.code)) return;
    if (isObject(error.error) && [-32603].includes(error.error.code)) {
      dispatch(updateErrorPopup(getWalletErrorText(ERR_USER_NOT_FOUND)));
      return;
    }

    dispatch(updateErrorPopup(getWalletErrorText(error)));
    return;
  }

  const me = { stxAddr: data.stxAddr, stxPubKey: data.stxPubKey, stxSigStr: '' };
  dispatch(updateMe(me));

  dispatch(signStxTstStr());
};

export const signStxTstStr = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const { networkName } = getInfo();
  const { stxAddr, stxPubKey } = getState().me;

  let data;
  try {
    data = await walletApi.signMessage(stxPubKey, STX_TST_STR, networkName);
  } catch (error) {
    console.log('In signStxTstStr, error:', error);
    if (isObject(error.error) && [4001, -32000].includes(error.error.code)) return;

    dispatch(updateErrorPopup(getWalletErrorText(error)));
    return;
  }

  const payload = { stxAddr, stxPubKey, stxSigStr: '' };
  await resetState(payload, dispatch);

  const me = { stxSigStr: data.stxSigStr };
  dispatch(updateMe(me));
  dispatch(fetchMe());
};

const resetState = async (payload, dispatch) => {
  idxApi.deleteLocalFiles();

  dispatch({ type: RESET_STATE, payload });
};

export const updatePopup = (id, isShown, anchorPosition) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const updateWalletPopup = (payload) => {
  return { type: UPDATE_WALLET_POPUP, payload };
};

export const updateNotiPopup = (payload) => {
  return { type: UPDATE_NOTI_POPUP, payload };
};

export const updateErrorPopup = (payload) => {
  return { type: UPDATE_ERROR_POPUP, payload };
};

export const fetchMe = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  if (getSignInStatus(getState().me) !== 3) return;

  const { stxAddr, fthSts } = getState().me;

  if (fthSts === 0) return;
  if (!doForce && fthSts !== null) return;
  dispatch(updateMe({ fthSts: 0 }));

  let data, isError;
  try {
    data = await idxApi.fetchMe();
  } catch (error) {
    console.log('fetchMe error:', error);
    isError = true;
  }

  if (getState().me.stxAddr !== stxAddr) return;

  if (isError) {
    dispatch(updateMe({ fthSts: 2 }));
    return;
  }

  dispatch(updateMe({ ...data, fthSts: 1 }));
  dispatch(applyEnroll());
};

export const updateMe = (payload) => {
  return { type: UPDATE_ME, payload };
};

export const applyEnroll = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  if (getSignInStatus(getState().me) !== 3) return;

  // cases: 1. first time/no data/no enroll
  //        2. enroll and processing
  //        3. enrolled successfully
  const { stxAddr, balance, enrlFthSts } = getState().me;
  if (isNumber(balance)) {
    dispatch(refreshTxs());
    return;
  }

  if (enrlFthSts === 0) return;
  if (!doForce && enrlFthSts !== null) return;
  dispatch(updateMe({ enrlFthSts: 0 }));
  dispatch(updateNotiPopup({
    type: SCS,
    title: 'Welcome to the game!',
    body: 'Your sign-up bonus of ₳1,000 is on the way. In 5 seconds!',
  }));

  let data, isError;
  try {
    data = await idxApi.applyEnroll();
  } catch (error) {
    console.log('applyEnroll error:', error);
    isError = true;
  }

  if (getState().me.stxAddr !== stxAddr) return;

  if (isError) {
    dispatch(updateMe({ enrlFthSts: 2 }));
    dispatch(updateNotiPopup({
      type: ERROR,
      title: 'There is an error with your sign-up bonus!',
      body: 'We\'ll sort it out. Please wait for a while and refresh the page.',
    }));
    return;
  }

  dispatch(updateMe({ ...data, enrlFthSts: 1 }));
  setTimeout(() => {
    dispatch(refreshTxs());
  }, 5 * 1000);
};

export const refreshTxs = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  if (!doForce && vars.refreshTxs.timeId) return;
  clearTimeout(vars.refreshTxs.timeId);

  if (getSignInStatus(getState().me) !== 3) {
    [vars.refreshTxs.timeId, vars.refreshTxs.seq] = [null, 0];
    return;
  }

  const { stxAddr, txs } = getState().me;

  const unputTxs = [], unconfirmedTxs = [];
  for (const tx of Object.values<any>(txs)) {
    const state = getTxState(tx);
    if ([TX_IN_MEMPOOL, TX_PUT_ERROR].includes(state)) unputTxs.push(tx);
    if (state === TX_PUT_OK) unconfirmedTxs.push(tx);
  }
  if (unputTxs.length === 0 && unconfirmedTxs.length === 0) {
    [vars.refreshTxs.timeId, vars.refreshTxs.seq] = [null, 0];
    return;
  }

  vars.refreshTxs.timeId = PDG;

  await putUnputTxs(stxAddr, unputTxs, dispatch, getState);
  await refreshUnconfirmedTxs(stxAddr, unconfirmedTxs, dispatch, getState);

  const seq = vars.refreshTxs.seq;
  const ms = Math.max(Math.min(Math.round(
    (0.8217 * seq ^ 2 + 2.6469 * seq + 5.7343) * 1000,
  ), 5 * 60 * 1000), 5 * 1000);
  vars.refreshTxs.timeId = setTimeout(() => {
    dispatch(refreshTxs(true));
  }, ms);
  vars.refreshTxs.seq += 1;
};

const putUnputTxs = async (
  stxAddr, txs, dispatch: AppDispatch, getState: AppGetState,
) => {
  for (const tx of txs) {
    const newTx = mergeTxs(tx, { pTxSts: SCS, updateDate: Date.now() });

    let data;
    try {
      data = await idxApi.patchTx(newTx);
    } catch (error) {
      console.log('putUnputTxs error:', error);
      continue; // Do it later.
    }

    if (getState().me.stxAddr !== stxAddr) return;

    dispatch(updateMe({ ...data }));
  }
};

const refreshUnconfirmedTxs = async (
  stxAddr, txs, dispatch: AppDispatch, getState: AppGetState,
) => {
  for (const tx of txs) {
    let txInfo, data;
    try {
      txInfo = await hiroApi.fetchTxInfo(tx.cTxId);
    } catch (error) {
      if (error.message !== ERR_NOT_FOUND) {
        console.log('refreshUnconfirmedTxs.fetchTxInfo error:', error);
        continue; // server error, network error, do it later or by server.
      } else if (Date.now() - tx.createDate < 60 * 60 * 1000) {
        continue; // wait a bit more, maybe the api lacks behind.
      }

      // Not in mempool anymore like cannot confirm i.e. wrong nonce, not enough fee
      txInfo = { tx_id: tx.cTxId, tx_status: ABT_BY_NF };
    }

    if (getState().me.stxAddr !== stxAddr) return;

    txInfo = deriveTxInfo(txInfo);
    if (txInfo.status === PDG) continue;

    const newTx = mergeTxs(tx, { cTxSts: txInfo.status, updateDate: Date.now() });
    if ([TX_BUY, TX_SELL].includes(newTx.type) && newTx.cTxSts === SCS) {
      newTx.amount = getTxAmount(txInfo);
      newTx.cost = getTxCost(txInfo);
    }

    try {
      data = await idxApi.patchTx(newTx);
    } catch (error) {
      console.log('refreshUnconfirmedTxs.patchTx error:', error);
      continue; // Do it later.
    }

    if (getState().me.stxAddr !== stxAddr) return;

    dispatch(updateMe({ ...data }));

    const state = getTxState(data.tx);
    if (state === TX_CONFIRMED_OK && data.isToScs) {
      if ([TX_ENROLL].includes(data.tx.type)) {
        dispatch(updateNotiPopup({
          type: SCS,
          title: '₳1,000 Added!',
          body: 'We\'ve just dropped ₳1,000 into your account. Have fun!',
        }));
      } else if ([TX_BUY, TX_SELL].includes(data.tx.type)) {
        dispatch(updateNotiPopup({
          type: SCS,
          title: 'Your transaction has been committed!',
          body: 'Congrats! 🎉 Wishing you make excellent profits!',
        }));
      }
    } else if (state === TX_CONFIRMED_ERROR) {
      dispatch(updateNotiPopup({
        type: ERROR,
        title: 'There is an error with your sign-up bonus!',
        body: 'We\'ll sort it out. Please wait for a while and refresh the page.',
      }));
    }
  }
};
