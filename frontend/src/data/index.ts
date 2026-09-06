/* ══════════════════════════════════════════════════════════════
   InternPrangon — Shared Data
   ══════════════════════════════════════════════════════════════ */

export type Navigate = (page: string, data?: Record<string, unknown>) => void;

/* ─── Internships ─────────────────────────────────────────────── */
export interface Internship {
  id: number;
  companyId: number;
  role: string;
  company: string;
  logo: string;
  logoColor: string;
  logoBg: string;
  paid: boolean;
  duration: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  tags: string[];
  posted: string;
  deadline: string;
  daysLeft: number;
  description: string;
  qualifications: string[];
  responsibilities: string[];
  stipend?: string;
  featured?: boolean;
  openings?: number;
}

export const INTERNSHIPS: Internship[] = [
  {
    id: 1, companyId: 1,
    role: 'Frontend Developer Intern', company: 'ByteForge Solutions',
    logo: 'BF', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    paid: true, duration: '3 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['React', 'TypeScript', 'TailwindCSS'], posted: '2 days ago',
    deadline: 'Feb 28, 2025', daysLeft: 12, stipend: 'BDT 15,000/mo',
    featured: true, openings: 3,
    description: `ByteForge Solutions is looking for a talented Frontend Developer Intern to join our product team. You will work closely with senior engineers to build user-facing features for our flagship SaaS product used by thousands of students and professionals across Bangladesh.\n\nThis is a hands-on role where you will write real code, participate in design reviews, and ship features in a fast-paced agile environment. We believe in mentorship and will invest in your growth.`,
    qualifications: [
      'Currently enrolled in a CS, Software Engineering, or related degree',
      'Strong foundation in HTML, CSS, and JavaScript (ES6+)',
      'Familiarity with React or Vue.js — you should have built something real',
      'Understanding of responsive design and cross-browser compatibility',
      'Ability to read and understand existing codebases',
    ],
    responsibilities: [
      'Build and maintain reusable UI components in React and TypeScript',
      'Collaborate with backend engineers to integrate REST APIs',
      'Write clean, well-documented, and tested code',
      'Participate in code reviews and provide constructive feedback',
      'Work with the design team to implement pixel-perfect interfaces',
    ],
  },
  {
    id: 2, companyId: 2,
    role: 'Data Analyst Intern', company: 'DataNest BD',
    logo: 'DN', logoColor: '#059669', logoBg: '#f0fdf4',
    paid: true, duration: '6 months', location: 'Chittagong, BD', type: 'On-site',
    tags: ['Python', 'SQL', 'Tableau', 'Excel'], posted: '5 days ago',
    deadline: 'Mar 5, 2025', daysLeft: 5, stipend: 'BDT 12,000/mo',
    featured: true, openings: 2,
    description: `DataNest BD is a data analytics consultancy helping leading enterprises in Bangladesh make smarter business decisions. As a Data Analyst Intern, you will work on real datasets, produce insights, and contribute to client-facing reports.\n\nThis is an excellent opportunity to build practical data skills and get exposure to real business problems across multiple industries.`,
    qualifications: [
      'Pursuing a degree in Statistics, Mathematics, Computer Science, or Economics',
      'Comfortable with Python (pandas, numpy) or R for data manipulation',
      'Familiar with SQL and relational databases',
      'Strong analytical thinking and problem-solving mindset',
      'Ability to communicate findings clearly in written and verbal form',
    ],
    responsibilities: [
      'Collect, clean, and prepare datasets for analysis',
      'Build dashboards and visualizations using Tableau or Power BI',
      'Run statistical analyses and summarize findings for stakeholders',
      'Support senior analysts on client projects',
      'Document data pipelines and maintain analysis notebooks',
    ],
  },
  {
    id: 3, companyId: 3,
    role: 'UI/UX Designer Intern', company: 'PixelCraft Studio',
    logo: 'PC', logoColor: '#f59e0b', logoBg: '#fffbeb',
    paid: false, duration: '3 months', location: 'Dhaka, BD', type: 'Hybrid',
    tags: ['Figma', 'Prototyping', 'User Research'], posted: '1 week ago',
    deadline: 'Mar 20, 2025', daysLeft: 22, openings: 1,
    description: `PixelCraft Studio is a boutique design agency creating digital products for clients across South Asia. We are looking for a passionate UI/UX Designer Intern who wants to sharpen their craft in a real studio environment.\n\nYou will participate in the full design process — from user research and wireframing to high-fidelity prototypes and developer handoff.`,
    qualifications: [
      'Studying Design, Fine Arts, HCI, or a related field',
      'Proficient in Figma (components, auto-layout, prototyping)',
      'Understanding of fundamental UX principles and design thinking',
      'Portfolio showing 2–3 personal or academic projects',
      'Attention to visual detail and strong aesthetic sensibility',
    ],
    responsibilities: [
      'Create wireframes, user flows, and high-fidelity UI mockups',
      'Conduct user interviews and usability testing sessions',
      'Collaborate with developers to ensure accurate design implementation',
      'Contribute to the internal design system and component library',
      'Iterate designs based on feedback and user research data',
    ],
  },
  {
    id: 4, companyId: 4,
    role: 'Software Engineer Intern', company: 'TechNova Ltd',
    logo: 'TN', logoColor: '#6d28d9', logoBg: '#f5f3ff',
    paid: true, duration: '4 months', location: 'Dhaka, BD', type: 'On-site',
    tags: ['Node.js', 'PostgreSQL', 'REST APIs', 'Docker'], posted: '3 days ago',
    deadline: 'Mar 10, 2025', daysLeft: 18, stipend: 'BDT 18,000/mo',
    featured: true, openings: 2,
    description: `TechNova Ltd is a fast-growing B2B software company building enterprise-grade solutions for the logistics and supply chain sector. Our engineering team is small, talented, and moves fast.\n\nAs a Software Engineer Intern, you will contribute to real backend systems that handle thousands of transactions per day.`,
    qualifications: [
      'CS or Engineering student with strong programming fundamentals',
      'Experience with Node.js, Python, or Java',
      'Familiarity with relational databases (PostgreSQL or MySQL)',
      'Basic understanding of REST API design principles',
      'Exposure to version control with Git',
    ],
    responsibilities: [
      'Develop and maintain RESTful API endpoints',
      'Write database queries and schema migrations',
      'Participate in sprint planning and daily stand-ups',
      'Debug and fix issues reported by QA and production monitoring',
      'Write unit and integration tests for backend services',
    ],
  },
  {
    id: 5, companyId: 5,
    role: 'Marketing Intern', company: 'GrowthHub Agency',
    logo: 'GH', logoColor: '#d97706', logoBg: '#fffbeb',
    paid: false, duration: '3 months', location: 'Sylhet, BD', type: 'Hybrid',
    tags: ['Social Media', 'Content Writing', 'SEO'], posted: '4 days ago',
    deadline: 'Mar 15, 2025', daysLeft: 9, openings: 1,
    description: `GrowthHub Agency helps SMEs across Bangladesh build their digital presence. We are looking for a creative and data-driven Marketing Intern to join our growing team in Sylhet.`,
    qualifications: [
      'Pursuing a degree in Marketing, Business Administration, or Communications',
      'Strong written communication skills in both Bengali and English',
      'Familiarity with social media platforms (Facebook, Instagram, LinkedIn)',
      'Basic understanding of SEO principles',
      'Creative mindset with an eye for engaging content',
    ],
    responsibilities: [
      'Create and schedule content for client social media pages',
      'Write blog posts and website copy optimized for SEO',
      'Monitor campaign analytics and prepare performance reports',
      'Assist with email marketing campaigns',
      'Research industry trends and competitor strategies',
    ],
  },
  {
    id: 6, companyId: 6,
    role: 'Backend Developer Intern', company: 'CloudBase',
    logo: 'CB', logoColor: '#0284c7', logoBg: '#eff6ff',
    paid: true, duration: '6 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['Python', 'Django', 'Redis', 'AWS'], posted: '1 day ago',
    deadline: 'Apr 1, 2025', daysLeft: 30, stipend: 'BDT 20,000/mo',
    featured: true, openings: 2,
    description: `CloudBase is a cloud infrastructure startup building developer tools used by engineering teams across Asia. We are looking for a Backend Developer Intern who wants to work on high-performance distributed systems.`,
    qualifications: [
      'Strong Python skills — you should be able to write clean, idiomatic Python',
      'Familiar with Django or Flask web frameworks',
      'Understanding of caching, queues, and distributed system concepts',
      'Basic knowledge of Linux command line and cloud services (AWS/GCP)',
      'Interest in performance optimization and scalability',
    ],
    responsibilities: [
      'Build and maintain Django REST APIs',
      'Implement caching strategies using Redis',
      'Write and optimize database queries',
      'Deploy and monitor services on AWS infrastructure',
      'Contribute to internal developer tooling and automation',
    ],
  },
  {
    id: 7, companyId: 7,
    role: 'FinTech Analyst Intern', company: 'FinEdge BD',
    logo: 'FE', logoColor: '#0f766e', logoBg: '#f0fdfa',
    paid: true, duration: '3 months', location: 'Dhaka, BD', type: 'On-site',
    tags: ['Excel', 'SQL', 'Financial Modeling'], posted: '6 days ago',
    deadline: 'Feb 25, 2025', daysLeft: 3, stipend: 'BDT 10,000/mo',
    openings: 1,
    description: `FinEdge BD is a licensed fintech company providing digital payment infrastructure for over 200,000 small merchants across Bangladesh.`,
    qualifications: [
      'Pursuing a degree in Finance, Economics, or Business',
      'Comfortable with Excel and basic data analysis',
      'Familiarity with financial concepts and reporting',
      'Detail-oriented with strong analytical mindset',
    ],
    responsibilities: [
      'Support the finance team with monthly reporting',
      'Analyze transaction data for merchant insights',
      'Assist in preparing investor presentations',
      'Research fintech trends and regulatory developments',
    ],
  },
  {
    id: 8, companyId: 8,
    role: 'Machine Learning Intern', company: 'Insight Analytics',
    logo: 'IA', logoColor: '#6d28d9', logoBg: '#f5f3ff',
    paid: true, duration: '6 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['Python', 'TensorFlow', 'scikit-learn', 'ML'], posted: '3 days ago',
    deadline: 'Feb 26, 2025', daysLeft: 2, stipend: 'BDT 16,000/mo',
    openings: 3,
    description: `Insight Analytics delivers machine learning and AI solutions for healthcare, retail, and banking clients in South Asia. Strong research culture and excellent mentorship from PhD-level engineers.`,
    qualifications: [
      'Pursuing a degree in Computer Science, Statistics, or related field',
      'Strong Python skills with experience in ML libraries',
      'Understanding of supervised and unsupervised learning concepts',
      'Familiarity with data preprocessing and feature engineering',
    ],
    responsibilities: [
      'Train and evaluate machine learning models',
      'Preprocess and analyze large datasets',
      'Document experiments and maintain model versioning',
      'Collaborate with the data engineering team on data pipelines',
    ],
  },
];

/* ─── Companies ───────────────────────────────────────────────── */
export interface Company {
  id: number;
  name: string;
  logo: string;
  logoColor: string;
  logoBg: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  about: string;
  rating: number;
  reviewCount: number;
  activeInternships: number;
  avgStipend: string;
  tags: string[];
  verified: boolean;
  founded: string;
  featured?: boolean;
  website?: string;
}

export const COMPANIES: Company[] = [
  {
    id: 1, name: 'ByteForge Solutions', logo: 'BF', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    industry: 'Software', location: 'Dhaka, BD', size: '51–200', founded: '2018',
    description: 'ByteForge builds SaaS productivity tools for teams across South Asia.',
    about: 'ByteForge Solutions has been building productivity-focused SaaS products since 2018. Known throughout Bangladesh for their strong internship mentorship culture, ByteForge gives interns real responsibility from day one — production code, real projects, and a structured mentorship program. Their internship program has a near-perfect rehire rate.',
    rating: 4.7, reviewCount: 38, activeInternships: 3, avgStipend: 'BDT 15,000/mo',
    tags: ['React', 'Node.js', 'SaaS', 'TypeScript'], verified: true, featured: true,
    website: 'byteforge.com.bd',
  },
  {
    id: 2, name: 'DataNest BD', logo: 'DN', logoColor: '#059669', logoBg: '#f0fdf4',
    industry: 'Data & AI', location: 'Chittagong, BD', size: '11–50', founded: '2020',
    description: 'DataNest is a boutique analytics consultancy solving complex business intelligence problems.',
    about: 'DataNest BD is a boutique analytics consultancy working with mid-market and enterprise clients across Bangladesh. Interns work on real client datasets with senior analysts and get exposure to full-lifecycle analytics projects. Strong culture of documentation and knowledge sharing.',
    rating: 4.5, reviewCount: 24, activeInternships: 2, avgStipend: 'BDT 12,000/mo',
    tags: ['Python', 'SQL', 'Tableau', 'Power BI'], verified: true, featured: true,
    website: 'datanest.com.bd',
  },
  {
    id: 3, name: 'PixelCraft Studio', logo: 'PC', logoColor: '#f59e0b', logoBg: '#fffbeb',
    industry: 'Design', location: 'Dhaka, BD', size: '11–50', founded: '2019',
    description: 'A boutique product design studio working with clients across South and Southeast Asia.',
    about: 'PixelCraft Studio is a boutique design agency renowned for craft-first design culture. Interns participate in the full design process — from user research to developer handoff. The portfolio exposure here is unmatched for design students in Bangladesh.',
    rating: 4.3, reviewCount: 17, activeInternships: 1, avgStipend: 'Unpaid',
    tags: ['Figma', 'Product Design', 'UX Research'], verified: true,
    website: 'pixelcraft.studio',
  },
  {
    id: 4, name: 'TechNova Ltd', logo: 'TN', logoColor: '#6d28d9', logoBg: '#f5f3ff',
    industry: 'Software', location: 'Dhaka, BD', size: '201–500', founded: '2015',
    description: 'TechNova is a B2B enterprise software company serving logistics and supply chain.',
    about: 'TechNova Ltd is one of Bangladesh\'s largest B2B enterprise software companies, serving over 120 logistics and supply chain clients. A demanding but rewarding environment — interns own real features and present to stakeholders. High bar, high reward.',
    rating: 4.1, reviewCount: 52, activeInternships: 2, avgStipend: 'BDT 18,000/mo',
    tags: ['Node.js', 'PostgreSQL', 'Docker', 'Enterprise'], verified: true,
    website: 'technova.com.bd',
  },
  {
    id: 5, name: 'GrowthHub Agency', logo: 'GH', logoColor: '#d97706', logoBg: '#fffbeb',
    industry: 'Marketing', location: 'Sylhet, BD', size: '11–50', founded: '2021',
    description: 'GrowthHub helps SMEs build digital brands that drive real revenue.',
    about: 'GrowthHub Agency is a full-service digital marketing agency based in Sylhet, working with clients across Bangladesh. Good for students who want hands-on campaign experience. Note: currently unpaid. Best for portfolio building.',
    rating: 3.9, reviewCount: 11, activeInternships: 1, avgStipend: 'Unpaid',
    tags: ['SEO', 'Social Media', 'Content', 'Analytics'], verified: true,
    website: 'growthhub.com.bd',
  },
  {
    id: 6, name: 'CloudBase', logo: 'CB', logoColor: '#0284c7', logoBg: '#eff6ff',
    industry: 'Cloud & DevOps', location: 'Dhaka, BD', size: '11–50', founded: '2022',
    description: 'CloudBase builds the next generation of developer infrastructure tools for engineering teams across Asia.',
    about: 'CloudBase is an early-stage infrastructure startup building developer tooling for engineering teams across Asia. Interns work directly with the CTO on production systems. High autonomy, steep learning curve, competitive pay. Not for the faint-hearted — but the learning is unmatched.',
    rating: 4.8, reviewCount: 9, activeInternships: 2, avgStipend: 'BDT 20,000/mo',
    tags: ['Python', 'AWS', 'Django', 'Redis', 'DevOps'], verified: true, featured: true,
    website: 'cloudbase.io',
  },
  {
    id: 7, name: 'FinEdge BD', logo: 'FE', logoColor: '#0f766e', logoBg: '#f0fdfa',
    industry: 'FinTech', location: 'Dhaka, BD', size: '51–200', founded: '2017',
    description: 'FinEdge is a licensed fintech company providing digital payment infrastructure.',
    about: 'FinEdge BD is a licensed BFIU-registered fintech company operating across Bangladesh\'s digital payment ecosystem. Structured internship program with formal onboarding. Good for finance and business students who want fintech exposure.',
    rating: 4.2, reviewCount: 29, activeInternships: 1, avgStipend: 'BDT 10,000/mo',
    tags: ['FinTech', 'Payments', 'Excel', 'SQL'], verified: true,
    website: 'finedge.com.bd',
  },
  {
    id: 8, name: 'Insight Analytics', logo: 'IA', logoColor: '#6d28d9', logoBg: '#f5f3ff',
    industry: 'Data & AI', location: 'Dhaka, BD', size: '51–200', founded: '2016',
    description: 'Insight Analytics delivers ML and AI solutions for healthcare, retail, and banking clients.',
    about: 'Insight Analytics is a research-driven AI company with PhD-level engineers on staff. Interns contribute to real ML projects in healthcare and retail verticals. Strong publication culture — some interns have co-authored conference papers. Top choice for AI/ML students.',
    rating: 4.6, reviewCount: 21, activeInternships: 3, avgStipend: 'BDT 16,000/mo',
    tags: ['ML', 'Python', 'TensorFlow', 'Research'], verified: true, featured: true,
    website: 'insightanalytics.ai',
  },
];

/* ─── Mock student profile ─────────────────────────────────────── */
export const CURRENT_STUDENT = {
  name: 'Riya Hossain',
  initials: 'RH',
  email: 'riya.hossain@student.buet.ac.bd',
  university: 'BUET',
  degree: 'BSc in Computer Science & Engineering',
  year: '3rd Year',
  location: 'Dhaka, Bangladesh',
  bio: 'Passionate about building user interfaces and learning modern web technologies. Looking for a remote frontend or full-stack internship.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Figma', 'Git'],
  points: 340,
  badge: 'Explorer',
  badgeTier: 2,
  profileComplete: 100,
  savedIds: [1, 3, 6],
  applicationIds: [1, 4, 6],
};

/* ─── Mock applications ────────────────────────────────────────── */
export type AppStatus = 'Applied' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected';

export interface Application {
  id: number;
  internshipId: number;
  role: string;
  company: string;
  logo: string;
  logoColor: string;
  logoBg: string;
  appliedDate: string;
  status: AppStatus;
  lastUpdate: string;
  note?: string;
}

/* ─── Company HR Data ─────────────────────────────────────────── */
export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';
export type InternshipStatus   = 'active' | 'expired' | 'draft';

export const CURRENT_COMPANY = {
  id: 1,
  name: 'ByteForge Solutions',
  logo: 'BF',
  logoColor: '#7c3aed',
  logoBg: '#f5f3ff',
  industry: 'Software & Technology',
  size: '51–200 employees',
  location: 'Dhaka, Bangladesh',
  website: 'byteforge.dev',
  founded: '2018',
  rating: 4.7,
  reviewCount: 38,
  avgStipend: 'BDT 15,000/mo',
  verificationStatus: 'approved' as VerificationStatus,
  description: 'ByteForge Solutions builds SaaS productivity tools used by teams across South Asia. We are a fast-growing product company with a strong engineering culture and a commitment to mentorship.',
  tags: ['SaaS', 'Product', 'Engineering', 'Startup'],
};

export interface HRInternship {
  id: number;
  title: string;
  status: InternshipStatus;
  applicants: number;
  shortlisted: number;
  interviewing: number;
  deadline: string;
  daysLeft: number;
  paid: boolean;
  type: 'Remote' | 'On-site' | 'Hybrid';
  stipend?: string;
  posted: string;
  openings: number;
  tags: string[];
  description?: string;
}

export const HR_INTERNSHIPS: HRInternship[] = [
  {
    id: 101, title: 'Frontend Developer Intern', status: 'active',
    applicants: 24, shortlisted: 6, interviewing: 3,
    deadline: 'Feb 28, 2025', daysLeft: 12, paid: true, type: 'Remote',
    stipend: 'BDT 15,000/mo', posted: '2 days ago', openings: 3,
    tags: ['React', 'TypeScript', 'TailwindCSS'],
    description: 'Join our product team to build user-facing features for our flagship SaaS platform.',
  },
  {
    id: 102, title: 'UI/UX Design Intern', status: 'active',
    applicants: 18, shortlisted: 4, interviewing: 2,
    deadline: 'Mar 10, 2025', daysLeft: 22, paid: true, type: 'Hybrid',
    stipend: 'BDT 12,000/mo', posted: '5 days ago', openings: 2,
    tags: ['Figma', 'Design Systems', 'Prototyping'],
    description: 'Work with our design team to create exceptional product experiences.',
  },
  {
    id: 103, title: 'Backend Engineer Intern', status: 'active',
    applicants: 31, shortlisted: 7, interviewing: 2,
    deadline: 'Feb 20, 2025', daysLeft: 4, paid: true, type: 'On-site',
    stipend: 'BDT 18,000/mo', posted: '1 week ago', openings: 2,
    tags: ['Node.js', 'PostgreSQL', 'AWS'],
    description: 'Build and scale our backend infrastructure serving thousands of users.',
  },
  {
    id: 104, title: 'Data Analyst Intern', status: 'draft',
    applicants: 0, shortlisted: 0, interviewing: 0,
    deadline: 'Apr 1, 2025', daysLeft: 44, paid: false, type: 'Remote',
    posted: 'Draft', openings: 1,
    tags: ['Python', 'SQL', 'Data Visualization'],
    description: 'Analyze product data to surface insights for our growth team.',
  },
  {
    id: 105, title: 'Mobile Developer Intern', status: 'expired',
    applicants: 42, shortlisted: 8, interviewing: 0,
    deadline: 'Jan 15, 2025', daysLeft: 0, paid: true, type: 'Hybrid',
    stipend: 'BDT 14,000/mo', posted: '6 weeks ago', openings: 2,
    tags: ['React Native', 'iOS', 'Android'],
  },
];

export type HRAppStatus = 'Applied' | 'Shortlisted' | 'Interviewing' | 'Rejected';

export interface HRApplicant {
  id: number;
  internshipId: number;
  internshipTitle: string;
  name: string;
  university: string;
  degree: string;
  year: string;
  email: string;
  appliedDate: string;
  status: HRAppStatus;
  resumeFile: string;
  note?: string;
}

export const HR_APPLICANTS: HRApplicant[] = [
  {
    id: 1001, internshipId: 101, internshipTitle: 'Frontend Developer Intern',
    name: 'Riya Hossain', university: 'BUET', degree: 'BSc CSE', year: '3rd Year',
    email: 'riya@buet.ac.bd', appliedDate: 'Jan 14, 2025', status: 'Interviewing',
    resumeFile: 'riya_hossain_cv.pdf', note: 'Strong React portfolio. Technical interview scheduled.',
  },
  {
    id: 1002, internshipId: 101, internshipTitle: 'Frontend Developer Intern',
    name: 'Farhan Ahmed', university: 'BUET', degree: 'BSc CSE', year: '4th Year',
    email: 'farhan@buet.ac.bd', appliedDate: 'Jan 15, 2025', status: 'Shortlisted',
    resumeFile: 'farhan_ahmed_cv.pdf', note: 'Excellent GitHub projects. Proceed to assessment.',
  },
  {
    id: 1003, internshipId: 101, internshipTitle: 'Frontend Developer Intern',
    name: 'Tasnia Islam', university: 'DU', degree: 'BSc CS', year: '3rd Year',
    email: 'tasnia@du.ac.bd', appliedDate: 'Jan 16, 2025', status: 'Applied',
    resumeFile: 'tasnia_islam_cv.pdf',
  },
  {
    id: 1004, internshipId: 101, internshipTitle: 'Frontend Developer Intern',
    name: 'Rafi Hossain', university: 'NSU', degree: 'BSc SWE', year: '3rd Year',
    email: 'rafi@nsu.edu.bd', appliedDate: 'Jan 17, 2025', status: 'Applied',
    resumeFile: 'rafi_hossain_cv.pdf',
  },
  {
    id: 1005, internshipId: 101, internshipTitle: 'Frontend Developer Intern',
    name: 'Mehrin Akter', university: 'SUST', degree: 'BSc CSE', year: '4th Year',
    email: 'mehrin@sust.edu', appliedDate: 'Jan 12, 2025', status: 'Rejected',
    resumeFile: 'mehrin_akter_cv.pdf', note: 'Skills do not match current requirements.',
  },
  {
    id: 1006, internshipId: 102, internshipTitle: 'UI/UX Design Intern',
    name: 'Zara Chowdhury', university: 'BRAC', degree: 'BSc CS', year: '3rd Year',
    email: 'zara@bracu.ac.bd', appliedDate: 'Jan 18, 2025', status: 'Interviewing',
    resumeFile: 'zara_chowdhury_cv.pdf', note: 'Impressive Figma portfolio. Final round.',
  },
  {
    id: 1007, internshipId: 102, internshipTitle: 'UI/UX Design Intern',
    name: 'Labib Rahman', university: 'IUT', degree: 'BSc SWE', year: '2nd Year',
    email: 'labib@iut.ac.bd', appliedDate: 'Jan 19, 2025', status: 'Applied',
    resumeFile: 'labib_rahman_cv.pdf',
  },
  {
    id: 1008, internshipId: 103, internshipTitle: 'Backend Engineer Intern',
    name: 'Nadia Hassan', university: 'UIU', degree: 'BSc CSE', year: '4th Year',
    email: 'nadia@uiu.ac.bd', appliedDate: 'Jan 11, 2025', status: 'Shortlisted',
    resumeFile: 'nadia_hassan_cv.pdf', note: 'Strong Node.js background. Send coding challenge.',
  },
  {
    id: 1009, internshipId: 103, internshipTitle: 'Backend Engineer Intern',
    name: 'Karim Uddin', university: 'KUET', degree: 'BSc CSE', year: '3rd Year',
    email: 'karim@kuet.ac.bd', appliedDate: 'Jan 13, 2025', status: 'Applied',
    resumeFile: 'karim_uddin_cv.pdf',
  },
  {
    id: 1010, internshipId: 103, internshipTitle: 'Backend Engineer Intern',
    name: 'Sadia Begum', university: 'JnU', degree: 'BSc CS', year: '4th Year',
    email: 'sadia@jnu.edu.bd', appliedDate: 'Jan 10, 2025', status: 'Applied',
    resumeFile: 'sadia_begum_cv.pdf',
  },
];

/* ─── Admin Data ──────────────────────────────────────────────── */
export type AdminVerifStatus = 'pending' | 'approved' | 'rejected';
export type ReportReason     = 'Inappropriate content' | 'Fake review' | 'Spam' | 'Misleading information' | 'Other';
export type ModerationAction = 'pending' | 'dismissed' | 'deleted';

export interface AdminCompany {
  id: number;
  name: string;
  logo: string;
  logoColor: string;
  logoBg: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  registrationNo: string;
  submittedDate: string;
  verificationStatus: AdminVerifStatus;
  internshipCount: number;
  reviewCount: number;
  documents: string[];
  rejectionReason?: string;
}

export const ADMIN_COMPANIES: AdminCompany[] = [
  {
    id: 1, name: 'ByteForge Solutions', logo: 'BF', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    industry: 'Software & Technology', size: '51–200', location: 'Dhaka, BD',
    website: 'byteforge.dev', email: 'hr@byteforge.dev', registrationNo: 'C-1842/2018',
    submittedDate: 'Jan 10, 2025', verificationStatus: 'approved',
    internshipCount: 5, reviewCount: 38, documents: ['trade_license.pdf', 'registration_cert.pdf', 'contact_nid.pdf'],
  },
  {
    id: 2, name: 'CloudBase', logo: 'CB', logoColor: '#0284c7', logoBg: '#eff6ff',
    industry: 'Cloud Infrastructure', size: '201–500', location: 'Dhaka, BD',
    website: 'cloudbase.io', email: 'people@cloudbase.io', registrationNo: 'C-3311/2019',
    submittedDate: 'Jan 18, 2025', verificationStatus: 'pending',
    internshipCount: 3, reviewCount: 24, documents: ['trade_license.pdf', 'registration_cert.pdf'],
  },
  {
    id: 3, name: 'DataNest Analytics', logo: 'DN', logoColor: '#059669', logoBg: '#f0fdf4',
    industry: 'Data & Analytics', size: '11–50', location: 'Chittagong, BD',
    website: 'datanest.ai', email: 'careers@datanest.ai', registrationNo: 'C-0977/2021',
    submittedDate: 'Jan 20, 2025', verificationStatus: 'pending',
    internshipCount: 2, reviewCount: 17, documents: ['trade_license.pdf'],
  },
  {
    id: 4, name: 'PixelCraft Studio', logo: 'PC', logoColor: '#db2777', logoBg: '#fdf2f8',
    industry: 'Design & Creative', size: '11–50', location: 'Dhaka, BD',
    website: 'pixelcraft.studio', email: 'hello@pixelcraft.studio', registrationNo: 'C-2201/2022',
    submittedDate: 'Jan 12, 2025', verificationStatus: 'rejected',
    internshipCount: 1, reviewCount: 5, documents: ['trade_license.pdf', 'registration_cert.pdf'],
    rejectionReason: 'Trade license document was not legible. Please resubmit a clearer scan.',
  },
  {
    id: 5, name: 'GrowthHub Agency', logo: 'GH', logoColor: '#d97706', logoBg: '#fffbeb',
    industry: 'Marketing & Growth', size: '11–50', location: 'Dhaka, BD',
    website: 'growthhub.agency', email: 'ops@growthhub.agency', registrationNo: 'C-1556/2020',
    submittedDate: 'Jan 22, 2025', verificationStatus: 'pending',
    internshipCount: 2, reviewCount: 11, documents: ['trade_license.pdf', 'registration_cert.pdf', 'contact_nid.pdf'],
  },
  {
    id: 6, name: 'TechNova Ltd', logo: 'TN', logoColor: '#6d28d9', logoBg: '#f5f3ff',
    industry: 'Software & Technology', size: '201–500', location: 'Sylhet, BD',
    website: 'technova.com.bd', email: 'hr@technova.com.bd', registrationNo: 'C-0431/2016',
    submittedDate: 'Dec 30, 2024', verificationStatus: 'approved',
    internshipCount: 8, reviewCount: 52, documents: ['trade_license.pdf', 'registration_cert.pdf', 'contact_nid.pdf'],
  },
];

export interface ReportedReview {
  id: number;
  companyId: number;
  companyName: string;
  companyLogo: string;
  companyLogoColor: string;
  companyLogoBg: string;
  rating: number;
  reviewType: 'Internship Experience' | 'Interview Experience';
  content: string;
  reportReason: ReportReason;
  reportedDate: string;
  reviewDate: string;
  action: ModerationAction;
}

export const REPORTED_REVIEWS: ReportedReview[] = [
  {
    id: 2001, companyId: 4, companyName: 'PixelCraft Studio',
    companyLogo: 'PC', companyLogoColor: '#db2777', companyLogoBg: '#fdf2f8',
    rating: 1, reviewType: 'Internship Experience',
    content: 'Absolutely terrible environment. The manager screamed at interns daily and nobody got paid what was promised. Do not apply here.',
    reportReason: 'Inappropriate content', reportedDate: 'Jan 19, 2025', reviewDate: 'Jan 17, 2025',
    action: 'pending',
  },
  {
    id: 2002, companyId: 5, companyName: 'GrowthHub Agency',
    companyLogo: 'GH', companyLogoColor: '#d97706', companyLogoBg: '#fffbeb',
    rating: 5, reviewType: 'Internship Experience',
    content: 'Best internship ever! They gave me a full-time offer after just 2 weeks. Everyone gets promoted and earns 100k+ BDT per month as an intern.',
    reportReason: 'Misleading information', reportedDate: 'Jan 21, 2025', reviewDate: 'Jan 20, 2025',
    action: 'pending',
  },
  {
    id: 2003, companyId: 2, companyName: 'CloudBase',
    companyLogo: 'CB', companyLogoColor: '#0284c7', companyLogoBg: '#eff6ff',
    rating: 2, reviewType: 'Interview Experience',
    content: 'Buy our course to pass the interview. They push you into their paid courses before giving you a chance. Complete scam operation.',
    reportReason: 'Spam', reportedDate: 'Jan 23, 2025', reviewDate: 'Jan 22, 2025',
    action: 'pending',
  },
  {
    id: 2004, companyId: 1, companyName: 'ByteForge Solutions',
    companyLogo: 'BF', companyLogoColor: '#7c3aed', companyLogoBg: '#f5f3ff',
    rating: 1, reviewType: 'Internship Experience',
    content: 'Fake company. This is not real.',
    reportReason: 'Fake review', reportedDate: 'Jan 15, 2025', reviewDate: 'Jan 14, 2025',
    action: 'dismissed',
  },
];

export interface AdminActivity {
  id: number;
  type: 'verification_approved' | 'verification_rejected' | 'review_deleted' | 'company_registered' | 'internship_posted' | 'review_dismissed';
  description: string;
  target: string;
  adminName: string;
  timestamp: string;
  timeAgo: string;
}

export const ADMIN_ACTIVITY: AdminActivity[] = [
  { id: 3001, type: 'verification_approved', description: 'Verification approved', target: 'ByteForge Solutions', adminName: 'Admin', timestamp: 'Jan 10, 2025 14:32', timeAgo: '10 days ago' },
  { id: 3002, type: 'company_registered', description: 'New company registered', target: 'GrowthHub Agency', adminName: 'System', timestamp: 'Jan 22, 2025 09:15', timeAgo: '2 days ago' },
  { id: 3003, type: 'internship_posted', description: 'Internship posted', target: 'Frontend Developer Intern — ByteForge Solutions', adminName: 'System', timestamp: 'Jan 23, 2025 11:04', timeAgo: '1 day ago' },
  { id: 3004, type: 'review_dismissed', description: 'Report dismissed', target: 'ByteForge Solutions · Review #2004', adminName: 'Admin', timestamp: 'Jan 15, 2025 16:20', timeAgo: '9 days ago' },
  { id: 3005, type: 'verification_rejected', description: 'Verification rejected', target: 'PixelCraft Studio', adminName: 'Admin', timestamp: 'Jan 12, 2025 10:00', timeAgo: '12 days ago' },
  { id: 3006, type: 'company_registered', description: 'New company registered', target: 'DataNest Analytics', adminName: 'System', timestamp: 'Jan 20, 2025 08:45', timeAgo: '4 days ago' },
  { id: 3007, type: 'verification_approved', description: 'Verification approved', target: 'TechNova Ltd', adminName: 'Admin', timestamp: 'Jan 5, 2025 15:10', timeAgo: '15 days ago' },
];

export const APPLICATIONS: Application[] = [
  {
    id: 1, internshipId: 1,
    role: 'Frontend Developer Intern', company: 'ByteForge Solutions',
    logo: 'BF', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    appliedDate: 'Jan 14, 2025', status: 'Interviewing', lastUpdate: '2 days ago',
    note: 'Technical interview scheduled for Feb 5.',
  },
  {
    id: 2, internshipId: 4,
    role: 'Software Engineer Intern', company: 'TechNova Ltd',
    logo: 'TN', logoColor: '#6d28d9', logoBg: '#f5f3ff',
    appliedDate: 'Jan 10, 2025', status: 'Shortlisted', lastUpdate: '5 days ago',
    note: 'Your profile has been shortlisted for a coding assessment.',
  },
  {
    id: 3, internshipId: 6,
    role: 'Backend Developer Intern', company: 'CloudBase',
    logo: 'CB', logoColor: '#0284c7', logoBg: '#eff6ff',
    appliedDate: 'Jan 8, 2025', status: 'Applied', lastUpdate: '8 days ago',
  },
  {
    id: 4, internshipId: 5,
    role: 'Marketing Intern', company: 'GrowthHub Agency',
    logo: 'GH', logoColor: '#d97706', logoBg: '#fffbeb',
    appliedDate: 'Dec 28, 2024', status: 'Rejected', lastUpdate: '15 days ago',
    note: 'Thank you for applying. We have moved forward with other candidates.',
  },
];
