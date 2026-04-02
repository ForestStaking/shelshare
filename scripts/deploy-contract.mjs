import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';
import { Ed25519Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new ShelbyNodeClient({ 
  network: 'shelbynet', 
  apiKey: 'AG-H4JN1AJWW14V4YMKE2WUUWDK1KZRA8X1T' 
});

const pk = new Ed25519PrivateKey('ed25519-priv-0x914cc008bb4648ee5683fba9084d444d0f1ab500b5f2426ef8cb59f6e43b70de');
const account = new Ed25519Account({ privateKey: pk });

console.log('Deployer:', account.accountAddress.toString());

const bal = await client.aptos.getAccountAPTAmount({ accountAddress: account.accountAddress });
console.log('Balance:', bal / 1e8, 'APT');

// Read compiled bytecode
const bytecodeHex = readFileSync(
  join(__dirname, '../contracts/sealed/build/sealed/bytecode_modules/sealed_files.mv')
);

console.log('Bytecode size:', bytecodeHex.length, 'bytes');

// Publish module
try {
  const txn = await client.aptos.publishPackageTransaction({
    account: account.accountAddress,
    metadataBytes: readFileSync(
      join(__dirname, '../contracts/sealed/build/sealed/package-metadata.bcs')
    ),
    moduleBytecode: [bytecodeHex],
  });

  const committed = await client.aptos.signAndSubmitTransaction({
    signer: account,
    transaction: txn,
  });

  const result = await client.aptos.waitForTransaction({ transactionHash: committed.hash });
  console.log('Deployed! Tx:', committed.hash);
  console.log('Success:', result.success);
} catch(e) {
  console.error('Deploy error:', e.message);
}
