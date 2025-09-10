/**
 * Quantum-Safe Cryptography Demonstration
 * 
 * This example shows how to use post-quantum cryptographic algorithms
 * that are resistant to attacks by quantum computers.
 */

import {
  LWECrypto,
  SPHINCSPlus,
  Dilithium,
  HybridCrypto
} from '../src/core/quantum-safe';

// Utility functions
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

console.log('═══════════════════════════════════════════════════════════');
console.log('           Quantum-Safe Cryptography Demonstration          ');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Learning With Errors (LWE) Encryption
console.log('1. LWE Encryption (Lattice-based)');
console.log('─'.repeat(60));

function demonstrateLWE() {
  const lwe = new LWECrypto();
  
  // Generate keys
  console.log('Generating LWE key pair...');
  const keyGenTime = measureTime(() => {
    var keyPair = lwe.generateKeyPair();
  });
  const keyPair = lwe.generateKeyPair();
  
  console.log(`✓ Key generation time: ${keyGenTime.toFixed(2)}ms`);
  console.log(`  Public key size: ${formatSize(keyPair.publicKey.length)}`);
  console.log(`  Private key size: ${formatSize(keyPair.privateKey.length)}`);
  
  // Encrypt message
  const message = 'Quantum computers cannot break this!';
  const plaintext = new TextEncoder().encode(message);
  
  console.log(`\nEncrypting: "${message}"`);
  let ciphertext: Uint8Array;
  const encryptTime = measureTime(() => {
    ciphertext = lwe.encrypt(plaintext, keyPair.publicKey);
  });
  ciphertext = lwe.encrypt(plaintext, keyPair.publicKey);
  
  console.log(`✓ Encryption time: ${encryptTime.toFixed(2)}ms`);
  console.log(`  Plaintext size: ${formatSize(plaintext.length)}`);
  console.log(`  Ciphertext size: ${formatSize(ciphertext.length)}`);
  console.log(`  Expansion ratio: ${(ciphertext.length / plaintext.length).toFixed(1)}x`);
  
  // Decrypt message
  console.log('\nDecrypting...');
  let decrypted: Uint8Array;
  const decryptTime = measureTime(() => {
    decrypted = lwe.decrypt(ciphertext, keyPair.privateKey);
  });
  decrypted = lwe.decrypt(ciphertext, keyPair.privateKey);
  
  const decryptedMessage = new TextDecoder().decode(decrypted);
  console.log(`✓ Decryption time: ${decryptTime.toFixed(2)}ms`);
  console.log(`  Decrypted: "${decryptedMessage}"`);
  console.log(`  Match: ${message === decryptedMessage ? '✓' : '✗'}`);
  
  // Test wrong key
  console.log('\nTesting decryption with wrong key...');
  const wrongKeyPair = lwe.generateKeyPair();
  const wrongDecrypted = lwe.decrypt(ciphertext, wrongKeyPair.privateKey);
  const wrongMessage = new TextDecoder().decode(wrongDecrypted);
  console.log(`  Result: "${wrongMessage}"`);
  console.log(`  Match: ${message === wrongMessage ? '✗ SECURITY FAILURE' : '✓ Properly failed'}`);
}

demonstrateLWE();

// 2. SPHINCS+ Digital Signatures
console.log('\n\n2. SPHINCS+ Digital Signatures (Hash-based)');
console.log('─'.repeat(60));

function demonstrateSPHINCS() {
  const sphincs = new SPHINCSPlus();
  
  // Generate keys
  console.log('Generating SPHINCS+ key pair...');
  const keyGenTime = measureTime(() => {
    var keyPair = sphincs.generateKeyPair();
  });
  const keyPair = sphincs.generateKeyPair();
  
  console.log(`✓ Key generation time: ${keyGenTime.toFixed(2)}ms`);
  console.log(`  Public key size: ${formatSize(keyPair.publicKey.length)}`);
  console.log(`  Private key size: ${formatSize(keyPair.privateKey.length)}`);
  
  // Sign message
  const message = 'This signature is quantum-safe!';
  const messageBytes = new TextEncoder().encode(message);
  
  console.log(`\nSigning: "${message}"`);
  let signature: any;
  const signTime = measureTime(() => {
    signature = sphincs.sign(messageBytes, keyPair.privateKey);
  });
  signature = sphincs.sign(messageBytes, keyPair.privateKey);
  
  console.log(`✓ Signing time: ${signTime.toFixed(2)}ms`);
  console.log(`  Message size: ${formatSize(messageBytes.length)}`);
  console.log(`  Signature size: ${formatSize(signature.signature.length)}`);
  console.log(`  Signature (first 32 bytes): ${bytesToHex(signature.signature.slice(0, 32))}`);
  
  // Verify signature
  console.log('\nVerifying signature...');
  let isValid: boolean;
  const verifyTime = measureTime(() => {
    isValid = sphincs.verify(messageBytes, signature.signature, keyPair.publicKey);
  });
  isValid = sphincs.verify(messageBytes, signature.signature, keyPair.publicKey);
  
  console.log(`✓ Verification time: ${verifyTime.toFixed(2)}ms`);
  console.log(`  Signature valid: ${isValid ? '✓' : '✗'}`);
  
  // Test tampered message
  console.log('\nTesting with tampered message...');
  const tamperedMessage = new TextEncoder().encode('This signature was tampered!');
  const tamperedValid = sphincs.verify(tamperedMessage, signature.signature, keyPair.publicKey);
  console.log(`  Tampered message valid: ${tamperedValid ? '✗ SECURITY FAILURE' : '✓ Properly rejected'}`);
  
  // Test wrong public key
  console.log('\nTesting with wrong public key...');
  const wrongKeyPair = sphincs.generateKeyPair();
  const wrongKeyValid = sphincs.verify(messageBytes, signature.signature, wrongKeyPair.publicKey);
  console.log(`  Wrong key valid: ${wrongKeyValid ? '✗ SECURITY FAILURE' : '✓ Properly rejected'}`);
}

demonstrateSPHINCS();

// 3. Dilithium Digital Signatures
console.log('\n\n3. Dilithium Digital Signatures (Lattice-based)');
console.log('─'.repeat(60));

function demonstrateDilithium() {
  const dilithium = new Dilithium();
  
  // Generate keys
  console.log('Generating Dilithium key pair...');
  const keyGenTime = measureTime(() => {
    var keyPair = dilithium.generateKeyPair();
  });
  const keyPair = dilithium.generateKeyPair();
  
  console.log(`✓ Key generation time: ${keyGenTime.toFixed(2)}ms`);
  console.log(`  Public key size: ${formatSize(keyPair.publicKey.length)}`);
  console.log(`  Private key size: ${formatSize(keyPair.privateKey.length)}`);
  
  // Sign message
  const message = 'Dilithium: Fast and secure!';
  const messageBytes = new TextEncoder().encode(message);
  
  console.log(`\nSigning: "${message}"`);
  let signature: any;
  const signTime = measureTime(() => {
    signature = dilithium.sign(messageBytes, keyPair.privateKey);
  });
  signature = dilithium.sign(messageBytes, keyPair.privateKey);
  
  console.log(`✓ Signing time: ${signTime.toFixed(2)}ms`);
  console.log(`  Signature size: ${formatSize(signature.signature.length)}`);
  
  // Verify signature
  console.log('\nVerifying signature...');
  let isValid: boolean;
  const verifyTime = measureTime(() => {
    isValid = dilithium.verify(messageBytes, signature.signature, keyPair.publicKey);
  });
  isValid = dilithium.verify(messageBytes, signature.signature, keyPair.publicKey);
  
  console.log(`✓ Verification time: ${verifyTime.toFixed(2)}ms`);
  console.log(`  Signature valid: ${isValid ? '✓' : '✗'}`);
  
  // Compare with SPHINCS+
  console.log('\nPerformance comparison with SPHINCS+:');
  const sphincs = new SPHINCSPlus();
  const sphincsKeys = sphincs.generateKeyPair();
  
  const sphincsSignTime = measureTime(() => {
    sphincs.sign(messageBytes, sphincsKeys.privateKey);
  });
  
  console.log(`  Dilithium signing: ${signTime.toFixed(2)}ms`);
  console.log(`  SPHINCS+ signing: ${sphincsSignTime.toFixed(2)}ms`);
  console.log(`  Speedup: ${(sphincsSignTime / signTime).toFixed(1)}x faster`);
}

demonstrateDilithium();

// 4. Hybrid Cryptography
console.log('\n\n4. Hybrid Cryptography (Quantum + Classical)');
console.log('─'.repeat(60));

function demonstrateHybrid() {
  const hybrid = new HybridCrypto();
  
  // Generate hybrid keys
  console.log('Generating hybrid key pairs...');
  const keyGenTime = measureTime(() => {
    var keyPair = hybrid.generateKeyPair();
  });
  const keyPair = hybrid.generateKeyPair();
  
  console.log(`✓ Key generation time: ${keyGenTime.toFixed(2)}ms`);
  console.log(`  Quantum public key: ${formatSize(keyPair.quantumPublicKey.length)}`);
  console.log(`  Classical public key: ${formatSize(keyPair.classicalPublicKey.length)}`);
  
  // Encrypt with hybrid scheme
  const message = 'Protected by both quantum and classical crypto!';
  const plaintext = new TextEncoder().encode(message);
  
  console.log(`\nHybrid encrypting: "${message}"`);
  let ciphertext: any;
  const encryptTime = measureTime(() => {
    ciphertext = hybrid.encrypt(
      plaintext,
      keyPair.quantumPublicKey,
      keyPair.classicalPublicKey
    );
  });
  ciphertext = hybrid.encrypt(
    plaintext,
    keyPair.quantumPublicKey,
    keyPair.classicalPublicKey
  );
  
  console.log(`✓ Encryption time: ${encryptTime.toFixed(2)}ms`);
  console.log(`  Ciphertext components:`);
  console.log(`    - Quantum part: ${formatSize(ciphertext.quantumCiphertext.length)}`);
  console.log(`    - Classical part: ${formatSize(ciphertext.classicalCiphertext.length)}`);
  console.log(`    - Encrypted data: ${formatSize(ciphertext.encryptedData.length)}`);
  
  // Decrypt with hybrid scheme
  console.log('\nHybrid decrypting...');
  let decrypted: Uint8Array;
  const decryptTime = measureTime(() => {
    decrypted = hybrid.decrypt(
      ciphertext,
      keyPair.quantumPrivateKey,
      keyPair.classicalPrivateKey
    );
  });
  decrypted = hybrid.decrypt(
    ciphertext,
    keyPair.quantumPrivateKey,
    keyPair.classicalPrivateKey
  );
  
  const decryptedMessage = new TextDecoder().decode(decrypted);
  console.log(`✓ Decryption time: ${decryptTime.toFixed(2)}ms`);
  console.log(`  Decrypted: "${decryptedMessage}"`);
  console.log(`  Match: ${message === decryptedMessage ? '✓' : '✗'}`);
  
  // Test resilience
  console.log('\nTesting resilience (quantum key compromised)...');
  const wrongQuantumKey = hybrid.generateKeyPair().quantumPrivateKey;
  try {
    const resilientDecrypted = hybrid.decrypt(
      ciphertext,
      wrongQuantumKey,
      keyPair.classicalPrivateKey
    );
    const resilientMessage = new TextDecoder().decode(resilientDecrypted);
    console.log(`  Classical fallback: ${message === resilientMessage ? '✓ Still works!' : '✗ Failed'}`);
  } catch (error) {
    console.log('  Classical fallback: ✗ Failed to decrypt');
  }
  
  // Sign with hybrid scheme
  console.log('\nHybrid signing...');
  let hybridSignature: any;
  const hybridSignTime = measureTime(() => {
    hybridSignature = hybrid.sign(
      plaintext,
      keyPair.quantumPrivateKey,
      keyPair.classicalPrivateKey
    );
  });
  hybridSignature = hybrid.sign(
    plaintext,
    keyPair.quantumPrivateKey,
    keyPair.classicalPrivateKey
  );
  
  console.log(`✓ Signing time: ${hybridSignTime.toFixed(2)}ms`);
  console.log(`  Signature components:`);
  console.log(`    - Quantum signature: ${formatSize(hybridSignature.quantumSignature.length)}`);
  console.log(`    - Classical signature: ${formatSize(hybridSignature.classicalSignature.length)}`);
  
  // Verify hybrid signature
  console.log('\nVerifying hybrid signature...');
  let hybridValid: boolean;
  const hybridVerifyTime = measureTime(() => {
    hybridValid = hybrid.verify(
      plaintext,
      hybridSignature,
      keyPair.quantumPublicKey,
      keyPair.classicalPublicKey
    );
  });
  hybridValid = hybrid.verify(
    plaintext,
    hybridSignature,
    keyPair.quantumPublicKey,
    keyPair.classicalPublicKey
  );
  
  console.log(`✓ Verification time: ${hybridVerifyTime.toFixed(2)}ms`);
  console.log(`  Signature valid: ${hybridValid ? '✓' : '✗'}`);
}

demonstrateHybrid();

// 5. Security Comparison
console.log('\n\n5. Security Comparison');
console.log('─'.repeat(60));

function compareAlgorithms() {
  console.log('Algorithm Security Levels:\n');
  
  console.log('┌─────────────────┬──────────────┬─────────────────┬───────────────┐');
  console.log('│ Algorithm       │ Type         │ Security Basis  │ NIST Level    │');
  console.log('├─────────────────┼──────────────┼─────────────────┼───────────────┤');
  console.log('│ LWE             │ Encryption   │ Lattice         │ 1-5           │');
  console.log('│ SPHINCS+        │ Signature    │ Hash            │ 1-5           │');
  console.log('│ Dilithium       │ Signature    │ Module-Lattice  │ 2,3,5         │');
  console.log('│ Hybrid          │ Both         │ Multiple        │ Highest       │');
  console.log('└─────────────────┴──────────────┴─────────────────┴───────────────┘');
  
  console.log('\nKey and Signature Sizes:\n');
  
  const lwe = new LWECrypto();
  const sphincs = new SPHINCSPlus();
  const dilithium = new Dilithium();
  
  const lweKeys = lwe.generateKeyPair();
  const sphincsKeys = sphincs.generateKeyPair();
  const dilithiumKeys = dilithium.generateKeyPair();
  
  const testMessage = new Uint8Array(32);
  const sphincsSig = sphincs.sign(testMessage, sphincsKeys.privateKey);
  const dilithiumSig = dilithium.sign(testMessage, dilithiumKeys.privateKey);
  
  console.log('┌─────────────────┬──────────────┬───────────────┬────────────────┐');
  console.log('│ Algorithm       │ Public Key   │ Private Key   │ Signature      │');
  console.log('├─────────────────┼──────────────┼───────────────┼────────────────┤');
  console.log(`│ LWE             │ ${formatSize(lweKeys.publicKey.length).padEnd(12)} │ ${formatSize(lweKeys.privateKey.length).padEnd(13)} │ N/A            │`);
  console.log(`│ SPHINCS+        │ ${formatSize(sphincsKeys.publicKey.length).padEnd(12)} │ ${formatSize(sphincsKeys.privateKey.length).padEnd(13)} │ ${formatSize(sphincsSig.signature.length).padEnd(14)} │`);
  console.log(`│ Dilithium       │ ${formatSize(dilithiumKeys.publicKey.length).padEnd(12)} │ ${formatSize(dilithiumKeys.privateKey.length).padEnd(13)} │ ${formatSize(dilithiumSig.signature.length).padEnd(14)} │`);
  console.log('└─────────────────┴──────────────┴───────────────┴────────────────┘');
}

compareAlgorithms();

// 6. Performance Benchmarks
console.log('\n\n6. Performance Benchmarks');
console.log('─'.repeat(60));

function runBenchmarks() {
  console.log('Running performance benchmarks (10 iterations)...\n');
  
  const iterations = 10;
  const testData = new Uint8Array(1024); // 1KB test data
  testData.fill(42);
  
  // LWE benchmarks
  console.log('LWE Encryption:');
  const lwe = new LWECrypto();
  const lweKeys = lwe.generateKeyPair();
  
  const lweEncryptTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      lwe.encrypt(testData, lweKeys.publicKey);
    }
  }) / iterations;
  
  const ciphertext = lwe.encrypt(testData, lweKeys.publicKey);
  const lweDecryptTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      lwe.decrypt(ciphertext, lweKeys.privateKey);
    }
  }) / iterations;
  
  console.log(`  Encrypt: ${lweEncryptTime.toFixed(2)}ms per KB`);
  console.log(`  Decrypt: ${lweDecryptTime.toFixed(2)}ms per KB`);
  
  // SPHINCS+ benchmarks
  console.log('\nSPHINCS+ Signatures:');
  const sphincs = new SPHINCSPlus();
  const sphincsKeys = sphincs.generateKeyPair();
  
  const sphincsSignTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      sphincs.sign(testData, sphincsKeys.privateKey);
    }
  }) / iterations;
  
  const sphincsSig = sphincs.sign(testData, sphincsKeys.privateKey);
  const sphincsVerifyTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      sphincs.verify(testData, sphincsSig.signature, sphincsKeys.publicKey);
    }
  }) / iterations;
  
  console.log(`  Sign: ${sphincsSignTime.toFixed(2)}ms`);
  console.log(`  Verify: ${sphincsVerifyTime.toFixed(2)}ms`);
  
  // Dilithium benchmarks
  console.log('\nDilithium Signatures:');
  const dilithium = new Dilithium();
  const dilithiumKeys = dilithium.generateKeyPair();
  
  const dilithiumSignTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      dilithium.sign(testData, dilithiumKeys.privateKey);
    }
  }) / iterations;
  
  const dilithiumSig = dilithium.sign(testData, dilithiumKeys.privateKey);
  const dilithiumVerifyTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      dilithium.verify(testData, dilithiumSig.signature, dilithiumKeys.publicKey);
    }
  }) / iterations;
  
  console.log(`  Sign: ${dilithiumSignTime.toFixed(2)}ms`);
  console.log(`  Verify: ${dilithiumVerifyTime.toFixed(2)}ms`);
  
  // Performance comparison
  console.log('\nSignature Performance Comparison:');
  const speedup = sphincsSignTime / dilithiumSignTime;
  console.log(`  Dilithium is ${speedup.toFixed(1)}x faster than SPHINCS+ for signing`);
}

runBenchmarks();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('         Quantum-Safe Cryptography Demo Complete!           ');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Key Takeaways:');
console.log('• LWE provides quantum-safe encryption but with large ciphertext expansion');
console.log('• SPHINCS+ offers hash-based signatures with strong security guarantees');
console.log('• Dilithium provides faster signatures with reasonable sizes');
console.log('• Hybrid schemes combine quantum and classical crypto for defense in depth');
console.log('• All algorithms are designed to resist attacks from quantum computers');

export {};
