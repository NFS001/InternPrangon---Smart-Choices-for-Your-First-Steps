import React, { useState, useEffect, useRef } from "react";
import type { Navigate } from "../../data/index";
import { CURRENT_STUDENT } from "../../data/index";
import {
  getSavedUser,
  getStudentProfile,
  updateStudentProfile,
  getMyResume,
  uploadResume,
  type ApiUser,
} from "../../api/client";

interface Props {
  navigate: Navigate;
  currentUser?: ApiUser | null;
}

export default function ProfilePage({ navigate: _navigate, currentUser }: Props) {
  const user = currentUser ?? getSavedUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || CURRENT_STUDENT.name);
  const [email, setEmail] = useState(user?.email || CURRENT_STUDENT.email);
  const [bio, setBio] = useState(
    "Final-year Computer Science student at BRAC University specializing in full-stack web architectures, distributed systems, and cloud backend engineering."
  );

  // Grouped Skills
  const [coreSkills, setCoreSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "C#",
    ".NET",
    "FastAPI",
  ]);
  const [devopsSkills, setDevopsSkills] = useState<string[]>([
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS",
  ]);

  const [newSkillInput, setNewSkillInput] = useState("");
  const [resumeFilename, setResumeFilename] = useState("Nafis_Uddin_Chowdhury_Resume_2026.pdf");
  const [resumeUploadDate, setResumeUploadDate] = useState("Sep 7, 2026");

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          if (res.profile.bio && res.profile.bio.trim()) {
            setBio(res.profile.bio);
          }
          if (res.profile.skills && res.profile.skills.length > 0) {
            // Merge custom skills into core
            setCoreSkills((prev) => Array.from(new Set([...prev, ...res.profile!.skills!])));
          }
        }
      })
      .catch(() => {});

    getMyResume()
      .then((res) => {
        if (res.resume && res.resume.filePath) {
          const fn = res.resume.filePath.split(/[/\\]/).pop() || "Nafis_Uddin_Chowdhury_Resume_2026.pdf";
          setResumeFilename(fn);
          if (res.resume.uploadedDate) {
            setResumeUploadDate(
              new Date(res.resume.uploadedDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            );
          }
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSaveBio = async () => {
    setSavingBio(true);
    setFeedbackMsg(null);
    try {
      await updateStudentProfile({
        bio: editBioValue,
        skills: [...coreSkills, ...devopsSkills],
      });
      setBio(editBioValue);
      setIsEditingBio(false);
      setFeedbackMsg({ type: "success", text: "Bio updated successfully!" });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save bio.",
      });
    } finally {
      setSavingBio(false);
    }
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (coreSkills.includes(trimmed) || devopsSkills.includes(trimmed)) {
      setNewSkillInput("");
      return;
    }
    const updated = [...coreSkills, trimmed];
    setCoreSkills(updated);
    setNewSkillInput("");
    updateStudentProfile({ skills: [...updated, ...devopsSkills] }).catch(() => {});
  };

  const handleRemoveSkill = (skillToRemove: string, category: "core" | "devops") => {
    if (category === "core") {
      const updated = coreSkills.filter((s) => s !== skillToRemove);
      setCoreSkills(updated);
      updateStudentProfile({ skills: [...updated, ...devopsSkills] }).catch(() => {});
    } else {
      const updated = devopsSkills.filter((s) => s !== skillToRemove);
      setDevopsSkills(updated);
      updateStudentProfile({ skills: [...coreSkills, ...updated] }).catch(() => {});
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedbackMsg(null);
    try {
      const res = await uploadResume(file);
      const fn = res.resume?.filePath?.split(/[/\\]/).pop() || file.name;
      setResumeFilename(fn);
      setResumeUploadDate("Just now");
      setFeedbackMsg({ type: "success", text: "Resume uploaded & parsed successfully!" });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload PDF.",
      });
    }
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-5xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition-all ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* 1. Profile Header Showcase */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Soft Ambient Corner Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Headshot in Squircle Frame with Camera Badge */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-md bg-slate-100">
                <img
                  src="/team_nafis.jpg"
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  NU
                </div>
              </div>

              {/* Camera Upload Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center text-xs transition-colors border-2 border-white"
                title="Change Photo"
              >
                📷
              </button>
            </div>

            {/* Name, Badges & Subtitle */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px]">✔</span> Verified Student Email
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                <span>🎓 B.Sc. in CSE</span>
                <span>·</span>
                <span>BRAC University</span>
                <span>·</span>
                <span className="text-slate-400 font-normal">{email}</span>
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  🌱 Newbie Tier · 25 pts
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                  ID: 21101234
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <button
              onClick={() => {
                setEditBioValue(bio);
                setIsEditingBio(!isEditingBio);
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors shadow-2xs"
            >
              {isEditingBio ? "Cancel" : "Edit Profile Info"}
            </button>
            <button
              onClick={() => window.open("https://github.com/NFS001", "_blank")}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs rounded-xl border border-indigo-200/80 transition-colors flex items-center gap-1"
            >
              <span>Public View</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Profile Completion Widget */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg font-bold shrink-0">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">100% Profile Complete & Verified</h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All verification steps finished. Your profile is prioritized in recruiter searches.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* 3. About & Bio Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            About & Bio
          </h2>
          <button
            onClick={() => {
              setEditBioValue(bio);
              setIsEditingBio(!isEditingBio);
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {isEditingBio ? "Close" : "Edit Bio"}
          </button>
        </div>

        {isEditingBio ? (
          <div className="space-y-3 pt-1">
            <textarea
              rows={4}
              value={editBioValue}
              onChange={(e) => setEditBioValue(e.target.value)}
              className="w-full p-3.5 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingBio(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBio}
                disabled={savingBio}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                {savingBio ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {bio}
          </p>
        )}
      </div>

      {/* 4. Verified Skills Matrix */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verified Skills Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tagged skills automatically increase match rate for company internship openings.
            </p>
          </div>

          {/* Quick Add Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="+ Add new skill or framework..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(newSkillInput);
                }
              }}
              className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 w-56"
            />
            <button
              onClick={() => handleAddSkill(newSkillInput)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Group 1: Core Tech */}
        <div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Core Tech & Languages
          </p>
          <div className="flex flex-wrap gap-2">
            {coreSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/80 shadow-2xs transition-colors"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill, "core")}
                  className="text-indigo-400 hover:text-indigo-800 text-sm font-bold leading-none"
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Group 2: Databases & DevOps */}
        <div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Databases & Cloud DevOps
          </p>
          <div className="flex flex-wrap gap-2">
            {devopsSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill, "devops")}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold leading-none"
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Resume & Portfolio Vault */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resume & Portfolio Vault
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely stored and verified for instant 1-Click Applications.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Upload New Version
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Elevated Document Preview Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Red SVG PDF Icon Container */}
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity="0.4" />
                <path d="M14 2v6h6" />
                <path d="M9 13h6M9 17h3" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  {resumeFilename}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>🟢</span>
                  <span>Ready for 1-Click Apply</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                240 KB · Uploaded {resumeUploadDate} · Parsed for 1-Click Apply
              </p>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => alert(`Previewing ${resumeFilename} in secure document viewer.`)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              Preview
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-600 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              Replace PDF
            </button>
            <button
              onClick={() => alert(`Downloading verified resume: ${resumeFilename}`)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* 6. Academic Credentials Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
          Academic Credentials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Institution</p>
            <p className="font-bold text-slate-900 text-sm mt-1">BRAC University</p>
            <p className="text-xs text-slate-500">Mohakhali, Dhaka, Bangladesh</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Degree & Major</p>
            <p className="font-bold text-slate-900 text-sm mt-1">B.Sc. in Computer Science</p>
            <p className="text-xs text-slate-500">School of Data and Sciences</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Graduation</p>
            <p className="font-bold text-indigo-600 text-sm mt-1">Class of 2026</p>
            <p className="text-xs text-slate-500">CGPA: 3.82 / 4.00 (Dean's List)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
