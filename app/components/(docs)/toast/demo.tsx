"use client";

import { Toaster, toast } from "@/components/ui/toast";

const BUTTON =
  "h-9 cursor-pointer rounded-full bg-[#F4F4F9] px-4 text-[13px] font-semibold text-black transition-[transform,background-color] hover:bg-[#EDEDF3] active:scale-95 motion-reduce:transition-none dark:bg-[#262626] dark:text-white dark:hover:bg-[#2C2C2C]";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMOS = [
  {
    label: "Success",
    run: () =>
      toast.success("Changes saved", {
        description: "Your profile is up to date.",
      }),
  },
  {
    label: "Error",
    run: () =>
      toast.error("Upload failed", {
        description: "The file is over 10 MB.",
        action: {
          label: "Retry",
          onClick: () => toast.success("Uploaded"),
        },
      }),
  },
  {
    label: "Warning",
    run: () =>
      toast.warning("Storage almost full", {
        description: "You have used 92% of your 5 GB.",
      }),
  },
  {
    label: "Info",
    run: () =>
      toast.info("Update ready", {
        description: "Version 2.4 installs on restart.",
      }),
  },
  {
    label: "Promise",
    run: () =>
      toast.promise(wait(2000), {
        loading: "Publishing your post",
        success: "Post published",
        error: "Couldn't publish",
      }),
  },
  {
    label: "Undo",
    run: () =>
      toast("Message archived", {
        action: {
          label: "Undo",
          onClick: () => toast("Message restored"),
        },
      }),
  },
];

export default function ToastPage() {
  return (
    <div className="relative flex h-full items-center justify-center px-6 font-runde">
      <div className="flex max-w-sm flex-wrap justify-center gap-2">
        {DEMOS.map((demo) => (
          <button
            key={demo.label}
            type="button"
            onClick={demo.run}
            className={BUTTON}
          >
            {demo.label}
          </button>
        ))}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
