import React, { useState, useEffect, useRef } from "react";
import type { Navigate } from "../../data/index";
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

function getInitials(name?: string) {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ProfilePage({ navigate, currentUser }: Props) {
  const user = currentUser ?? getSavedUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name] = useState(user?.name || "Student");
  const [email] = useState(user?.email || "student@example.com");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js"]);
  const [points, setPoints] = useState(0);
  const [badge, setBadge] = useState("Newbie");
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeDate, setResumeDate] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Fetch live student profile
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setBio(res.profile.bio || "Student at InternPrangon looking for great internship opportunities.");
          if (res.profile.skills && res.profile.skills.length > 0) {
            setSkills(res.profile.skills);
          }
          setPoints(res.profile.points ?? 0);
          setBadge(res.profile.badge ?? "Newbie");
          setEditBio(res.profile.bio || "");
        }
      })
      .catch(() => {});

    // Fetch live resume
    getMyResume()
      .then((res) => {
        if (res.resume && res.resume.filePath) {
          const filename = res.resume.filePath.split(/[/\\]/).pop() || "resume.pdf";
          setResumeName(filename);
          setResumeDate(new Date(res.resume.uploadedDate).toLocaleDateString());
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const initials = getInitials(name);

  // Calculate dynamic profile completion:
  // 25% account created + 25% bio + 25% skills + 25% resume = 100%
  let completion = 25;
  if (bio && bio.trim().length > 0) completion += 25;
  if (skills && skills.length > 0) completion += 25;
  if (resumeName) completion += 25;
  completion = Math.min(100, completion);

  useEffect(() => {
    localStorage.setItem("student_profile_completion", String(completion));
  }, [completion]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateStudentProfile({ bio: editBio, skills });
      setBio(editBio);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      setNewSkill("");
      updateStudentProfile({ skills: updated }).catch(() => {});
    }
  };

  const handleRemoveSkill = (toRemove: string) => {
    const updated = skills.filter((s) => s !== toRemove);
    setSkills(updated);
    updateStudentProfile({ skills: updated }).catch(() => {});
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    try {
      const res = await uploadResume(file);
      const filename = res.resume.filePath.split(/[/\\]/).pop() || file.name;
      setResumeName(filename);
      setResumeDate(new Date(res.resume.uploadedDate).toLocaleDateString());
      setMessage({ type: "success", text: "Resume uploaded successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to upload resume." });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Feedback banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-danger-50 text-danger-700 border border-danger-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar + name block */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl text-brand-700 mb-0.5 truncate"
            style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
          >
            {name}
          </h1>
          <p className="text-neutral-600 text-sm truncate">{email}</p>
          <p className="text-neutral-400 text-sm mt-0.5">Student Account</p>
        </div>
        <button
          onClick={() => {
            setEditBio(bio);
            setIsEditing(!isEditing);
          }}
          className="px-4 py-2 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit profile"}
        </button>
      </div>

      {/* Edit Bio Form */}
      {isEditing && (
        <div className="bg-white border border-brand-200 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-neutral-800 mb-2">Edit Bio</h3>
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Tell companies about your academic interests, career goals, and passions..."
            rows={3}
            className="w-full p-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Bio"}
            </button>
          </div>
        </div>
      )}

      {/* Profile completion */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-neutral-800 text-sm">Profile completion</p>
          <span className="text-brand-600 font-bold">{completion}%</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-2">Add missing skills and upload your resume to reach 100%</p>
      </div>

      {/* About / Bio */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-2">About & Bio</h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          {bio || "No bio added yet. Click 'Edit profile' to share a brief introduction."}
        </p>
      </div>

      {/* Skills */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800">Skills</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              placeholder="e.g. Python"
              className="px-3 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={handleAddSkill}
              className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg font-medium hover:bg-brand-100"
            >
              + Add
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 text-sm font-medium rounded-full border border-brand-100"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-brand-400 hover:text-brand-700 text-xs font-bold leading-none"
                title="Remove skill"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Resume (Feature 7) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-neutral-800">Resume</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-brand-600 font-medium hover:underline"
          >
            {resumeName ? "Replace" : "Upload Resume (PDF)"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleResumeFileChange}
            className="hidden"
          />
        </div>
        {resumeName ? (
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-danger-600 text-xs font-bold">PDF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{resumeName}</p>
              <p className="text-xs text-neutral-400">Uploaded {resumeDate || "Recently"}</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Ready for 1-click apply
            </span>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-neutral-200 rounded-xl text-center cursor-pointer hover:border-brand-400 transition-colors"
          >
            <p className="text-sm font-medium text-neutral-600">Click to upload your resume (PDF format, max 5 MB)</p>
            <p className="text-xs text-neutral-400 mt-1">Enables 1-click internship applications</p>
          </div>
        )}
      </div>

      {/* Contributor info (Feature 15 & 16) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-4">Contributor Status</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">
            {badge === "Elite" ? "🏆" : badge === "Veteran" ? "⚡" : badge === "Insider" ? "💡" : badge === "Explorer" ? "🔭" : "🌱"}
          </div>
          <div className="flex-1">
            <p className="font-bold text-neutral-800 text-lg">{badge} Tier</p>
            <p className="text-neutral-500 text-sm">{points} contributor points</p>
            <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, (points / 300) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Earn points by sharing reviews (+5 pts) and interview questions (+3 pts)
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("contributors")}
          className="mt-4 w-full py-2.5 border border-brand-200 text-brand-700 text-sm font-medium rounded-xl hover:bg-brand-50 transition-colors"
        >
          View leaderboard
        </button>
      </div>
    </div>
  );
}
