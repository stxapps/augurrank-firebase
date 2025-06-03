import idxApi from '@/apis';
import { PROFILES_PATH } from '@/types/const';
import { getResErrMsg } from '@/utils';

const fetchProfile = async (stxAddr) => {
  const res = await fetch(`${PROFILES_PATH}/${stxAddr}`, {
    method: 'GET',
    referrerPolicy: 'strict-origin',
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }

  const obj = await res.json();
  return obj;
};

const patchProfile = async (stxAddr, profile) => {
  const authData = idxApi.getAuthData();

  const res = await fetch(`${PROFILES_PATH}/${stxAddr}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'strict-origin',
    body: JSON.stringify({ ...authData, profile }),
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }

  const obj = await res.json();
  return obj;
};

const profile = { fetchProfile, patchProfile };

export default profile;
