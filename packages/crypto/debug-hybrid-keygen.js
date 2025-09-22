import { HybridCrypto } from './src/core/quantum-safe.ts';

console.log('Testing HybridCrypto key generation...');

const hybrid = new HybridCrypto();

console.log('Creating hybrid instance...');

// Set a timeout to prevent infinite loop
const timeout = setTimeout(() => {
  console.log('❌ Key generation timed out after 5 seconds');
  process.exit(1);
}, 5000);

try {
  console.log('Generating key pair...');
  const keyPair = hybrid.generateKeyPair();
  
  clearTimeout(timeout);
  
  console.log('✅ Key generation successful!');
  console.log('Quantum public key length:', keyPair.quantumPublicKey.length);
  console.log('Quantum private key length:', keyPair.quantumPrivateKey.length);
  console.log('Classical public key length:', keyPair.classicalPublicKey.length);
  console.log('Classical private key length:', keyPair.classicalPrivateKey.length);
  
} catch (error) {
  clearTimeout(timeout);
  console.error('❌ Error during key generation:', error.message);
  console.error(error.stack);
}
