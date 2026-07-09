"use client";

import { useRef } from "react";

import ScrollProgress from "@/components/ui/scroll-progress";

type DocItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

type DocGroup = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: DocItem[];
};

const docs: DocGroup[] = [
  {
    id: "overview",
    eyebrow: "Introduction",
    title: "Scroll Progress",
    description:
      "A thin indicator that reports how far the reader has moved through a page or a scroll container. It sits quietly at the edge of the viewport and fills as the content advances.",
    items: [
      {
        id: "overview-purpose",
        eyebrow: "Why it exists",
        title: "A sense of position on long pages",
        description:
          "Long articles hide their own length. A progress bar gives readers a continuous cue for how much remains, without adding another block of chrome to the layout.",
      },
      {
        id: "overview-signal",
        eyebrow: "The signal",
        title: "One value, mapped to width",
        description:
          "The component tracks a single scalar between zero and one and maps it to the fill. Everything else — color, thickness, placement — is presentation on top of that value.",
      },
      {
        id: "overview-placement",
        eyebrow: "Placement",
        title: "Pinned to the top by default",
        description:
          "The indicator is fixed to the top edge so it stays visible while the content scrolls beneath it. It can also be attached to the bottom or to a specific container.",
      },
    ],
  },
  {
    id: "behavior",
    eyebrow: "Interaction",
    title: "Behavior",
    description:
      "The bar follows scroll position directly. It should feel like a physical readout of the page rather than an animation that plays on its own.",
    items: [
      {
        id: "behavior-track",
        eyebrow: "Tracking",
        title: "Progress is derived, not stored",
        description:
          "Scroll offset divided by the total scrollable distance gives the progress value. Because it is derived on every frame, it stays correct through resizes and content changes.",
      },
      {
        id: "behavior-smoothing",
        eyebrow: "Smoothing",
        title: "A spring keeps the fill from stuttering",
        description:
          "Raw scroll values can arrive in jumps. Passing the value through a spring smooths the fill so it glides toward the target instead of snapping between frames.",
      },
      {
        id: "behavior-transform",
        eyebrow: "Performance",
        title: "Animate transform, never layout",
        description:
          "The fill is driven by scaleX with a left transform origin. Scaling avoids layout work on every scroll event and keeps the indicator smooth on long documents.",
      },
    ],
  },
  {
    id: "styling",
    eyebrow: "Visual System",
    title: "Styling",
    description:
      "The default look is deliberately minimal: a few pixels tall, full width, and tied to the foreground color so it reads clearly in both themes.",
    items: [
      {
        id: "styling-height",
        eyebrow: "Thickness",
        title: "Keep it thin",
        description:
          "Two to four pixels is enough to register in peripheral vision. A heavier bar competes with the content and starts to feel like a loading state rather than a position cue.",
      },
      {
        id: "styling-color",
        eyebrow: "Contrast",
        title: "Lean on the foreground token",
        description:
          "Using the foreground color keeps the bar legible without a hardcoded value, so it inverts correctly when the theme flips between light and dark.",
      },
      {
        id: "styling-origin",
        eyebrow: "Direction",
        title: "Fill from the leading edge",
        description:
          "A left transform origin makes the bar grow in the reading direction. For right-to-left layouts the origin flips so the motion still matches the flow of text.",
      },
    ],
  },
  {
    id: "usage",
    eyebrow: "Implementation",
    title: "Usage",
    description:
      "Drop the component near the top of a scrollable layout and it works with no configuration. Everything past that is optional refinement.",
    items: [
      {
        id: "usage-mount",
        eyebrow: "Mounting",
        title: "One instance per scroll surface",
        description:
          "Render a single indicator for the page. If you have an independent inner scroll area, give that region its own instance pointed at the container.",
      },
      {
        id: "usage-classname",
        eyebrow: "Layout",
        title: "Use className for placement and color",
        description:
          "The component owns the tracking logic; the surrounding page controls where the bar sits and how it is themed through a className.",
      },
      {
        id: "usage-reduced-motion",
        eyebrow: "Accessibility",
        title: "Respect reduced motion",
        description:
          "The progress bar is decorative, so it should not be the only indicator of position. When reduced motion is requested, drop the spring and track scroll directly.",
      },
    ],
  },
];

const progressSections = docs.map((group) => ({
  id: group.id,
  label: group.title,
}));

export default function Page() {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-foreground">
      <ScrollProgress containerRef={scrollRef} sections={progressSections} />

      <main
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto px-8 py-20 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:px-14"
      >
        <article className="mx-auto max-w-2xl">
          {docs.map((group, groupIndex) => (
            <section
              key={group.id}
              id={group.id}
              className="mt-10 scroll-mt-12 first:mt-0"
            >
              <p className="mb-2 text-sm text-foreground/40">{group.eyebrow}</p>
              {groupIndex === 0 ? (
                <h1 className="font-cal text-5xl font-medium tracking-wider text-foreground">
                  {group.title}
                </h1>
              ) : (
                <h2 className="border-b pb-2 font-cal text-3xl font-medium tracking-wide text-foreground/90">
                  {group.title}
                </h2>
              )}
              <p className="mt-2 text-lg text-foreground/40">
                {group.description}
              </p>

              <div className="mt-6 space-y-6">
                {group.items.map((item) => (
                  <section
                    key={item.id}
                    id={item.id}
                    className="scroll-mt-12"
                  >
                    <p className="mb-1 text-sm text-foreground/40">
                      {item.eyebrow}
                    </p>
                    <h3 className="font-cal text-xl font-medium text-foreground/90">
                      {item.title}
                    </h3>
                    <p className="mt-1 font-sans text-sm leading-6 text-foreground/40">
                      {item.description}
                    </p>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
