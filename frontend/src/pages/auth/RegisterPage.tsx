import { useState } from "react";
import { type Navigate } from "../../data/index";

interface Props {
  navigate: Navigate;
  onLogin: (as: "student" | "company" | "admin") => void;
  onSubmit: (
    name: string,
    email: string,
    password: string,
    role: "student" | "company",
    extra?: { industry?: string; university?: string; year?: string }
  ) => Promise<void>;
  error?: string;
  loading?: boolean;
  as?: "student" | "company";
}

const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters"];

const industryOptions = [
  "Software & Technology",
  "Data & AI",
  "Design & Creative",
  "Marketing & Growth",
  "Finance & FinTech",
  "E-commerce & Retail",
  "Healthcare",
  "Education & EdTech",
  "Logistics & Supply Chain",
  "Other",
];

const companySizeOptions = ["1–10", "11–50", "51–200", "201–500", "500+"];

export default function RegisterPage({ navigate, onLogin, onSubmit, error, loading, as: defaultTab }: Props) {
  const [tab, setTab] = useState<"student" | "company">(defaultTab ?? "student");
  const [localError, setLocalError] = useState("");

  // Student fields
  const [studentName, setStudentName] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirm, setStudentConfirm] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyConfirm, setCompanyConfirm] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    const name = tab === "student" ? studentName.trim() : companyName.trim();
    const email = tab === "student" ? studentEmail.trim() : contactEmail.trim();
    const password = tab === "student" ? studentPassword : companyPassword;
    const confirmation = tab === "student" ? studentConfirm : companyConfirm;

    if (!name || !email || !password) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmation) {
      setLocalError("Passwords do not match");
      return;
    }

    const extra = tab === "company"
      ? { industry: industry.trim() || undefined }
      : { university: university.trim() || undefined, year: year || undefined };

    await onSubmit(name, email, password, tab, extra);
  }

  const inputClass =
    "w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition";

  const labelClass = "text-sm font-medium text-neutral-700";

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <span className="font-display italic text-2xl text-neutral-900">Intern</span>
          <span className="font-bold text-2xl text-brand-700">Prangon</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-display italic text-3xl text-neutral-900">Create an account</h1>
            <p className="text-sm text-neutral-500 mt-1">Join thousands of students and companies</p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setTab("student")}
              className={[
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
                tab === "student"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
              ].join(" ")}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setTab("company")}
              className={[
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
                tab === "company"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
              ].join(" ")}
            >
              Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {(localError || error) && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {localError || error}
              </p>
            )}
            {tab === "student" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="s-name">Full name</label>
                  <input
                    id="s-name"
                    type="text"
                    autoComplete="name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Riya Hossain"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="s-university">University</label>
                  <input
                    id="s-university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="BUET, BRAC, NSU, DU…"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="s-year">Year of study</label>
                  <select
                    id="s-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select year…</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="s-email">Email address</label>
                  <input
                    id="s-email"
                    type="email"
                    autoComplete="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="you@university.ac.bd"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="s-password">Password</label>
                  <input
                    id="s-password"
                    type="password"
                    autoComplete="new-password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="s-confirm">Confirm password</label>
                  <input
                    id="s-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={studentConfirm}
                    onChange={(e) => setStudentConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className={inputClass}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="c-name">Company name</label>
                  <input
                    id="c-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ByteForge Solutions"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="c-industry">Industry</label>
                  <select
                    id="c-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select industry…</option>
                    {industryOptions.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="c-email">Contact email</label>
                  <input
                    id="c-email"
                    type="email"
                    autoComplete="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hr@yourcompany.com"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="c-size">Company size</label>
                  <select
                    id="c-size"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select size…</option>
                    {companySizeOptions.map((s) => (
                      <option key={s} value={s}>{s} employees</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="c-password">Password</label>
                  <input
                    id="c-password"
                    type="password"
                    autoComplete="new-password"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="c-confirm">Confirm password</label>
                  <input
                    id="c-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={companyConfirm}
                    onChange={(e) => setCompanyConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 transition-colors mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Privacy note */}
          <p className="text-center text-xs text-neutral-400 leading-relaxed">
            By creating an account you agree to our{" "}
            <button type="button" className="text-brand-600 hover:underline">Terms</button>
            {" and "}
            <button type="button" className="text-brand-600 hover:underline">Privacy Policy</button>.
          </p>

          {/* Login link */}
          <p className="text-center text-sm text-neutral-500">
            {"Already have an account? "}
            <button
              type="button"
              onClick={() => navigate("login")}
              className="text-brand-700 font-medium hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
