// Migration script to clean up old SEO documents and ensure 'page' field exists
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI not set');

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  const SEO = mongoose.connection.collection('seos');

  // Remove documents missing 'page' field
  const deleteResult = await SEO.deleteMany({ page: { $exists: false } });
  console.log(`Deleted ${deleteResult.deletedCount} old SEO documents without 'page' field.`);

  // Optionally, update documents to add a default 'page' value
  // const updateResult = await SEO.updateMany(
  //   { page: { $exists: false } },
  //   { $set: { page: 'home' } }
  // );
  // console.log(`Updated ${updateResult.modifiedCount} SEO documents to add 'page' field.`);

  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
