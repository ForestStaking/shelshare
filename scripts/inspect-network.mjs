import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';
import { Ed25519Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

const client = new ShelbyNodeClient({ network: 'shelbynet', apiKey: 'AG-H4JN1AJWW14V4YMKE2WUUWDK1KZRA8X1T' });

// Walk all properties to find the node URL
function findUrls(obj, depth = 0, path = '') {
  if (depth > 4 || !obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && (v.startsWith('http') || v.includes('aptos') || v.includes('shelby'))) {
      console.log(`${path}.${k} = ${v}`);
    } else if (typeof v === 'object' && v !== null) {
      findUrls(v, depth + 1, `${path}.${k}`);
    }
  }
}
findUrls(client, 0, 'client');
