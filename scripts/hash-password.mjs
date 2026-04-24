#!/usr/bin/env node
// Generate a fresh proposal access code + its argon2id hash.
//
// Usage:
//   node scripts/hash-password.mjs             # generates a new UUID
//   node scripts/hash-password.mjs <code>      # hashes an existing code
//
// Parameters follow OWASP 2024 argon2id recommendation: m=19 MiB, t=2, p=1.
// Copy HASH into the proposal JSON's passwordHash field. Deliver CODE to
// the client via a secure side channel (1Password share, Signal). Do NOT
// paste CODE into email, chat, or anything that retains a copy.

import crypto from "node:crypto";
import argon2 from "argon2";

const code = process.argv[2] ?? crypto.randomUUID();

const hash = await argon2.hash(code, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});

// Sanity round-trip so we never hand over a hash that doesn't match.
const ok = await argon2.verify(hash, code);
if (!ok) {
  console.error("FATAL: round-trip verify failed. Do not use this hash.");
  process.exit(1);
}

console.log("CODE=" + code);
console.log("HASH=" + hash);
