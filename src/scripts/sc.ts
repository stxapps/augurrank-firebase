import { getInfo } from '@/info';
import scApi from '@/apis/server/sc';

const setMarketsContract = async () => {
  const info = getInfo();
  const res = await scApi.addAllowedContract(`${info.stxAddr}.${info.marketsContract}`);
  console.log(`setMarketsContract with txId: ${res.txId}`);
};
//setMarketsContract();

const setStoreContract = async () => {
  const info = getInfo();
  const res = await scApi.addAllowedContract(`${info.stxAddr}.${info.storeContract}`);
  console.log(`setStoreContract with txId: ${res.txId}`);
};
//setStoreContract();

const setTokenUri = async () => {
  const uri = 'https://augurrank.com/augur-token-metadata-v1.json';

  const res = await scApi.setTokenUri(uri);
  console.log(`setTokenUri with txId: ${res.txId}`);
};
//setTokenUri();

const mint = async () => {
  const amount = 1000000000000, recipient = null;
  const res = await scApi.mint(amount, recipient);
  console.log(`Mint with txId: ${res.txId}`);
};
//mint();
