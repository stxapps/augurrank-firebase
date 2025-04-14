import {
  verifyMessageSignatureRsv, verifyMessageSignature, verifyECDSA,
} from '@stacks/encryption';
import { getAddressFromPublicKey } from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

import { STX_TST_STR } from '@/types/const';

const verify = (stxAddr, stxPubKey, stxTstStr, stxSigStr) => {
  if (stxTstStr !== STX_TST_STR) return false;

  let network = STACKS_MAINNET;
  if (['ST', 'SN'].includes(stxAddr.slice(0, 2))) network = STACKS_TESTNET;

  const addr = getAddressFromPublicKey(stxPubKey, network);
  if (addr !== stxAddr) return false;

  let rst = false;
  try {
    rst = verifyMessageSignatureRsv({
      publicKey: stxPubKey, message: stxTstStr, signature: stxSigStr,
    });
  } catch (error) {}
  if (rst === true) return rst;

  try {
    rst = verifyMessageSignature({
      publicKey: stxPubKey, message: stxTstStr, signature: stxSigStr,
    });
  } catch (error) {}
  if (rst === true) return rst;

  try {
    rst = verifyECDSA(stxTstStr, stxPubKey, stxSigStr);
  } catch (error) {}

  return rst;
};

const auth = { verify };

export default auth;
