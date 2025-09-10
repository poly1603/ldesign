/**
 * Modern Ciphers Demo
 * Demonstrates usage of ChaCha20-Poly1305, XSalsa20, and BLAKE2b
 */

import {
  ChaCha20,
  Poly1305,
  ChaCha20Poly1305,
  XSalsa20,
  BLAKE2b,
  ModernCipherUtils
} from '../src/core/modern-ciphers';

// Utility function to convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Utility function to measure performance
async function measureTime(name: string, fn: () => void | Promise<void>): Promise<void> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  console.log(`  ⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
}

async function demonstrateChaCha20() {
  console.log('\n🔐 ChaCha20 Stream Cipher Demo\n');
  console.log('=' .repeat(50));
  
  const key = ModernCipherUtils.generateKey('chacha20');
  const nonce = ModernCipherUtils.generateNonce('chacha20');
  const plaintext = 'ChaCha20 is a high-speed stream cipher designed by Daniel J. Bernstein.';
  
  console.log('📝 Original message:', plaintext);
  console.log('🔑 Key (hex):', bytesToHex(key).substring(0, 32) + '...');
  console.log('🎲 Nonce (hex):', bytesToHex(nonce));
  
  const data = new TextEncoder().encode(plaintext);
  
  // Encrypt
  const cipher = new ChaCha20(key, nonce);
  const ciphertext = cipher.encrypt(data);
  console.log('🔒 Encrypted (hex):', bytesToHex(ciphertext).substring(0, 64) + '...');
  
  // Decrypt
  const decipher = new ChaCha20(key, nonce);
  const decrypted = decipher.decrypt(ciphertext);
  console.log('🔓 Decrypted:', new TextDecoder().decode(decrypted));
  
  // Performance test
  console.log('\n📊 Performance (1MB data):');
  const largeData = new Uint8Array(1024 * 1024);
  await measureTime('ChaCha20 encryption', () => {
    const c = new ChaCha20(key, nonce);
    c.encrypt(largeData);
  });
}

async function demonstratePoly1305() {
  console.log('\n🔐 Poly1305 MAC Demo\n');
  console.log('=' .repeat(50));
  
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  const message = 'Poly1305 is a cryptographic message authentication code (MAC) created by Daniel J. Bernstein.';
  
  console.log('📝 Message:', message);
  console.log('🔑 Key (hex):', bytesToHex(key).substring(0, 32) + '...');
  
  const data = new TextEncoder().encode(message);
  
  // Generate MAC
  const tag = Poly1305.auth(data, key);
  console.log('🏷️  MAC tag (hex):', bytesToHex(tag));
  console.log('📏 Tag length:', tag.length, 'bytes');
  
  // Verify MAC
  const isValid = Poly1305.verify(tag, tag);
  console.log('✅ Verification:', isValid ? 'PASS' : 'FAIL');
  
  // Tamper with message and verify again
  const tamperedData = new TextEncoder().encode(message + '!');
  const tamperedTag = Poly1305.auth(tamperedData, key);
  const isTampered = Poly1305.verify(tag, tamperedTag);
  console.log('❌ Tampered verification:', isTampered ? 'FAIL (should not match!)' : 'PASS (correctly rejected)');
  
  // Incremental updates
  console.log('\n📦 Incremental MAC computation:');
  const part1 = new TextEncoder().encode('First part. ');
  const part2 = new TextEncoder().encode('Second part.');
  
  const poly = new Poly1305(key);
  poly.update(part1);
  poly.update(part2);
  const incrementalTag = poly.finish();
  
  const combined = new Uint8Array(part1.length + part2.length);
  combined.set(part1);
  combined.set(part2, part1.length);
  const directTag = Poly1305.auth(combined, key);
  
  console.log('  Incremental == Direct:', bytesToHex(incrementalTag) === bytesToHex(directTag) ? '✅ Match' : '❌ Mismatch');
}

async function demonstrateChaCha20Poly1305() {
  console.log('\n🔐 ChaCha20-Poly1305 AEAD Demo\n');
  console.log('=' .repeat(50));
  
  const key = ModernCipherUtils.generateKey('chacha20');
  const plaintext = 'ChaCha20-Poly1305 is an AEAD cipher combining ChaCha20 and Poly1305.';
  const additionalData = 'metadata-123';
  
  console.log('📝 Plaintext:', plaintext);
  console.log('📎 Additional data:', additionalData);
  console.log('🔑 Key (hex):', bytesToHex(key).substring(0, 32) + '...');
  
  // Encrypt with AEAD
  const encrypted = ModernCipherUtils.encryptAEAD(plaintext, key, additionalData);
  
  console.log('🎲 Nonce (hex):', bytesToHex(encrypted.nonce));
  console.log('🔒 Ciphertext (hex):', bytesToHex(encrypted.ciphertext).substring(0, 64) + '...');
  console.log('🏷️  Auth tag (hex):', bytesToHex(encrypted.tag));
  
  // Decrypt with correct AAD
  const decrypted = ModernCipherUtils.decryptAEAD(
    encrypted.ciphertext,
    encrypted.tag,
    key,
    encrypted.nonce,
    additionalData
  );
  
  if (decrypted) {
    console.log('✅ Decrypted successfully:', new TextDecoder().decode(decrypted));
  } else {
    console.log('❌ Decryption failed!');
  }
  
  // Try with wrong AAD
  const wrongDecrypted = ModernCipherUtils.decryptAEAD(
    encrypted.ciphertext,
    encrypted.tag,
    key,
    encrypted.nonce,
    'wrong-metadata'
  );
  
  console.log('🚫 Wrong AAD result:', wrongDecrypted ? 'FAIL (should be null!)' : 'Correctly rejected');
  
  // Performance comparison
  console.log('\n📊 Performance comparison (1MB data):');
  const largeData = new Uint8Array(1024 * 1024);
  const nonce = ModernCipherUtils.generateNonce('chacha20');
  
  await measureTime('ChaCha20-Poly1305 encrypt', () => {
    const cipher = new ChaCha20Poly1305();
    cipher.encrypt(largeData, key, nonce);
  });
}

async function demonstrateXSalsa20() {
  console.log('\n🔐 XSalsa20 Stream Cipher Demo\n');
  console.log('=' .repeat(50));
  
  const key = ModernCipherUtils.generateKey('xsalsa20');
  const nonce = ModernCipherUtils.generateNonce('xsalsa20');
  const plaintext = 'XSalsa20 extends Salsa20 with a 192-bit nonce for better security.';
  
  console.log('📝 Original message:', plaintext);
  console.log('🔑 Key (hex):', bytesToHex(key).substring(0, 32) + '...');
  console.log('🎲 Nonce (hex):', bytesToHex(nonce).substring(0, 48) + '...');
  console.log('   Nonce size:', nonce.length, 'bytes (extended!)');
  
  const data = new TextEncoder().encode(plaintext);
  
  // Encrypt
  const cipher = new XSalsa20(key, nonce);
  const ciphertext = cipher.encrypt(data);
  console.log('🔒 Encrypted (hex):', bytesToHex(ciphertext).substring(0, 64) + '...');
  
  // Decrypt
  const decipher = new XSalsa20(key, nonce);
  const decrypted = decipher.decrypt(ciphertext);
  console.log('🔓 Decrypted:', new TextDecoder().decode(decrypted));
  
  // Compare with ChaCha20
  console.log('\n📊 XSalsa20 vs ChaCha20 comparison:');
  console.log('  XSalsa20 nonce: 192 bits (24 bytes)');
  console.log('  ChaCha20 nonce: 96 bits (12 bytes)');
  console.log('  Both use 256-bit keys');
}

async function demonstrateBLAKE2b() {
  console.log('\n🔐 BLAKE2b Hash Function Demo\n');
  console.log('=' .repeat(50));
  
  const message = 'BLAKE2b is a cryptographic hash function faster than SHA-2 and SHA-3.';
  
  console.log('📝 Message:', message);
  
  // Basic hashing
  const data = new TextEncoder().encode(message);
  const hash64 = BLAKE2b.hash(data);
  console.log('🔨 Hash (64 bytes):', bytesToHex(hash64));
  
  // Variable output length
  const hash32 = BLAKE2b.hash(data, 32);
  const hash16 = BLAKE2b.hash(data, 16);
  console.log('🔨 Hash (32 bytes):', bytesToHex(hash32));
  console.log('🔨 Hash (16 bytes):', bytesToHex(hash16));
  
  // Keyed hashing (MAC)
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  const mac = BLAKE2b.hash(data, 32, key);
  console.log('\n🔑 Keyed hash (MAC):');
  console.log('   Key (hex):', bytesToHex(key).substring(0, 32) + '...');
  console.log('   MAC (hex):', bytesToHex(mac));
  
  // Incremental hashing
  console.log('\n📦 Incremental hashing:');
  const blake = new BLAKE2b(32);
  blake.update(new TextEncoder().encode('Part 1 '));
  blake.update(new TextEncoder().encode('Part 2 '));
  blake.update(new TextEncoder().encode('Part 3'));
  const incrementalHash = blake.digest();
  
  const fullData = new TextEncoder().encode('Part 1 Part 2 Part 3');
  const directHash = BLAKE2b.hash(fullData, 32);
  
  console.log('  Incremental hash:', bytesToHex(incrementalHash));
  console.log('  Direct hash:     ', bytesToHex(directHash));
  console.log('  Match:', bytesToHex(incrementalHash) === bytesToHex(directHash) ? '✅' : '❌');
  
  // Performance comparison with SHA-256
  console.log('\n📊 Performance (10MB data):');
  const largeData = new Uint8Array(10 * 1024 * 1024);
  
  await measureTime('BLAKE2b (512-bit)', () => {
    BLAKE2b.hash(largeData, 64);
  });
  
  await measureTime('BLAKE2b (256-bit)', () => {
    BLAKE2b.hash(largeData, 32);
  });
  
  // Using utilities
  console.log('\n🛠️  Using ModernCipherUtils:');
  const utilHash = ModernCipherUtils.blake2bHash(message, 32);
  console.log('  Hash:', bytesToHex(utilHash));
  
  const utilMAC = ModernCipherUtils.blake2bMAC(message, key, 32);
  console.log('  MAC:', bytesToHex(utilMAC));
}

async function demonstrateSecureMessaging() {
  console.log('\n🔐 Secure Messaging System Demo\n');
  console.log('=' .repeat(50));
  
  // Simulate two parties: Alice and Bob
  console.log('👤 Alice and Bob want to exchange secure messages\n');
  
  // Generate shared key (in practice, use key exchange like ECDH)
  const sharedKey = ModernCipherUtils.generateKey('chacha20');
  console.log('🔑 Shared key established (hex):', bytesToHex(sharedKey).substring(0, 32) + '...');
  
  // Alice sends a message to Bob
  const aliceMessage = 'Meet me at the secret location at midnight 🌙';
  const metadata = JSON.stringify({
    from: 'Alice',
    to: 'Bob',
    timestamp: Date.now(),
    messageId: crypto.randomUUID()
  });
  
  console.log('\n📤 Alice sends:');
  console.log('  Message:', aliceMessage);
  console.log('  Metadata:', metadata);
  
  // Encrypt message with ChaCha20-Poly1305
  const encrypted = ModernCipherUtils.encryptAEAD(aliceMessage, sharedKey, metadata);
  
  console.log('\n📦 Wire format:');
  console.log('  Nonce:', bytesToHex(encrypted.nonce));
  console.log('  Ciphertext:', bytesToHex(encrypted.ciphertext));
  console.log('  Tag:', bytesToHex(encrypted.tag));
  
  // Bob receives and decrypts
  console.log('\n📥 Bob receives and verifies:');
  
  const decrypted = ModernCipherUtils.decryptAEAD(
    encrypted.ciphertext,
    encrypted.tag,
    sharedKey,
    encrypted.nonce,
    metadata
  );
  
  if (decrypted) {
    console.log('  ✅ Authentication passed');
    console.log('  📖 Decrypted message:', new TextDecoder().decode(decrypted));
    
    const meta = JSON.parse(metadata);
    console.log('  👤 From:', meta.from);
    console.log('  ⏰ Time:', new Date(meta.timestamp).toLocaleString());
  } else {
    console.log('  ❌ Authentication failed!');
  }
  
  // Demonstrate tamper detection
  console.log('\n🚨 Tamper detection demo:');
  
  // Attacker modifies ciphertext
  const tamperedCiphertext = new Uint8Array(encrypted.ciphertext);
  tamperedCiphertext[0] ^= 0xff;
  
  const tamperedResult = ModernCipherUtils.decryptAEAD(
    tamperedCiphertext,
    encrypted.tag,
    sharedKey,
    encrypted.nonce,
    metadata
  );
  
  console.log('  Tampered ciphertext result:', tamperedResult ? 'COMPROMISED!' : '✅ Tampering detected');
  
  // Attacker modifies metadata
  const modifiedMetadata = JSON.stringify({
    from: 'Eve',  // Attacker tries to impersonate
    to: 'Bob',
    timestamp: Date.now(),
    messageId: crypto.randomUUID()
  });
  
  const metadataResult = ModernCipherUtils.decryptAEAD(
    encrypted.ciphertext,
    encrypted.tag,
    sharedKey,
    encrypted.nonce,
    modifiedMetadata
  );
  
  console.log('  Modified metadata result:', metadataResult ? 'COMPROMISED!' : '✅ Metadata tampering detected');
}

async function demonstratePasswordHashing() {
  console.log('\n🔐 Password Hashing with BLAKE2b Demo\n');
  console.log('=' .repeat(50));
  
  const password = 'MySecurePassword123!';
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  
  console.log('🔑 Password:', password);
  console.log('🧂 Salt (hex):', bytesToHex(salt));
  
  // Combine password and salt
  const passwordBytes = new TextEncoder().encode(password);
  const combined = new Uint8Array(passwordBytes.length + salt.length);
  combined.set(passwordBytes);
  combined.set(salt, passwordBytes.length);
  
  // Hash with BLAKE2b
  const passwordHash = BLAKE2b.hash(combined, 32);
  console.log('🔨 Password hash:', bytesToHex(passwordHash));
  
  // Verify password
  console.log('\n✅ Password verification:');
  
  const attemptCorrect = 'MySecurePassword123!';
  const attemptWrong = 'WrongPassword';
  
  // Verify correct password
  const correctBytes = new TextEncoder().encode(attemptCorrect);
  const correctCombined = new Uint8Array(correctBytes.length + salt.length);
  correctCombined.set(correctBytes);
  correctCombined.set(salt, correctBytes.length);
  const correctHash = BLAKE2b.hash(correctCombined, 32);
  
  console.log('  Correct password:', bytesToHex(correctHash) === bytesToHex(passwordHash) ? '✅ Match' : '❌ No match');
  
  // Verify wrong password
  const wrongBytes = new TextEncoder().encode(attemptWrong);
  const wrongCombined = new Uint8Array(wrongBytes.length + salt.length);
  wrongCombined.set(wrongBytes);
  wrongCombined.set(salt, wrongBytes.length);
  const wrongHash = BLAKE2b.hash(wrongCombined, 32);
  
  console.log('  Wrong password:', bytesToHex(wrongHash) === bytesToHex(passwordHash) ? '❌ Match (should not!)' : '✅ No match');
  
  // Using keyed mode for additional security
  console.log('\n🔐 Keyed password hashing:');
  const serverKey = new Uint8Array(32);
  crypto.getRandomValues(serverKey);
  
  const keyedHash = BLAKE2b.hash(combined, 32, serverKey);
  console.log('  Server key (hex):', bytesToHex(serverKey).substring(0, 32) + '...');
  console.log('  Keyed hash:', bytesToHex(keyedHash));
  console.log('  💡 Benefit: Even if database is compromised, hashes cannot be verified without server key');
}

// Main demo runner
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     Modern Cryptographic Algorithms Demo       ║');
  console.log('║         ChaCha20, Poly1305, BLAKE2b           ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  try {
    await demonstrateChaCha20();
    await demonstratePoly1305();
    await demonstrateChaCha20Poly1305();
    await demonstrateXSalsa20();
    await demonstrateBLAKE2b();
    await demonstrateSecureMessaging();
    await demonstratePasswordHashing();
    
    console.log('\n');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║              Demo Completed! 🎉                ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('\n✨ All modern cipher demonstrations completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during demo:', error);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
