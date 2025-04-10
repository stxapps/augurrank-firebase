import scApi from '@/apis/server/sc';

const setMarketsContract = async () => {
  const res = await scApi.setMarketsContract();
  console.log(`setMarketsContract with txid: ${res.txid}`);
};
//setMarketsContract();

const setStoreContract = async () => {
  const res = await scApi.setStoreContract();
  console.log(`setStoreContract with txid: ${res.txid}`);
};
//setStoreContract();

const setTokenUri = async () => {
  const uri = 'https://augurrank.com/augur-token-metadata-v1.json';

  const res = await scApi.setTokenUri(uri);
  console.log(`setTokenUri with txid: ${res.txid}`);
};
//setTokenUri();

const mint = async () => {
  const amount = 1000000000000, recipient = null;
  const res = await scApi.mint(amount, recipient);
  console.log(`Mint with txid: ${res.txid}`);
};
//mint();
