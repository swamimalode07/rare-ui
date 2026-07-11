import GooeyNavbar from "@/components/GooeyNavbar";
import HeroCta from "@/components/HeroCta";

export default function Home() {
  return (
    <>
      <section className="relative w-full p-2.5">
        <div
          className="relative flex min-h-[calc(100svh-1rem)] w-full items-center justify-center overflow-hidden rounded-[45px]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <img
            src="/assets/landing/herobg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-white to-transparent dark:from-black" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-32 pt-24 text-center sm:gap-4 sm:px-6">
            <div>
              <GooeyNavbar />
            </div>
            <h1 className="max-w-4xl text-balance dark:text-white font-runde text-black text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Tasteful Components, Made to Stand Out.
            </h1>
            <p className="max-w-xl font-medium text-muted-foreground sm:text-lg">
              A collection of rare, animated components. Browse them in action
              below and install any component with shadcn CLI.
            </p>
            <HeroCta />
          </div>
        </div>
      </section>
      <DemoSection />
    </>
  );
}

function DemoSection() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-3 px-6 text-center">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Demo section
      </h2>
      <p className="max-w-xl text-balance text-muted-foreground">
        Scroll target so the navbar has room to collapse and expand.
      </p>
    </section>
  );
}
