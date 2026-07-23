"use client";

import { useState } from "react";
import OtpInput, { type OtpStatus } from "@/components/ui/otp-input";

const CORRECT_CODE = "123456";

export default function OtpInputPage() {
  const [status, setStatus] = useState<OtpStatus>("idle");

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6">
      <OtpInput
        length={6}
        status={status}
        size="md"
        onChange={() => setStatus("idle")}
        onComplete={(code) =>
          setStatus(code === CORRECT_CODE ? "success" : "error")
        }
      />
      <p className="text-sm text-foreground/50">
        Enter {CORRECT_CODE} to pass. Any other code fails.
      </p>
    </div>
  );
}
