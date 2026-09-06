import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { INTERNSHIPS } from "../../data/index";
import {
  getSavedUser,
  getStudentProfile,
  getMyResume,
  getMyBookmarks,
  getMyApplications,
  getMyNotifications,
  type ApiUser,
  type ApiApplicationItem,
  type ApiNotificationItem
} from "../../api/client";

interface Props {
  navigate: Navigate;
  currentUser?: ApiUser | null;
}

const statusColor: Record<string, string> = {
  Applied: "bg-neutral-100 text-neutral-700",
  Shortlisted: "bg-info-100 text-info-700",
  Interviewing: "bg-amber-100 text-amber-700",
  Offered: "bg-success-100 text-success-700",
  Rejected: "bg-danger-100 text-danger-600",
};

const BADGE_INFO: Record<string, { icon: string; nextTier: string; nextPts: number; minPts: number }> = {
  Newbie: { icon: "🌱", nextTier: "Explorer", nextPts: 100, minPts: 0 },
  Explorer: { icon: "🔭", nextTier: "Insider", nextPts: 300, minPts: 100 },
  Insider: { icon: "💡", nextTier: "Veteran", nextPts: 600, minPts: 300 },
  Veteran: { icon: "⚡", nextTier: "Elite", nextPts: 1000, minPts: 600 },
  Elite: { icon: "🏆", nextTier: "Elite", nextPts: 1000, minPts: 1000 },
};

export default function DashboardPage({ navigate, currentUser }: Props) {
  const user = currentUser ?? getSavedUser();
  const firstName = user?.name ? user.name.trim().split(" ")[0] : "Student";

  const [points, setPoints] = useState(0);
  const [badge, setBadge] = useState("Newbie");
  const [profileCompletion, setProfileCompletion] = useState(() => {
    const cached = localStorage.getItem("student_profile_completion");
    return cached ? Number(cached) : 100;
  });
  const [savedCount, setSavedCount] = useState(0);
  const [applications, setApplications] = useState<ApiApplicationItem[]>([]);
  const [notifications, setNotifications] = useState<ApiNotificationItem[]>([]);

  useEffect(() => {
    // 1. Fetch Student Profile
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setPoints(res.profile.points ?? 0);
          setBadge(res.profile.badge ?? "Newbie");

          let comp = 25; // 25% for creating account
          if (res.profile.bio && res.profile.bio.trim().length > 0) comp += 25;
          if (res.profile.skills && res.profile.skills.length > 0) comp += 25;

          // Check resume to complete calculation
          getMyResume()
            .then((rRes) => {
              if (rRes.resume) comp += 25;
              setProfileCompletion(comp);
              localStorage.setItem("student_profile_completion", String(comp));
            })
            .catch(() => {
              setProfileCompletion(comp);
              localStorage.setItem("student_profile_completion", String(comp));
            });
        }
      })
      .catch(() => {
        const cached = localStorage.getItem("student_profile_completion");
        if (cached) setProfileCompletion(Number(cached));
      });

    // 2. Fetch Bookmarks
    getMyBookmarks()
      .then((res) => {
        setSavedCount(res.bookmarks?.length || 0);
      })
      .catch(() => setSavedCount(0));

    // 3. Fetch Applications
    getMyApplications()
      .then((res) => {
        setApplications(res.applications || []);
      })
      .catch(() => setApplications([]));

    // 4. Fetch Notifications
    getMyNotifications()
      .then((res) => {
        setNotifications(res.notifications || []);
      })
      .catch(() => setNotifications([]));
  }, []);

  const recommended = INTERNSHIPS.slice(0, 3);
  const tierData = BADGE_INFO[badge] || BADGE_INFO.Newbie;
  const ptsToNext = Math.max(0, tierData.nextPts - points);
  const progressPercent = tierData.nextPts > tierData.minPts
    ? Math.min(100, Math.max(0, ((points - tierData.minPts) / (tierData.nextPts - tierData.minPts)) * 100))
    : 100;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1
          className="text-2xl lg:text-3xl text-brand-700 mb-1"
          style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
        >
          Good morning, {firstName}.
        </h1>
        <p className="text-neutral-500 text-base">{"Here's where you stand."}</p>
      </div>

      {/* Dynamic Profile completion card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-neutral-800">Profile {profileCompletion}% complete</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              {profileCompletion === 100
                ? "Your profile is fully completed! High visibility for recruiters."
                : "Add skills and upload your resume to improve matching score"}
            </p>
          </div>
          <span className="text-2xl font-bold text-brand-600">{profileCompletion}%</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-4">
          <div
            className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("profile")}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Update Profile & Skills
          </button>
          <button
            onClick={() => navigate("profile")}
            className="px-4 py-2 bg-brand-50 text-brand-700 text-sm font-medium rounded-lg hover:bg-brand-100 transition-colors border border-brand-200"
          >
            Upload Resume
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 mb-8">
        {/* Col 1: Recommended internships */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-800 mb-4 text-sm uppercase tracking-wider">Recommended for you</h2>
          <div className="flex flex-col gap-4">
            {recommended.map((i) => (
              <div key={i.id} className="flex items-start gap-3 min-h-[44px]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: i.logoBg, color: i.logoColor }}
                >
                  {i.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 text-sm leading-tight truncate">{i.role}</p>
                  <p className="text-xs text-neutral-500">{i.company}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                    {i.type}
                  </span>
                </div>
                <button
                  onClick={() => navigate("internship-detail", { id: i.id })}
                  className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0"
                >
                  View
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("internships")}
            className="mt-4 w-full text-sm text-brand-600 font-medium text-center hover:underline"
          >
            Browse all internships →
          </button>
        </div>

        {/* Col 2: Application progress */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-800 mb-4 text-sm uppercase tracking-wider">Applications</h2>
          <div className="flex flex-col gap-3">
            {applications.length === 0 ? (
              <div className="py-8 text-center text-neutral-400">
                <p className="text-3xl mb-1">📋</p>
                <p className="text-sm font-medium text-neutral-600">No applications yet</p>
                <p className="text-xs text-neutral-400 mt-0.5">Explore open roles and apply.</p>
              </div>
            ) : (
              applications.slice(0, 4).map((app) => {
                const internshipObj = typeof app.internship === "object" ? app.internship : null;
                const title = internshipObj?.title || "Internship";
                return (
                  <div key={app.applicationId} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 bg-brand-50 text-brand-700"
                    >
                      {title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{title}</p>
                      <p className="text-xs text-neutral-500 truncate">{internshipObj?.mode || "On-site"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor[app.status] || "bg-neutral-100 text-neutral-700"}`}>
                      {app.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => navigate("applications")}
            className="mt-4 w-full text-sm text-brand-600 font-medium text-center hover:underline"
          >
            View all applications →
          </button>
        </div>

        {/* Col 3: Stats + Notifications */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-neutral-800 mb-3 text-sm uppercase tracking-wider">Your stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-brand-700">{points}</p>
                <p className="text-xs text-brand-500">Points</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-lg font-bold text-amber-700">{badge} {tierData.icon}</p>
                <p className="text-xs text-amber-500">Badge Tier</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-neutral-700">{savedCount}</p>
                <p className="text-xs text-neutral-400">Saved</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-neutral-700">{applications.length}</p>
                <p className="text-xs text-neutral-400">Applied</p>
              </div>
            </div>
          </div>

          {/* Notifications teaser */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex-1">
            <h2 className="font-semibold text-neutral-800 mb-3 text-sm uppercase tracking-wider">Notifications</h2>
            <div className="flex flex-col gap-3">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-neutral-400 text-xs">
                  No new notifications right now.
                </div>
              ) : (
                notifications.slice(0, 2).map((n) => (
                  <div key={n._id} className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full ${n.isRead ? "bg-neutral-300" : "bg-blue-500"} mt-1.5 flex-shrink-0`} />
                    <p className="text-sm text-neutral-700 line-clamp-2">{n.message}</p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("notifications")}
              className="mt-3 text-sm text-brand-600 font-medium hover:underline"
            >
              View all notifications →
            </button>
          </div>
        </div>
      </div>

      {/* Contributor points widget */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 lg:p-6 text-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">Contributor Tier</p>
            <h3 className="text-2xl font-bold">{badge} {tierData.icon}</h3>
            <p className="text-brand-200 text-sm mt-1">{points} points earned</p>
          </div>
          <div className="text-right">
            {badge === "Elite" ? (
              <p className="text-white font-bold text-lg">Top Tier Achieved! 🏆</p>
            ) : (
              <>
                <p className="text-brand-200 text-sm">Next tier: {tierData.nextTier}</p>
                <p className="text-white font-bold text-lg">{ptsToNext} pts away</p>
              </>
            )}
            <button
              onClick={() => navigate("contributors")}
              className="mt-2 px-3 py-1.5 bg-white text-brand-700 text-xs font-semibold rounded-lg hover:bg-brand-50 transition-colors"
            >
              View leaderboard
            </button>
          </div>
        </div>
        <div className="mt-4 w-full bg-brand-500 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-brand-300 mt-1">
          <span>{badge} ({tierData.minPts})</span>
          <span>{tierData.nextTier} ({tierData.nextPts})</span>
        </div>
      </div>
    </div>
  );
}
