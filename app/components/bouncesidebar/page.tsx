"use client";

import { useEffect, useRef, useState } from "react";
import { motion, stagger, type Variants } from "motion/react";
import { BounceSidebar } from "@/components/ui/bounce-sidebar";

const STEP = 0.04;
const getDelay = stagger(STEP, { startDelay: 0.05 });

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (order: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: getDelay(order, TOTAL), duration: 0.35, ease: "easeOut" },
  }),
};

const LOREM_A = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const LOREM_B = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const LOREM_C = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

const sections = [
  {
    title: "Introduction",
    blocks: [
      { text: LOREM_A },
      { heading: "Background", text: LOREM_B },
      { heading: "Etymology", text: LOREM_C },
    ],
  },
  {
    title: "History",
    blocks: [
      { text: LOREM_C },
      { heading: "Early period", text: LOREM_A },
      { heading: "Modern era", text: LOREM_B },
    ],
  },
  {
    title: "Overview",
    blocks: [
      { text: LOREM_B },
      { heading: "Principles", text: LOREM_C },
      { heading: "Structure", text: LOREM_A },
    ],
  },
  {
    title: "Architecture",
    blocks: [
      { text: LOREM_A },
      { heading: "Components", text: LOREM_B },
      { heading: "Data flow", text: LOREM_C },
    ],
  },
  {
    title: "References",
    blocks: [{ text: LOREM_C }, { heading: "Further reading", text: LOREM_A }],
  },
];

const TOTAL = 2 + sections.reduce((n, s) => n + 1 + s.blocks.length, 0);

export default function BounceSidebarPage() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const lockUntil = useRef(0);

  const goTo = (index: number) => {
    const container = scrollRef.current;
    const el = sectionRefs.current[index];
    if (!container || !el) return;
    setActive(index);
    lockUntil.current = Date.now() + 800;
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    container.scrollTo({ top: top - 8, behavior: "smooth" });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return;
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 4
      ) {
        setActive(sectionRefs.current.length - 1);
        return;
      }
      const containerTop = container.getBoundingClientRect().top;
      let current = 0;
      sectionRefs.current.forEach((el, index) => {
        if (el && el.getBoundingClientRect().top - containerTop <= 80)
          current = index;
      });
      setActive(current);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  let order = 0;

  return (
    <div className="flex h-full gap-10 overflow-hidden p-6">
      <aside className="w-52 shrink-0">
        <p className="mb-3 pl-2 mt-2 text-sm font-medium font-sans uppercase tracking-wide text-foreground">
          Contents
        </p>
        <BounceSidebar
          items={sections.map((s) => s.title)}
          value={active}
          onChange={goTo}
          dotColor="#FC4C01"
        />
      </aside>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <motion.article
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            custom={order++}
            className="text-5xl font-medium tracking-wider font-cal text-foreground"
          >
            Rare UI
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={order++}
            className="mt-2 text-lg text-foreground/40"
          >
            From Rare UI, the free component encyclopedia
          </motion.p>

          {sections.map((section, index) => (
            <section
              key={section.title}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className="mt-10"
            >
              <motion.h2
                variants={fadeUp}
                custom={order++}
                className="border-b pb-2 font-cal tracking-wide text-3xl font-medium text-foreground/90"
              >
                {section.title}
              </motion.h2>

              {section.blocks.map((block, blockIndex) => (
                <motion.div
                  key={blockIndex}
                  variants={fadeUp}
                  custom={order++}
                  className="mt-6"
                >
                  {"heading" in block && block.heading && (
                    <h3 className="text-lg font-cal tracking-wide font-normal text-foreground/80">
                      {block.heading}
                    </h3>
                  )}
                  <p className="mt-3 font-sans text-sm leading-6 text-foreground/40">
                    {block.text}
                  </p>
                </motion.div>
              ))}
            </section>
          ))}
        </motion.article>
      </div>
    </div>
  );
}
