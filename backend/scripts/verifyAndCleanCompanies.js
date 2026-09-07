const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function verifyAuth() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({ email: String, password: String, role: String }, { strict: false }));
  const CompanyProfile = mongoose.model('CompanyProfile', new mongoose.Schema({ companyName: String, verificationStatus: String, user: mongoose.Schema.Types.ObjectId }, { strict: false }));
  const Internship = mongoose.model('Internship', new mongoose.Schema({ title: String, companyId: mongoose.Schema.Types.ObjectId }, { strict: false }));

  // Clean up any remaining dummy/orphaned users
  const orphanUsers = await User.find({
    $or: [
      { email: /@example\.com$/ },
      { email: /^healthcare_/ },
      { email: /^fintech_/ },
      { email: /^edtech_/ },
      { email: 'company@internprangon.com' }
    ]
  });

  for (const u of orphanUsers) {
    await Internship.deleteMany({ companyId: u._id });
    await CompanyProfile.deleteMany({ user: u._id });
    await User.deleteOne({ _id: u._id });
  }
  console.log(`Cleaned up ${orphanUsers.length} orphaned/dummy user accounts and associated records.`);

  // List all real companies and test their passwords
  const companies = await User.find({ role: 'company' }).lean();
  console.log('\n--- VERIFYING REAL COMPANY LOGINS ---');
  for (const c of companies) {
    const emailPrefix = c.email.split('@')[0];
    const expectedPassword = emailPrefix + '123';
    const isMatch = await bcrypt.compare(expectedPassword, c.password);
    const profile = await CompanyProfile.findOne({ user: c._id }).lean();
    console.log(
      `Email: ${c.email.padEnd(25)} | Password: ${expectedPassword.padEnd(20)} | Match: ${isMatch ? '✅' : '❌'} | Company: ${(profile ? profile.companyName : '(none)').padEnd(25)} | Status: ${profile ? profile.verificationStatus : 'N/A'}`
    );
  }

  console.log('\n--- ALL CURRENT INTERNSHIPS ---');
  const allInternships = await Internship.find().lean();
  for (const i of allInternships) {
    const user = await User.findById(i.companyId).lean();
    const profile = await CompanyProfile.findOne({ user: i.companyId }).lean();
    console.log(`[${i._id}] "${i.title}" -> ${profile?.companyName || user?.email}`);
  }

  await mongoose.disconnect();
}
verifyAuth().catch(console.error);
