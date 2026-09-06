import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { getMyNotifications, markNotificationAsRead } from "../../api/client";

interface Props {
  navigate: Navigate;
}

type PageState = "loading" | "loaded" | "error";

interface Notification {
  id: string;
  text: string;
  time: string;
  dotColor: string;
  read: boolean;
}

export default function NotificationsPage({ navigate: _navigate }: Props) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = () => {
    setPageState("loading");
    getMyNotifications()
      .then((res) => {
        const mapped: Notification[] = (res.notifications || []).map((n) => ({
          id: n._id,
          text: n.message,
          time: new Date(n.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          dotColor: n.isRead
            ? "bg-neutral-300"
            : n.type === "CompanyVerification"
            ? "bg-brand-500"
            : "bg-blue-500",
          read: n.isRead,
        }));
        setNotifications(mapped);
        setPageState("loaded");
      })
      .catch(() => {
        setNotifications([]);
        setPageState("loaded");
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkOneRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, dotColor: "bg-neutral-300" } : n))
    );
    try {
      await markNotificationAsRead(id);
    } catch {
      // Revert if error
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, dotColor: "bg-neutral-300" }))
    );
    for (const item of unread) {
      await markNotificationAsRead(item.id).catch(() => {});
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl text-brand-700"
            style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
          >
            Notifications
          </h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All notifications read"}
          </p>
        </div>

        {pageState === "loaded" && unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 font-semibold rounded-lg hover:bg-brand-100 transition-colors border border-brand-200"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Loading state */}
      {pageState === "loading" && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-neutral-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {pageState === "error" && (
        <div className="bg-danger-50 border border-danger-200 rounded-2xl p-6 text-center">
          <p className="text-danger-600 font-medium mb-3">Failed to load notifications. Try again.</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-danger-600 text-white text-sm font-medium rounded-lg hover:bg-danger-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loaded state */}
      {pageState === "loaded" && (
        <>
          {/* Empty state */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-neutral-200 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-neutral-600 font-semibold text-base">{"You're all caught up!"}</p>
              <p className="text-neutral-400 text-sm mt-1">No new notifications right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white border rounded-2xl p-4 lg:p-5 transition-all flex items-start justify-between gap-3 ${
                    n.read
                      ? "border-neutral-200 opacity-75"
                      : "border-brand-200 shadow-sm hover:shadow-md bg-brand-50/10"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${n.dotColor} mt-1.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${n.read ? "text-neutral-600" : "font-semibold text-neutral-900"}`}>
                        {n.text}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">{n.time}</p>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkOneRead(n.id)}
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold hover:underline shrink-0 pt-0.5"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
