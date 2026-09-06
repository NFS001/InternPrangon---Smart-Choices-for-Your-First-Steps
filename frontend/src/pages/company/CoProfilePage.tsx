import type { Navigate } from "../../data/index";
import { CURRENT_COMPANY, HR_INTERNSHIPS } from "../../data/index";

interface Props {
  navigate: Navigate;
}

const SAMPLE_REVIEWS = [
  {
    id: 1,
    stars: 5,
    quote:
      "An excellent place to start your career. The mentorship was outstanding and the work was genuinely meaningful.",
  },
  {
    id: 2,
    stars: 4,
    quote:
      "A well-structured internship program with clear goals. I shipped real features to production within my first two weeks.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(count)}
      {"☆".repeat(5 - count)}
    </span>
  );
}

export default function CoProfilePage({ navigate }: Props) {
  const company = CURRENT_COMPANY;
  const activeCount = HR_INTERNSHIPS.filter((i) => i.status === "active").length;

  const infoRows: { label: string; value: string }[] = [
    { label: "Industry", value: company.industry },
    { label: "Company size", value: company.size },
    { label: "Location", value: company.location },
    { label: "Website", value: company.website },
    { label: "Founded", value: company.founded },
  ];

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl text-neutral-900 leading-tight"
          style={{
            fontFamily: "Fraunces, serif",
            fontStyle: "italic",
            fontVariationSettings: "'opsz' 72, 'wght' 700",
          }}
        >
          Company Profile
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Public-facing information about {company.name}
        </p>
      </div>

      {/* Section 1: Company identity */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: company.logoBg, color: company.logoColor }}
          >
            {company.logo}
          </div>

          {/* Name + verification */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className="text-3xl text-neutral-900 leading-tight"
                style={{
                  fontFamily: "Fraunces, serif",
                  fontStyle: "italic",
                  fontVariationSettings: "'opsz' 72, 'wght' 700",
                }}
              >
                {company.name}
              </h2>
              {company.verificationStatus === "approved" && (
                <span className="inline-flex items-center gap-1 bg-success-50 text-success-700 text-xs font-medium px-2.5 py-1 rounded-full border border-success-100">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            {/* Info rows */}
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-baseline gap-2">
                  <span className="text-xs text-neutral-400 w-24 flex-shrink-0">
                    {row.label}
                  </span>
                  <span className="text-sm text-neutral-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: About */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
            About
          </h3>
          <button
            className="text-sm font-medium"
            style={{ color: "#7c3aed" }}
          >
            Edit description
          </button>
        </div>
        <p className="text-sm text-neutral-700 leading-relaxed">{company.description}</p>
      </div>

      {/* Section 3: Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Rating
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{company.rating}</span>
            <span className="text-amber-400 text-lg">★</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">{company.reviewCount} reviews</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Avg stipend
          </p>
          <p className="text-xl font-bold text-neutral-900">{company.avgStipend}</p>
          <p className="text-xs text-neutral-400 mt-1">Across active roles</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Active openings
          </p>
          <p className="text-2xl font-bold" style={{ color: "#7c3aed" }}>
            {activeCount}
          </p>
          <p className="text-xs text-neutral-400 mt-1">Live internship listings</p>
        </div>
      </div>

      {/* Section 4: Tags */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
            Tags
          </h3>
          <button
            className="text-sm font-medium"
            style={{ color: "#7c3aed" }}
          >
            Manage tags
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {company.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1 rounded-full border border-neutral-200 text-neutral-700 bg-neutral-50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Section 5: Public reviews teaser */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
            Public reviews
          </h3>
          <button
            className="text-sm font-medium"
            style={{ color: "#7c3aed" }}
          >
            View all reviews
          </button>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Your company has {company.reviewCount} reviews on InternPrangon
        </p>
        <div className="flex flex-col gap-3">
          {SAMPLE_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-neutral-50 rounded-lg p-4 border border-neutral-100"
            >
              <StarRating count={review.stars} />
              <p className="text-sm italic text-neutral-600 mt-1.5 leading-relaxed">
                "{review.quote}"
              </p>
              <p className="text-xs text-neutral-400 mt-2">— Anonymous intern</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
