/**
 * Directly set (or reset) the admin password hash in MongoDB.
 *
 * Use when login shows "invalid credentials" because a password hash is already
 * stored in the DB (which overrides the ADMIN_PASSWORD env var on login).
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/set-admin-password.js "your-new-password"
 *
 * The hashing here mirrors lib/adminAuth.ts exactly (scrypt, salt:hash hex),
 * so the app's verifyPassword() will accept the password you set.
 */
const crypto = require('crypto');
const mongoose = require('mongoose');

const SCRYPT_KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const password = process.argv[2] || process.env.ADMIN_PASSWORD;
  const uri = process.env.MONGODB_URI;

  if (!password) {
    console.error('✗ Provide a password: node scripts/set-admin-password.js "your-new-password"');
    process.exit(1);
  }
  if (!uri) {
    console.error('✗ MONGODB_URI is not set. Export it or prefix the command with it.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const coll = mongoose.connection.collection('siteconfigs');
  const hash = hashPassword(password);
  const res = await coll.updateOne(
    {},
    { $set: { adminPasswordHash: hash }, $unset: { adminPassword: '' } },
    { upsert: true }
  );
  console.log(`✓ Admin password set. (matched=${res.matchedCount}, modified=${res.modifiedCount}, upserted=${res.upsertedId ? 'yes' : 'no'})`);
  console.log('  You can now log in with the password you just passed.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('✗ Failed:', e.message || e);
  process.exit(1);
});
