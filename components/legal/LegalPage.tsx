import { Fragment } from "react";
import type { LegalSection } from "@/lib/legal";

const LINKABLE = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

const IS_LINK = /^(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)$/;

function linkify(text: string) {
  return text.split(LINKABLE).map((part, index) => {
    if (!IS_LINK.test(part)) return <Fragment key={index}>{part}</Fragment>;

    const trailing = part.endsWith(".") ? "." : "";
    const target = trailing ? part.slice(0, -1) : part;
    const href = target.includes("@") ? `mailto:${target}` : target;

    return (
      <Fragment key={index}>
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-out hover:decoration-foreground"
        >
          {target}
        </a>
        {trailing}
      </Fragment>
    );
  });
}

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-32 sm:px-6 md:pt-40">
      <header className="flex flex-col gap-3">
        <h1 className="font-runde text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="font-medium text-muted-foreground">{intro}</p>
        <p className="text-sm text-muted-foreground/70">
          Last updated {updated}
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-10">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="font-runde text-lg font-bold tracking-tight">
              {section.heading}
            </h2>

            {section.body?.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[15px] leading-relaxed text-muted-foreground"
              >
                {linkify(paragraph)}
              </p>
            ))}

            {section.list && (
              <ul className="flex flex-col gap-2.5 text-[15px] leading-relaxed text-muted-foreground">
                {section.list.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1 shrink-0 rounded-full bg-[#FC4C01]"
                    />
                    <span>{linkify(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
