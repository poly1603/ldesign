/**
 * Modern Cipher Algorithms Implementation
 * Includes ChaCha20, Poly1305, XSalsa20, and ChaCha20-Poly1305 AEAD
 */

import { CSPRNG } from './csprng'

// Type definitions
export interface ModernCipherOptions {
  key: Uint8Array
  nonce?: Uint8Array
  counter?: number
}

export interface AEADOptions extends ModernCipherOptions {
  additionalData?: Uint8Array
}

export interface AEADResult {
  ciphertext: Uint8Array
  tag: Uint8Array
}

/**
 * ChaCha20 Stream Cipher
 * Based on RFC 8439
 */
export class ChaCha20 {
  private key: Uint32Array
  private nonce: Uint32Array
  private counter: number
  private block: Uint32Array
  private blockUsed: number

  constructor(key: Uint8Array, nonce: Uint8Array, counter = 0) {
    if (key.length !== 32) {
      throw new Error('ChaCha20 requires a 256-bit key')
    }
    if (nonce.length !== 12) {
      throw new Error('ChaCha20 requires a 96-bit nonce')
    }

    this.key = new Uint32Array(8)
    this.nonce = new Uint32Array(3)
    this.counter = counter
    this.block = new Uint32Array(16)
    this.blockUsed = 64

    // Convert key and nonce to 32-bit words
    for (let i = 0; i < 8; i++) {
      this.key[i] = this.u8to32le(key, i * 4)
    }
    for (let i = 0; i < 3; i++) {
      this.nonce[i] = this.u8to32le(nonce, i * 4)
    }
  }

  private u8to32le(data: Uint8Array, offset: number): number {
    return (
      data[offset]
      | (data[offset + 1] << 8)
      | (data[offset + 2] << 16)
      | (data[offset + 3] << 24)
    )
  }

  private u32to8le(n: number, data: Uint8Array, offset: number): void {
    data[offset] = n & 0xFF
    data[offset + 1] = (n >>> 8) & 0xFF
    data[offset + 2] = (n >>> 16) & 0xFF
    data[offset + 3] = (n >>> 24) & 0xFF
  }

  private rotl(a: number, b: number): number {
    return (a << b) | (a >>> (32 - b))
  }

  private quarterRound(a: number, b: number, c: number, d: number): [number, number, number, number] {
    a = (a + b) >>> 0
    d ^= a
    d = this.rotl(d, 16)

    c = (c + d) >>> 0
    b ^= c
    b = this.rotl(b, 12)

    a = (a + b) >>> 0
    d ^= a
    d = this.rotl(d, 8)

    c = (c + d) >>> 0
    b ^= c
    b = this.rotl(b, 7)

    return [a, b, c, d]
  }

  private chacha20Block(): void {
    const x = new Uint32Array(16)

    // Initialize working state
    x[0] = 0x61707865 // "expa"
    x[1] = 0x3320646E // "nd 3"
    x[2] = 0x79622D32 // "2-by"
    x[3] = 0x6B206574 // "te k"

    for (let i = 0; i < 8; i++) {
      x[4 + i] = this.key[i]
    }

    x[12] = this.counter
    for (let i = 0; i < 3; i++) {
      x[13 + i] = this.nonce[i]
    }

    const working = new Uint32Array(x)

    // 20 rounds (10 double rounds)
    for (let i = 0; i < 10; i++) {
      // Column rounds
      [working[0], working[4], working[8], working[12]]
        = this.quarterRound(working[0], working[4], working[8], working[12]);
      [working[1], working[5], working[9], working[13]]
        = this.quarterRound(working[1], working[5], working[9], working[13]);
      [working[2], working[6], working[10], working[14]]
        = this.quarterRound(working[2], working[6], working[10], working[14]);
      [working[3], working[7], working[11], working[15]]
        = this.quarterRound(working[3], working[7], working[11], working[15]);

      // Diagonal rounds
      [working[0], working[5], working[10], working[15]]
        = this.quarterRound(working[0], working[5], working[10], working[15]);
      [working[1], working[6], working[11], working[12]]
        = this.quarterRound(working[1], working[6], working[11], working[12]);
      [working[2], working[7], working[8], working[13]]
        = this.quarterRound(working[2], working[7], working[8], working[13]);
      [working[3], working[4], working[9], working[14]]
        = this.quarterRound(working[3], working[4], working[9], working[14])
    }

    // Add original state
    for (let i = 0; i < 16; i++) {
      this.block[i] = (working[i] + x[i]) >>> 0
    }

    this.counter++
    this.blockUsed = 0
  }

  encrypt(plaintext: Uint8Array): Uint8Array {
    const ciphertext = new Uint8Array(plaintext.length)

    for (let i = 0; i < plaintext.length; i++) {
      if (this.blockUsed === 64) {
        this.chacha20Block()
      }

      const blockIndex = Math.floor(this.blockUsed / 4)
      const byteIndex = this.blockUsed % 4
      const keyByte = (this.block[blockIndex] >>> (byteIndex * 8)) & 0xFF

      ciphertext[i] = plaintext[i] ^ keyByte
      this.blockUsed++
    }

    return ciphertext
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    // ChaCha20 is symmetric
    return this.encrypt(ciphertext)
  }
}

/**
 * Poly1305 MAC
 * Based on RFC 8439
 */
export class Poly1305 {
  private r: bigint[]
  private h: bigint[]
  private pad: bigint[]
  private leftover: number
  private buffer: Uint8Array
  private final: boolean

  constructor(key: Uint8Array) {
    if (key.length !== 32) {
      throw new Error('Poly1305 requires a 256-bit key')
    }

    this.r = Array.from({ length: 5 }, () => 0n)
    this.h = Array.from({ length: 5 }, () => 0n)
    this.pad = Array.from({ length: 4 }, () => 0n)
    this.leftover = 0
    this.buffer = new Uint8Array(16)
    this.final = false

    // Clamp r
    const t0 = this.u8to32le(key, 0)
    const t1 = this.u8to32le(key, 4)
    const t2 = this.u8to32le(key, 8)
    const t3 = this.u8to32le(key, 12)

    this.r[0] = BigInt(t0 & 0x3FFFFFF)
    this.r[1] = BigInt(((t0 >>> 26) | (t1 << 6)) & 0x3FFFF03)
    this.r[2] = BigInt(((t1 >>> 20) | (t2 << 12)) & 0x3FFC0FF)
    this.r[3] = BigInt(((t2 >>> 14) | (t3 << 18)) & 0x3F03FFF)
    this.r[4] = BigInt((t3 >>> 8) & 0x00FFFFF)

    // Save pad
    this.pad[0] = BigInt(this.u8to32le(key, 16))
    this.pad[1] = BigInt(this.u8to32le(key, 20))
    this.pad[2] = BigInt(this.u8to32le(key, 24))
    this.pad[3] = BigInt(this.u8to32le(key, 28))
  }

  private u8to32le(data: Uint8Array, offset: number): number {
    return (
      data[offset]
      | (data[offset + 1] << 8)
      | (data[offset + 2] << 16)
      | (data[offset + 3] << 24)
    )
  }

  private blocks(data: Uint8Array, offset: number, length: number): void {
    const hibit = this.final ? 0n : (1n << 40n)

    while (length >= 16) {
      // Load block
      const t0 = BigInt(this.u8to32le(data, offset))
      const t1 = BigInt(this.u8to32le(data, offset + 4))
      const t2 = BigInt(this.u8to32le(data, offset + 8))
      const t3 = BigInt(this.u8to32le(data, offset + 12))

      this.h[0] += t0 & 0x3FFFFFFn
      this.h[1] += ((t0 >> 26n) | (t1 << 6n)) & 0x3FFFFFFn
      this.h[2] += ((t1 >> 20n) | (t2 << 12n)) & 0x3FFFFFFn
      this.h[3] += ((t2 >> 14n) | (t3 << 18n)) & 0x3FFFFFFn
      this.h[4] += (t3 >> 8n) | hibit

      // Multiply and reduce
      const d0 = this.h[0] * this.r[0] + this.h[1] * this.r[4] * 5n
        + this.h[2] * this.r[3] * 5n + this.h[3] * this.r[2] * 5n
        + this.h[4] * this.r[1] * 5n
      const d1 = this.h[0] * this.r[1] + this.h[1] * this.r[0]
        + this.h[2] * this.r[4] * 5n + this.h[3] * this.r[3] * 5n
        + this.h[4] * this.r[2] * 5n
      const d2 = this.h[0] * this.r[2] + this.h[1] * this.r[1]
        + this.h[2] * this.r[0] + this.h[3] * this.r[4] * 5n
        + this.h[4] * this.r[3] * 5n
      const d3 = this.h[0] * this.r[3] + this.h[1] * this.r[2]
        + this.h[2] * this.r[1] + this.h[3] * this.r[0]
        + this.h[4] * this.r[4] * 5n
      const d4 = this.h[0] * this.r[4] + this.h[1] * this.r[3]
        + this.h[2] * this.r[2] + this.h[3] * this.r[1]
        + this.h[4] * this.r[0]

      // Carry propagation
      let c = d0 >> 26n
      this.h[0] = d0 & 0x3FFFFFFn
      const d1c = d1 + c
      c = d1c >> 26n
      this.h[1] = d1c & 0x3FFFFFFn
      const d2c = d2 + c
      c = d2c >> 26n
      this.h[2] = d2c & 0x3FFFFFFn
      const d3c = d3 + c
      c = d3c >> 26n
      this.h[3] = d3c & 0x3FFFFFFn
      const d4c = d4 + c
      c = d4c >> 26n
      this.h[4] = d4c & 0x3FFFFFFn
      this.h[0] += c * 5n
      c = this.h[0] >> 26n
      this.h[0] &= 0x3FFFFFFn
      this.h[1] += c

      offset += 16
      length -= 16
    }
  }

  update(data: Uint8Array): void {
    let offset = 0
    let length = data.length

    // Handle leftover
    if (this.leftover) {
      const want = 16 - this.leftover
      if (want > length) {
        for (let i = 0; i < length; i++) {
          this.buffer[this.leftover + i] = data[i]
        }
        this.leftover += length
        return
      }

      for (let i = 0; i < want; i++) {
        this.buffer[this.leftover + i] = data[i]
      }
      this.blocks(this.buffer, 0, 16)
      offset = want
      length -= want
      this.leftover = 0
    }

    // Process full blocks
    if (length >= 16) {
      const want = length & ~15
      this.blocks(data, offset, want)
      offset += want
      length -= want
    }

    // Store leftover
    if (length) {
      for (let i = 0; i < length; i++) {
        this.buffer[i] = data[offset + i]
      }
      this.leftover = length
    }
  }

  finish(): Uint8Array {
    if (this.leftover) {
      this.buffer[this.leftover] = 1
      for (let i = this.leftover + 1; i < 16; i++) {
        this.buffer[i] = 0
      }
      this.final = true
      this.blocks(this.buffer, 0, 16)
    }

    // Fully reduce h
    let c = this.h[1] >> 26n
    this.h[1] &= 0x3FFFFFFn
    this.h[2] += c
    c = this.h[2] >> 26n
    this.h[2] &= 0x3FFFFFFn
    this.h[3] += c
    c = this.h[3] >> 26n
    this.h[3] &= 0x3FFFFFFn
    this.h[4] += c
    c = this.h[4] >> 26n
    this.h[4] &= 0x3FFFFFFn
    this.h[0] += c * 5n
    c = this.h[0] >> 26n
    this.h[0] &= 0x3FFFFFFn
    this.h[1] += c

    // Compute h + pad
    const g0 = this.h[0] + 5n
    let c2 = g0 >> 26n
    const g1 = this.h[1] + c2
    c2 = g1 >> 26n
    const g2 = this.h[2] + c2
    c2 = g2 >> 26n
    const g3 = this.h[3] + c2
    c2 = g3 >> 26n
    const g4 = (this.h[4] + c2 - (1n << 26n)) & 0xFFFFFFFFn

    // Select h if h < p, or h + 5 if h >= p
    const mask = (g4 >> 31n) - 1n
    const g0m = g0 & mask
    const g1m = g1 & mask
    const g2m = g2 & mask
    const g3m = g3 & mask
    const g4m = g4 & mask
    const notMask = ~mask & 0xFFFFFFFFn
    const h0 = (this.h[0] & notMask) | g0m
    const h1 = (this.h[1] & notMask) | g1m
    const h2 = (this.h[2] & notMask) | g2m
    const h3 = (this.h[3] & notMask) | g3m
    const h4 = (this.h[4] & notMask) | g4m

    // h = h % (2^128)
    const h0f = h0 | (h1 << 26n)
    const h1f = (h1 >> 6n) | (h2 << 20n)
    const h2f = (h2 >> 12n) | (h3 << 14n)
    const h3f = (h3 >> 18n) | (h4 << 8n)

    // Add pad
    const f0 = h0f + this.pad[0]
    const f1 = h1f + this.pad[1] + (f0 >> 32n)
    const f2 = h2f + this.pad[2] + (f1 >> 32n)
    const f3 = h3f + this.pad[3] + (f2 >> 32n)

    // Convert to bytes
    const tag = new Uint8Array(16)
    this.u32to8le(Number(f0 & 0xFFFFFFFFn), tag, 0)
    this.u32to8le(Number(f1 & 0xFFFFFFFFn), tag, 4)
    this.u32to8le(Number(f2 & 0xFFFFFFFFn), tag, 8)
    this.u32to8le(Number(f3 & 0xFFFFFFFFn), tag, 12)

    return tag
  }

  private u32to8le(n: number, data: Uint8Array, offset: number): void {
    data[offset] = n & 0xFF
    data[offset + 1] = (n >>> 8) & 0xFF
    data[offset + 2] = (n >>> 16) & 0xFF
    data[offset + 3] = (n >>> 24) & 0xFF
  }

  static auth(data: Uint8Array, key: Uint8Array): Uint8Array {
    const poly = new Poly1305(key)
    poly.update(data)
    return poly.finish()
  }

  static verify(tag1: Uint8Array, tag2: Uint8Array): boolean {
    if (tag1.length !== tag2.length) { return false }
    let diff = 0
    for (let i = 0; i < tag1.length; i++) {
      diff |= tag1[i] ^ tag2[i]
    }
    return diff === 0
  }
}

/**
 * ChaCha20-Poly1305 AEAD
 * Based on RFC 8439
 */
export class ChaCha20Poly1305 {
  encrypt(plaintext: Uint8Array, key: Uint8Array, nonce: Uint8Array, aad?: Uint8Array): AEADResult {
    if (key.length !== 32) {
      throw new Error('ChaCha20-Poly1305 requires a 256-bit key')
    }
    if (nonce.length !== 12) {
      throw new Error('ChaCha20-Poly1305 requires a 96-bit nonce')
    }

    // Generate Poly1305 key
    const polyKey = new ChaCha20(key, nonce, 0).encrypt(new Uint8Array(32))

    // Encrypt plaintext
    const chacha = new ChaCha20(key, nonce, 1)
    const ciphertext = chacha.encrypt(plaintext)

    // Construct MAC input
    const aadLength = aad ? aad.length : 0
    const aadPadding = (16 - (aadLength % 16)) % 16
    const ciphertextPadding = (16 - (ciphertext.length % 16)) % 16

    const macData = new Uint8Array(
      aadLength + aadPadding
      + ciphertext.length + ciphertextPadding
      + 16,
    )

    let offset = 0

    // Add AAD
    if (aad) {
      macData.set(aad, offset)
      offset += aadLength + aadPadding
    }

    // Add ciphertext
    macData.set(ciphertext, offset)
    offset += ciphertext.length + ciphertextPadding

    // Add lengths
    const lengthBuffer = new ArrayBuffer(16)
    const lengthView = new DataView(lengthBuffer)
    lengthView.setUint32(0, aadLength, true)
    lengthView.setUint32(8, ciphertext.length, true)
    macData.set(new Uint8Array(lengthBuffer), offset)

    // Compute tag
    const tag = Poly1305.auth(macData, polyKey)

    return { ciphertext, tag }
  }

  decrypt(ciphertext: Uint8Array, tag: Uint8Array, key: Uint8Array, nonce: Uint8Array, aad?: Uint8Array): Uint8Array | null {
    if (key.length !== 32) {
      throw new Error('ChaCha20-Poly1305 requires a 256-bit key')
    }
    if (nonce.length !== 12) {
      throw new Error('ChaCha20-Poly1305 requires a 96-bit nonce')
    }
    if (tag.length !== 16) {
      throw new Error('ChaCha20-Poly1305 requires a 128-bit tag')
    }

    // Generate Poly1305 key
    const polyKey = new ChaCha20(key, nonce, 0).encrypt(new Uint8Array(32))

    // Construct MAC input
    const aadLength = aad ? aad.length : 0
    const aadPadding = (16 - (aadLength % 16)) % 16
    const ciphertextPadding = (16 - (ciphertext.length % 16)) % 16

    const macData = new Uint8Array(
      aadLength + aadPadding
      + ciphertext.length + ciphertextPadding
      + 16,
    )

    let offset = 0

    // Add AAD
    if (aad) {
      macData.set(aad, offset)
      offset += aadLength + aadPadding
    }

    // Add ciphertext
    macData.set(ciphertext, offset)
    offset += ciphertext.length + ciphertextPadding

    // Add lengths
    const lengthBuffer = new ArrayBuffer(16)
    const lengthView = new DataView(lengthBuffer)
    lengthView.setUint32(0, aadLength, true)
    lengthView.setUint32(8, ciphertext.length, true)
    macData.set(new Uint8Array(lengthBuffer), offset)

    // Verify tag
    const computedTag = Poly1305.auth(macData, polyKey)
    if (!Poly1305.verify(tag, computedTag)) {
      return null // Authentication failed
    }

    // Decrypt ciphertext
    const chacha = new ChaCha20(key, nonce, 1)
    return chacha.decrypt(ciphertext)
  }
}

/**
 * XSalsa20 Stream Cipher
 * Extended nonce variant of Salsa20
 */
export class XSalsa20 {
  private key: Uint8Array
  private nonce: Uint8Array
  private block: Uint8Array
  private blockUsed: number
  private counter: number

  constructor(key: Uint8Array, nonce: Uint8Array) {
    if (key.length !== 32) {
      throw new Error('XSalsa20 requires a 256-bit key')
    }
    if (nonce.length !== 24) {
      throw new Error('XSalsa20 requires a 192-bit nonce')
    }

    // HSalsa20 to derive subkey
    const subkey = this.hsalsa20(key, nonce.slice(0, 16))

    // Use subkey with last 8 bytes of nonce
    this.key = subkey
    this.nonce = new Uint8Array(8)
    this.nonce.set(nonce.slice(16, 24))

    this.block = new Uint8Array(64)
    this.blockUsed = 64
    this.counter = 0
  }

  private hsalsa20(key: Uint8Array, nonce: Uint8Array): Uint8Array {
    const x = new Uint32Array(16)
    const sigma = new TextEncoder().encode('expand 32-byte k')

    // Initialize state
    x[0] = this.u8to32le(sigma, 0)
    x[5] = this.u8to32le(sigma, 4)
    x[10] = this.u8to32le(sigma, 8)
    x[15] = this.u8to32le(sigma, 12)

    for (let i = 0; i < 4; i++) {
      x[1 + i] = this.u8to32le(key, i * 4)
      x[11 + i] = this.u8to32le(key, 16 + i * 4)
      x[6 + i] = this.u8to32le(nonce, i * 4)
    }

    // 20 rounds
    for (let i = 0; i < 10; i++) {
      this.doubleRound(x)
    }

    // Extract output
    const out = new Uint8Array(32)
    this.u32to8le(x[0], out, 0)
    this.u32to8le(x[5], out, 4)
    this.u32to8le(x[10], out, 8)
    this.u32to8le(x[15], out, 12)
    this.u32to8le(x[6], out, 16)
    this.u32to8le(x[7], out, 20)
    this.u32to8le(x[8], out, 24)
    this.u32to8le(x[9], out, 28)

    return out
  }

  private u8to32le(data: Uint8Array, offset: number): number {
    return (
      data[offset]
      | (data[offset + 1] << 8)
      | (data[offset + 2] << 16)
      | (data[offset + 3] << 24)
    )
  }

  private u32to8le(n: number, data: Uint8Array, offset: number): void {
    data[offset] = n & 0xFF
    data[offset + 1] = (n >>> 8) & 0xFF
    data[offset + 2] = (n >>> 16) & 0xFF
    data[offset + 3] = (n >>> 24) & 0xFF
  }

  private rotl(a: number, b: number): number {
    return (a << b) | (a >>> (32 - b))
  }

  private quarterRound(x: Uint32Array, a: number, b: number, c: number, d: number): void {
    x[b] ^= this.rotl((x[a] + x[d]) >>> 0, 7)
    x[c] ^= this.rotl((x[b] + x[a]) >>> 0, 9)
    x[d] ^= this.rotl((x[c] + x[b]) >>> 0, 13)
    x[a] ^= this.rotl((x[d] + x[c]) >>> 0, 18)
  }

  private doubleRound(x: Uint32Array): void {
    // Column round
    this.quarterRound(x, 0, 4, 8, 12)
    this.quarterRound(x, 5, 9, 13, 1)
    this.quarterRound(x, 10, 14, 2, 6)
    this.quarterRound(x, 15, 3, 7, 11)

    // Row round
    this.quarterRound(x, 0, 1, 2, 3)
    this.quarterRound(x, 5, 6, 7, 4)
    this.quarterRound(x, 10, 11, 8, 9)
    this.quarterRound(x, 15, 12, 13, 14)
  }

  private salsa20Block(): void {
    const x = new Uint32Array(16)
    const sigma = new TextEncoder().encode('expand 32-byte k')

    // Initialize working state
    x[0] = this.u8to32le(sigma, 0)
    x[5] = this.u8to32le(sigma, 4)
    x[10] = this.u8to32le(sigma, 8)
    x[15] = this.u8to32le(sigma, 12)

    for (let i = 0; i < 4; i++) {
      x[1 + i] = this.u8to32le(this.key, i * 4)
      x[11 + i] = this.u8to32le(this.key, 16 + i * 4)
    }

    x[6] = this.counter & 0xFFFFFFFF
    x[7] = (this.counter >>> 32) & 0xFFFFFFFF

    x[8] = this.u8to32le(this.nonce, 0)
    x[9] = this.u8to32le(this.nonce, 4)

    const working = new Uint32Array(x)

    // 20 rounds
    for (let i = 0; i < 10; i++) {
      this.doubleRound(working)
    }

    // Add original state
    for (let i = 0; i < 16; i++) {
      working[i] = (working[i] + x[i]) >>> 0
    }

    // Convert to bytes
    for (let i = 0; i < 16; i++) {
      this.u32to8le(working[i], this.block, i * 4)
    }

    this.counter++
    this.blockUsed = 0
  }

  encrypt(plaintext: Uint8Array): Uint8Array {
    const ciphertext = new Uint8Array(plaintext.length)

    for (let i = 0; i < plaintext.length; i++) {
      if (this.blockUsed === 64) {
        this.salsa20Block()
      }

      ciphertext[i] = plaintext[i] ^ this.block[this.blockUsed]
      this.blockUsed++
    }

    return ciphertext
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    // XSalsa20 is symmetric
    return this.encrypt(ciphertext)
  }
}

/**
 * BLAKE2b Hash Function
 * Based on RFC 7693
 */
export class BLAKE2b {
  private static readonly IV = new Uint32Array([
    0xF3BCC908,
    0x6A09E667,
    0x84CAA73B,
    0xBB67AE85,
    0xFE94F82B,
    0x3C6EF372,
    0x5F1D36F1,
    0xA54FF53A,
    0xADE682D1,
    0x510E527F,
    0x2B3E6C1F,
    0x9B05688C,
    0xFB41BD6B,
    0x1F83D9AB,
    0x137E2179,
    0x5BE0CD19,
  ])

  private static readonly SIGMA = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  ]

  private h: Uint32Array
  private t: Uint32Array
  private f: Uint32Array
  private buf: Uint8Array
  private buflen: number
  private outlen: number

  constructor(outlen = 64, key?: Uint8Array) {
    if (outlen < 1 || outlen > 64) {
      throw new Error('BLAKE2b output length must be between 1 and 64 bytes')
    }
    if (key && key.length > 64) {
      throw new Error('BLAKE2b key length must not exceed 64 bytes')
    }

    this.outlen = outlen
    this.h = new Uint32Array(BLAKE2b.IV)
    this.t = new Uint32Array(4)
    this.f = new Uint32Array(4)
    this.buf = new Uint8Array(128)
    this.buflen = 0

    // Parameter block
    const keylen = key ? key.length : 0
    this.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen

    // Key processing
    if (key) {
      this.update(key)
      this.buflen = 128
    }
  }

  private rotr64(x: Uint32Array, xi: number, n: number): void {
    if (n === 32) {
      const tmp = x[xi]
      x[xi] = x[xi + 1]
      x[xi + 1] = tmp
    }
 else if (n < 32) {
      const h = x[xi + 1]
      const l = x[xi]
      x[xi + 1] = (h >>> n) | (l << (32 - n))
      x[xi] = (l >>> n) | (h << (32 - n))
    }
 else {
      const h = x[xi + 1]
      const l = x[xi]
      x[xi + 1] = (l >>> (n - 32)) | (h << (64 - n))
      x[xi] = (h >>> (n - 32)) | (l << (64 - n))
    }
  }

  private g(v: Uint32Array, a: number, b: number, c: number, d: number, x: Uint32Array, xi: number, y: Uint32Array, yi: number): void {
    // v[a] = v[a] + v[b] + x
    let carry = 0
    let t = v[a * 2] + v[b * 2] + x[xi]
    v[a * 2] = t >>> 0
    carry = t >= 0x100000000 ? 1 : 0
    t = v[a * 2 + 1] + v[b * 2 + 1] + x[xi + 1] + carry
    v[a * 2 + 1] = t >>> 0

    // v[d] = rotr64(v[d] ^ v[a], 32)
    v[d * 2] ^= v[a * 2]
    v[d * 2 + 1] ^= v[a * 2 + 1]
    this.rotr64(v, d * 2, 32)

    // v[c] = v[c] + v[d]
    carry = 0
    t = v[c * 2] + v[d * 2]
    v[c * 2] = t >>> 0
    carry = t >= 0x100000000 ? 1 : 0
    v[c * 2 + 1] = (v[c * 2 + 1] + v[d * 2 + 1] + carry) >>> 0

    // v[b] = rotr64(v[b] ^ v[c], 24)
    v[b * 2] ^= v[c * 2]
    v[b * 2 + 1] ^= v[c * 2 + 1]
    this.rotr64(v, b * 2, 24)

    // v[a] = v[a] + v[b] + y
    carry = 0
    t = v[a * 2] + v[b * 2] + y[yi]
    v[a * 2] = t >>> 0
    carry = t >= 0x100000000 ? 1 : 0
    t = v[a * 2 + 1] + v[b * 2 + 1] + y[yi + 1] + carry
    v[a * 2 + 1] = t >>> 0

    // v[d] = rotr64(v[d] ^ v[a], 16)
    v[d * 2] ^= v[a * 2]
    v[d * 2 + 1] ^= v[a * 2 + 1]
    this.rotr64(v, d * 2, 16)

    // v[c] = v[c] + v[d]
    carry = 0
    t = v[c * 2] + v[d * 2]
    v[c * 2] = t >>> 0
    carry = t >= 0x100000000 ? 1 : 0
    v[c * 2 + 1] = (v[c * 2 + 1] + v[d * 2 + 1] + carry) >>> 0

    // v[b] = rotr64(v[b] ^ v[c], 63)
    v[b * 2] ^= v[c * 2]
    v[b * 2 + 1] ^= v[c * 2 + 1]
    this.rotr64(v, b * 2, 63)
  }

  private compress(last: boolean): void {
    const v = new Uint32Array(32)
    const m = new Uint32Array(32)

    // Initialize working vector
    for (let i = 0; i < 16; i++) {
      v[i] = this.h[i]
    }
    for (let i = 0; i < 16; i++) {
      v[16 + i] = BLAKE2b.IV[i]
    }

    // Mix in counter and flag
    v[24] ^= this.t[0]
    v[25] ^= this.t[1]
    v[26] ^= this.t[2]
    v[27] ^= this.t[3]

    if (last) {
      v[28] ^= 0xFFFFFFFF
      v[29] ^= 0xFFFFFFFF
    }

    // Convert input block to 64-bit words
    for (let i = 0; i < 32; i++) {
      m[i] = this.u8to32le(this.buf, i * 4)
    }

    // Cryptographic mixing
    for (let r = 0; r < 12; r++) {
      const s = BLAKE2b.SIGMA[r % 12]
      this.g(v, 0, 4, 8, 12, m, s[0] * 2, m, s[1] * 2)
      this.g(v, 1, 5, 9, 13, m, s[2] * 2, m, s[3] * 2)
      this.g(v, 2, 6, 10, 14, m, s[4] * 2, m, s[5] * 2)
      this.g(v, 3, 7, 11, 15, m, s[6] * 2, m, s[7] * 2)
      this.g(v, 0, 5, 10, 15, m, s[8] * 2, m, s[9] * 2)
      this.g(v, 1, 6, 11, 12, m, s[10] * 2, m, s[11] * 2)
      this.g(v, 2, 7, 8, 13, m, s[12] * 2, m, s[13] * 2)
      this.g(v, 3, 4, 9, 14, m, s[14] * 2, m, s[15] * 2)
    }

    // Update state
    for (let i = 0; i < 16; i++) {
      this.h[i] ^= v[i] ^ v[16 + i]
    }
  }

  private u8to32le(data: Uint8Array, offset: number): number {
    return (
      data[offset]
      | (data[offset + 1] << 8)
      | (data[offset + 2] << 16)
      | (data[offset + 3] << 24)
    )
  }

  private u32to8le(n: number, data: Uint8Array, offset: number): void {
    data[offset] = n & 0xFF
    data[offset + 1] = (n >>> 8) & 0xFF
    data[offset + 2] = (n >>> 16) & 0xFF
    data[offset + 3] = (n >>> 24) & 0xFF
  }

  private incrementCounter(inc: number): void {
    let t = this.t[0] + inc
    this.t[0] = t >>> 0
    if (t >= 0x100000000) {
      t = this.t[1] + 1
      this.t[1] = t >>> 0
      if (t >= 0x100000000) {
        t = this.t[2] + 1
        this.t[2] = t >>> 0
        if (t >= 0x100000000) {
          this.t[3] = (this.t[3] + 1) >>> 0
        }
      }
    }
  }

  update(data: Uint8Array): void {
    let offset = 0

    while (offset < data.length) {
      const left = 128 - this.buflen
      const fill = Math.min(left, data.length - offset)

      this.buf.set(data.slice(offset, offset + fill), this.buflen)
      this.buflen += fill
      offset += fill

      if (this.buflen === 128) {
        this.incrementCounter(128)
        this.compress(false)
        this.buflen = 0
      }
    }
  }

  digest(): Uint8Array {
    // Increment counter by final chunk length
    this.incrementCounter(this.buflen)

    // Pad final chunk
    for (let i = this.buflen; i < 128; i++) {
      this.buf[i] = 0
    }

    // Final compression
    this.compress(true)

    // Convert hash to bytes
    const out = new Uint8Array(this.outlen)
    for (let i = 0; i < this.outlen; i++) {
      const wordIndex = Math.floor(i / 4)
      const byteIndex = i % 4
      out[i] = (this.h[wordIndex] >>> (byteIndex * 8)) & 0xFF
    }

    return out
  }

  static hash(data: Uint8Array, outlen = 64, key?: Uint8Array): Uint8Array {
    const blake2b = new BLAKE2b(outlen, key)
    blake2b.update(data)
    return blake2b.digest()
  }
}

/**
 * Utility functions for modern ciphers
 */
export class ModernCipherUtils {
  /**
   * Generate a random key for the specified algorithm
   */
  static generateKey(_algorithm: 'chacha20' | 'xsalsa20' | 'blake2b' = 'chacha20'): Uint8Array {
    const csprng = new CSPRNG()
    return csprng.randomBytes(32) // All these algorithms use 256-bit keys
  }

  /**
   * Generate a random nonce for the specified algorithm
   */
  static generateNonce(algorithm: 'chacha20' | 'xsalsa20' = 'chacha20'): Uint8Array {
    const csprng = new CSPRNG()
    if (algorithm === 'chacha20') {
      return csprng.randomBytes(12) // 96-bit nonce
    }
 else {
      return csprng.randomBytes(24) // 192-bit nonce for XSalsa20
    }
  }

  /**
   * Encrypt data with authentication using ChaCha20-Poly1305
   */
  static encryptAEAD(
    plaintext: Uint8Array | string,
    key: Uint8Array,
    additionalData?: Uint8Array | string,
  ): { ciphertext: Uint8Array, nonce: Uint8Array, tag: Uint8Array } {
    const data = typeof plaintext === 'string'
      ? new TextEncoder().encode(plaintext)
      : plaintext

    const aad = additionalData
      ? (typeof additionalData === 'string'
          ? new TextEncoder().encode(additionalData)
          : additionalData)
      : undefined

    const nonce = this.generateNonce('chacha20')
    const cipher = new ChaCha20Poly1305()
    const result = cipher.encrypt(data, key, nonce, aad)

    return {
      ciphertext: result.ciphertext,
      nonce,
      tag: result.tag,
    }
  }

  /**
   * Decrypt data with authentication using ChaCha20-Poly1305
   */
  static decryptAEAD(
    ciphertext: Uint8Array,
    tag: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    additionalData?: Uint8Array | string,
  ): Uint8Array | null {
    const aad = additionalData
      ? (typeof additionalData === 'string'
          ? new TextEncoder().encode(additionalData)
          : additionalData)
      : undefined

    const cipher = new ChaCha20Poly1305()
    return cipher.decrypt(ciphertext, tag, key, nonce, aad)
  }

  /**
   * Hash data using BLAKE2b
   */
  static blake2bHash(
    data: Uint8Array | string,
    outputLength = 64,
    key?: Uint8Array,
  ): Uint8Array {
    const input = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data

    return BLAKE2b.hash(input, outputLength, key)
  }

  /**
   * Create a keyed hash (MAC) using BLAKE2b
   */
  static blake2bMAC(
    data: Uint8Array | string,
    key: Uint8Array,
    outputLength = 32,
  ): Uint8Array {
    return this.blake2bHash(data, outputLength, key)
  }
}

export default {
  ChaCha20,
  Poly1305,
  ChaCha20Poly1305,
  XSalsa20,
  BLAKE2b,
  ModernCipherUtils,
}
