<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project conventions

Read `CONVENTIONS.md` before writing or editing any component, documentation, description, or comment. Follow it exactly.

# Comments

Default to no comment. Write one only where the code cannot say it itself: a decision whose obvious refactor reintroduces a bug, or a non-obvious constraint.

- One line, lowercase. Never a multi-line block.
- Never restate what the next line does. If the code reads fine, delete the comment.
- No JSDoc, no section banners, no `// handle X` above a function called `handleX`.
