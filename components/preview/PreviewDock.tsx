"use client";

import { motion } from "motion/react";
import { Squircle } from "@squircle-js/react";

const SQUIRCLE = { cornerRadius: 16, cornerSmoothing: 1 } as const;

type PreviewDockProps = {
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
  constraintsRef?: React.RefObject<HTMLElement | null>;
};

export default function PreviewDock({
  children,
  className = "",
  draggable = false,
  constraintsRef,
}: PreviewDockProps) {
  if (draggable) {
    return (
      <Squircle asChild {...SQUIRCLE}>
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0}
          whileDrag={{ scale: 1.03 }}
          className={`border-apple flex items-center gap-2.5 ${className}`}
        >
          {children}
        </motion.div>
      </Squircle>
    );
  }

  return (
    <Squircle
      {...SQUIRCLE}
      className={`border-apple flex items-center gap-2.5 ${className}`}
    >
      {children}
    </Squircle>
  );
}
