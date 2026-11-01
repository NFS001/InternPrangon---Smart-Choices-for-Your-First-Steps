const fs = require('fs');
const path = require('path');

const contentStream = `BT
/F1 20 Tf
50 740 Td
(NAFIS UDDIN CHOWDHURY) Tj
/F2 10 Tf
0 -18 Td
(Dhaka, Bangladesh | nafis.chowdhury@g.bracu.ac.bd | github.com/NFS001) Tj
0 -14 Td
(LinkedIn: linkedin.com/in/nafis-uddin | Portfolio: internprangon.vercel.app) Tj
0 -24 Td
/F1 12 Tf
(EDUCATION) Tj
/F2 10 Tf
0 -15 Td
(BRAC University - B.Sc. in Computer Science and Engineering) Tj
0 -13 Td
(Class of 2026 | CGPA: 3.82 / 4.00 - Vice Chancellor and Deans Honor List) Tj
0 -22 Td
/F1 12 Tf
(CORE TECHNICAL SKILLS) Tj
/F2 10 Tf
0 -15 Td
(Languages: TypeScript, JavaScript, Python, C#, C++, SQL, HTML5, CSS3) Tj
0 -13 Td
(Frameworks: React 19, Vite, Tailwind CSS v4, Node.js, Express, FastAPI, Next.js) Tj
0 -13 Td
(Databases & Tools: MongoDB Atlas, PostgreSQL, Docker, Git, Vercel, RESTful APIs) Tj
0 -22 Td
/F1 12 Tf
(FEATURED PROJECTS) Tj
/F1 11 Tf
0 -16 Td
(InternPrangon - Transparent Internship & Hiring Platform) Tj
/F2 10 Tf
0 -13 Td
(- Engineered multi-tenant platform for students, verified companies, and administrators.) Tj
0 -13 Td
(- Built 1-click ATS application pipeline, resume parser, and transparent stipend insights.) Tj
0 -13 Td
(- Modern split-screen authentication, glassmorphic dashboards, and verified badges.) Tj
0 -18 Td
/F1 11 Tf
(High-Throughput Distributed Microservices Engine) Tj
/F2 10 Tf
0 -13 Td
(- Scalable REST API with JWT role-based access control and MongoDB query caching.) Tj
0 -13 Td
(- Comprehensive unit and integration test coverage across all sprint milestones.) Tj
0 -22 Td
/F1 12 Tf
(ACADEMIC HONORS & LEADERSHIP) Tj
/F2 10 Tf
0 -15 Td
(- BRAC University Merit Academic Scholarship recipient.) Tj
0 -13 Td
(- Certified Full-Stack Web Developer & Active Peer Mentor.) Tj
ET`;

const streamLength = Buffer.byteLength(contentStream, 'utf-8');

const parts = [];
parts.push('%PDF-1.4\n');

const offsets = [];

function addObj(str) {
  offsets.push(Buffer.byteLength(parts.join(''), 'utf-8'));
  parts.push(str);
}

addObj('1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj\n');
addObj('2 0 obj\n<<\n  /Type /Pages\n  /Kids [3 0 R]\n  /Count 1\n>>\nendobj\n');
addObj('3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 612 792]\n  /Resources <<\n    /Font <<\n      /F1 4 0 R\n      /F2 5 0 R\n    >>\n  >>\n  /Contents 6 0 R\n>>\nendobj\n');
addObj('4 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Bold\n>>\nendobj\n');
addObj('5 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica\n>>\nendobj\n');
addObj(`6 0 obj\n<<\n  /Length ${streamLength}\n>>\nstream\n${contentStream}\nendstream\nendobj\n`);

const startXref = Buffer.byteLength(parts.join(''), 'utf-8');
let xref = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) {
  xref += String(off).padStart(10, '0') + ' 00000 n \n';
}
parts.push(xref);
parts.push(`trailer\n<<\n  /Size ${offsets.length + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startXref}\n%%EOF\n`);

const pdfBuffer = Buffer.from(parts.join(''), 'utf-8');
const targetPath = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'sample_resume.pdf');
fs.writeFileSync(targetPath, pdfBuffer);
console.log('Sample resume PDF created successfully at:', targetPath, 'Size:', pdfBuffer.length);
