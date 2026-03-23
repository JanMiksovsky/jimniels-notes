import { toString } from "@weborigami/async-tree";
import { createHash } from "node:crypto";

/**
 * Given a
 * Return a seeded random number generator function that produces a sequence of
 * pseudo-random numbers in the range [0, 1).
 *
 * @param {Uint8Array} seedData
 * @return {function(): number}
 */
export default function seedRandom(seedData) {
  let bytes;
  if (seedData instanceof Uint8Array) {
    bytes = seedData;
    // } else if (Tree.isMaplike(seedData)) {
    //   const text = Tree.deepText(seedData);
    //   bytes = new TextEncoder().encode(text);
  } else {
    const text = toString(seedData);
    if (!text) {
      throw new TypeError("Seed data must be a string or Uint8Array");
    }
    bytes = new TextEncoder().encode(text);
  }

  // Hash the seed data to produce a 128-bit seed for the xoshiro128** algorithm
  const hash = createHash("sha256").update(bytes).digest();
  const a = hash.readUInt32LE(0);
  const b = hash.readUInt32LE(4);
  const c = hash.readUInt32LE(8);
  const d = hash.readUInt32LE(12);

  const rng = xoshiro128ss(a, b, c, d);
  return rng;
}

function xoshiro128ss(a, b, c, d) {
  let s0 = a >>> 0;
  let s1 = b >>> 0;
  let s2 = c >>> 0;
  let s3 = d >>> 0;

  function rotl(x, k) {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
  }

  return function () {
    const result = (rotl(Math.imul(s1, 5), 7) * 9) >>> 0;

    const t = (s1 << 9) >>> 0;

    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;

    s2 ^= t;
    s3 = rotl(s3, 11);

    return result / 4294967296;
  };
}
