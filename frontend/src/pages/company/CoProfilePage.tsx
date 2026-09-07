import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
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
  const [profile, setProfile] = useState<{
    _id?: string;
    companyName: string;
    industry?: string;
    description?: string;
    website?: string;
    verificationStatus: "Pending" | "Approved" | "Rejected";
  }>({
    companyName: user?.name || "Company",
    industry: "Software & Technology",
    description: "Technology firm offering modern internship opportunities.",
    website: "https://example.com",
    verificationStatus: "Pending",
  });
  const [activeCount, setActiveCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndustry, setEditIndustry] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getMyCompanyProfile()
      .then((res) => {
        if (res.profile) {
          setProfile({
            ...res.profile,
            companyName: res.profile.companyName || user?.name || "Company",
            industry: res.profile.industry || "Software & Technology",
            description: res.profile.description || "Leading technology solutions and internship provider.",
            website: res.profile.website || "https://example.com",
            verificationStatus: res.profile.verificationStatus || "Pending",
          });
          setEditIndustry(res.profile.industry || "Software & Technology");
          setEditDescription(res.profile.description || "");
          setEditWebsite(res.profile.website || "https://example.com");
        }
      })
      .catch(() => {});

    getMyCompanyInternships()
      .then((res) => {
        const active = (res.internships || []).filter((i) => i.status === "active").length;
        setActiveCount(active);
      })
      .catch(() => {});
  }, [user?.name]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await submitCompanyProfile({
        companyName: profile.companyName,
        industry: editIndustry,
        description: editDescription,
        website: editWebsite,
        verificationDocument: "trade_license.pdf",
      });
      setProfile((prev) => ({
        ...prev,
        industry: editIndustry,
        description: editDescription,
        website: editWebsite,
      }));
      setIsEditing(false);
      setMessage("Company profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const infoRows = [
    { label: "Industry", value: profile.industry || "Software & Technology" },
    { label: "Account email", value: user?.email || "company@example.com" },
    { label: "Website", value: profile.website || "https://example.com" },
    { label: "Status", value: profile.verificationStatus },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 lg:px-8 lg:py-10 min-h-screen bg-neutral-50">
      {message && (
        <div className="fixed top-5 right-5 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 animate-fade-in">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl lg:text-3xl text-neutral-900 leading-tight"
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontVariationSettings: "'opsz' 72, 'wght' 700",
            }}
          >
            Company Profile
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Public-facing organization information for {profile.companyName}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Section 1: Company identity */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-md">
            {profile.companyName.slice(0, 2).toUpperCase()}
          </div>

          {/* Name + verification */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className="text-2xl lg:text-3xl text-neutral-900 leading-tight font-bold"
                style={{
                  fontFamily: "Fraunces, serif",
                  fontStyle: "italic",
                }}
              >
                {profile.companyName}
              </h2>
              {profile.verificationStatus === "Approved" && (
                <span className="inline-flex items-center gap-1 bg-success-50 text-success-700 text-xs font-semibold px-3 py-1 rounded-full border border-success-200">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified Enterprise
                </span>
              )}
            </div>

            {/* Info rows */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-baseline gap-2">
                  <span className="text-xs text-neutral-400 w-28 flex-shrink-0 font-medium">
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-neutral-800 truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal/Drawer */}
      {isEditing && (
        <div className="bg-white border border-brand-200 rounded-3xl p-6 lg:p-8 mb-6 shadow-md space-y-4">
          <h3 className="font-bold text-neutral-900 text-base">Edit Company Details</h3>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Industry</label>
            <input
              type="text"
              value={editIndustry}
              onChange={(e) => setEditIndustry(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Website URL</label>
            <input
              type="text"
              value={editWebsite}
              onChange={(e) => setEditWebsite(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">About / Bio</label>
            <textarea
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl text-xs font-semibold hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Section 2: About */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 mb-6 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Company Overview & Culture
        </h3>
        <p className="text-sm text-neutral-700 leading-relaxed">
          {profile.description || "No company description provided yet."}
        </p>
      </div>

      {/* Section 3: Stat Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold mb-1">
            Active Internships
          </p>
          <p className="text-2xl font-bold text-brand-600">{activeCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold mb-1">
            Verification Status
          </p>
          <p className="text-2xl font-bold text-success-600">{profile.verificationStatus}</p>
        </div>
      </div>
    </div>
  );
}
