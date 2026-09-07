const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');
const Internship = require('../models/Internship');
const Review = require('../models/Review');
const StipendReport = require('../models/StipendReport');
const InterviewExperience = require('../models/InterviewExperience');

async function seedRealData() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    // 1. Delete dummy / mock / junk users and companies
    console.log('\nCleaning up dummy and test data...');

    const dummyUsernames = [
        /apex/i,
        /acme/i,
        /comp_1788/i,
        /abc@gmail/i,
        /facebook/i,
        /sprint/i,
        /byteforge/i
    ];

    const dummyUsers = await User.find({
        $or: [
            { email: { $in: dummyUsernames } },
            { name: { $in: dummyUsernames } }
        ]
    });

    for (const u of dummyUsers) {
        console.log(`Deleting dummy user: ${u.name} (${u.email})`);
        await CompanyProfile.deleteMany({ user: u._id });
        await Internship.deleteMany({ companyId: u._id });
        await User.deleteOne({ _id: u._id });
    }

    // Delete dummy internships like "Bug fixer", "Lab assistant", "Teacher"
    const dummyInternshipTitles = [/bug fixer/i, /lab assistant/i, /teacher/i, /senior frontend engineer intern/i];
    for (const pat of dummyInternshipTitles) {
        const deleted = await Internship.deleteMany({ title: { $regex: pat } });
        if (deleted.deletedCount > 0) {
            console.log(`Deleted ${deleted.deletedCount} dummy internships matching ${pat}`);
        }
    }

    // 2. Real Companies to ensure in DB
    const realCompanies = [
        {
            key: 'brainstation',
            companyName: 'Brain Station 23',
            email: 'brainstation@gmail.com',
            altEmail: 'brainstation23@gmail.com',
            password: 'brainstation123',
            industry: 'Software & Cloud Solutions',
            description: 'Global software solutions company with 700+ engineers building cloud and enterprise systems.',
            website: 'https://brainstation-23.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Software Engineer Intern (Backend & Cloud)',
                    description: 'Work with our cloud and enterprise backend team on scalable microservices using Node.js, Go, and AWS. Real production deployments from month one.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-04-30')
                },
                {
                    title: 'Frontend React / Next.js Intern',
                    description: 'Build responsive, accessible user interfaces for international clients using React, Next.js, and TypeScript with modern design systems.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-05-15')
                }
            ]
        },
        {
            key: 'chaldal',
            companyName: 'Chaldal',
            email: 'chaldal@gmail.com',
            password: 'chaldal123',
            industry: 'E-commerce & Grocery',
            description: 'Pioneering online grocery service operating across Dhaka and major cities in Bangladesh.',
            website: 'https://chaldal.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Backend Engineering Intern (C# / .NET)',
                    description: 'Contribute to the logistics and warehouse management infrastructure powering thousands of daily grocery deliveries across Bangladesh.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-04-15')
                },
                {
                    title: 'Data Analyst Intern',
                    description: 'Analyze real-time demand patterns, delivery route efficiency, and product catalog performance using SQL and Python.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-01')
                }
            ]
        },
        {
            key: 'square',
            companyName: 'Square',
            email: 'square@gmail.com',
            password: 'square123',
            industry: 'Healthcare & Pharmaceuticals',
            description: 'Leading healthcare and enterprise conglomerate in Bangladesh offering diverse career opportunities.',
            website: 'https://squarepharma.com.bd',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Software Quality Assurance Intern',
                    description: 'Write automated end-to-end tests, design test plans, and ensure enterprise software meets high-reliability medical standards.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-04-20')
                },
                {
                    title: 'Enterprise Systems Analyst Intern',
                    description: 'Assist in maintaining and auditing ERP systems, database integrity, and automated supply chain pipelines across manufacturing units.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-05-10')
                }
            ]
        },
        {
            key: 'pathao',
            companyName: 'Pathao',
            email: 'pathao@gmail.com',
            password: 'pathao123',
            industry: 'Ride-sharing & Logistics',
            description: 'Super-app providing ride-hailing, food delivery, logistics, and digital payment services.',
            website: 'https://pathao.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Mobile App Developer Intern (Flutter)',
                    description: 'Build fast, intuitive client-facing screens and map interactions for millions of daily commuters and delivery riders.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-04-25')
                },
                {
                    title: 'Product Operations Intern',
                    description: 'Monitor daily operations metrics, merchant onboarding funnels, and assist product managers in improving user experience.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-05')
                }
            ]
        },
        {
            key: 'bkash',
            companyName: 'bKash Limited',
            email: 'bkash@gmail.com',
            password: 'bkash123',
            industry: 'Fintech & Mobile Financial Services',
            description: 'Largest mobile financial services provider in Bangladesh empowering millions with digital transactions.',
            website: 'https://bkash.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Fintech Cybersecurity Intern',
                    description: 'Conduct security vulnerability assessments, audit API authentication headers, and ensure PCI-DSS security compliance.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-04-28')
                },
                {
                    title: 'Cloud Infrastructure Intern',
                    description: 'Help manage Kubernetes clusters, CI/CD pipelines, and high-availability database replication for financial transaction systems.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-20')
                }
            ]
        },
        {
            key: 'optimizely',
            companyName: 'Optimizely',
            email: 'optimizely@gmail.com',
            password: 'optimizely123',
            industry: 'Digital Experience & Experimentation',
            description: 'Global leader in digital experience platform (DXP) software with a major engineering hub in Dhaka.',
            website: 'https://optimizely.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Product Design (UI/UX) Intern',
                    description: 'Create user flows, interactive prototypes, and collaborate with frontend engineers on global design system tokens.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-04-10')
                },
                {
                    title: 'Full Stack Software Engineer Intern',
                    description: 'Build scalable experimentation features in React and C#/.NET used by Fortune 500 companies around the world.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-12')
                }
            ]
        },
        {
            key: 'shopup',
            companyName: 'ShopUp',
            email: 'shopup@gmail.com',
            password: 'shopup123',
            industry: 'B2B Commerce & Supply Chain',
            description: "Bangladesh's leading B2B commerce platform connecting micro-retailers to food producers.",
            website: 'https://shopup.com.bd',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Operations & Supply Chain Intern',
                    description: 'Optimize fulfillment center dispatch timings, warehouse stock tracking, and supplier coordination workflows.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-04-18')
                }
            ]
        },
        {
            key: 'daraz',
            companyName: 'Daraz',
            email: 'daraz@gmail.com',
            password: 'daraz123',
            industry: 'E-Commerce & Retail',
            description: "South Asia's premier online marketplace backed by Alibaba Group.",
            website: 'https://daraz.com.bd',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'E-Commerce Business Analytics Intern',
                    description: 'Create visual performance dashboards for merchant categories, conversion funnels, and marketing campaign efficacy.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-08')
                }
            ]
        },
        {
            key: 'rokomari',
            companyName: 'Rokomari',
            email: 'rokomari@gmail.com',
            password: 'rokomari123',
            industry: 'E-Commerce & Books',
            description: "Bangladesh's largest online bookstore and consumer products e-retailer.",
            website: 'https://rokomari.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Web Application Developer Intern',
                    description: 'Maintain and enhance customer-facing search algorithms, catalog navigation, and shopping cart checkout flows.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-14')
                }
            ]
        },
        {
            key: '10minuteschool',
            companyName: '10 Minute School',
            email: '10minuteschool@gmail.com',
            password: '10minuteschool123',
            industry: 'EdTech & Education',
            description: 'Largest online educational platform in Bangladesh helping millions of students excel.',
            website: 'https://10minuteschool.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Educational Technology Intern',
                    description: 'Develop interactive quiz modules, learning progress trackers, and video streaming enhancements for the mobile learning app.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-18')
                }
            ]
        },
        {
            key: 'incepta',
            companyName: 'Incepta Pharmaceuticals',
            email: 'incepta@gmail.com',
            password: 'incepta123',
            industry: 'Pharmaceuticals & Biotechnology',
            description: 'Top pharmaceutical manufacturing company in Bangladesh innovating healthcare products.',
            website: 'https://inceptapharma.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Biotech Research Assistant Intern',
                    description: 'Support analytical chemistry documentation, formulation testing records, and quality control database logging.',
                    type: 'Paid',
                    mode: 'On-site',
                    deadline: new Date('2027-05-25')
                }
            ]
        },
        {
            key: 'biopharma',
            companyName: 'BioPharma Group',
            email: 'biopharma@gmail.com',
            password: 'biopharma123',
            industry: 'Healthcare & Life Sciences',
            description: 'Innovative healthcare enterprise providing pharmaceutical research and biotechnology internships.',
            website: 'https://biopharmabd.com',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Clinical Research Intern',
                    description: 'Assist in clinical data auditing, trial participant reporting, and healthcare documentation management.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-30')
                }
            ]
        },
        {
            key: 'sheba',
            companyName: 'Sheba.xyz',
            email: 'sheba@gmail.com',
            password: 'sheba123',
            industry: 'On-demand Services',
            description: 'Leading service marketplace providing home and corporate service solutions across Bangladesh.',
            website: 'https://sheba.xyz',
            verificationStatus: 'Approved',
            internships: [
                {
                    title: 'Customer Experience & Product Intern',
                    description: 'Analyze service partner feedback, investigate booking flow drop-offs, and suggest UI enhancements for mobile apps.',
                    type: 'Paid',
                    mode: 'Remote',
                    deadline: new Date('2027-05-22')
                }
            ]
        },
        {
            key: 'fintech',
            companyName: 'FinTech Hub',
            email: 'fintech@gmail.com',
            password: 'fintech123',
            industry: 'Fintech',
            description: 'Emerging financial technology startup building automated micro-lending algorithms.',
            website: 'https://fintechhub.local',
            verificationStatus: 'Pending',
            internships: []
        },
        {
            key: 'edtech',
            companyName: 'EdTech Global',
            email: 'edtech@gmail.com',
            password: 'edtech123',
            industry: 'EdTech',
            description: 'Educational technology firm developing skill assessment and coding challenges.',
            website: 'https://edtechglobal.local',
            verificationStatus: 'Pending',
            internships: []
        }
    ];

    console.log('\nEnsuring real companies, users, and internships...');

    for (const compData of realCompanies) {
        // 1. Find or create user
        let user = await User.findOne({
            $or: [
                { email: compData.email },
                compData.altEmail ? { email: compData.altEmail } : null,
                { name: compData.companyName }
            ].filter(Boolean)
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(compData.password, salt);

        if (!user) {
            user = await User.create({
                name: compData.companyName,
                email: compData.email,
                password: compData.password, // Schema pre('save') will hash if not hashed
                role: 'company'
            });
            console.log(`Created company user: ${user.email} (pwd: ${compData.password})`);
        } else {
            // Update email to standard format requested by user: companyname@gmail.com
            user.email = compData.email;
            user.password = hashedPassword;
            user.name = compData.companyName;
            await User.updateOne({ _id: user._id }, {
                email: compData.email,
                password: hashedPassword,
                name: compData.companyName,
                role: 'company'
            });
            console.log(`Updated company user: ${compData.email} (pwd: ${compData.password})`);
        }

        // 2. Find or create company profile
        let profile = await CompanyProfile.findOne({
            $or: [
                { user: user._id },
                { companyName: compData.companyName }
            ]
        });

        if (!profile) {
            profile = await CompanyProfile.create({
                user: user._id,
                companyName: compData.companyName,
                industry: compData.industry,
                description: compData.description,
                website: compData.website,
                verificationStatus: compData.verificationStatus,
                verificationDocument: 'trade_license.pdf'
            });
            console.log(`Created company profile: ${compData.companyName}`);
        } else {
            profile.user = user._id;
            profile.companyName = compData.companyName;
            profile.industry = compData.industry;
            profile.description = compData.description;
            profile.website = compData.website;
            profile.verificationStatus = compData.verificationStatus;
            await profile.save();
            console.log(`Updated company profile: ${compData.companyName}`);
        }

        // 3. Ensure internships
        if (compData.verificationStatus === 'Approved' && compData.internships.length > 0) {
            for (const item of compData.internships) {
                const existing = await Internship.findOne({
                    companyId: user._id,
                    title: item.title
                });

                if (!existing) {
                    await Internship.create({
                        companyId: user._id,
                        title: item.title,
                        description: item.description,
                        type: item.type,
                        mode: item.mode,
                        deadline: item.deadline
                    });
                    console.log(`  + Seeded internship: "${item.title}" for ${compData.companyName}`);
                }
            }
        }
    }

    console.log('\nSeeding completed successfully!');
    await mongoose.disconnect();
}

seedRealData().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
