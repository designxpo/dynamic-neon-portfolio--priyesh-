#!/usr/bin/env node
/**
 * Seed script to populate Education collection with sample data
 * Use this if your education collection is empty
 * 
 * Run: node scripts/seed-education.js
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
  institution: String,
  startYear: String,
  endYear: String,
  description: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Education = mongoose.models.Education || mongoose.model('Education', educationSchema);

// Sample education data
const sampleEducation = [
  {
    degree: 'Bachelor of Computer Science',
    institution: 'University of Technology',
    startYear: '2018',
    endYear: '2022',
    description: 'Focused on software engineering, algorithms, and full-stack web development. Graduated with honors.',
    order: 1,
  },
  {
    degree: 'High School Diploma',
    institution: 'City High School',
    startYear: '2014',
    endYear: '2018',
    description: 'Specialized in Mathematics and Computer Science. Active member of the coding club.',
    order: 2,
  },
];

async function seedEducation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if education already exists
    const existingCount = await Education.countDocuments();
    console.log(`📊 Current education count: ${existingCount}`);

    if (existingCount > 0) {
      console.log('\n⚠️  Education data already exists!');
      console.log('   This script is only for seeding empty collections.');
      console.log('   Use fix-education-data.js to fix existing data.');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🌱 Seeding education data...\n');

    for (const edu of sampleEducation) {
      const created = await Education.create(edu);
      console.log(`✅ Created: ${created.degree} at ${created.institution}`);
    }

    console.log('\n✅ Education data seeded successfully!');
    console.log(`   Added ${sampleEducation.length} education entries`);
    console.log('\n💡 You can now edit these entries in the Admin panel.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run seeder
seedEducation();
