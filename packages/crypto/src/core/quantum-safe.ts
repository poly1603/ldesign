/**
 * Quantum-Safe Cryptography Implementation
 * Includes post-quantum algorithms resistant to quantum computer attacks
 */

import { CSPRNG } from './csprng';
import { BLAKE2b } from './modern-ciphers';
import { createHash } from 'crypto';

// Type definitions
export interface QuantumSafeKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface QuantumSafeSignature {
  signature: Uint8Array;
  publicKey?: Uint8Array;
}

export interface LatticeParams {
  n: number;      // Dimension
  q: number;      // Modulus
  sigma: number;  // Standard deviation for error distribution
}

export interface HashBasedParams {
  n: number;      // Security parameter (hash output size)
  w: number;      // Winternitz parameter
  h: number;      // Tree height
}

/**
 * Learning With Errors (LWE) based encryption
 * Simplified implementation for demonstration
 */
export class LWECrypto {
  private params: LatticeParams;
  private csprng: CSPRNG;

  constructor(params?: Partial<LatticeParams>) {
    this.params = {
      n: params?.n || 256,
      q: params?.q || 7681,
      sigma: params?.sigma || 2.8
    };
    this.csprng = new CSPRNG();
  }

  /**
   * Generate a random matrix A
   */
  private generateMatrix(rows: number, cols: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = this.csprng.randomInt(0, this.params.q - 1);
      }
    }
    return matrix;
  }

  /**
   * Sample from discrete Gaussian distribution
   */
  private sampleGaussian(): number {
    // Box-Muller transform for Gaussian sampling
    const u1 = this.csprng.randomFloat();
    const u2 = this.csprng.randomFloat();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.round(z * this.params.sigma);
  }

  /**
   * Generate error vector
   */
  private generateError(length: number): number[] {
    const error: number[] = [];
    for (let i = 0; i < length; i++) {
      error[i] = this.sampleGaussian();
    }
    return error;
  }

  /**
   * Matrix-vector multiplication mod q
   */
  private matrixVectorMult(matrix: number[][], vector: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result[i] = ((sum % this.params.q) + this.params.q) % this.params.q;
    }
    return result;
  }

  /**
   * Vector addition mod q
   */
  private vectorAdd(a: number[], b: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = ((a[i] + b[i]) % this.params.q + this.params.q) % this.params.q;
    }
    return result;
  }

  /**
   * Generate LWE key pair
   */
  generateKeyPair(): QuantumSafeKeyPair {
    const { n, q } = this.params;
    
    // Generate public matrix A
    const A = this.generateMatrix(n, n);
    
    // Generate secret key s
    const s: number[] = [];
    for (let i = 0; i < n; i++) {
      s[i] = this.csprng.randomInt(0, 1); // Binary secret
    }
    
    // Generate error e
    const e = this.generateError(n);
    
    // Compute public key b = As + e
    const As = this.matrixVectorMult(A, s);
    const b = this.vectorAdd(As, e);
    
    // Serialize keys
    const publicKey = new Uint8Array(n * n * 4 + n * 4);
    const privateKey = new Uint8Array(n * 4);
    
    let offset = 0;
    // Pack matrix A
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const value = A[i][j];
        publicKey[offset++] = value & 0xff;
        publicKey[offset++] = (value >> 8) & 0xff;
        publicKey[offset++] = (value >> 16) & 0xff;
        publicKey[offset++] = (value >> 24) & 0xff;
      }
    }
    
    // Pack vector b
    for (let i = 0; i < n; i++) {
      const value = b[i];
      publicKey[offset++] = value & 0xff;
      publicKey[offset++] = (value >> 8) & 0xff;
      publicKey[offset++] = (value >> 16) & 0xff;
      publicKey[offset++] = (value >> 24) & 0xff;
    }
    
    // Pack secret s
    for (let i = 0; i < n; i++) {
      const value = s[i];
      privateKey[i * 4] = value & 0xff;
      privateKey[i * 4 + 1] = (value >> 8) & 0xff;
      privateKey[i * 4 + 2] = (value >> 16) & 0xff;
      privateKey[i * 4 + 3] = (value >> 24) & 0xff;
    }
    
    return { publicKey, privateKey };
  }

  /**
   * Encrypt a message bit
   */
  encryptBit(bit: number, publicKey: Uint8Array): Uint8Array {
    const { n, q } = this.params;
    
    // Deserialize public key
    const A: number[][] = [];
    const b: number[] = [];
    
    let offset = 0;
    for (let i = 0; i < n; i++) {
      A[i] = [];
      for (let j = 0; j < n; j++) {
        A[i][j] = publicKey[offset] | 
                  (publicKey[offset + 1] << 8) |
                  (publicKey[offset + 2] << 16) |
                  (publicKey[offset + 3] << 24);
        offset += 4;
      }
    }
    
    for (let i = 0; i < n; i++) {
      b[i] = publicKey[offset] | 
             (publicKey[offset + 1] << 8) |
             (publicKey[offset + 2] << 16) |
             (publicKey[offset + 3] << 24);
      offset += 4;
    }
    
    // Generate random r
    const r: number[] = [];
    for (let i = 0; i < n; i++) {
      r[i] = this.csprng.randomInt(0, 1);
    }
    
    // Generate errors
    const e1 = this.generateError(n);
    const e2 = this.sampleGaussian();
    
    // Compute ciphertext
    // c1 = A^T * r + e1
    const AT: number[][] = [];
    for (let i = 0; i < n; i++) {
      AT[i] = [];
      for (let j = 0; j < n; j++) {
        AT[i][j] = A[j][i];
      }
    }
    const ATr = this.matrixVectorMult(AT, r);
    const c1 = this.vectorAdd(ATr, e1);
    
    // c2 = b^T * r + e2 + bit * floor(q/2)
    let bTr = 0;
    for (let i = 0; i < n; i++) {
      bTr += b[i] * r[i];
    }
    const c2 = ((bTr + e2 + bit * Math.floor(q / 2)) % q + q) % q;
    
    // Serialize ciphertext
    const ciphertext = new Uint8Array(n * 4 + 4);
    offset = 0;
    
    for (let i = 0; i < n; i++) {
      const value = c1[i];
      ciphertext[offset++] = value & 0xff;
      ciphertext[offset++] = (value >> 8) & 0xff;
      ciphertext[offset++] = (value >> 16) & 0xff;
      ciphertext[offset++] = (value >> 24) & 0xff;
    }
    
    ciphertext[offset++] = c2 & 0xff;
    ciphertext[offset++] = (c2 >> 8) & 0xff;
    ciphertext[offset++] = (c2 >> 16) & 0xff;
    ciphertext[offset++] = (c2 >> 24) & 0xff;
    
    return ciphertext;
  }

  /**
   * Decrypt a message bit
   */
  decryptBit(ciphertext: Uint8Array, privateKey: Uint8Array): number {
    const { n, q } = this.params;
    
    // Deserialize ciphertext
    const c1: number[] = [];
    let offset = 0;
    
    for (let i = 0; i < n; i++) {
      c1[i] = ciphertext[offset] | 
              (ciphertext[offset + 1] << 8) |
              (ciphertext[offset + 2] << 16) |
              (ciphertext[offset + 3] << 24);
      offset += 4;
    }
    
    const c2 = ciphertext[offset] | 
               (ciphertext[offset + 1] << 8) |
               (ciphertext[offset + 2] << 16) |
               (ciphertext[offset + 3] << 24);
    
    // Deserialize private key
    const s: number[] = [];
    for (let i = 0; i < n; i++) {
      s[i] = privateKey[i * 4] | 
             (privateKey[i * 4 + 1] << 8) |
             (privateKey[i * 4 + 2] << 16) |
             (privateKey[i * 4 + 3] << 24);
    }
    
    // Compute m' = c2 - s^T * c1
    let sTc1 = 0;
    for (let i = 0; i < n; i++) {
      sTc1 += s[i] * c1[i];
    }
    const mPrime = ((c2 - sTc1) % q + q) % q;
    
    // Decode bit
    const threshold = Math.floor(q / 4);
    if (mPrime < threshold || mPrime > q - threshold) {
      return 0;
    } else {
      return 1;
    }
  }

  /**
   * Encrypt bytes
   */
  encrypt(data: Uint8Array, publicKey: Uint8Array): Uint8Array {
    const bits: number[] = [];
    
    // Convert bytes to bits
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < 8; j++) {
        bits.push((data[i] >> j) & 1);
      }
    }
    
    // Encrypt each bit
    const encryptedBits: Uint8Array[] = [];
    for (const bit of bits) {
      encryptedBits.push(this.encryptBit(bit, publicKey));
    }
    
    // Concatenate encrypted bits
    const totalLength = encryptedBits.length * encryptedBits[0].length;
    const ciphertext = new Uint8Array(totalLength + 4);
    
    // Store original data length
    ciphertext[0] = data.length & 0xff;
    ciphertext[1] = (data.length >> 8) & 0xff;
    ciphertext[2] = (data.length >> 16) & 0xff;
    ciphertext[3] = (data.length >> 24) & 0xff;
    
    let offset = 4;
    for (const encBit of encryptedBits) {
      ciphertext.set(encBit, offset);
      offset += encBit.length;
    }
    
    return ciphertext;
  }

  /**
   * Decrypt bytes
   */
  decrypt(ciphertext: Uint8Array, privateKey: Uint8Array): Uint8Array {
    // Extract original data length
    const dataLength = ciphertext[0] | 
                      (ciphertext[1] << 8) |
                      (ciphertext[2] << 16) |
                      (ciphertext[3] << 24);
    
    const bitCiphertextSize = (this.params.n * 4 + 4);
    const bits: number[] = [];
    
    // Decrypt each bit
    let offset = 4;
    for (let i = 0; i < dataLength * 8; i++) {
      const bitCiphertext = ciphertext.slice(offset, offset + bitCiphertextSize);
      bits.push(this.decryptBit(bitCiphertext, privateKey));
      offset += bitCiphertextSize;
    }
    
    // Convert bits back to bytes
    const data = new Uint8Array(dataLength);
    for (let i = 0; i < dataLength; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte |= bits[i * 8 + j] << j;
      }
      data[i] = byte;
    }
    
    return data;
  }
}

/**
 * SPHINCS+ Hash-based signature scheme
 * Simplified implementation
 */
export class SPHINCSPlus {
  private params: HashBasedParams;
  private csprng: CSPRNG;

  constructor(params?: Partial<HashBasedParams>) {
    this.params = {
      n: params?.n || 32,  // 256-bit security
      w: params?.w || 16,   // Winternitz parameter
      h: params?.h || 10    // Tree height
    };
    this.csprng = new CSPRNG();
  }

  /**
   * Hash function wrapper
   */
  private hash(data: Uint8Array, outputLength: number = this.params.n): Uint8Array {
    return BLAKE2b.hash(data, outputLength);
  }

  /**
   * Generate WOTS+ private key
   */
  private generateWOTSPrivateKey(seed: Uint8Array, address: Uint8Array): Uint8Array[] {
    const len = Math.ceil(8 * this.params.n / Math.log2(this.params.w));
    const sk: Uint8Array[] = [];
    
    for (let i = 0; i < len; i++) {
      const input = new Uint8Array(seed.length + address.length + 4);
      input.set(seed);
      input.set(address, seed.length);
      input[seed.length + address.length] = i & 0xff;
      input[seed.length + address.length + 1] = (i >> 8) & 0xff;
      input[seed.length + address.length + 2] = (i >> 16) & 0xff;
      input[seed.length + address.length + 3] = (i >> 24) & 0xff;
      
      sk.push(this.hash(input));
    }
    
    return sk;
  }

  /**
   * Chain function for WOTS+
   */
  private chain(x: Uint8Array, start: number, steps: number, seed: Uint8Array): Uint8Array {
    let result = new Uint8Array(x);
    
    for (let i = start; i < start + steps; i++) {
      const input = new Uint8Array(result.length + seed.length + 4);
      input.set(result);
      input.set(seed, result.length);
      input[result.length + seed.length] = i & 0xff;
      input[result.length + seed.length + 1] = (i >> 8) & 0xff;
      input[result.length + seed.length + 2] = (i >> 16) & 0xff;
      input[result.length + seed.length + 3] = (i >> 24) & 0xff;
      
      result = this.hash(input);
    }
    
    return result;
  }

  /**
   * Generate WOTS+ public key from private key
   */
  private generateWOTSPublicKey(sk: Uint8Array[], seed: Uint8Array): Uint8Array {
    const pk: Uint8Array[] = [];
    
    for (let i = 0; i < sk.length; i++) {
      pk.push(this.chain(sk[i], 0, this.params.w - 1, seed));
    }
    
    // Combine all public key parts
    const totalLength = pk.reduce((sum, p) => sum + p.length, 0);
    const publicKey = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const part of pk) {
      publicKey.set(part, offset);
      offset += part.length;
    }
    
    return this.hash(publicKey);
  }

  /**
   * Generate SPHINCS+ key pair
   */
  generateKeyPair(): QuantumSafeKeyPair {
    // Generate master seed
    const masterSeed = this.csprng.randomBytes(this.params.n);
    
    // Generate tree seeds
    const publicSeed = this.csprng.randomBytes(this.params.n);
    const secretSeed = this.hash(masterSeed);
    
    // Generate root of tree
    const address = new Uint8Array(32); // Simplified address
    const rootSk = this.generateWOTSPrivateKey(secretSeed, address);
    const root = this.generateWOTSPublicKey(rootSk, publicSeed);
    
    // Public key = (root, publicSeed)
    const publicKey = new Uint8Array(root.length + publicSeed.length);
    publicKey.set(root);
    publicKey.set(publicSeed, root.length);
    
    // Private key = (masterSeed, publicSeed)
    const privateKey = new Uint8Array(masterSeed.length + publicSeed.length);
    privateKey.set(masterSeed);
    privateKey.set(publicSeed, masterSeed.length);
    
    return { publicKey, privateKey };
  }

  /**
   * Sign a message
   */
  sign(message: Uint8Array, privateKey: Uint8Array): QuantumSafeSignature {
    const n = this.params.n;
    
    // Extract seeds from private key
    const masterSeed = privateKey.slice(0, n);
    const publicSeed = privateKey.slice(n, 2 * n);
    const secretSeed = this.hash(masterSeed);
    
    // Generate randomness
    const rand = this.csprng.randomBytes(n);
    
    // Hash message with randomness
    const msgInput = new Uint8Array(rand.length + message.length);
    msgInput.set(rand);
    msgInput.set(message, rand.length);
    const msgHash = this.hash(msgInput);
    
    // Generate WOTS+ signature for message hash
    const address = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      address[i] = msgHash[i % msgHash.length];
    }
    
    const sk = this.generateWOTSPrivateKey(secretSeed, address);
    
    // Convert message hash to base-w representation
    const msgW: number[] = [];
    let bits = 0;
    let bitsInBuffer = 0;
    let buffer = 0;
    
    for (let i = 0; i < msgHash.length; i++) {
      buffer = (buffer << 8) | msgHash[i];
      bitsInBuffer += 8;
      
      while (bitsInBuffer >= Math.log2(this.params.w)) {
        const bitsToExtract = Math.floor(Math.log2(this.params.w));
        const mask = (1 << bitsToExtract) - 1;
        const value = (buffer >> (bitsInBuffer - bitsToExtract)) & mask;
        msgW.push(value);
        bitsInBuffer -= bitsToExtract;
      }
    }
    
    // Generate signature parts
    const sigParts: Uint8Array[] = [];
    for (let i = 0; i < sk.length && i < msgW.length; i++) {
      sigParts.push(this.chain(sk[i], 0, msgW[i], publicSeed));
    }
    
    // Combine signature parts
    const totalLength = sigParts.reduce((sum, p) => sum + p.length, 0) + rand.length;
    const signature = new Uint8Array(totalLength);
    
    signature.set(rand);
    let offset = rand.length;
    for (const part of sigParts) {
      signature.set(part, offset);
      offset += part.length;
    }
    
    return { signature };
  }

  /**
   * Verify a signature
   */
  verify(message: Uint8Array, signature: QuantumSafeSignature, publicKey: Uint8Array): boolean {
    const n = this.params.n;
    
    // Extract root and public seed from public key
    const root = publicKey.slice(0, n);
    const publicSeed = publicKey.slice(n, 2 * n);
    
    // Extract randomness from signature
    const rand = signature.signature.slice(0, n);
    
    // Hash message with randomness
    const msgInput = new Uint8Array(rand.length + message.length);
    msgInput.set(rand);
    msgInput.set(message, rand.length);
    const msgHash = this.hash(msgInput);
    
    // Convert message hash to base-w representation
    const msgW: number[] = [];
    let bitsInBuffer = 0;
    let buffer = 0;
    
    for (let i = 0; i < msgHash.length; i++) {
      buffer = (buffer << 8) | msgHash[i];
      bitsInBuffer += 8;
      
      while (bitsInBuffer >= Math.log2(this.params.w)) {
        const bitsToExtract = Math.floor(Math.log2(this.params.w));
        const mask = (1 << bitsToExtract) - 1;
        const value = (buffer >> (bitsInBuffer - bitsToExtract)) & mask;
        msgW.push(value);
        bitsInBuffer -= bitsToExtract;
      }
    }
    
    // Extract signature parts and complete chains
    const sigLength = Math.ceil(8 * n / Math.log2(this.params.w));
    const pkParts: Uint8Array[] = [];
    let offset = n;
    
    for (let i = 0; i < sigLength && i < msgW.length; i++) {
      if (offset + n > signature.signature.length) break;
      
      const sigPart = signature.signature.slice(offset, offset + n);
      const pkPart = this.chain(sigPart, msgW[i], this.params.w - 1 - msgW[i], publicSeed);
      pkParts.push(pkPart);
      offset += n;
    }
    
    // Combine and hash to get public key
    const totalLength = pkParts.reduce((sum, p) => sum + p.length, 0);
    const computedPk = new Uint8Array(totalLength);
    offset = 0;
    
    for (const part of pkParts) {
      computedPk.set(part, offset);
      offset += part.length;
    }
    
    const computedRoot = this.hash(computedPk);
    
    // Compare with stored root
    if (computedRoot.length !== root.length) return false;
    
    for (let i = 0; i < root.length; i++) {
      if (computedRoot[i] !== root[i]) return false;
    }
    
    return true;
  }
}

/**
 * Dilithium - Lattice-based digital signature
 * Simplified implementation
 */
export class Dilithium {
  private params: LatticeParams;
  private csprng: CSPRNG;

  constructor(params?: Partial<LatticeParams>) {
    this.params = {
      n: params?.n || 256,
      q: params?.q || 8380417,
      sigma: params?.sigma || 2
    };
    this.csprng = new CSPRNG();
  }

  /**
   * Polynomial multiplication in ring
   */
  private polyMult(a: number[], b: number[]): number[] {
    const n = this.params.n;
    const q = this.params.q;
    const result = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const index = (i + j) % n;
        const sign = Math.floor((i + j) / n) % 2 === 0 ? 1 : -1;
        result[index] = (result[index] + sign * a[i] * b[j]) % q;
        if (result[index] < 0) result[index] += q;
      }
    }
    
    return result;
  }

  /**
   * Generate key pair
   */
  generateKeyPair(): QuantumSafeKeyPair {
    const n = this.params.n;
    
    // Generate random seed
    const seed = this.csprng.randomBytes(32);
    
    // Generate matrix A from seed
    const A = this.expandSeed(seed, n);
    
    // Generate secret vectors s1, s2
    const s1 = this.sampleSmall(n);
    const s2 = this.sampleSmall(n);
    
    // Compute public key t = As1 + s2
    const As1 = this.polyMult(A, s1);
    const t: number[] = [];
    for (let i = 0; i < n; i++) {
      t[i] = (As1[i] + s2[i]) % this.params.q;
      if (t[i] < 0) t[i] += this.params.q;
    }
    
    // Serialize keys
    const publicKey = this.serializePublic(seed, t);
    const privateKey = this.serializePrivate(seed, s1, s2, t);
    
    return { publicKey, privateKey };
  }

  /**
   * Sign a message
   */
  sign(message: Uint8Array, privateKey: Uint8Array): QuantumSafeSignature {
    const { seed, s1, s2, t } = this.deserializePrivate(privateKey);
    const A = this.expandSeed(seed, this.params.n);
    
    // Hash message
    const msgHash = BLAKE2b.hash(message, 64);
    
    // Generate mask y
    const y = this.sampleMask();
    
    // Compute w = Ay
    const w = this.polyMult(A, y);
    
    // Challenge from hash(w, message)
    const challengeInput = new Uint8Array(w.length * 4 + msgHash.length);
    for (let i = 0; i < w.length; i++) {
      const value = w[i];
      challengeInput[i * 4] = value & 0xff;
      challengeInput[i * 4 + 1] = (value >> 8) & 0xff;
      challengeInput[i * 4 + 2] = (value >> 16) & 0xff;
      challengeInput[i * 4 + 3] = (value >> 24) & 0xff;
    }
    challengeInput.set(msgHash, w.length * 4);
    
    const c = this.hashToChallenge(challengeInput);
    
    // Compute response z = y + cs1
    const cs1 = this.polyMult(c, s1);
    const z: number[] = [];
    for (let i = 0; i < this.params.n; i++) {
      z[i] = (y[i] + cs1[i]) % this.params.q;
      if (z[i] < 0) z[i] += this.params.q;
    }
    
    // Create signature
    const signature = this.serializeSignature(c, z);
    
    return { signature };
  }

  /**
   * Verify a signature
   */
  verify(message: Uint8Array, signature: QuantumSafeSignature, publicKey: Uint8Array): boolean {
    const { seed, t } = this.deserializePublic(publicKey);
    const { c, z } = this.deserializeSignature(signature.signature);
    const A = this.expandSeed(seed, this.params.n);
    
    // Hash message
    const msgHash = BLAKE2b.hash(message, 64);
    
    // Compute w' = Az - ct
    const Az = this.polyMult(A, z);
    const ct = this.polyMult(c, t);
    const wPrime: number[] = [];
    for (let i = 0; i < this.params.n; i++) {
      wPrime[i] = (Az[i] - ct[i]) % this.params.q;
      if (wPrime[i] < 0) wPrime[i] += this.params.q;
    }
    
    // Recompute challenge
    const challengeInput = new Uint8Array(wPrime.length * 4 + msgHash.length);
    for (let i = 0; i < wPrime.length; i++) {
      const value = wPrime[i];
      challengeInput[i * 4] = value & 0xff;
      challengeInput[i * 4 + 1] = (value >> 8) & 0xff;
      challengeInput[i * 4 + 2] = (value >> 16) & 0xff;
      challengeInput[i * 4 + 3] = (value >> 24) & 0xff;
    }
    challengeInput.set(msgHash, wPrime.length * 4);
    
    const cPrime = this.hashToChallenge(challengeInput);
    
    // Check if challenges match
    for (let i = 0; i < this.params.n; i++) {
      if (c[i] !== cPrime[i]) return false;
    }
    
    return true;
  }

  // Helper methods
  private expandSeed(seed: Uint8Array, n: number): number[] {
    const expanded = BLAKE2b.hash(seed, n * 4);
    const result: number[] = [];
    
    for (let i = 0; i < n; i++) {
      result[i] = expanded[i * 4] | 
                  (expanded[i * 4 + 1] << 8) |
                  (expanded[i * 4 + 2] << 16) |
                  (expanded[i * 4 + 3] << 24);
      result[i] %= this.params.q;
    }
    
    return result;
  }

  private sampleSmall(n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result[i] = this.csprng.randomInt(-2, 2);
    }
    return result;
  }

  private sampleMask(): number[] {
    const result: number[] = [];
    const bound = Math.floor(this.params.q / 4);
    
    for (let i = 0; i < this.params.n; i++) {
      result[i] = this.csprng.randomInt(-bound, bound);
    }
    return result;
  }

  private hashToChallenge(data: Uint8Array): number[] {
    const hash = BLAKE2b.hash(data, this.params.n);
    const result: number[] = [];
    
    for (let i = 0; i < this.params.n; i++) {
      // Create sparse ternary challenge
      if (hash[i] < 85) result[i] = -1;
      else if (hash[i] < 170) result[i] = 0;
      else result[i] = 1;
    }
    
    return result;
  }

  private serializePublic(seed: Uint8Array, t: number[]): Uint8Array {
    const result = new Uint8Array(seed.length + t.length * 4);
    result.set(seed);
    
    let offset = seed.length;
    for (const value of t) {
      result[offset++] = value & 0xff;
      result[offset++] = (value >> 8) & 0xff;
      result[offset++] = (value >> 16) & 0xff;
      result[offset++] = (value >> 24) & 0xff;
    }
    
    return result;
  }

  private deserializePublic(data: Uint8Array): { seed: Uint8Array; t: number[] } {
    const seed = data.slice(0, 32);
    const t: number[] = [];
    
    for (let i = 32; i < data.length; i += 4) {
      t.push(data[i] | (data[i + 1] << 8) | (data[i + 2] << 16) | (data[i + 3] << 24));
    }
    
    return { seed, t };
  }

  private serializePrivate(seed: Uint8Array, s1: number[], s2: number[], t: number[]): Uint8Array {
    const result = new Uint8Array(seed.length + (s1.length + s2.length + t.length) * 4);
    let offset = 0;
    
    result.set(seed);
    offset += seed.length;
    
    for (const value of s1) {
      result[offset++] = value & 0xff;
      result[offset++] = (value >> 8) & 0xff;
      result[offset++] = (value >> 16) & 0xff;
      result[offset++] = (value >> 24) & 0xff;
    }
    
    for (const value of s2) {
      result[offset++] = value & 0xff;
      result[offset++] = (value >> 8) & 0xff;
      result[offset++] = (value >> 16) & 0xff;
      result[offset++] = (value >> 24) & 0xff;
    }
    
    for (const value of t) {
      result[offset++] = value & 0xff;
      result[offset++] = (value >> 8) & 0xff;
      result[offset++] = (value >> 16) & 0xff;
      result[offset++] = (value >> 24) & 0xff;
    }
    
    return result;
  }

  private deserializePrivate(data: Uint8Array): { seed: Uint8Array; s1: number[]; s2: number[]; t: number[] } {
    const seed = data.slice(0, 32);
    const n = this.params.n;
    const s1: number[] = [];
    const s2: number[] = [];
    const t: number[] = [];
    
    let offset = 32;
    
    for (let i = 0; i < n; i++) {
      s1.push(data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24));
      offset += 4;
    }
    
    for (let i = 0; i < n; i++) {
      s2.push(data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24));
      offset += 4;
    }
    
    for (let i = 0; i < n; i++) {
      t.push(data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24));
      offset += 4;
    }
    
    return { seed, s1, s2, t };
  }

  private serializeSignature(c: number[], z: number[]): Uint8Array {
    const result = new Uint8Array((c.length + z.length) * 4);
    let offset = 0;
    
    for (const value of c) {
      result[offset++] = value & 0xff;
      result[offset++] = (value >> 8) & 0xff;
      result[offset++] = (value >> 16) & 0xff;
      result[offset++] = (value >> 24) & 0xff;
    }
    
    for (const value of z) {
      result[offset++] = value & 0xff;
      result[offset++] = (value >> 8) & 0xff;
      result[offset++] = (value >> 16) & 0xff;
      result[offset++] = (value >> 24) & 0xff;
    }
    
    return result;
  }

  private deserializeSignature(data: Uint8Array): { c: number[]; z: number[] } {
    const n = this.params.n;
    const c: number[] = [];
    const z: number[] = [];
    
    let offset = 0;
    
    for (let i = 0; i < n; i++) {
      c.push(data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24));
      offset += 4;
    }
    
    for (let i = 0; i < n; i++) {
      z.push(data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24));
      offset += 4;
    }
    
    return { c, z };
  }
}

/**
 * Quantum-Safe Crypto Utilities
 */
export class QuantumSafeUtils {
  /**
   * Get algorithm security level
   */
  static getSecurityLevel(algorithm: 'lwe' | 'sphincs' | 'dilithium'): number {
    switch (algorithm) {
      case 'lwe':
        return 128; // Simplified, actual depends on parameters
      case 'sphincs':
        return 256;
      case 'dilithium':
        return 192;
      default:
        return 0;
    }
  }

  /**
   * Estimate key size
   */
  static getKeySize(algorithm: 'lwe' | 'sphincs' | 'dilithium', type: 'public' | 'private'): number {
    switch (algorithm) {
      case 'lwe':
        return type === 'public' ? 8192 : 1024; // Approximate sizes
      case 'sphincs':
        return type === 'public' ? 64 : 96;
      case 'dilithium':
        return type === 'public' ? 1312 : 2528;
      default:
        return 0;
    }
  }

  /**
   * Hybrid encryption combining classical and quantum-safe
   */
  static hybridEncrypt(
    data: Uint8Array,
    quantumPublicKey: Uint8Array,
    classicalKey: Uint8Array
  ): { quantum: Uint8Array; classical: Uint8Array; nonce: Uint8Array } {
    // Use LWE for key encapsulation
    const lwe = new LWECrypto();
    const sessionKey = new CSPRNG().randomBytes(32);
    const encapsulatedKey = lwe.encrypt(sessionKey, quantumPublicKey);
    
    // Use ChaCha20 for data encryption (would import from modern-ciphers)
    const nonce = new CSPRNG().randomBytes(12);
    // Simplified - would use actual ChaCha20
    const xorKey = BLAKE2b.hash(new Uint8Array([...classicalKey, ...sessionKey, ...nonce]), data.length);
    const ciphertext = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      ciphertext[i] = data[i] ^ xorKey[i];
    }
    
    return {
      quantum: encapsulatedKey,
      classical: ciphertext,
      nonce
    };
  }

  /**
   * Benchmark quantum-safe algorithms
   */
  static async benchmark(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    const testData = new Uint8Array(1024);
    const testMessage = new Uint8Array(32);
    
    // Benchmark LWE
    const lwe = new LWECrypto({ n: 128 }); // Smaller for benchmark
    let start = performance.now();
    const lweKeys = lwe.generateKeyPair();
    results['lwe_keygen'] = performance.now() - start;
    
    start = performance.now();
    const lweCiphertext = lwe.encrypt(testData, lweKeys.publicKey);
    results['lwe_encrypt'] = performance.now() - start;
    
    start = performance.now();
    lwe.decrypt(lweCiphertext, lweKeys.privateKey);
    results['lwe_decrypt'] = performance.now() - start;
    
    // Benchmark SPHINCS+
    const sphincs = new SPHINCSPlus({ h: 5 }); // Smaller tree for benchmark
    start = performance.now();
    const sphincsKeys = sphincs.generateKeyPair();
    results['sphincs_keygen'] = performance.now() - start;
    
    start = performance.now();
    const sphincsSig = sphincs.sign(testMessage, sphincsKeys.privateKey);
    results['sphincs_sign'] = performance.now() - start;
    
    start = performance.now();
    sphincs.verify(testMessage, sphincsSig, sphincsKeys.publicKey);
    results['sphincs_verify'] = performance.now() - start;
    
    // Benchmark Dilithium
    const dilithium = new Dilithium({ n: 128 }); // Smaller for benchmark
    start = performance.now();
    const dilithiumKeys = dilithium.generateKeyPair();
    results['dilithium_keygen'] = performance.now() - start;
    
    start = performance.now();
    const dilithiumSig = dilithium.sign(testMessage, dilithiumKeys.privateKey);
    results['dilithium_sign'] = performance.now() - start;
    
    start = performance.now();
    dilithium.verify(testMessage, dilithiumSig, dilithiumKeys.publicKey);
    results['dilithium_verify'] = performance.now() - start;
    
    return results;
  }
}

export default {
  LWECrypto,
  SPHINCSPlus,
  Dilithium,
  QuantumSafeUtils
};
