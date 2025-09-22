import { SPHINCSPlus } from './src/core/quantum-safe.ts';

console.log('Testing SPHINCS+ signature...');

const sphincs = new SPHINCSPlus({ h: 5 }); // Small tree for testing
const keyPair = sphincs.generateKeyPair();

console.log('Generated key pair:');
console.log('Public key length:', keyPair.publicKey.length);
console.log('Private key length:', keyPair.privateKey.length);

const message = new TextEncoder().encode('Test message');
console.log('Message:', message);

const signature = sphincs.sign(message, keyPair.privateKey);
console.log('Generated signature:');
console.log('Signature length:', signature.signature.length);
console.log('First 10 bytes:', Array.from(signature.signature.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));

const isValid = sphincs.verify(message, signature, keyPair.publicKey);
console.log('Signature valid:', isValid);

// Test with wrong message
const wrongMessage = new TextEncoder().encode('Wrong message');
const isValidWrong = sphincs.verify(wrongMessage, signature, keyPair.publicKey);
console.log('Wrong message valid:', isValidWrong);
