// Use import for ES modules
import { CSPRNG } from './dist/index.mjs';

console.log('Testing CSPRNG...');

const csprng = new CSPRNG({
  entropySource: 'fallback',
  seedLength: 32,
  useHardwareRNG: false,
  collectEntropy: false,
  reseedInterval: 10000,
});

console.log('Generated random bytes:');
for (let i = 0; i < 5; i++) {
  const bytes = csprng.randomBytes(8);
  console.log(`Attempt ${i + 1}:`, Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
}

console.log('\nGenerated random integers:');
for (let i = 0; i < 5; i++) {
  const int = csprng.randomInt(0, 1000);
  console.log(`Attempt ${i + 1}:`, int);
}
