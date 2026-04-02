import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';

const client = new ShelbyNodeClient({ network: 'shelbynet', apiKey: 'AG-H4JN1AJWW14V4YMKE2WUUWDK1KZRA8X1T' });

// Get the aptos config full node url
const cfg = client.aptos.config;
console.log('Full config:', JSON.stringify({
  network: cfg.network,
  fullnode: cfg.fullnode,
  faucet: cfg.faucet,
  indexer: cfg.indexer,
  pepper: cfg.pepper,
  prover: cfg.prover,
}, null, 2));

// Try funding
try {
  const result = await client.aptos.fundAccount({
    accountAddress: '0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283',
    amount: 200_000_000
  });
  console.log('Fund result:', result);
} catch(e) {
  console.log('Fund error:', e.message);
}

// Check balance
try {
  const bal = await client.aptos.getAccountAPTAmount({ 
    accountAddress: '0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283'
  });
  console.log('Balance:', bal, 'octas');
} catch(e) {
  console.log('Balance error:', e.message);
}
