#!/usr/bin/env node
/**
 * Migration script to fix Education collection in MongoDB
 * Normalizes legacy field names (course → degree, university → institution)
 * and ensures all documents have required fields
 * 
 * Run: node scripts/fix-education-data.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length && !line.trim().startsWith('#')) {
      // Remove quotes if present
      let value = values.join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Define Education schema
const educationSchema = new mongoose.Schema({
  degree: String,
  course: String, // legacy field
  institution: String,
  university: String, // legacy field
  startYear: String,
  start: String, // legacy field
  endYear: String,
  end: String, // legacy field
  description: String,
  order: { type: Number, default: 0 },
}, { timestamps: true, strict: false });

const Education = mongoose.models.Education || mongoose.model('Education', educationSchema);

async function fixEducationData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all education documents
    const educations = await Education.find({}).lean();
    console.log(`📊 Found ${educations.length} education documents\n`);

    if (educations.length === 0) {
      console.log('ℹ️  No education documents found. Collection is empty.');
      console.log('💡 Add education entries through the Admin panel.');
      await mongoose.disconnect();
      return;
    }

    let fixedCount = 0;
    let alreadyCorrect = 0;

    for (const doc of educations) {
      console.log(`\n📄 Checking document: ${doc._id}`);
      console.log('   Current fields:', {
        degree: doc.degree || '(empty)',
        course: doc.course || '(empty)',
        institution: doc.institution || '(empty)',
        university: doc.university || '(empty)',
        startYear: doc.startYear || '(empty)',
        endYear: doc.endYear || '(empty)',
      });

      const updates = {};
      let needsUpdate = false;

      // Map legacy fields to new fields
      if (!doc.degree && doc.course) {
        updates.degree = doc.course;
        updates.$unset = { ...updates.$unset, course: 1 };
        needsUpdate = true;
      }

      if (!doc.institution && doc.university) {
        updates.institution = doc.university;
        updates.$unset = { ...updates.$unset, university: 1 };
        needsUpdate = true;
      }

      if (!doc.startYear && doc.start) {
        updates.startYear = doc.start;
        updates.$unset = { ...updates.$unset, start: 1 };
        needsUpdate = true;
      }

      if (!doc.endYear && doc.end) {
        updates.endYear = doc.end;
        updates.$unset = { ...updates.$unset, end: 1 };
        needsUpdate = true;
      }

      // Ensure required fields exist
      if (!doc.degree && !doc.course) {
        console.log('   ⚠️  Warning: No degree/course field found!');
      }

      if (!doc.institution && !doc.university) {
        console.log('   ⚠️  Warning: No institution/university field found!');
      }

      if (needsUpdate) {
        await Education.updateOne({ _id: doc._id }, updates);
        console.log('   ✅ Fixed legacy fields');
        fixedCount++;
      } else {
        console.log('   ✓ Already correct');
        alreadyCorrect++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log(`   Total documents: ${educations.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Already correct: ${alreadyCorrect}`);
    console.log('='.repeat(60) + '\n');

    // Verify the fix
    console.log('🔍 Verifying fixed data...\n');
    const verifyDocs = await Education.find({}).lean();
    
    for (const doc of verifyDocs) {
      console.log(`✓ ${doc._id}:`);
      console.log(`  Degree: ${doc.degree || '(empty)'}`);
      console.log(`  Institution: ${doc.institution || '(empty)'}`);
      console.log(`  Years: ${doc.startYear || '?'} - ${doc.endYear || '?'}`);
    }

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
fixEducationData();
