export interface AdminActivityItem {
  id: string | number;
  type:
    | 'verification_approved'
    | 'verification_rejected'
    | 'review_deleted'
    | 'review_dismissed'
    | 'company_registered'
    | 'internship_posted';
  description: string;
  target?: string;
  adminName?: string;
  timestamp: string;
  timeAgo: string;
}

const STORAGE_KEY = 'internprangon_admin_activity';

export const getStoredActivities = (): AdminActivityItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const logAdminActivity = (item: {
  type: AdminActivityItem['type'];
  description: string;
  target?: string;
  adminName?: string;
}) => {
  try {
    const existing = getStoredActivities();
    const newItem: AdminActivityItem = {
      id: Date.now() + Math.random(),
      type: item.type,
      description: item.description,
      target: item.target,
      adminName: item.adminName || 'Admin',
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
    };
    const updated = [newItem, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('internprangon_activity_updated'));
  } catch {}
};
