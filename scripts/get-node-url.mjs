import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';

const client = new ShelbyNodeClient({ network: 'shelbynet', apiKey: 'AG-H4JN1AJWW14V4YMKE2WUUWDK1KZRA8X1T' });

// The Aptos SDK builds URLs via requestWithBCS - intercept a simple call to see the URL used
const origFetch = globalThis.fetch;
globalThis.fetch = (url, ...args) => {
  console.log('FETCH:', url);
  return origFetch(url, ...args);
};

try {
  await client.aptos.getLedgerInfo();
} catch(e) {}
