## Objective
Build production-style portfolio projects with clean architecture, strong TypeScript hygiene, clear documentation, and recruiter-friendly presentation quality.

## Engineering standards
- Use Next.js App Router and TypeScript.
- Prefer server actions / route handlers where appropriate.
- Keep code modular and easy to review.
- No dead code, placeholder comments, or fake implementations unless explicitly marked.
- Every feature must be actually wired end-to-end.
- Validate inputs with Zod.
- Use Prisma for database access.
- Use SQLite by default for local development, but keep schema portable to Postgres.
- Use Tailwind CSS and a clean, minimal UI.
- Add loading, empty, and error states.
- Add basic tests for critical parsing / validation logic.
- Add seed data or sample fixtures where useful.
- Add a complete README with setup, architecture, tradeoffs, screenshots placeholders, and future improvements.

## UX standards
- Recruiter should understand the project in under 2 minutes.
- UI should feel polished, not hackathon-like.
- Use clear labels, helpful helper text, and obvious call-to-actions.
- Include dashboard cards, status badges, result panels, and history views where appropriate.

## Delivery standards
- Work in small reviewable commits.
- Create a pull request with:
  - summary of what was built
  - architecture notes
  - local setup steps
  - known limitations
  - recommended next improvements

## Safety / implementation rules
- Do not commit secrets.
- Use `.env.example`.
- If an external API is optional, provide a mock or fallback path so the app still runs locally.
- If OCR or document extraction quality is uncertain, expose confidence / notes in the UI rather than hiding uncertainty.
