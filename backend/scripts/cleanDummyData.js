const mongoose = require('mongoose');
require('dotenv').config();
const CompanyProfile = require('../models/CompanyProfile');
const Review = require('../models/Review');
const Flag = require('../models/Flag');

async function cleanDummyData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. Find timestamped test companies and specific test names
    const dummyRegex = /ApexNova Labs|Sprint Test Company|Acme Test Corp/i;
    const dummyComps = await CompanyProfile.find({ companyName: dummyRegex });
    console.log(`Found ${dummyComps.length} test companies to remove.`);

    for (const c of dummyComps) {
      // Remove flags for reviews of this company
      const reviews = await Review.find({ company: c._id });
      for (const r of reviews) {
        await Flag.deleteMany({ review: r._id });
      }
      await Review.deleteMany({ company: c._id });
      await CompanyProfile.findByIdAndDelete(c._id);
      console.log(`Deleted test company: ${c.companyName} (${c._id})`);
    }

    // 2. Deduplicate Healthcare Labs, FinTech Hub, EdTech Global
    const dupNames = ['Healthcare Labs', 'FinTech Hub', 'EdTech Global'];
    for (const name of dupNames) {
      const records = await CompanyProfile.find({ companyName: name }).sort({ createdAt: 1 });
      if (records.length > 1) {
        // Keep the first one, delete the rest
        const toKeep = records[0];
        const toRemove = records.slice(1);
        console.log(`Keeping 1 copy of ${name} (${toKeep._id}), removing ${toRemove.length} duplicates.`);
        for (const r of toRemove) {
          const reviews = await Review.find({ company: r._id });
          for (const rev of reviews) {
            await Flag.deleteMany({ review: rev._id });
          }
          await Review.deleteMany({ company: r._id });
          await CompanyProfile.findByIdAndDelete(r._id);
        }
      }
    }

    // 3. Clean up orphaned flags (flags where review no longer exists)
    const allFlags = await Flag.find({});
    let orphanedFlags = 0;
    for (const f of allFlags) {
      if (f.review) {
        const revExists = await Review.findById(f.review);
        if (!revExists) {
          await Flag.findByIdAndDelete(f._id);
          orphanedFlags++;
        }
      } else {
        await Flag.findByIdAndDelete(f._id);
        orphanedFlags++;
      }
    }
    if (orphanedFlags > 0) {
      console.log(`Cleaned up ${orphanedFlags} orphaned flag(s).`);
    }

    // 4. Summarize remaining companies
    const remaining = await CompanyProfile.find({}).sort({ companyName: 1 });
    console.log(`\n=== REMAINING CLEAN COMPANIES (${remaining.length} total) ===`);
    const statusCounts = {};
    remaining.forEach((c) => {
      statusCounts[c.verificationStatus] = (statusCounts[c.verificationStatus] || 0) + 1;
      console.log(`- ${c.companyName} [${c.verificationStatus}] (ID: ${c._id})`);
    });
    console.log('\nStatus breakdown:', statusCounts);

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning dummy data:', err);
    process.exit(1);
  }
}

cleanDummyData();
