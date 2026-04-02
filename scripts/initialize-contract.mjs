import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';
import { Ed25519Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

const client = new ShelbyNodeClient({ network: 'shelbynet', apiKey: 'AG-H4JN1AJWW14V4YMKE2WUUWDK1KZRA8X1T' });
const pk = new Ed25519PrivateKey('ed25519-priv-0x914cc008bb4648ee5683fba9084d444d0f1ab500b5f2426ef8cb59f6e43b70de');
const account = new Ed25519Account({ privateKey: pk });

const txn = await client.aptos.transaction.build.simple({
  sender: account.accountAddress,
  data: {
    function: '0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283::sealed_files::initialize',
    functionArguments: [],
  },
});

const committed = await client.aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
const result = await client.aptos.waitForTransaction({ transactionHash: committed.hash });
console.log('Initialized! Tx:', committed.hash, '| Success:', result.success);
