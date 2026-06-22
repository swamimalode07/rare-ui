import FolderComponent from "@/components/ui/folder-component";

const REGISTRY = "swamimalode07/rare-ui";

export default function Home() {
  return (
    <div className="mx-auto h-screen flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16">
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

      <main className="items-center py-8">
        <FolderComponent color="blue" size="md" />
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
