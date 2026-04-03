#!/usr/bin/env node
/**
 * Quick diagnostic script to check education data
 * Run: MONGODB_URI="your_uri" node scripts/check-education.js
 * Or pass URI as first argument: node scripts/check-education.js "mongodb+srv://..."
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('undefined')) {
  console.error('❌ MongoDB URI not provided!');
  console.error('Usage: node scripts/check-education.js "mongodb+srv://..."');
  process.exit(1);
}

// Define Education schema (flexible)
const educationSchema = new mongoose.Schema({}, { timestamps: true, strict: false });
const Education = mongoose.models.Education || mongoose.model('Education', educationSchema);

async function checkEducation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const count = await Education.countDocuments();
    console.log(`📊 Total education documents: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  Collection is EMPTY!');
      console.log('💡 Run: node scripts/seed-education.js "your_mongodb_uri"');
      await mongoose.disconnect();
      return;
    }

    const docs = await Education.find({}).lean();
    
    console.log('📄 Document details:\n');
    docs.forEach((doc, i) => {
      console.log(`${i + 1}. ID: ${doc._id}`);
      console.log(`   Fields present:`, Object.keys(doc).filter(k => k !== '_id' && k !== '__v'));
      console.log(`   degree: "${doc.degree || ''}"`);
      console.log(`   course: "${doc.course || ''}"`);
      console.log(`   institution: "${doc.institution || ''}"`);
      console.log(`   university: "${doc.university || ''}"`);
      console.log(`   startYear: "${doc.startYear || ''}"`);
      console.log(`   start: "${doc.start || ''}"`);
      console.log(`   endYear: "${doc.endYear || ''}"`);
      console.log(`   end: "${doc.end || ''}"`);
      console.log(`   description: "${(doc.description || '').substring(0, 50)}..."`);
      console.log(`   order: ${doc.order || 0}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('DIAGNOSIS:');
    
    const hasLegacyFields = docs.some(d => d.course || d.university || d.start || d.end);
    const hasNewFields = docs.some(d => d.degree || d.institution || d.startYear || d.endYear);
    const hasEmptyFields = docs.some(d => !d.degree && !d.course);
    
    if (hasLegacyFields && !hasNewFields) {
      console.log('🔧 NEEDS MIGRATION: Documents use legacy field names');
      console.log('   Run: node scripts/fix-education-data.js "your_mongodb_uri"');
    } else if (hasEmptyFields) {
      console.log('⚠️  WARNING: Some documents missing required fields');
      console.log('   Add data through Admin panel or fix manually');
    } else if (hasNewFields) {
      console.log('✅ Documents look correct!');
      console.log('   If not displaying, check frontend component');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected');
  }
}

checkEducation();
