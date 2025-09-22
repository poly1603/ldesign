import { LWECrypto } from './src/core/quantum-safe.ts';

console.log('Testing LWE wrong key detection...');

const lwe = new LWECrypto();

try {
  console.log('\n=== Step 1: Generate key pairs ===');
  const correctKeyPair = lwe.generateKeyPair();
  const wrongKeyPair = lwe.generateKeyPair();
  
  console.log('Correct public key length:', correctKeyPair.publicKey.length);
  console.log('Correct private key length:', correctKeyPair.privateKey.length);
  console.log('Wrong private key length:', wrongKeyPair.privateKey.length);
  
  console.log('\n=== Step 2: Encrypt with correct key ===');
  const data = new Uint8Array([42, 123, 200]);
  console.log('Original data:', Array.from(data));
  
  const ciphertext = lwe.encrypt(data, correctKeyPair.publicKey);
  console.log('Ciphertext length:', ciphertext.length);
  
  console.log('\n=== Step 3: Decrypt with correct key ===');
  const correctDecrypted = lwe.decrypt(ciphertext, correctKeyPair.privateKey);
  console.log('Correct decrypted:', Array.from(correctDecrypted));
  console.log('Matches original:', correctDecrypted.every((val, idx) => val === data[idx]));
  
  console.log('\n=== Step 4: Decrypt with wrong key ===');
  try {
    const wrongDecrypted = lwe.decrypt(ciphertext, wrongKeyPair.privateKey);
    console.log('Wrong decrypted:', Array.from(wrongDecrypted));
    console.log('Matches original:', wrongDecrypted.every((val, idx) => val === data[idx]));
    console.log('❌ PROBLEM: Wrong key decryption succeeded!');
  } catch (error) {
    console.log('✅ GOOD: Wrong key decryption failed with error:', error.message);
  }
  
  console.log('\n=== Step 5: Test multiple times ===');
  let successCount = 0;
  let errorCount = 0;
  let differentResultCount = 0;
  
  for (let i = 0; i < 10; i++) {
    try {
      const wrongDecrypted = lwe.decrypt(ciphertext, wrongKeyPair.privateKey);
      if (wrongDecrypted.every((val, idx) => val === data[idx])) {
        successCount++;
      } else {
        differentResultCount++;
      }
    } catch (error) {
      errorCount++;
    }
  }
  
  console.log(`Results after 10 attempts:`);
  console.log(`- Successful (same result): ${successCount}`);
  console.log(`- Different result: ${differentResultCount}`);
  console.log(`- Errors: ${errorCount}`);
  
} catch (error) {
  console.error('Error:', error);
}
