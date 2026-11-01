import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { CompanyLogo } from "../../components/common/CompanyLogos";
import {
  getMyCompanyProfile,
  getMyCompanyInternships,
  submitCompanyProfile,
  getSavedUser,
} from "../../api/client";

interface Props {
  navigate: Navigate;
}

export default function CoProfilePage({ navigate }: Props) {
  const user = getSavedUser();
  const [companyName, setCompanyName] = useState(user?.name || "bKash Limited");
  const [industry, setIndustry] = useState("Fintech & Mobile Financial Services");
  const [website, setWebsite] = useState("https://bkash.com");
  const [contactEmail, setContactEmail] = useState(user?.email || "careers@company.com");
  const [verificationStatus, setVerificationStatus] = useState("Approved");
  const [aboutBio, setAboutBio] = useState(
    "Leading technology solutions, distributed services, and career opportunities for young talent across Bangladesh."
  );
  const [companyInternships, setCompanyInternships] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editIndustry, setEditIndustry] = useState(industry);
  const [editWebsite, setEditWebsite] = useState(website);
  const [editBio, setEditBio] = useState(aboutBio);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getMyCompanyProfile()
      .then((res) => {
        if (res.profile) {
          setCompanyName(res.profile.companyName || user?.name || "Company");
          if (res.profile.industry) setIndustry(res.profile.industry);
          if (res.profile.website) setWebsite(res.profile.website);
          if (res.profile.description) setAboutBio(res.profile.description);
          setVerificationStatus(res.profile.verificationStatus || "Approved");

          setEditIndustry(res.profile.industry || "Technology & Enterprise");
          setEditWebsite(res.profile.website || "https://example.com");
          setEditBio(res.profile.description || aboutBio);
        }
      })
      .catch(() => {});

    getMyCompanyInternships()
      .then((res) => {
        if (res.internships) {
          setCompanyInternships(res.internships);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await submitCompanyProfile({
        companyName,
        industry: editIndustry,
        website: editWebsite,
        description: editBio,
        verificationDocument: "trade_license.pdf",
      });
      setIndustry(editIndustry);
      setWebsite(editWebsite);
      setAboutBio(editBio);
      setIsEditing(false);
      setMessage("Company profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {message && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Public Organization Profile
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            This information is publicly visible to university students across Bangladesh.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditIndustry(industry);
              setEditWebsite(website);
              setEditBio(aboutBio);
              setIsEditing(!isEditing);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            {isEditing ? "Close Editor" : "Edit Profile & Branding"}
          </button>
          <button
            onClick={() => navigate("company-detail", { id: 5 })}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>View Public Profile</span>
            <span>↗</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Top Cover Photo Banner */}
        <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img
            src="/workplace_office_banner.jpg"
            alt="bKash Dhaka Headquarters"
            className="w-full h-full object-cover object-center brightness-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
          <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-xs flex items-center gap-1.5">
            <span>📍</span>
            <span>Dhaka Headquarters</span>
          </span>
        </div>

        {/* Brand Block & Identity Information */}
        <div className="px-6 lg:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Elevated Squircle Brand Logo overlapping the banner photo */}
              <div className="-mt-12 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-2.5 shadow-xl border-4 border-white flex items-center justify-center shrink-0 z-10">
                <CompanyLogo name={companyName} size={72} />
              </div>

              {/* Company Name & Metadata - strictly positioned on the clean white card below the photo */}
              <div className="pt-2 sm:pt-5 space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {companyName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                    <span>✔</span>
                    <span>Verified Enterprise Partner</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Dhaka, Bangladesh · 500+ Employees · {industry}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Info Grid (4-Column Layout) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Industry</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{industry}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Website</p>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:underline mt-0.5 inline-flex items-center gap-1"
              >
                <span>{website}</span>
                <span>↗</span>
              </a>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recruiter Contact</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{contactEmail}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{verificationStatus} & Active</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Drawer */}
      {isEditing && (
        <div className="bg-white rounded-3xl border border-indigo-200 p-6 lg:p-8 shadow-xl space-y-4 animate-scale-up">
          <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
            Edit Public Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Industry</label>
              <input
                type="text"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Website URL</label>
              <input
                type="text"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company Overview</label>
            <textarea
              rows={5}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* 3. Organization Overview & Culture Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: About bKash (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              About {companyName}
            </h3>
            <div className="text-xs text-slate-700 leading-relaxed space-y-3">
              {aboutBio.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Workplace & Perks */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Workplace & Student Intern Perks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { title: "Mentorship Program", icon: "👨‍🏫" },
                { title: "Flexible Core Hours", icon: "⏰" },
                { title: "Subsidized Lunch", icon: "🍲" },
                { title: "Pre-Placement Offer (PPO) Track", icon: "🎯" },
              ].map((perk) => (
                <div
                  key={perk.title}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center space-y-1.5"
                >
                  <span className="text-xl">{perk.icon}</span>
                  <p className="font-bold text-[11px] text-slate-800 leading-tight">{perk.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Opportunities Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Opportunities ({companyInternships.length})
            </h3>
            <button
              onClick={() => navigate("co-internships")}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Manage all →
            </button>
          </div>

          <div className="space-y-3">
            {companyInternships.length > 0 ? (
              companyInternships.map((ci) => (
                <div key={ci._id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {ci.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ci.mode || "On-site"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {ci.type === "Paid" ? "Paid · BDT 20,000/mo" : "Unpaid"} · Deadline:{" "}
                    {ci.deadline
                      ? new Date(ci.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "May 20, 2027"}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {ci.totalApplicants || 0} direct {ci.totalApplicants === 1 ? "applicant" : "applicants"}
                    </span>
                    <button
                      onClick={() => navigate("co-applicants", { internshipId: ci._id })}
                      className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View candidates →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-white text-center text-xs text-slate-400">
                No live opportunities posted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
