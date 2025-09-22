import { aes } from './src/algorithms/aes.ts';

console.log('Testing corrupted data handling...');

const testData = 'Hello, Integration!';
const testKey = 'my-secret-key-256-bits-long';

try {
  console.log('\n=== Step 1: Normal encryption ===');
  const encrypted = aes.encrypt(testData, testKey, { keySize: 256 });
  console.log('Encrypted:', JSON.stringify(encrypted, null, 2));
  
  if (!encrypted.success) {
    console.log('❌ Encryption failed');
    process.exit(1);
  }
  
  console.log('\n=== Step 2: Normal decryption ===');
  const normalDecrypted = aes.decrypt(encrypted.data, testKey, {
    keySize: 256,
    iv: encrypted.iv
  });
  console.log('Normal decrypted:', JSON.stringify(normalDecrypted, null, 2));
  
  console.log('\n=== Step 3: Corrupt the data ===');
  const corruptedData = `${encrypted.data.substring(0, encrypted.data.length - 5)}XXXXX`;
  console.log('Original data length:', encrypted.data.length);
  console.log('Corrupted data length:', corruptedData.length);
  console.log('Original data (last 10 chars):', encrypted.data.slice(-10));
  console.log('Corrupted data (last 10 chars):', corruptedData.slice(-10));
  
  console.log('\n=== Step 4: Try to decrypt corrupted data ===');
  const corruptedDecrypted = aes.decrypt(corruptedData, testKey, {
    keySize: 256,
    iv: encrypted.iv
  });
  console.log('Corrupted decrypted:', JSON.stringify(corruptedDecrypted, null, 2));
  
  if (corruptedDecrypted.success) {
    console.log('❌ PROBLEM: Corrupted data decryption succeeded when it should have failed!');
    console.log('Decrypted text:', JSON.stringify(corruptedDecrypted.data));
    console.log('Is it the same as original?', corruptedDecrypted.data === testData);
  } else {
    console.log('✅ GOOD: Corrupted data decryption failed as expected');
  }
  
} catch (error) {
  console.error('Error:', error);
}
