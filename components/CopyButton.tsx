"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const CopyGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckGlyph = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.002 0C10.7601 0.000146659 11.4317 0.362748 11.8594 0.921875C12.4708 0.578706 13.228 0.510629 13.9229 0.806641C14.5754 1.08475 15.0349 1.62513 15.2344 2.25195C15.8931 2.20043 16.5695 2.42596 17.0732 2.92969C17.6095 3.46597 17.8284 4.19755 17.7354 4.89551C18.4113 5.08482 18.9952 5.57393 19.2773 6.27539C19.5422 6.93402 19.4847 7.64105 19.1816 8.22559C19.6819 8.65487 20 9.29027 20 10.001C20 10.7592 19.6373 11.4307 19.0781 11.8584C19.4253 12.4713 19.4956 13.2318 19.1982 13.9297C18.9191 14.5845 18.3759 15.0449 17.7461 15.2432C17.795 15.8991 17.5709 16.5717 17.0693 17.0732C16.5346 17.608 15.8055 17.8273 15.1094 17.7363C14.9212 18.4146 14.4329 19.0012 13.7295 19.2842C13.0676 19.5504 12.3567 19.4914 11.7705 19.1846C11.3412 19.6831 10.7064 20 9.99707 20C9.2427 19.9999 8.57349 19.6413 8.14551 19.0869C7.53299 19.4328 6.77315 19.5021 6.07617 19.2051C5.41915 18.9249 4.95678 18.3796 4.75977 17.7471C4.10287 17.7968 3.42904 17.5726 2.92676 17.0703C2.393 16.5366 2.17302 15.8092 2.2627 15.1143C1.58766 14.9245 1.00356 14.438 0.72168 13.7373C0.455483 13.0754 0.514265 12.3636 0.821289 11.7773C0.319258 11.348 4.96556e-06 10.7112 0 9.99902C0 9.24362 0.359426 8.57349 0.915039 8.14551C0.572299 7.53419 0.50482 6.7775 0.800781 6.08301C1.08 5.42798 1.62296 4.96675 2.25293 4.76855C2.20042 4.1089 2.42518 3.4313 2.92969 2.92676C3.46493 2.39155 4.19485 2.17205 4.8916 2.26367C5.08233 1.59062 5.57041 1.00976 6.26953 0.728516C6.92803 0.463712 7.63526 0.520432 8.21973 0.823242C8.64908 0.319614 9.28839 0 10.002 0Z"
      fill="#FF5100"
    />
    <path
      d="M6 10.4225L8.33333 12.8182L14 7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type CopyButtonProps = Omit<ComponentProps<"button">, "value"> & {
  value: string;
  label?: string;
  idleIcon?: ReactNode;
  iconClassName?: string;
  children?: ReactNode;
};


export default function CopyButton({
  value,
  label = "Copy",
  idleIcon,
  iconClassName = "size-3.5",
  className,
  children,
  title,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const layer =
    "col-start-1 row-start-1 block h-full w-full [&>svg]:h-full [&>svg]:w-full";

  return (
    <button
      {...props}
      type="button"
      onClick={copy}
      data-slot="copy-button"
      data-copied={copied}
      aria-label={copied ? "Copied" : label}
      title={title === undefined ? label : title || undefined}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground/60 transition-colors hover:text-white",
        children ? "h-7 gap-1.5 px-2" : "size-7",
        className,
      )}
    >
      <span className={cn("grid shrink-0 place-items-center", iconClassName)}>
        <motion.span
          className={layer}
          initial={false}
          animate={{
            opacity: copied ? 0 : 1,
            filter: copied ? "blur(3px)" : "blur(0px)",
          }}
          transition={{ duration: 0.14, ease: "easeIn" }}
        >
          {idleIcon ?? <CopyGlyph />}
        </motion.span>

        <motion.span
          className={cn(layer, "scale-[1.35]")}
          initial={false}
          animate={{
            opacity: copied ? 1 : 0,
            filter: copied ? "blur(0px)" : "blur(3px)",
          }}
          transition={{
            duration: 0.16,
            ease: "easeOut",
            delay: copied ? 0.07 : 0,
          }}
        >
          <CheckGlyph />
        </motion.span>
      </span>
      {children}
    </button>
  );
}
