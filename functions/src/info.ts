import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const getInfo = () => {
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
  if (network === 'mainnet') {
    return {
      network: STACKS_MAINNET,
      stxAddr: 'SP1ARJX5XDEYWNDX8JEKGTZNZ0YJHQAYDWVNBRXGM',
      tokenContract: 'augur-token-v1',
      marketsContract: 'augur-markets-v1',
      enrollContract: 'augur-enroll-v1',
      storeContract: 'augur-store-v1',
      enrollBonus: 1000000000,
      bucket: 'augurrank-prod.firebasestorage.app',
    };
  }
  if (network === 'testnet') {
    return {
      network: STACKS_TESTNET,
      stxAddr: 'ST1ARJX5XDEYWNDX8JEKGTZNZ0YJHQAYDWRSAB44M',
      tokenContract: 'augur-token-t1',
      marketsContract: 'augur-markets-t1',
      enrollContract: 'augur-enroll-t1',
      storeContract: 'augur-store-t1',
      enrollBonus: 1000000000,
      bucket: 'augurrank-test.firebasestorage.app',
    };
  }

  throw new Error(`Invalid Stacks network: ${network}`);
};
