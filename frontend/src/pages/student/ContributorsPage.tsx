import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { getLeaderboard, getStudentProfile, getSavedUser } from "../../api/client";

interface Props {
  navigate: Navigate;
}

interface Tier {
  name: string;
  icon: string;
  range: string;
  min: number;
  color: string;
  bg: string;
  border: string;
}

const TIERS: Tier[] = [
  { name: "Newbie", icon: "🌱", range: "0–99 pts", min: 0, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  { name: "Explorer", icon: "🔭", range: "100–299 pts", min: 100, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  { name: "Insider", icon: "💡", range: "300–599 pts", min: 300, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  { name: "Veteran", icon: "⚡", range: "600–999 pts", min: 600, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  { name: "Elite", icon: "🏆", range: "1000+ pts", min: 1000, color: "text-brand-700", bg: "bg-brand-50", border: "border-brand-200" },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  university: string;
  points: number;
  badge: string;
  badgeIcon: string;
  isCurrentUser?: boolean;
}

const BADGE_ICONS: Record<string, string> = {
  Newbie: "🌱",
  Explorer: "🔭",
  Insider: "💡",
  Veteran: "⚡",
  Elite: "🏆",
};

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Farhan Ahmed", university: "BUET", points: 1240, badge: "Elite", badgeIcon: "🏆" },
  { rank: 2, name: "Tasnia Islam", university: "DU", points: 980, badge: "Veteran", badgeIcon: "⚡" },
  { rank: 3, name: "Rafi Hossain", university: "NSU", points: 820, badge: "Veteran", badgeIcon: "⚡" },
  { rank: 4, name: "Mehrin Akter", university: "SUST", points: 710, badge: "Veteran", badgeIcon: "⚡" },
  { rank: 5, name: "Labib Rahman", university: "IUT", points: 590, badge: "Insider", badgeIcon: "💡" },
  { rank: 6, name: "Zara Chowdhury", university: "BRAC", points: 480, badge: "Insider", badgeIcon: "💡" },
  { rank: 7, name: "Riya Hossain", university: "BUET", points: 340, badge: "Explorer", badgeIcon: "🔭" },
  { rank: 8, name: "Nadia Hassan", university: "UIU", points: 220, badge: "Explorer", badgeIcon: "🔭" },
  { rank: 9, name: "Karim Uddin", university: "KUET", points: 110, badge: "Explorer", badgeIcon: "🔭" },
  { rank: 10, name: "Sadia Begum", university: "JnU", points: 60, badge: "Newbie", badgeIcon: "🌱" },
];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const HOW_TO_EARN = [
  { action: "Write a company review", points: "+5 pts" },
  { action: "Share interview experience", points: "+5 pts" },
  { action: "Contribute stipend data", points: "Anonymous" },
  { action: "Complete profile", points: "+10 pts" },
];

function getCurrentTier(points: number): string {
  if (points >= 1000) return "Elite";
  if (points >= 600) return "Veteran";
  if (points >= 300) return "Insider";
  if (points >= 100) return "Explorer";
  return "Newbie";
}

export default function ContributorsPage({ navigate }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [studentPoints, setStudentPoints] = useState(0);
  const [studentBadge, setStudentBadge] = useState("Newbie");
  const currentUser = getSavedUser();

  useEffect(() => {
    // 1. Fetch Student Profile for live badge & points
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setStudentPoints(res.profile.points ?? 0);
          setStudentBadge(res.profile.badge ?? "Newbie");
        }
      })
      .catch(() => {});

    // 2. Fetch Leaderboard from backend
    getLeaderboard(20)
      .then((res) => {
        if (res.leaderboard && res.leaderboard.length > 0) {
          const mapped: LeaderboardEntry[] = res.leaderboard.map((item) => ({
            rank: item.rank,
            name: item.name,
            university: "Student",
            points: item.points,
            badge: item.badge,
            badgeIcon: BADGE_ICONS[item.badge] || "🌱",
            isCurrentUser: currentUser ? currentUser.name === item.name : false,
          }));
          setLeaderboard(mapped);
        }
      })
      .catch(() => {});
  }, [currentUser?.name]);

  const currentTierName = studentBadge || getCurrentTier(studentPoints);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl lg:text-3xl text-brand-700 mb-1"
            style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
          >
            Contributor Leaderboard
          </h1>
          <p className="text-neutral-500 text-sm">Earn points by sharing reviews and interview experiences.</p>
        </div>
        <button
          onClick={() => navigate("write-review")}
          className="px-4 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition-colors shrink-0 self-start sm:self-auto"
        >
          + Write Review
        </button>
      </div>

      {/* User Status Bar */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-2xl p-5 mb-8 text-white flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-brand-200 uppercase font-semibold tracking-wider">Your Contribution Status</p>
          <p className="text-xl font-bold mt-0.5">{currentUser?.name || "Student"}</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-brand-200">Points</p>
            <p className="text-2xl font-bold">{studentPoints}</p>
          </div>
          <div className="border-l border-brand-500/50 pl-4">
            <p className="text-xs text-brand-200">Tier</p>
            <p className="text-lg font-bold flex items-center gap-1">
              {studentBadge} <span>{BADGE_ICONS[studentBadge] || "🌱"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Badge tiers */}
      <div className="mb-10">
        <h2 className="font-semibold text-neutral-800 mb-4">Badge Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TIERS.map((tier) => {
            const isCurrent = tier.name === currentTierName;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl p-4 border-2 transition-all ${
                  isCurrent
                    ? "border-violet-400 bg-brand-50 shadow-md shadow-violet-100"
                    : `${tier.border} ${tier.bg}`
                }`}
              >
                <div className="text-2xl mb-2">{tier.icon}</div>
                <p className={`font-bold text-sm ${isCurrent ? "text-brand-700" : tier.color}`}>
                  {tier.name}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{tier.range}</p>
                {isCurrent && (
                  <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-brand-200 text-brand-700 rounded-full font-medium">
                    Your tier
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-3xl mx-auto mb-10">
        <h2 className="font-semibold text-neutral-800 mb-4">Top Contributors</h2>
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-3">University</div>
            <div className="col-span-2 text-right">Points</div>
            <div className="col-span-1 text-right">Badge</div>
          </div>

          {/* Rows */}
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-neutral-100 last:border-0 transition-colors ${
                entry.isCurrentUser
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "hover:bg-neutral-50"
              }`}
            >
              <div className="col-span-1 flex items-center">
                {MEDALS[entry.rank] ? (
                  <span className="text-base">{MEDALS[entry.rank]}</span>
                ) : (
                  <span className={`font-bold text-sm ${entry.isCurrentUser ? "text-brand-600" : "text-neutral-500"}`}>
                    {entry.rank}
                  </span>
                )}
              </div>
              <div className="col-span-5 flex items-center">
                <span className={`text-sm ${entry.isCurrentUser ? "text-brand-700 font-bold" : "text-neutral-800 font-medium"}`}>
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs bg-brand-200 text-brand-700 px-1.5 py-0.5 rounded-full">You</span>
                  )}
                </span>
              </div>
              <div className={`col-span-3 flex items-center text-sm ${entry.isCurrentUser ? "text-brand-600" : "text-neutral-500"}`}>
                {entry.university}
              </div>
              <div className={`col-span-2 flex items-center justify-end font-semibold text-sm ${entry.isCurrentUser ? "text-brand-700" : "text-neutral-700"}`}>
                {entry.points}
              </div>
              <div className="col-span-1 flex items-center justify-end text-base">
                {entry.badgeIcon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to earn */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-semibold text-neutral-800 mb-4">How to earn points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOW_TO_EARN.map((item) => (
            <div
              key={item.action}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <p className="text-sm text-neutral-700">{item.action}</p>
              <span className="text-sm font-bold text-brand-600 ml-2">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
