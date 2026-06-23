"use client";

import { useState } from "react";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect
      x="9"
      y="9"
      width="11"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M5 15V5a2 2 0 0 1 2-2h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy install command"
      className="shrink-0 cursor-pointer rounded-md p-1.5 text-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

export default CopyButton;
