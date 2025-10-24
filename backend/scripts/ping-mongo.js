/*
  Ping MongoDB using native driver with Stable API v1.
  Reads MONGODB_URI from backend/.env
*/

const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

// Load backend/.env explicitly
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set. Create backend/.env with your Atlas URI or local MongoDB URI.');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Ping successful: Connected to MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Ping failed:', err?.message || err);
    process.exit(1);
  } finally {
    await client.close().catch(() => {});
  }
}

run();
