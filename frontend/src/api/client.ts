const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "company" | "admin";
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiInternship {
  _id: string;
  companyId: string;
  title: string;
  description: string;
  type: "Paid" | "Unpaid";
  mode: "Remote" | "On-site";
  deadline: string;
  deadlineSoon?: boolean;
  company?: string;
  companyProfileId?: string;
  companyIndustry?: string;
  companyWebsite?: string;
  companyVerified?: boolean;
  daysLeft?: number;
  createdAt: string;
}

export interface SearchInternshipsResponse {
  message: string;
  resultsFound: number;
  totalResults: number;
  page: number;
  limit: number;
  totalPages: number;
  internships: ApiInternship[];
}

export interface ApiBookmarkItem {
  bookmarkId: string;
  internship: ApiInternship;
  deadlineSoon: boolean;
}

export interface ApiNotificationItem {
  _id: string;
  recipient: string;
  type: "CompanyVerification" | "ApplicationStatus";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiCompanyDirectoryItem {
  _id: string;
  companyName: string;
  industry?: string;
  description?: string;
  website?: string;
  verificationStatus: "Pending" | "Approved" | "Rejected";
  verificationDocument?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  averageRating: number;
  reviewCount: number;
  averageStipend: number;
  stipendReportCount: number;
  createdAt: string;
}

export interface ApiLeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badge: "Newbie" | "Explorer" | "Insider" | "Veteran" | "Elite" | string;
}

export interface ApiReviewItem {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiStipendItem {
  amount: number;
  datePosted: string;
}

export interface ApiInterviewExperienceItem {
  questions: string;
  datePosted: string;
}

export interface ApiFlagItem {
  _id: string;
  review: {
    _id: string;
    comment: string;
    rating: number;
  };
  reason: string;
  status: "Pending" | "Resolved";
  dateFlagged: string;
}

export interface ApiApplicationItem {
  applicationId: string;
  internship: string | ApiInternship;
  resume?: string | {
    id?: string;
    _id?: string;
    filePath: string;
    originalName?: string;
    uploadedDate: string;
  };
  status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected";
  appliedDate: string;
  student?: {
    _id: string;
    name: string;
    email: string;
  };
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("internprangon_token");
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "The request could not be completed.");
  }
  return body as T;
};

/* ---------------- AUTHENTICATION & USER ---------------- */
export const login = (email: string, password: string) =>
  request<AuthResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (
  name: string,
  email: string,
  password: string,
  role: "student" | "company",
  extra?: { industry?: string; university?: string; year?: string }
) =>
  request<AuthResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role, ...extra }),
  });

export const getCurrentUser = () =>
  request<{ user: ApiUser }>("/users/me");

export const saveAuth = (auth: AuthResponse) => {
  localStorage.setItem("internprangon_token", auth.token);
  localStorage.setItem("internprangon_user", JSON.stringify(auth.user));
};

export const clearAuth = () => {
  localStorage.removeItem("internprangon_token");
  localStorage.removeItem("internprangon_user");
};

export const getSavedUser = (): ApiUser | null => {
  const savedUser = localStorage.getItem("internprangon_user");
  return savedUser ? (JSON.parse(savedUser) as ApiUser) : null;
};

/* ---------------- INTERNSHIPS (Sprint 1 & 2 & 4) ---------------- */
export const searchInternships = (params: {
  keyword?: string;
  type?: "Paid" | "Unpaid";
  mode?: "Remote" | "On-site";
  page?: number;
  limit?: number;
  sortBy?: "deadline" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
} = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.type) query.set("type", params.type);
  if (params.mode) query.set("mode", params.mode);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  const qStr = query.toString();
  return request<SearchInternshipsResponse>(`/internship/search${qStr ? `?${qStr}` : ""}`);
};

export const getInternshipById = (id: string) =>
  request<{ message: string; internship: ApiInternship }>(`/internship/${id}`);

export const getClosingSoonInternships = () =>
  request<{ message: string; resultsFound: number; internships: ApiInternship[] }>("/internship/deadlines/soon");

export const postInternship = (data: {
  title: string;
  description: string;
  type: "Paid" | "Unpaid";
  mode: "Remote" | "On-site";
  deadline: string;
}) =>
  request<{ message: string; internship: ApiInternship }>("/internship/post", {
    method: "POST",
    body: JSON.stringify(data),
  });

export interface ApiCompanyInternship {
  _id: string;
  companyId: string;
  title: string;
  description: string;
  type: "Paid" | "Unpaid";
  mode: "Remote" | "On-site";
  deadline: string;
  status: "active" | "expired" | "draft";
  daysLeft: number;
  totalApplicants: number;
  shortlisted: number;
  interviewing: number;
  applied: number;
  rejected: number;
  createdAt: string;
}

export interface ApiCompanyApplicantItem {
  applicationId: string;
  status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected";
  appliedDate: string;
  internship: {
    id: string;
    title: string;
    type: "Paid" | "Unpaid";
    mode: "Remote" | "On-site";
    deadline: string;
  } | null;
  student: {
    id: string;
    name: string;
    email: string;
    bio: string;
    skills: string[];
    points: number;
    badge: string;
  } | null;
  resume: {
    id: string;
    filePath: string;
    uploadedDate: string;
  } | null;
  resumeAvailable: boolean;
}

export const getMyCompanyInternships = () =>
  request<{ message: string; count: number; internships: ApiCompanyInternship[] }>("/internship/company/my");

export const deleteCompanyInternship = (internshipId: string) =>
  request<{ message: string }>(`/internship/${internshipId}`, {
    method: "DELETE",
  });

/* ---------------- BOOKMARKS (Sprint 4: Feature 19) ---------------- */
export const getMyBookmarks = () =>
  request<{ message: string; bookmarks: ApiBookmarkItem[] }>("/bookmarks");

export const addBookmark = (internshipId: string) =>
  request<{ message: string; bookmarkId: string }>(`/bookmarks/${internshipId}`, {
    method: "POST",
  });

export const removeBookmark = (internshipId: string) =>
  request<{ message: string }>(`/bookmarks/${internshipId}`, {
    method: "DELETE",
  });

/* ---------------- RESUME & APPLICATIONS (Sprint 2: Features 7, 8, 9) ---------------- */
export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append("resume", file);
  return request<{ message: string; resume: { filePath: string; originalName?: string; uploadedDate: string } }>("/resume", {
    method: "POST",
    body: formData,
  });
};

export const getMyResume = () =>
  request<{ message: string; resume: { filePath: string; originalName?: string; uploadedDate: string } | null }>("/resume/me");

export const applyToInternship = (internshipId: string) =>
  request<{ message: string; application: ApiApplicationItem }>(`/applications/${internshipId}`, {
    method: "POST",
  });

export const getApplicantsForInternship = (internshipId: string) =>
  request<{ message: string; totalApplicants: number; applicants: ApiApplicationItem[] }>(
    `/applications/internship/${internshipId}`
  );

export const getAllCompanyApplicants = () =>
  request<{ message: string; totalApplicants: number; applicants: ApiCompanyApplicantItem[] }>(
    "/applications/company/all"
  );

export const updateApplicationStatus = (
  applicationId: string,
  status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected"
) =>
  request<{ message: string; application: Partial<ApiApplicationItem> }>(
    `/applications/${applicationId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );

export const getMyApplications = () =>
  request<{ message: string; totalApplications: number; applications: ApiApplicationItem[] }>("/applications/my-applications");


/* ---------------- COMPANIES & VERIFICATION (Sprint 1, 2, 3) ---------------- */
export const getCompanyDirectory = (params: {
  sortBy?: "rating" | "averageStipend";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
} = {}) => {
  const query = new URLSearchParams();
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qStr = query.toString();
  return request<{
    totalCompanies: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    companies: ApiCompanyDirectoryItem[];
  }>(`/company/directory${qStr ? `?${qStr}` : ""}`);
};

export interface ApiCompanyDetailItem {
  _id: string;
  companyName: string;
  industry: string;
  description: string;
  website: string;
  verificationStatus: "Pending" | "Approved" | "Rejected";
  averageRating: number;
  reviewCount: number;
  averageStipend: number;
  stipendReportCount: number;
  internshipsCount: number;
  internships: Array<{
    _id: string;
    title: string;
    type: "Paid" | "Unpaid";
    mode: "Remote" | "On-site";
    deadline: string;
  }>;
  reviews: Array<{
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export const getCompanyDetails = (companyId: string) =>
  request<{ message: string; company: ApiCompanyDetailItem }>(`/company/details/${encodeURIComponent(companyId)}`);

export const submitCompanyProfile = (data: {
  companyName: string;
  industry?: string;
  description?: string;
  website?: string;
  verificationDocument: string;
}) =>
  request<{ message: string; profile: unknown }>("/company/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getAllCompaniesAdmin = () =>
  request<{ message: string; companies: ApiCompanyDirectoryItem[] }>("/company/all");

export const verifyCompanyAdmin = (companyId: string, status: "Approved" | "Rejected") =>
  request<{ message: string; company: unknown }>(`/company/verify/${companyId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const deleteCompanyAdmin = (companyId: string) =>
  request<{ message: string }>(`/company/${companyId}`, {
    method: "DELETE",
  });

export const addCompanyAdmin = (data: {
  companyName: string;
  industry?: string;
  description?: string;
  website?: string;
  verificationStatus?: "Pending" | "Approved" | "Rejected";
  verificationDocument?: string;
}) =>
  request<{ message: string; company: unknown }>("/company/admin-add", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ---------------- REVIEWS, STIPENDS & INTERVIEWS (Sprint 2 & 3) ---------------- */
export const getCompanyReviews = (companyId: string) =>
  request<{
    companyId: string;
    averageRating: number;
    reviewCount: number;
    reviews: ApiReviewItem[];
  }>(`/reviews/company/${companyId}`);

export interface ApiGlobalReviewItem {
  id: string;
  company: string;
  companyId: string;
  industry?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiGlobalInterviewItem {
  id: string;
  company: string;
  companyId: string;
  industry?: string;
  questions: string;
  datePosted: string;
}

export const getAllReviews = () =>
  request<{ message: string; count: number; reviews: ApiGlobalReviewItem[] }>("/reviews");

export const getAllInterviewExperiences = () =>
  request<{ message: string; count: number; interviewExperiences: ApiGlobalInterviewItem[] }>("/interview-experiences");

export const submitCompanyReview = (companyId: string, rating: number, comment: string) =>
  request<{ message: string; review: ApiReviewItem }>(`/reviews/company/${companyId}`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });

export const getCompanyStipends = (companyId: string) =>
  request<{
    companyId: string;
    averageStipend: number;
    reportCount: number;
    reports: ApiStipendItem[];
  }>(`/stipends/company/${companyId}`);

export const submitCompanyStipend = (companyId: string, amount: number) =>
  request<{ message: string; stipendReport: ApiStipendItem }>(`/stipends/company/${companyId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

export const getCompanyInterviewExperiences = (companyId: string) =>
  request<{
    companyId: string;
    count: number;
    interviewExperiences: ApiInterviewExperienceItem[];
  }>(`/interview-experiences/company/${companyId}`);

export const submitInterviewExperience = (companyId: string, questions: string) =>
  request<{ message: string; interviewExperience: ApiInterviewExperienceItem }>(
    `/interview-experiences/company/${companyId}`,
    {
      method: "POST",
      body: JSON.stringify({ questions }),
    }
  );

/* ---------------- FLAGS / MODERATION (Sprint 3: Feature 14) ---------------- */
export const flagReview = (reviewId: string, reason: string) =>
  request<{ message: string; flag: unknown }>(`/flags/review/${reviewId}`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getFlagsAdmin = () =>
  request<{ flags: ApiFlagItem[] }>("/flags");

export const updateFlagStatusAdmin = (flagId: string, status: "Pending" | "Resolved") =>
  request<{ message: string; flag: ApiFlagItem }>(`/flags/${flagId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

/* ---------------- NOTIFICATIONS (Sprint 4: Feature 18) ---------------- */
export const getMyNotifications = () =>
  request<{ message: string; unreadCount: number; notifications: ApiNotificationItem[] }>("/notifications");

export const markNotificationAsRead = (notificationId: string) =>
  request<{ message: string; notification: ApiNotificationItem }>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

/* ---------------- STUDENT PROFILE & LEADERBOARD (Sprint 3 & 4) ---------------- */
export const getLeaderboard = (limit = 20) =>
  request<{ message: string; leaderboard: ApiLeaderboardEntry[] }>(`/student/leaderboard?limit=${limit}`);

export const getStudentProfile = () =>
  request<{
    message: string;
    user: ApiUser;
    profile: {
      bio: string;
      skills: string[];
      points: number;
      badge: string;
    };
  }>("/student/profile");

export const updateStudentProfile = (data: { bio?: string; skills?: string[] }) =>
  request<{ message: string; profile: unknown }>("/student/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMyCompanyProfile = () =>
  request<{
    message: string;
    user: ApiUser;
    profile: {
      _id: string;
      companyName: string;
      industry?: string;
      description?: string;
      website?: string;
      verificationDocument?: string;
      verificationStatus: "Pending" | "Approved" | "Rejected";
    } | null;
  }>("/company/profile");
