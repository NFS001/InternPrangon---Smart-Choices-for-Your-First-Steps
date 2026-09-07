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
    role: 'Software Engineer Intern (Backend & Cloud)', company: 'Brain Station 23',
    logo: 'BS', logoColor: '#2845e2', logoBg: '#eff4ff',
    paid: true, duration: '3 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['Node.js', 'Go', 'AWS', 'Microservices'], posted: '2 days ago',
    deadline: 'Apr 30, 2027', daysLeft: 200, stipend: 'BDT 18,000/mo',
    featured: true, openings: 2,
    description: `Brain Station 23 is looking for a Software Engineer Intern to join our cloud and enterprise backend team. You will work closely with senior architects to build scalable microservices and APIs for international enterprise clients.\n\nThis is a hands-on role where you will write production code, participate in design reviews, and ship features in an agile environment. Mentorship is provided by senior engineers.`,
    qualifications: [
      'Currently enrolled in Computer Science, Software Engineering, or related degree',
      'Solid foundation in Data Structures, Algorithms, and Object-Oriented Design',
      'Hands-on experience with Node.js, Python, or Go',
      'Understanding of RESTful API principles and relational databases (PostgreSQL/MySQL)',
      'Basic familiarity with Git and cloud concepts (AWS/Azure)',
    ],
    responsibilities: [
      'Design, develop, and test scalable REST APIs and microservices',
      'Collaborate with frontend teams to integrate clean interfaces',
      'Write clean, well-tested, and maintainable code',
      'Participate in daily standups, sprint planning, and code reviews',
      'Document architecture decisions and system APIs',
    ],
  },
  {
    id: 2, companyId: 1,
    role: 'Frontend React / Next.js Intern', company: 'Brain Station 23',
    logo: 'BS', logoColor: '#2845e2', logoBg: '#eff4ff',
    paid: true, duration: '3 months', location: 'Dhaka, BD', type: 'On-site',
    tags: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'], posted: '3 days ago',
    deadline: 'May 15, 2027', daysLeft: 215, stipend: 'BDT 16,000/mo',
    featured: true, openings: 2,
    description: `Join Brain Station 23's Frontend Practice to build modern, responsive web applications using React, Next.js, and TypeScript. You will work on real client projects with structured code reviews.`,
    qualifications: [
      'Proficiency in JavaScript (ES6+), HTML5, and CSS3',
      'Experience building web apps with React and TypeScript',
      'Familiarity with state management and component lifecycle',
      'Good aesthetic sense and attention to pixel-perfect design details',
    ],
    responsibilities: [
      'Develop reusable UI components according to design specifications',
      'Integrate client-side state management with backend REST APIs',
      'Optimize web performance and ensure cross-browser compatibility',
      'Participate in team code reviews and technical discussions',
    ],
  },
  {
    id: 3, companyId: 2,
    role: 'Backend Engineering Intern (C# / .NET)', company: 'Chaldal',
    logo: 'CH', logoColor: '#059669', logoBg: '#f0fdf4',
    paid: true, duration: '6 months', location: 'Dhaka, BD', type: 'On-site',
    tags: ['C#', '.NET', 'SQL', 'Logistics'], posted: '4 days ago',
    deadline: 'Apr 15, 2027', daysLeft: 185, stipend: 'BDT 18,000/mo',
    featured: true, openings: 2,
    description: `Chaldal is looking for an enthusiastic Backend Engineering Intern to contribute to the high-throughput order dispatching, warehouse automation, and logistics routing systems that power grocery delivery across Bangladesh.`,
    qualifications: [
      'Studying CS, Software Engineering, or related technical field',
      'Comfortable with C#, .NET Core, or Java',
      'Knowledge of relational database queries and index optimization',
      'Strong problem-solving capability and proactive attitude',
    ],
    responsibilities: [
      'Implement backend services for order processing and dispatch workflows',
      'Optimize database queries and background job processing',
      'Collaborate with warehouse tech teams to debug live operations',
      'Write comprehensive unit and integration tests',
    ],
  },
  {
    id: 4, companyId: 2,
    role: 'Data Analyst Intern', company: 'Chaldal',
    logo: 'CH', logoColor: '#059669', logoBg: '#f0fdf4',
    paid: true, duration: '3 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['Python', 'SQL', 'Tableau', 'Analytics'], posted: '5 days ago',
    deadline: 'May 1, 2027', daysLeft: 201, stipend: 'BDT 16,000/mo',
    openings: 2,
    description: `Analyze real-time demand patterns, delivery route efficiency, and catalog performance using SQL and Python. Work alongside business analysts and product leads.`,
    qualifications: [
      'Pursuing degree in Statistics, Computer Science, Data Science, or Economics',
      'Strong SQL querying skills and experience with pandas/numpy',
      'Ability to translate raw numbers into actionable business insights',
    ],
    responsibilities: [
      'Construct automated dashboards and weekly operations reports',
      'Perform cohort and churn analyses on customer ordering behaviors',
      'Identify delivery route bottlenecks from GPS data',
    ],
  },
  {
    id: 5, companyId: 3,
    role: 'Software Quality Assurance Intern', company: 'Square',
    logo: 'SQ', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    paid: true, duration: '4 months', location: 'Dhaka, BD', type: 'On-site',
    tags: ['QA', 'Automation', 'Selenium', 'Testing'], posted: '1 week ago',
    deadline: 'Apr 20, 2027', daysLeft: 190, stipend: 'BDT 15,000/mo',
    featured: true, openings: 2,
    description: `Square is hiring a Quality Assurance Intern for our enterprise technology team. You will write automated end-to-end tests, design test plans, and ensure enterprise software meets high-reliability standards.`,
    qualifications: [
      'Undergraduate in Computer Science, Software Engineering, or IT',
      'Basic knowledge of software testing concepts (black-box, white-box, regression)',
      'Familiarity with Python, JavaScript, or Java for test automation',
    ],
    responsibilities: [
      'Design test cases from product specifications',
      'Execute manual and automated test suites',
      'Report bugs with clear reproduction steps and collaborate with developers',
    ],
  },
  {
    id: 6, companyId: 4,
    role: 'Mobile App Developer Intern (Flutter)', company: 'Pathao',
    logo: 'PA', logoColor: '#dc2626', logoBg: '#fef2f2',
    paid: true, duration: '3 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['Flutter', 'Dart', 'Mobile', 'UI'], posted: '3 days ago',
    deadline: 'Apr 25, 2027', daysLeft: 195, stipend: 'BDT 20,000/mo',
    featured: true, openings: 2,
    description: `Join Pathao to build fast, responsive mobile interfaces used by millions of riders, passengers, and food lovers every single day.`,
    qualifications: [
      'Experience developing mobile apps with Flutter & Dart',
      'Understanding of mobile state management (Bloc, Provider, or Riverpod)',
      'Experience with REST API consumption and JSON serialization',
    ],
    responsibilities: [
      'Build performant mobile screens and widget components',
      'Integrate location services and payment gateways with backend APIs',
      'Collaborate with UX designers to refine motion and interaction feedback',
    ],
  },
  {
    id: 7, companyId: 5,
    role: 'Fintech Cybersecurity Intern', company: 'bKash Limited',
    logo: 'BK', logoColor: '#db2777', logoBg: '#fdf2f8',
    paid: true, duration: '6 months', location: 'Dhaka, BD', type: 'On-site',
    tags: ['Cybersecurity', 'Fintech', 'Network Security', 'Audit'], posted: '2 days ago',
    deadline: 'Apr 28, 2027', daysLeft: 198, stipend: 'BDT 22,000/mo',
    featured: true, openings: 1,
    description: `Work with bKash's Information Security team. Assist in conducting security vulnerability assessments, auditing API authentication headers, and verifying regulatory compliance standards.`,
    qualifications: [
      'CS or Cybersecurity major with strong understanding of networking and cryptography',
      'Knowledge of OWASP Top 10 vulnerabilities and API security fundamentals',
      'Familiarity with security scanning tools and Linux environments',
    ],
    responsibilities: [
      'Assist in vulnerability scanning and security log analysis',
      'Review code changes for common security antipatterns',
      'Participate in incident response drills and compliance audits',
    ],
  },
  {
    id: 8, companyId: 6,
    role: 'Product Design (UI/UX) Intern', company: 'Optimizely',
    logo: 'OP', logoColor: '#2563eb', logoBg: '#eff6ff',
    paid: true, duration: '4 months', location: 'Dhaka, BD', type: 'Remote',
    tags: ['Figma', 'UI/UX', 'Design System', 'Prototyping'], posted: '3 days ago',
    deadline: 'Apr 10, 2027', daysLeft: 180, stipend: 'BDT 25,000/mo',
    featured: true, openings: 2,
    description: `Optimizely is looking for a passionate UI/UX Design Intern to collaborate with our international product design team on enterprise experimentation software used by Fortune 500 companies.`,
    qualifications: [
      'Design, HCI, or related background with a portfolio of UI/UX projects',
      'Proficiency in Figma (auto-layout, components, interactive prototypes)',
      'Understanding of user-centered design methodologies and usability heuristics',
    ],
    responsibilities: [
      'Create intuitive user journeys, wireframes, and high-fidelity mockups',
      'Contribute to our global design system component library',
      'Participate in user research interviews and usability testing',
    ],
  },
];

/* ─── Companies ───────────────────────────────────────────────── */
export interface Company {
  id: number;
  mongoId?: string;
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
    id: 1, mongoId: '6a9da65e5fb860cbfae8a39c', name: 'Brain Station 23', logo: 'BS', logoColor: '#2845e2', logoBg: '#eff4ff',
    industry: 'Software & Cloud Solutions', location: 'Dhaka, BD', size: '500+ employees', founded: '2006',
    description: 'Global software solutions company with 700+ engineers building cloud and enterprise systems.',
    about: 'Brain Station 23 is a global IT solution provider and digital transformation partner headquartered in Dhaka with 700+ engineers. Known across Bangladesh for its outstanding engineering mentorship culture, interns work directly with senior architects on enterprise cloud and AI systems.',
    rating: 4.8, reviewCount: 42, activeInternships: 2, avgStipend: 'BDT 18,000/mo',
    tags: ['Cloud', 'React', 'Node.js', 'Enterprise', 'AWS'], verified: true, featured: true,
    website: 'brainstation-23.com',
  },
  {
    id: 2, mongoId: '6a9da65e5fb860cbfae8a3a0', name: 'Chaldal', logo: 'CH', logoColor: '#059669', logoBg: '#f0fdf4',
    industry: 'E-commerce & Grocery', location: 'Dhaka, BD', size: '1000+ employees', founded: '2013',
    description: 'Pioneering online grocery service operating across Dhaka and major cities.',
    about: 'Chaldal is Bangladesh\'s pioneering online grocery delivery platform. With automated fulfillment centers and cutting-edge logistics tech, interns solve high-scale engineering and supply chain problems in real-time.',
    rating: 4.6, reviewCount: 31, activeInternships: 2, avgStipend: 'BDT 18,000/mo',
    tags: ['C#', '.NET', 'Data', 'Supply Chain'], verified: true, featured: true,
    website: 'chaldal.com',
  },
  {
    id: 3, mongoId: '6a9dfda9c24c9499ce68d554', name: 'Square', logo: 'SQ', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    industry: 'Healthcare & Pharmaceuticals', location: 'Dhaka, BD', size: '10,000+ employees', founded: '1958',
    description: 'Leading healthcare and enterprise conglomerate in Bangladesh offering diverse career opportunities.',
    about: 'Square Group is one of the most respected enterprise conglomerates in Bangladesh. The technology division powers pharmaceutical manufacturing ERPs, enterprise QA, and healthcare automation systems.',
    rating: 4.7, reviewCount: 38, activeInternships: 2, avgStipend: 'BDT 15,000/mo',
    tags: ['Healthcare', 'Enterprise', 'QA', 'Pharma'], verified: true, featured: true,
    website: 'squarepharma.com.bd',
  },
  {
    id: 4, mongoId: '6a9db51d29572105f3d18f6b', name: 'Pathao', logo: 'PA', logoColor: '#dc2626', logoBg: '#fef2f2',
    industry: 'Ride-sharing & Logistics', location: 'Dhaka, BD', size: '500–1000', founded: '2015',
    description: 'Super-app providing ride-hailing, food delivery, logistics, and digital payment services.',
    about: 'Pathao is the digital life platform of Bangladesh, offering mobility, food delivery, parcel logistics, and financial services to millions of daily users. High-velocity engineering culture where interns ship production features.',
    rating: 4.5, reviewCount: 29, activeInternships: 2, avgStipend: 'BDT 20,000/mo',
    tags: ['Flutter', 'Mobile', 'Golang', 'Logistics'], verified: true, featured: true,
    website: 'pathao.com',
  },
  {
    id: 5, mongoId: '6a9db51d29572105f3d18f6c', name: 'bKash Limited', logo: 'BK', logoColor: '#db2777', logoBg: '#fdf2f8',
    industry: 'Fintech & MFS', location: 'Dhaka, BD', size: '1000+ employees', founded: '2011',
    description: 'Largest mobile financial services provider in Bangladesh empowering millions with digital transactions.',
    about: 'bKash is Bangladesh\'s first unicorn fintech company. Operating at massive national scale, engineering and cybersecurity interns gain world-class exposure to high-concurrency transactional architectures.',
    rating: 4.9, reviewCount: 54, activeInternships: 2, avgStipend: 'BDT 22,000/mo',
    tags: ['Fintech', 'Security', 'Cloud', 'Microservices'], verified: true, featured: true,
    website: 'bkash.com',
  },
  {
    id: 6, mongoId: '6a9da65e5fb860cbfae8a39e', name: 'Optimizely', logo: 'OP', logoColor: '#2563eb', logoBg: '#eff6ff',
    industry: 'Digital Experience', location: 'Dhaka, BD', size: '1000+ employees', founded: '2010',
    description: 'Global leader in digital experience platform (DXP) software with a major engineering hub in Dhaka.',
    about: 'Optimizely is a global leader in experimentation and content management systems. Their Dhaka engineering center provides global-standard product development, design systems, and frontend engineering mentorship.',
    rating: 4.8, reviewCount: 27, activeInternships: 2, avgStipend: 'BDT 25,000/mo',
    tags: ['DXP', 'React', 'Product Design', 'Experimentation'], verified: true, featured: true,
    website: 'optimizely.com',
  },
  {
    id: 7, mongoId: '6a9da65f5fb860cbfae8a3a2', name: 'ShopUp', logo: 'SU', logoColor: '#ea580c', logoBg: '#fff7ed',
    industry: 'B2B Commerce', location: 'Dhaka, BD', size: '500–1000', founded: '2016',
    description: 'Bangladesh\'s leading B2B commerce platform connecting micro-retailers to food producers.',
    about: 'ShopUp provides digital commerce and supply chain infrastructure to hundreds of thousands of neighbourhood shops across Bangladesh.',
    rating: 4.3, reviewCount: 19, activeInternships: 1, avgStipend: 'BDT 16,000/mo',
    tags: ['B2B', 'Supply Chain', 'Operations'], verified: true,
    website: 'shopup.com.bd',
  },
  {
    id: 8, mongoId: '6a9df8fed85dde5d271e6c3e', name: 'Daraz', logo: 'DZ', logoColor: '#f97316', logoBg: '#fff7ed',
    industry: 'E-Commerce', location: 'Dhaka, BD', size: '1000+ employees', founded: '2012',
    description: 'South Asia\'s premier online marketplace backed by Alibaba Group.',
    about: 'Daraz is the leading e-commerce marketplace in South Asia. Interns work on analytics, marketing campaigns, and seller portal tooling.',
    rating: 4.4, reviewCount: 35, activeInternships: 1, avgStipend: 'BDT 18,000/mo',
    tags: ['E-Commerce', 'Analytics', 'Alibaba'], verified: true,
    website: 'daraz.com.bd',
  },
  {
    id: 9, mongoId: '6a9df934d85dde5d271e6c40', name: 'Rokomari', logo: 'RO', logoColor: '#059669', logoBg: '#f0fdf4',
    industry: 'E-Commerce & Books', location: 'Dhaka, BD', size: '200–500', founded: '2012',
    description: 'Bangladesh\'s largest online bookstore and consumer products e-retailer.',
    about: 'Rokomari is Bangladesh\'s foremost online book and electronics retailer, providing interns practical experience in web development and customer engagement.',
    rating: 4.5, reviewCount: 22, activeInternships: 1, avgStipend: 'BDT 15,000/mo',
    tags: ['Web', 'Books', 'E-Commerce'], verified: true,
    website: 'rokomari.com',
  },
  {
    id: 10, mongoId: '6a9dfed1c24c9499ce68d557', name: '10 Minute School', logo: '10', logoColor: '#dc2626', logoBg: '#fef2f2',
    industry: 'EdTech', location: 'Dhaka, BD', size: '200–500', founded: '2015',
    description: 'Largest online educational platform in Bangladesh helping millions of students excel.',
    about: '10 Minute School is the pioneer of online education in Bangladesh, reaching over 10 million students with digital classes, quizzes, and live courses.',
    rating: 4.7, reviewCount: 40, activeInternships: 1, avgStipend: 'BDT 15,000/mo',
    tags: ['EdTech', 'Education', 'Platform'], verified: true,
    website: '10minuteschool.com',
  },
  {
    id: 11, mongoId: '6a9df25dd85dde5d271e6c25', name: 'Incepta Pharmaceuticals', logo: 'IP', logoColor: '#0284c7', logoBg: '#eff6ff',
    industry: 'Pharmaceuticals', location: 'Dhaka, BD', size: '5000+ employees', founded: '1999',
    description: 'Top pharmaceutical manufacturing company in Bangladesh innovating healthcare products.',
    about: 'Incepta is one of Bangladesh\'s top-tier pharmaceutical manufacturers, offering laboratory and technology internships.',
    rating: 4.6, reviewCount: 20, activeInternships: 1, avgStipend: 'BDT 15,000/mo',
    tags: ['Pharma', 'Biotech', 'Healthcare'], verified: true,
    website: 'inceptapharma.com',
  },
  {
    id: 12, mongoId: '6a9e0505360fc51f23045b99', name: 'BioPharma Group', logo: 'BP', logoColor: '#16a34a', logoBg: '#f0fdf4',
    industry: 'Healthcare & Life Sciences', location: 'Dhaka, BD', size: '500–1000', founded: '2014',
    description: 'Innovative healthcare enterprise providing pharmaceutical research and biotechnology internships.',
    about: 'BioPharma Group focuses on advanced life sciences research, clinical trials, and clinical data systems.',
    rating: 4.5, reviewCount: 16, activeInternships: 1, avgStipend: 'BDT 16,000/mo',
    tags: ['Clinical', 'Healthcare', 'Research'], verified: true,
    website: 'biopharmabd.com',
  },
  {
    id: 13, mongoId: '6a9da65f5fb860cbfae8a3a4', name: 'Sheba.xyz', logo: 'SH', logoColor: '#7c3aed', logoBg: '#f5f3ff',
    industry: 'On-demand Services', location: 'Dhaka, BD', size: '200–500', founded: '2016',
    description: 'Leading service marketplace providing home and corporate service solutions across Bangladesh.',
    about: 'Sheba.xyz is Bangladesh\'s largest on-demand service marketplace, connecting thousands of certified service professionals with consumers.',
    rating: 4.4, reviewCount: 18, activeInternships: 1, avgStipend: 'BDT 15,000/mo',
    tags: ['Services', 'Marketplace', 'Product'], verified: true,
    website: 'sheba.xyz',
  }
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
