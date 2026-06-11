import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const REGISTRY = "swamimalode07/rare-ui";

function ComponentTile({
  name,
  description,
  slug,
  className,
  children,
}: {
  name: string;
  description: string;
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-foreground/20 ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col gap-1 border-b px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight">{name}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-center gap-4 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:16px_16px] p-8">
        {children}
      </div>

      <div className="border-t bg-muted/40 px-6 py-3">
        <code className="font-mono text-xs text-muted-foreground">
          <span className="text-foreground/40 select-none">$ </span>
          npx shadcn@latest add {REGISTRY}/{slug}
        </code>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          shadcn registry
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Rare UI
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          A collection of rare, animated components. Browse them in action below
          and install any item straight from GitHub with the shadcn CLI.
        </p>
      </header>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ComponentTile
          name="Button"
          description="A button with variants, sizes and asChild composition."
          slug="button"
          className="md:col-span-2"
        >
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </ComponentTile>

        <ComponentTile
          name="Shimmer Button"
          description="A pill button with a looping shimmer highlight."
          slug="shimmer-button"
        >
          <ShimmerButton>Get Started</ShimmerButton>
          <ShimmerButton shimmerDuration="1.2s">Fast Shimmer</ShimmerButton>
        </ComponentTile>

        <ComponentTile
          name="Card"
          description="A card with header, content and footer sections."
          slug="card"
        >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>
                A short description of the card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Cards group related content and actions together.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
        </ComponentTile>

        <ComponentTile
          name="Spotlight Card"
          description="A card with a mouse-tracking spotlight glow. Move your cursor over it."
          slug="spotlight-card"
          className="md:col-span-2"
        >
          <SpotlightCard className="w-full max-w-md p-6">
            <h3 className="font-semibold">Spotlight</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Hover anywhere on this card and a soft glow follows your cursor.
            </p>
          </SpotlightCard>
        </ComponentTile>
      </main>

      <footer className="mt-4 border-t pt-6 text-center text-sm text-muted-foreground">
        Built with the{" "}
        <a
          href="https://ui.shadcn.com"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          shadcn CLI
        </a>
        . Install everything with{" "}
        <code className="font-mono text-xs">
          npx shadcn@latest add {REGISTRY}/[component]
        </code>
        .
      </footer>
    </div>
  );  
}
