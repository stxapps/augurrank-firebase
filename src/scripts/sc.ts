import scApi from '@/apis/server/sc';

const setMarketsContract = async () => {
  const res = await scApi.setMarketsContract();
  console.log(`setMarketsContract with txId: ${res.txId}`);
};
//setMarketsContract();

const setStoreContract = async () => {
  const res = await scApi.setStoreContract();
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
