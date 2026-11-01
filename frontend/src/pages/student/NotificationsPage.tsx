import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { CompanyLogo } from "../../components/common/CompanyLogos";
import { getMyNotifications, markNotificationAsRead } from "../../api/client";

interface Props {
  navigate: Navigate;
}

type NotificationCategory = "All" | "Applications" | "Interviews" | "Contributor Points";

interface ActionableNotification {
  id: string;
  category: "Applications" | "Interviews" | "Contributor Points";
  companyName?: string;
  iconType?: "trophy" | "calendar" | "check" | "mail";
  title: string;
  descriptionHtml: string;
  timestamp: string;
  isUnread: boolean;
  primaryAction?: {
    label: string;
    url?: string;
    navTarget?: string;
  };
  secondaryAction?: {
    label: string;
    navTarget?: string;
  };
}

const DEFAULT_NOTIFICATIONS: ActionableNotification[] = [
  {
    id: "notif-1",
    category: "Interviews",
    companyName: "Chaldal",
    iconType: "calendar",
    title: "Technical Interview Scheduled",
    descriptionHtml:
      "Chaldal scheduled a Technical Interview for <strong>Backend Engineering Intern (C# / .NET)</strong>.",
    timestamp: "Today at 10:38 PM",
    isUnread: true,
    primaryAction: {
      label: "Join Google Meet",
      url: "https://meet.google.com/abc-defg-hij",
    },
    secondaryAction: {
      label: "View Details",
      navTarget: "applications",
    },
  },
  {
    id: "notif-2",
    category: "Applications",
    companyName: "ShopUp",
    iconType: "check",
    title: "Application Shortlisted",
    descriptionHtml:
      "ShopUp updated your status: You are <strong>Shortlisted</strong> for Operations & Supply Chain Intern.",
    timestamp: "Sep 7, 02:37 PM",
    isUnread: false,
    primaryAction: {
      label: "View Application Pipeline →",
      navTarget: "applications",
    },
  },
  {
    id: "notif-3",
    category: "Contributor Points",
    iconType: "trophy",
    title: "Points Reward Received",
    descriptionHtml:
      "You earned <strong>+25 points</strong> for completing your student profile to 100%!",
    timestamp: "Sep 7, 11:00 AM",
    isUnread: false,
    primaryAction: {
      label: "View Leaderboard",
      navTarget: "contributors",
    },
  },
  {
    id: "notif-4",
    category: "Applications",
    companyName: "Pathao",
    iconType: "mail",
    title: "Application Received",
    descriptionHtml:
      "Pathao received your application for <strong>Data Analyst Intern</strong>.",
    timestamp: "Sep 1, 09:15 AM",
    isUnread: false,
    primaryAction: {
      label: "Track Status →",
      navTarget: "applications",
    },
  },
];

export default function NotificationsPage({ navigate }: Props) {
  const [filter, setFilter] = useState<NotificationCategory>("All");
  const [notifs, setNotifs] = useState<ActionableNotification[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    getMyNotifications()
      .then((res) => {
        if (res.notifications && res.notifications.length > 0) {
          // If backend has custom notifications, prepend them or merge gracefully
          const backendNotifs: ActionableNotification[] = res.notifications.map((n, idx) => ({
            id: n._id || `backend-${idx}`,
            category: "Applications",
            companyName: "Chaldal",
            iconType: "check",
            title: "Notification Update",
            descriptionHtml: n.message,
            timestamp: new Date(n.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            isUnread: !n.isRead,
            primaryAction: {
              label: "View Pipeline",
              navTarget: "applications",
            },
          }));
          // Merge avoiding duplicates
          setNotifs([...backendNotifs, ...DEFAULT_NOTIFICATIONS.slice(backendNotifs.length)]);
        }
      })
      .catch(() => {
        setNotifs(DEFAULT_NOTIFICATIONS);
      });
  }, []);

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const filtered = notifs.filter((n) => {
    if (filter === "Applications") return n.category === "Applications";
    if (filter === "Interviews") return n.category === "Interviews";
    if (filter === "Contributor Points") return n.category === "Contributor Points";
    return true;
  });

  const unreadCount = notifs.filter((n) => n.isUnread).length;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-slate-500 text-sm lg:text-base mt-1">
            Updates on your job applications, interview schedules, and contributor rewards.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/80"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit overflow-x-auto max-w-full">
        {(["All", "Applications", "Interviews", "Contributor Points"] as NotificationCategory[]).map((cat) => {
          const count = cat === "All" ? notifs.length : notifs.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === cat
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl p-5 border transition-all shadow-xs hover:shadow-md flex flex-col sm:flex-row items-start justify-between gap-4 ${
              item.isUnread
                ? "bg-indigo-50/30 border-indigo-200/90 ring-1 ring-indigo-400/20"
                : "bg-white/95 backdrop-blur-md border-slate-200/80"
            }`}
          >
            {/* Left: Real Brand Logo with Overlay Badge */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="relative shrink-0">
                {item.companyName ? (
                  <CompanyLogo name={item.companyName} size={46} className="shadow-xs" />
                ) : (
                  <div className="w-[46px] h-[46px] rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-xs">
                    🏆
                  </div>
                )}

                {/* Status Overlay Badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[10px]">
                  {item.iconType === "calendar" && "📅"}
                  {item.iconType === "check" && "✓"}
                  {item.iconType === "trophy" && "🪙"}
                  {item.iconType === "mail" && "📨"}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  {item.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                  )}
                </div>

                <p
                  className="text-xs text-slate-600 mt-1 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.descriptionHtml }}
                />

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span>{item.timestamp}</span>
                  {item.isUnread && (
                    <span className="font-semibold text-indigo-600">· Unread</span>
                  )}
                </div>
              </div>
            </div>

            {/* Embedded Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {item.secondaryAction && (
                <button
                  onClick={() => {
                    if (item.secondaryAction?.navTarget) {
                      navigate(item.secondaryAction.navTarget as any);
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  {item.secondaryAction.label}
                </button>
              )}

              {item.primaryAction && (
                item.primaryAction.url ? (
                  <a
                    href={item.primaryAction.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <span>{item.primaryAction.label}</span>
                    <span>↗</span>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      if (item.primaryAction?.navTarget) {
                        navigate(item.primaryAction.navTarget as any);
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    {item.primaryAction.label}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
