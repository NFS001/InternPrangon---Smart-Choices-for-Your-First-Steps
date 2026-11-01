import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { getMyCompanyProfile, getSavedUser } from "../../api/client";

interface Props {
  navigate: Navigate;
}

export default function CoVerificationPage({ navigate }: Props) {
  const user = getSavedUser();
  const [companyName, setCompanyName] = useState(user?.name || "bKash Limited");
  const [status, setStatus] = useState<"approved" | "pending" | "rejected" | "unverified">("approved");

  useEffect(() => {
    getMyCompanyProfile()
      .then((res) => {
        if (res.profile) {
          setCompanyName(res.profile.companyName || user?.name || "bKash Limited");
          const st = (res.profile.verificationStatus || "Approved").toLowerCase();
          if (st === "approved") setStatus("approved");
          else if (st === "pending") setStatus("pending");
          else if (st === "rejected") setStatus("rejected");
        }
      })
      .catch(() => {});
  }, [user?.name]);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-4xl mx-auto space-y-8">
      {/* 1. Top Feedback Ribbon */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
            ✓
          </span>
          <span>Your organization identity is fully verified. Unlimited internship posting is unlocked.</span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
          Tier 1 Enterprise
        </span>
      </div>

      {/* 2. Verified Organization Certificate Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-10 shadow-sm max-w-2xl mx-auto text-center space-y-6">
        {/* Large Glowing Green Checkmark Shield Icon */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
              ★
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {companyName} is Verified
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Your official business registration, trade license, and corporate domain have been authenticated by the InternPrangon Trust & Safety team.
          </p>
        </div>

        {/* Verification Audit Record Table */}
        <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-5 text-left text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-2.5">
            <span className="text-slate-500 font-medium">Verification Date</span>
            <span className="font-bold text-slate-900">January 10, 2025</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-500 font-medium">Authenticated By</span>
            <span className="font-bold text-slate-900">InternPrangon Trust & Safety Board</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-500 font-medium">Verified Documents</span>
            <span className="font-bold text-slate-900">Trade License, TIN Certificate, Corporate Domain DNS</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-500 font-medium">Trust Score</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Verified Employer
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 space-y-4">
          <button
            onClick={() => navigate("co-dashboard")}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
          >
            Return to Workspace Dashboard
          </button>

          <p className="text-xs text-slate-400">
            Need to update legal documents?{" "}
            <a
              href="mailto:support@internprangon.com"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Contact enterprise support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
