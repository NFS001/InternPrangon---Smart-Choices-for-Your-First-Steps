import React from "react"

interface CompanyLogoProps {
  name: string
  size?: number
  className?: string
}

export function CompanyLogo({
  name,
  size = 44,
  className = "",
}: CompanyLogoProps) {
  const norm = (name || "").toLowerCase()

  // 1. Brain Station 23
  if (norm.includes("brain station") || norm.includes("bs23")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#0f172a] shadow-sm overflow-hidden shrink-0 border border-slate-700/40 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 36 36"
          fill="none"
        >
          <rect x="6" y="6" width="10" height="10" rx="3" fill="#38BDF8" />
          <rect x="20" y="6" width="10" height="10" rx="3" fill="#818CF8" />
          <rect x="6" y="20" width="10" height="10" rx="3" fill="#6366F1" />
          <rect x="20" y="20" width="10" height="10" rx="3" fill="#F97316" />
          <circle cx="18" cy="18" r="3.5" fill="#FFFFFF" />
          <line
            x1="11"
            y1="11"
            x2="25"
            y2="25"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <line
            x1="25"
            y1="11"
            x2="11"
            y2="25"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    )
  }

  // 2. Chaldal
  if (norm.includes("chaldal")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#16A34A] shadow-sm overflow-hidden shrink-0 border border-emerald-500/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path d="M10 13 H26 L24 28 H12 L10 13 Z" fill="#FACC15" />
          <path
            d="M14 13 V9 C14 6.79 15.79 5 18 5 C20.21 5 22 6.79 22 9 V13"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="20" r="3" fill="#15803D" />
          <path
            d="M16 26 Q18 29 20 26"
            stroke="#15803D"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  // 3. Square
  if (norm.includes("square")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#0284C7] shadow-sm overflow-hidden shrink-0 border border-sky-400/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <rect x="6" y="6" width="24" height="24" rx="5" fill="#FFFFFF" />
          <rect x="12" y="12" width="12" height="12" rx="2" fill="#0284C7" />
          <rect x="15" y="15" width="6" height="6" rx="1" fill="#F97316" />
        </svg>
      </div>
    )
  }

  // 4. Pathao
  if (norm.includes("pathao")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#DC2626] shadow-sm overflow-hidden shrink-0 border border-rose-500/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path d="M8 26 L18 10 L28 26 L22 23 L18 18 L14 23 Z" fill="#FFFFFF" />
          <circle cx="18" cy="10" r="2.5" fill="#FEF08A" />
        </svg>
      </div>
    )
  }

  // 5. bKash
  if (norm.includes("bkash")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#E11D48] shadow-sm overflow-hidden shrink-0 border border-pink-500/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path
            d="M7 19 L19 7 L29 17 L21 21 L27 29 L16 23 L10 27 Z"
            fill="#FFFFFF"
            fillRule="evenodd"
          />
        </svg>
      </div>
    )
  }

  // 6. Optimizely
  if (norm.includes("optimizely")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#1E1B4B] shadow-sm overflow-hidden shrink-0 border border-indigo-700/40 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <circle cx="18" cy="18" r="12" stroke="#6366F1" strokeWidth="3" />
          <path
            d="M18 6 A12 12 0 0 1 30 18"
            stroke="#F97316"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="18" r="4" fill="#38BDF8" />
        </svg>
      </div>
    )
  }

  // 7. ShopUp
  if (norm.includes("shopup")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#7C3AED] shadow-sm overflow-hidden shrink-0 border border-violet-400/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path
            d="M8 24 L14 10 L20 20 L26 8 L30 26 H8 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          <circle cx="26" cy="8" r="2.5" fill="#FACC15" />
        </svg>
      </div>
    )
  }

  // 8. 10 Minute School
  if (norm.includes("10 minute") || norm.includes("10ms")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#059669] shadow-sm overflow-hidden shrink-0 border border-emerald-400/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path d="M8 26 L18 6 L28 26 L18 21 Z" fill="#FEF08A" />
          <circle cx="18" cy="16" r="3" fill="#065F46" />
        </svg>
      </div>
    )
  }

  // 9. BioPharma
  if (norm.includes("biopharma")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#0D9488] shadow-sm overflow-hidden shrink-0 border border-teal-400/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <circle
            cx="18"
            cy="18"
            r="11"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <path
            d="M18 10 V26 M10 18 H26"
            stroke="#FEF08A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="18" r="3.5" fill="#FFFFFF" />
        </svg>
      </div>
    )
  }

  // 10. Uber
  if (norm.includes("uber")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#000000] shadow-sm overflow-hidden shrink-0 border border-slate-800 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path
            d="M11 10 V20 C11 23.866 14.134 27 18 27 C21.866 27 25 23.866 25 20 V10"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="18" cy="18" r="2.5" fill="#38BDF8" />
        </svg>
      </div>
    )
  }

  // 11. Rokomari
  if (norm.includes("rokomari")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#EA580C] shadow-sm overflow-hidden shrink-0 border border-orange-400/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <path
            d="M6 14 C12 12 18 14 18 24 C18 14 24 12 30 14 V26 C24 24 18 26 18 26 C18 26 12 24 6 26 Z"
            fill="#FFFFFF"
          />
          <circle cx="18" cy="11" r="2.5" fill="#FEF08A" />
        </svg>
      </div>
    )
  }

  // 12. FinTech Hub
  if (norm.includes("fintech") || norm.includes("finance")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#4338CA] shadow-sm overflow-hidden shrink-0 border border-indigo-400/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <polygon
            points="18,6 30,12 30,22 18,29 6,22 6,12"
            stroke="#38BDF8"
            strokeWidth="2.5"
            fill="none"
          />
          <circle cx="18" cy="17" r="4" fill="#FACC15" />
        </svg>
      </div>
    )
  }

  // 13. Daraz
  if (norm.includes("daraz")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#F97316] shadow-sm overflow-hidden shrink-0 border border-orange-300/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 36 36"
          fill="none"
        >
          <polygon
            points="18,6 30,13 30,25 18,32 6,25 6,13"
            fill="#EA580C"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <path
            d="M12 16 L18 20 L24 16"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  // Default Verified Enterprise Tech Emblem
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-900 to-indigo-700 shadow-sm overflow-hidden shrink-0 text-white font-bold border border-indigo-500/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  )
}
