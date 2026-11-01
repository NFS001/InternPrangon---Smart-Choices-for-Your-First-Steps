import React from "react"

interface StudentAvatarProps {
  name: string
  size?: number
  className?: string
}

export function StudentAvatar({
  name,
  size = 44,
  className = "",
}: StudentAvatarProps) {
  const norm = (name || "").toLowerCase()

  // 1. Tahmina Akter (BUET) - Female engineer with purple/amber vibe
  if (norm.includes("tahmina")) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md ring-2 ring-indigo-200/60 overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="url(#tahminaGrad)" />
          <defs>
            <linearGradient id="tahminaGrad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
          {/* Hair & Hijab / Headwrap */}
          <path
            d="M12 20 C12 12 28 12 28 20 C28 26 12 26 12 20 Z"
            fill="#312E81"
          />
          {/* Face */}
          <circle cx="20" cy="18" r="7" fill="#FBBF24" />
          <ellipse cx="18" cy="18" rx="0.8" ry="1.2" fill="#1E1B4B" />
          <ellipse cx="22" cy="18" rx="0.8" ry="1.2" fill="#1E1B4B" />
          <path
            d="M19 21 Q20 22.5 21 21"
            stroke="#B45309"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Clothing */}
          <path d="M10 38 C10 28 30 28 30 38 Z" fill="#4338CA" />
        </svg>
      </div>
    )
  }

  // 2. Rakib Hasan (DU) - Male business student with glasses
  if (norm.includes("rakib")) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md ring-2 ring-emerald-200/60 overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="url(#rakibGrad)" />
          <defs>
            <linearGradient id="rakibGrad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          {/* Hair */}
          <path d="M13 16 C13 11 27 11 27 16 L27 18 L13 18 Z" fill="#0F172A" />
          {/* Face */}
          <circle cx="20" cy="18" r="6.5" fill="#FDE047" />
          {/* Glasses */}
          <rect
            x="15"
            y="16.5"
            width="4.5"
            height="3"
            rx="1"
            stroke="#0F172A"
            strokeWidth="1"
            fill="none"
          />
          <rect
            x="20.5"
            y="16.5"
            width="4.5"
            height="3"
            rx="1"
            stroke="#0F172A"
            strokeWidth="1"
            fill="none"
          />
          <line
            x1="19.5"
            y1="18"
            x2="20.5"
            y2="18"
            stroke="#0F172A"
            strokeWidth="1"
          />
          <path
            d="M19 21 Q20 22 21 21"
            stroke="#854D0E"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Shirt */}
          <path d="M11 38 C11 29 29 29 29 38 Z" fill="#065F46" />
          <path d="M17 38 L20 30 L23 38 Z" fill="#FFFFFF" />
        </svg>
      </div>
    )
  }

  // 3. Nusrat Jahan (NSU) - Modern tech student
  if (norm.includes("nusrat")) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-500 shadow-md ring-2 ring-orange-200/60 overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="url(#nusratGrad)" />
          <defs>
            <linearGradient id="nusratGrad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
          {/* Hair */}
          <circle cx="20" cy="18" r="8" fill="#18181B" />
          <path d="M12 20 C12 30 28 30 28 20 Z" fill="#18181B" />
          {/* Face */}
          <circle cx="20" cy="18" r="6" fill="#FED7AA" />
          <circle cx="18" cy="18" r="0.9" fill="#18181B" />
          <circle cx="22" cy="18" r="0.9" fill="#18181B" />
          <path
            d="M18.8 20.8 Q20 22 21.2 20.8"
            stroke="#EA580C"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Hoodie */}
          <path d="M11 38 C11 28 29 28 29 38 Z" fill="#EA580C" />
        </svg>
      </div>
    )
  }

  // Fallback Modern Avatar
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md ring-2 ring-indigo-200/60 text-white font-bold text-xs ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}
