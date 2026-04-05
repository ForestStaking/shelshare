import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';
import { Ed25519Account, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const NETWORK = process.env.SHELBY_NETWORK ?? 'testnet';
const API_KEY  = process.env.SHELBY_API_KEY  ?? 'AG-BJEKGE7HXZQ3XAEQ1ZSXXUBG4NEDK6DE8';
const PRIV_KEY = process.env.SHELBY_ACCOUNT_PRIVATE_KEY ?? 'ed25519-priv-0x914cc008bb4648ee5683fba9084d444d0f1ab500b5f2426ef8cb59f6e43b70de';

const sdkNetwork = NETWORK === 'testnet' ? Network.TESTNET : Network.SHELBYNET;

const client = new ShelbyNodeClient({ network: sdkNetwork, apiKey: API_KEY });

const pk      = new Ed25519PrivateKey(PRIV_KEY);
const account = new Ed25519Account({ privateKey: pk });

console.log('Network   :', NETWORK);
console.log('Deployer  :', account.accountAddress.toString());

// Fund account on testnet if needed
if (NETWORK === 'testnet') {
  try {
    console.log('Funding account on Aptos testnet faucet…');
    await client.aptos.fundAccount({ accountAddress: account.accountAddress, amount: 100_000_000 });
    console.log('Funded.');
  } catch (e) {
    console.warn('Fund skipped (may already be funded):', e.message);
  }
}

const bal = await client.aptos.getAccountAPTAmount({ accountAddress: account.accountAddress });
console.log('Balance   :', bal / 1e8, 'APT');

// Read compiled bytecode
const metadataBytes  = readFileSync(join(__dirname, '../contracts/sealed/build/sealed/package-metadata.bcs'));
const moduleBytecode = readFileSync(join(__dirname, '../contracts/sealed/build/sealed/bytecode_modules/sealed_files.mv'));

console.log('Bytecode  :', moduleBytecode.length, 'bytes');

try {
  const txn = await client.aptos.publishPackageTransaction({
    account: account.accountAddress,
    metadataBytes,
    moduleBytecode: [moduleBytecode],
  });

  const committed = await client.aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
  const result    = await client.aptos.waitForTransaction({ transactionHash: committed.hash });

  console.log('\n✓ Deployed!');
  console.log('Tx hash   :', committed.hash);
  console.log('Success   :', result.success);
  console.log('Contract  :', account.accountAddress.toString());
  console.log('\nSet in Vercel:');
  console.log(`  NEXT_PUBLIC_SEALED_CONTRACT=${account.accountAddress.toString()}`);
} catch (e) {
  console.error('Deploy error:', e.message);
}
