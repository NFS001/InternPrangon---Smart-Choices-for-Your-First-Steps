const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Internship = require('../models/Internship');
const Resume = require('../models/Resume');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas...');

        // 1. Admin User (admin123@gmail.com)
        let admin = await User.findOne({ email: 'admin123@gmail.com' });
        if (!admin) {
            admin = await User.create({
                name: 'System Administrator',
                email: 'admin123@gmail.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Created Admin:', admin.email);
        } else {
            admin.password = 'admin123';
            admin.role = 'admin';
            await admin.save();
            console.log('Updated Admin password to admin123:', admin.email);
        }

        // Also ensure fallback admin@internprangon.com exists for backwards-compat if any test references it
        let legacyAdmin = await User.findOne({ email: 'admin@internprangon.com' });
        if (!legacyAdmin) {
            await User.create({
                name: 'System Administrator',
                email: 'admin@internprangon.com',
                password: 'admin123',
                role: 'admin'
            });
        }

        // 2. Demo Student User
        let demoStudent = await User.findOne({ email: 'student@internprangon.com' });
        if (!demoStudent) {
            demoStudent = await User.create({
                name: 'Tahmid Rahman',
                email: 'student@internprangon.com',
                password: 'student123',
                role: 'student'
            });
            console.log('Created Demo Student:', demoStudent.email);
        } else {
            demoStudent.password = 'student123';
            await demoStudent.save();
        }

        let studentProf = await StudentProfile.findOne({ user: demoStudent._id });
        if (!studentProf) {
            studentProf = await StudentProfile.create({
                user: demoStudent._id,
                bio: 'CS Student passionate about Web Development and Cloud Computing.',
                skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
                points: 15,
                badge: 'Newbie'
            });
            console.log('Created Demo StudentProfile');
        }

        let demoResume = await Resume.findOne({ studentId: demoStudent._id });
        if (!demoResume) {
            const resumesDir = path.resolve(__dirname, '..', 'uploads', 'resumes');
            if (!fs.existsSync(resumesDir)) {
                fs.mkdirSync(resumesDir, { recursive: true });
            }
            const sampleResumeFile = path.join(resumesDir, 'demo_student_resume.pdf');
            if (!fs.existsSync(sampleResumeFile)) {
                fs.writeFileSync(sampleResumeFile, '%PDF-1.4 Demo Student Resume Placeholder');
            }
            demoResume = await Resume.create({
                studentId: demoStudent._id,
                filePath: 'uploads/resumes/demo_student_resume.pdf',
                uploadedDate: new Date()
            });
            console.log('Created Demo Student Resume');
        }

        // 3. Demo Company User
        let demoCompany = await User.findOne({ email: 'company@internprangon.com' });
        if (!demoCompany) {
            demoCompany = await User.create({
                name: 'Pathao HR',
                email: 'company@internprangon.com',
                password: 'company123',
                role: 'company'
            });
            console.log('Created Demo Company User:', demoCompany.email);
        } else {
            demoCompany.password = 'company123';
            await demoCompany.save();
        }

        // 4. Seed Core Verified Companies
        const companiesData = [
            {
                name: 'Pathao',
                industry: 'Ride Sharing & Logistics',
                description: 'Leading digital platform in Bangladesh providing ride sharing, food delivery, and logistics.',
                website: 'https://pathao.com',
                verificationStatus: 'Approved'
            },
            {
                name: 'bKash Limited',
                industry: 'FinTech',
                description: 'The largest mobile financial service provider in Bangladesh.',
                website: 'https://bkash.com',
                verificationStatus: 'Approved'
            },
            {
                name: 'Brain Station 23',
                industry: 'Software & Cloud Services',
                description: 'Global software solutions company with 700+ engineers.',
                website: 'https://brainstation-23.com',
                verificationStatus: 'Approved'
            },
            {
                name: 'Optimizely',
                industry: 'Experimentation & SaaS',
                description: 'Global leader in digital experience and experimentation platforms.',
                website: 'https://optimizely.com',
                verificationStatus: 'Approved'
            },
            {
                name: 'Chaldal',
                industry: 'E-commerce & Grocery',
                description: 'Pioneering online grocery service operating across Dhaka and major cities.',
                website: 'https://chaldal.com',
                verificationStatus: 'Approved'
            },
            {
                name: 'ShopUp',
                industry: 'B2B Commerce & Supply Chain',
                description: 'Full-stack B2B commerce platform for small businesses in Bangladesh.',
                website: 'https://shopup.com.bd',
                verificationStatus: 'Approved'
            },
            {
                name: 'Sheba.xyz',
                industry: 'Home Services & Tech',
                description: 'Bangladesh’s largest service marketplace platform.',
                website: 'https://sheba.xyz',
                verificationStatus: 'Approved'
            },
            {
                name: 'TechNovus Labs',
                industry: 'AI & Data Science',
                description: 'Startup building AI solutions for local logistics and analytics.',
                website: 'https://technovus.example.com',
                verificationStatus: 'Pending'
            }
        ];

        const companyProfilesMap = {};

        for (const cData of companiesData) {
            let compUser = await User.findOne({ email: `${cData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com` });
            if (!compUser) {
                compUser = await User.create({
                    name: `${cData.name} Rep`,
                    email: `${cData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
                    password: 'password123',
                    role: 'company'
                });
            }

            let profile = await CompanyProfile.findOne({ companyName: cData.name });
            if (!profile) {
                profile = await CompanyProfile.create({
                    user: compUser._id,
                    companyName: cData.name,
                    industry: cData.industry,
                    description: cData.description,
                    website: cData.website,
                    verificationDocument: 'trade_license_demo.pdf',
                    verificationStatus: cData.verificationStatus
                });
                console.log(`Created Company: ${cData.name} (${cData.verificationStatus})`);
            } else {
                profile.verificationStatus = cData.verificationStatus;
                await profile.save();
            }
            companyProfilesMap[cData.name] = profile;
        }

        // 5. Seed Core Internships for Approved Companies
        const internshipsData = [
            {
                companyName: 'Pathao',
                title: 'Software Engineer Intern (Backend)',
                description: 'Join our logistics engineering squad to build resilient microservices with Go and Node.js. Learn high-throughput messaging and scalable system design.',
                type: 'Paid',
                mode: 'On-site',
                deadlineDays: 14
            },
            {
                companyName: 'bKash Limited',
                title: 'Quality Assurance Intern',
                description: 'Work with the FinTech QA team on automation testing frameworks, regression suites, and load performance testing.',
                type: 'Paid',
                mode: 'On-site',
                deadlineDays: 7
            },
            {
                companyName: 'Brain Station 23',
                title: 'Frontend React / Next.js Intern',
                description: 'Build modern enterprise web applications using React, Next.js, and TailwindCSS. Collaborate directly with international clients.',
                type: 'Paid',
                mode: 'Remote',
                deadlineDays: 20
            },
            {
                companyName: 'Optimizely',
                title: 'Product Design (UI/UX) Intern',
                description: 'Shape user flows, design scalable Figma component libraries, and participate in user research for developer tooling.',
                type: 'Paid',
                mode: 'Remote',
                deadlineDays: 3
            },
            {
                companyName: 'Chaldal',
                title: 'Data Analyst Intern',
                description: 'Analyze supply chain metrics and customer delivery patterns using Python, SQL, and PowerBI.',
                type: 'Paid',
                mode: 'On-site',
                deadlineDays: 25
            },
            {
                companyName: 'ShopUp',
                title: 'Operations & Logistics Intern',
                description: 'Assist in warehouse management, inventory optimization, and vendor onboarding processes.',
                type: 'Unpaid',
                mode: 'On-site',
                deadlineDays: 18
            }
        ];

        for (const iData of internshipsData) {
            const company = companyProfilesMap[iData.companyName];
            if (!company) continue;

            const existingInternship = await Internship.findOne({
                companyId: company.user,
                title: iData.title
            });

            const deadline = new Date(Date.now() + iData.deadlineDays * 24 * 60 * 60 * 1000);

            if (!existingInternship) {
                await Internship.create({
                    companyId: company.user,
                    title: iData.title,
                    description: iData.description,
                    type: iData.type,
                    mode: iData.mode,
                    deadline
                });
                console.log(`Created Internship: ${iData.title}`);
            } else {
                existingInternship.deadline = deadline;
                await existingInternship.save();
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
