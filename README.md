# 🎓 InternPrangon — Smart Choices for Your First Steps

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#)
[![CSE470](https://img.shields.io/badge/Course-CSE470%20Software%20Engineering-blue?style=for-the-badge)](#)

> **InternPrangon** is a transparent, community-driven internship discovery and hiring platform built for university students and verified employers. It bridges the gap between ambitious students seeking meaningful career starts and enterprises recruiting top talent through verified company workspaces, authentic salary/stipend benchmarks, separated peer review streams, and a streamlined CV application pipeline.

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
  - [For Students](#-for-students)
  - [For Companies & HR Workspaces](#-for-companies--hr-workspaces)
  - [For System Administrators](#-for-system-administrators)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quick Start & Local Setup](#-quick-start--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Database Seeding](#2-database-seeding)
  - [3. Frontend Setup](#3-frontend-setup)
- [Pre-Configured Test Credentials](#-pre-configured-test-credentials)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Team & Academic Context](#-team--academic-context)

---

## 🌟 Project Overview

University students often struggle with fragmented job portals, outdated postings, ghosting recruiters, and opaque expectations regarding compensation and interview procedures.

**InternPrangon** delivers an integrated solution:
1. **Verified Opportunities**: Postings originate strictly from verified company workspaces with active deadlines and structured compensation models.
2. **Community Transparency**: Separate, dedicated reporting modules for **Internship Experiences** (mentorship, culture, stipend satisfaction) and **Interview Experiences** (interview types, rounds, difficulty ratings, technical questions asked).
3. **End-to-End Application Tracking**: Students upload PDF resumes once, apply with one click, and track real-time status updates (*Applied*, *Shortlisted*, *Interviewing*, *Rejected*).
4. **Enterprise Recruitment Hub**: HR teams can view applicant profiles, download candidate CVs, update candidate statuses, post vacancies, and customize company profile pages.
5. **Administrative Integrity**: Dedicated moderation portal to review flagged community posts, approve company verification requests, and maintain platform security.

---

## 🚀 Key Features

### 👨‍🎓 For Students
- **Dynamic Internship Search & Filtering**:
  - Filter by role, work mode (*Remote*, *On-site*, *Hybrid*), stipend type (*Paid* / *Unpaid*), location, and skills.
  - Search by keywords, company name, or technology tags with immediate results.
- **Detailed Opportunity View**:
  - View full job descriptions, responsibilities, requirements, benefits, stipend amounts, and active deadlines.
- **Community Knowledge Streams**:
  - **Internship Reviews**: Authentic reviews detailing culture, learning curve, mentorship quality, and verified stipend figures.
  - **Interview Experiences**: Dedicated breakdowns of interview rounds, difficulty ratings, questions encountered, and interview advice.
- **PDF Resume Upload & 1-Click Application**:
  - Upload and maintain a PDF resume in your student profile.
  - Apply to internships directly; applications instantly populate in the company's recruitment portal.
- **Student Dashboard & Gamification**:
  - Track live statuses of all submitted applications.
  - Earn points and achievement badges (*Newbie*, *Contributor*, *Top Contributor*) for participating in community reviews.
  - Save/bookmark internships for later review.
  - Receive real-time notification alerts when an employer updates application status.

### 🏢 For Companies & HR Workspaces
- **Company Workspace Dashboard**:
  - Live metric counters for **Active Internships**, **Total Applicants**, **Shortlisted Candidates**, and **Interviewing Candidates**.
  - Quick-action shortcuts to post vacancies, review submissions, and manage company branding.
- **Internship Management**:
  - Post new internship opportunities with custom requirements, deadlines, stipends, and work mode.
  - Track active vs. expired postings; delete or update vacancies at any time.
- **Applicant Tracking System (ATS)**:
  - Centralized table of all student applicants across company postings.
  - Inspect candidate bios, key skills, and community reputation points.
  - Direct 1-click download of student PDF resumes.
  - Transition applicant statuses with live feedback (*Shortlist*, *Invite to Interview*, *Reject*).
- **Enterprise Verification**:
  - Upload business documentation or license credentials to obtain a **Verified Enterprise** badge.

### 🛡️ For System Administrators
- **Moderation Engine**:
  - Monitor and moderate community-submitted internship reviews and interview experiences.
  - Instantly delete fraudulent, abusive, or violating content.
- **Enterprise Verification Approvals**:
  - Review submitted company documents and approve or reject verification requests.
- **Platform Analytics & Audit Trail**:
  - Real-time dashboard showing platform health, active users, company verification statistics, and system activity logs.

---

## 🏛 System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)              │
│       Tailwind CSS v4 · TypeScript · Lucide Icons      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST API (JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Backend (Node.js + Express 5)              │
│  JWT Auth · Role-Based Access Control · Multer (Upload) │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌────────────────────────────────────────────────────────┐
│                  MongoDB Atlas Cloud                   │
│   Users · Internships · Applications · Resumes · Etc.   │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Fetch API |
| **Backend** | Node.js, Express.js 5, JSON Web Tokens (JWT), Bcrypt.js, Multer |
| **Database** | MongoDB Atlas (Cloud NoSQL), Mongoose ODM 9 |
| **Tooling & QA** | OxLint, oxfmt, Node test runners, Postman / Automated JS test scripts |

---

## 📂 Project Structure

```text
InternPrangon---Smart-Choices-for-Your-First-Steps/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── applicationController.js # Applicant tracking and review endpoints
│   │   ├── companyController.js     # Company profile & directory logic
│   │   ├── flagController.js        # Moderation and flagging
│   │   ├── internshipController.js  # Internship CRUD & company-specific queries
│   │   ├── interviewExperienceController.js # Interview experience submissions
│   │   ├── notificationController.js# Real-time user notifications
│   │   ├── resumeController.js      # Multer-based PDF resume upload/stream
│   │   ├── reviewController.js      # Student reviews & moderation
│   │   ├── studentController.js     # Student profile & stats
│   │   └── userController.js        # Authentication & registration
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification & role authorization
│   │   └── uploadMiddleware.js      # Multer configuration for resumes
│   ├── models/                      # Mongoose Schema definitions
│   │   ├── Application.js
│   │   ├── CompanyProfile.js
│   │   ├── Flag.js
│   │   ├── Internship.js
│   │   ├── InterviewExperience.js
│   │   ├── Notification.js
│   │   ├── Resume.js
│   │   ├── Review.js
│   │   ├── StudentProfile.js
│   │   └── User.js
│   ├── routes/                      # Express route endpoints
│   ├── scripts/                     # Seeders, clean-up tools, & test suites
│   ├── uploads/                     # Storage folder for student PDF resumes
│   ├── .env.example                 # Example environment variables
│   ├── package.json
│   └── server.js                    # Express application entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Centralized API service layer
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── components/              # Shared UI components (Navbar, Footer, etc.)
│   │   ├── data/                    # Static catalogs and design tokens
│   │   ├── pages/
│   │   │   ├── admin/               # Admin portal pages (Moderation, Verifications, Activity)
│   │   │   ├── auth/                # Sign In & Registration forms
│   │   │   ├── company/             # Company workspace (Dashboard, ATS, Postings, Profile)
│   │   │   ├── student/             # Student dashboard, Applications, Profile, Reviews
│   │   │   ├── AboutPage.tsx        # Mission, platform values, and team
│   │   │   ├── CompaniesPage.tsx    # Company directory
│   │   │   ├── CompanyDetailPage.tsx# Comprehensive company view & reviews
│   │   │   ├── HomePage.tsx         # Platform landing page
│   │   │   ├── InternshipDetailPage.tsx # Role details & apply flow
│   │   │   ├── InternshipsPage.tsx  # Internship search & filters
│   │   │   └── ReviewsPage.tsx      # Community review & interview streams
│   │   ├── App.tsx                  # Client router & navigation controller
│   │   ├── index.css                # Custom styling tokens and Tailwind imports
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A MongoDB Atlas connection string (or local MongoDB instance)

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/internprangon?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
5. Start the backend server:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

---

### 2. Database Seeding

To immediately populate the platform with verified enterprises, active 2027 internships, student profiles, sample reviews, and test credentials:

```bash
# Inside the backend directory:
node scripts/seedRealCompaniesAndInternships.js
node scripts/seedData.js
```

---

### 3. Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # Open your browser at http://localhost:5173 (or displayed port)
   ```

---

## 🔑 Pre-Configured Test Credentials

All pre-seeded test accounts use consistent, memorable credentials for effortless grading and demonstration:

### 👑 System Administrator
| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin123@gmail.com` | `admin123` | Full Admin Dashboard, Content Moderation, Verifications |
| **Admin (Alias)** | `admin@internprangon.com` | `admin123` | Backwards-compatible Admin access |

---

### 👨‍🎓 Student Account
| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Student** | `student@internprangon.com` | `student123` | Pre-uploaded resume, CS profile, application history |

---

### 🏢 Verified Enterprise Accounts
All company logins follow the standardized format: `companyname@gmail.com` with password `companyname123`.

| Company | Login Email | Password | Industry |
|---|---|---|---|
| **ShopUp** | `shopup@gmail.com` | `shopup123` | B2B Commerce & Supply Chain |
| **Brain Station 23** | `brainstation@gmail.com` *(or brainstation23@gmail.com)* | `brainstation123` | Software & Cloud Solutions |
| **Pathao** | `pathao@gmail.com` | `pathao123` | Ride-sharing & Logistics |
| **bKash** | `bkash@gmail.com` | `bkash123` | Fintech & Mobile Financial Services |
| **Chaldal** | `chaldal@gmail.com` | `chaldal123` | E-commerce & Grocery |
| **Square** | `square@gmail.com` | `square123` | Healthcare & Pharmaceuticals |
| **Optimizely** | `optimizely@gmail.com` | `optimizely123` | Digital Experience & Experimentation |
| **Daraz** | `daraz@gmail.com` | `daraz123` | E-Commerce & Retail |
| **Rokomari** | `rokomari@gmail.com` | `rokomari123` | E-Commerce & Consumer Books |
| **10 Minute School** | `10minuteschool@gmail.com` | `10minuteschool123` | EdTech & Online Learning |
| **Incepta Pharmaceuticals** | `incepta@gmail.com` | `incepta123` | Pharmaceuticals & Bio-Research |
| **BioPharma** | `biopharma@gmail.com` | `biopharma123` | Healthcare & Biotech |
| **Sheba.xyz** | `sheba@gmail.com` | `sheba123` | On-Demand Services |

> 💡 **Tip**: When logged into any company account, clicking **Workspace** or navigating to the company dashboard displays the company's authentic live vacancies, candidate applications, and recruitment statistics.

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/users`)
- `POST /api/users/register` — Register a new student or company account
- `POST /api/users/login` — Sign in and obtain JWT authorization token
- `GET /api/users/profile` — Get authenticated user details

### 💼 Internships (`/api/internship`)
- `GET /api/internship` — Search and filter active internships
- `GET /api/internship/:id` — Retrieve comprehensive internship details
- `POST /api/internship` — Post a new vacancy (Company only)
- `GET /api/internship/company/my` — Get all postings belonging to the logged-in company
- `DELETE /api/internship/:id` — Delete a company internship posting

### 🏢 Companies (`/api/company`)
- `GET /api/company` — Retrieve all verified companies
- `GET /api/company/:id` — Retrieve company profile, open roles, reviews, and stipend data
- `POST /api/company/profile` — Create or update company profile
- `POST /api/company/verify` — Submit verification documents

### 📝 Applications & ATS (`/api/applications`)
- `POST /api/applications/:internshipId` — Submit a new internship application
- `GET /api/applications/student` — Retrieve application status history for logged-in student
- `GET /api/applications/company/all` — Retrieve all candidates across all company vacancies (Company only)
- `PUT /api/applications/:id/status` — Update application status (*Shortlist*, *Interview*, *Reject*)

### 💬 Reviews & Community Knowledge (`/api/reviews` & `/api/interview-experiences`)
- `GET /api/reviews` — Fetch approved internship reviews
- `POST /api/reviews` — Submit a new internship review
- `DELETE /api/reviews/:id` — Admin delete / moderation of reviews
- `GET /api/interview-experiences` — Fetch interview reports by company
- `POST /api/interview-experiences` — Submit an interview experience report

### 📄 Resumes (`/api/resume`)
- `POST /api/resume/upload` — Upload a student PDF resume
- `GET /api/resume/my-resume` — Retrieve active student resume metadata
- `GET /api/resume/download/:id` — Stream and download candidate resume (Authorized HR/Admin)

---

## 🧪 Testing & Quality Assurance

The codebase includes automated test suites covering authentication, candidate applications, ATS recruiter features, content moderation, and sprint milestones:

```bash
# Run the complete test suite
cd backend
npm test

# Run sprint-specific feature verification
node scripts/testSprint3Features.js

# Run comprehensive full-stack verification (Auth, Roles, Postings, Admin flow)
node scripts/runComprehensiveTest.js

# Verify content moderation and delete actions
node scripts/testDeleteReviewAndModeration.js
```

---

## 👥 Team & Academic Context

**InternPrangon** was conceived and developed as a Software Engineering Capstone Project under the **CSE470** curriculum.

- **Institution**: Department of Computer Science and Engineering
- **Focus**: Human-Centered Software Engineering, Clean Architecture, RESTful API Design, Role-Based Access Security, and Responsive UI/UX.

---

<div align="center">
  <sub>Built with ❤️ for students taking their first steps into the professional world.</sub><br>
  <sub>© 2026 InternPrangon. All rights reserved.</sub>
</div>
