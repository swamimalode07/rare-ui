export function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.656l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function MotionIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 100 100"
      className={className}
    >
      <path
        fill="currentColor"
        d="M37.796 31.248 18.018 68.753H0l15.445-29.284c2.394-4.542 8.366-8.221 13.343-8.221zm44.186 9.377c0-5.18 4.033-9.376 9.009-9.376 4.975 0 9.009 4.195 9.009 9.376S95.967 50 90.99 50c-4.975 0-9.008-4.194-9.008-9.375m-40.808-9.377h18.018L39.414 68.753H21.396zm21.28 0h18.018l-15.44 29.284c-2.394 4.542-8.371 8.22-13.347 8.22h-9.01z"
      />
    </svg>
  );
}
