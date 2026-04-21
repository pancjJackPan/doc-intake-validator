# Doc Intake Validator

Doc Intake Validator is a portfolio-grade internal operations web app for document review. A user uploads a PDF or image, the system stores the file metadata, extracts text, maps the transcript into typed fields, runs rule-based validation, and returns an actionable outcome with confidence notes, issue severity, and history tracking.

This project is designed to demonstrate strong fit for full-stack roles that need:

- Next.js App Router and TypeScript
- file processing and upload workflows
- API integration patterns with safe local fallbacks
- structured business logic and validation rules
- recruiter-friendly UI polish and clear documentation

## Why this project is relevant

This repo intentionally combines product and engineering concerns that show up in real ops tooling:

- A local-first extraction architecture with pluggable providers
- Persistent processing history with Prisma and SQLite
- Zod-validated inputs and typed structured outputs
- A rules engine that produces human-readable findings and next actions
- Clear result surfaces for analysts, not just raw JSON
- Demo fixtures and seed data so the app works immediately on a fresh machine

## Tech stack

- Next.js 16, App Router
- TypeScript
- Tailwind CSS v4
- Prisma
- SQLite for local development
- Zod
- React Hook Form
- Vitest

## Product workflow

1. Upload a PDF, PNG, JPG, or JPEG from the `/upload` page.
2. Store file metadata plus a processing run record in SQLite.
3. Extract raw text locally.
4. Map the transcript into typed document fields.
5. Run validation rules for missing data, invalid formats, suspicious inconsistencies, and confidence warnings.
6. Show the result with:
   - file summary
   - raw text preview
   - structured field table
   - JSON payload
   - validation findings
   - recommended action
   - audit-friendly timeline
7. Revisit the submission later from `/submissions`.

## Demo use case

The app is framed as a business intake / compliance review console. Example extracted fields:

- document type
- full name
- company / organization
- email
- phone
- document date
- invoice number
- reference number
- total amount
- address
- missing required fields
- suspicious inconsistencies

## Architecture overview

### UI

- `app/`
  - landing page
  - upload workspace
  - result page
  - history page
  - submission detail page
  - API routes for submission processing and JSON export
- `components/`
  - reusable dashboard panels
  - upload workflow UI
  - status badges and empty states

### Domain / backend

- `lib/submissions/process-submission.ts`
  - orchestration layer for upload storage, extraction, validation, and persistence
- `lib/extraction/`
  - provider factory
  - mock structured extraction provider
  - OpenAI extraction provider
  - OCR adapter interface and mock OCR implementation
  - local raw-text extraction for PDFs
- `lib/validation/`
  - normalization helpers
  - typed validation rules
  - recommendation generation
- `lib/demo/fixtures.ts`
  - seeded demo scenarios and bundled fixture metadata

### Persistence

- `prisma/schema.prisma`
  - `Submission`
  - `UploadedFile`
  - `ExtractedDocument`
  - `ValidationIssue`
  - `ProcessingRun`

## Data flow

```text
Upload / Demo Fixture
  -> Route Handler
  -> Persist file metadata + processing run
  -> Local text extraction
  -> Structured extraction provider
  -> Zod-validated typed document
  -> Rules engine
  -> Recommendation builder
  -> Prisma persistence
  -> Result page / history / export
```

## Extraction architecture

The app runs locally without API keys.

- `MockExtractionProvider`
  - default mode
  - uses local heuristics against extracted text
  - keeps the app fully runnable offline
- `OpenAiExtractionProvider`
  - optional live provider
  - uses the OpenAI Responses API through a thin `fetch` adapter
  - validates returned JSON against the same Zod schema
- `MockOcrAdapter`
  - pluggable OCR fallback for image files when no live OCR service is configured

### Local-first behavior

- PDFs attempt local text extraction first.
- If the source file is a bundled fixture or text extraction fails, the app falls back to fixture transcript data.
- Image files route through the OCR adapter interface.
- Confidence and notes stay visible in the UI instead of hiding uncertainty.

## Validation rules

The rules engine currently includes:

- required fields missing
- invalid email format
- invalid or future date
- amount missing
- reference / invoice format mismatch
- high amount threshold flag
- inconsistent organization name across extracted areas
- invalid phone normalization
- low-confidence extraction warning

Each issue stores:

- severity
- issue code
- message
- suggested fix

The recommendation engine converts those findings into a status such as `APPROVED`, `PROCESSED`, `NEEDS_REVIEW`, or `REJECTED`.

## Local setup

### Prerequisites

- Node.js 20+
- npm 11+

### Install and run

```bash
npm install
cp .env.example .env
npm run db:migrate -- --name init
npm run dev
```

Open `http://localhost:3000`.

### What migration does

`npm run db:migrate -- --name init` creates the SQLite database, applies Prisma migrations, generates the Prisma client, and runs the seed script configured in `prisma.config.ts`.

### Seed data and bundled fixtures

After migration, the database is seeded with three sample submissions:

- clean document
- missing-fields document
- suspicious document

Bundled upload assets also live in `public/demo/`:

- `clean-intake.pdf`
- `missing-fields.pdf`
- `suspicious-review.png`

You can either upload them manually or use the one-click demo fixture buttons on `/upload`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma database connection string. Defaults to SQLite local dev usage. |
| `EXTRACTION_PROVIDER` | No | `mock` or `openai`. Default is `mock`. |
| `OPENAI_API_KEY` | No | Enables the live OpenAI extraction adapter when paired with `EXTRACTION_PROVIDER=openai`. |
| `OPENAI_MODEL` | No | Model name for the OpenAI extraction adapter. Default is `gpt-4o-mini`. |
| `MAX_UPLOAD_SIZE_MB` | No | Upload size cap enforced in the API and UI. |
| `HIGH_AMOUNT_THRESHOLD` | No | Threshold used by the rules engine to flag high-value submissions. |

## Demo workflow

1. Start the app.
2. Open `/upload`.
3. Click one of the bundled fixture buttons.
4. Review the result page:
   - clean fixture should approve
   - missing-fields fixture should reject
   - suspicious fixture should require manual review
5. Open `/submissions` to filter history and revisit stored runs.
6. Export any stored record as JSON from the result or detail view.

## Testing

Focused tests cover:

- normalization helpers
- validation rule behavior
- recommendation generation

Run them with:

```bash
npm test
```

Additional verification used during development:

```bash
npm run lint
npm run typecheck
npm run build
```

## Screenshots

Add screenshots here after running the app locally:

- `docs/screenshots/landing.png`
- `docs/screenshots/upload.png`
- `docs/screenshots/result-clean.png`
- `docs/screenshots/result-review.png`
- `docs/screenshots/history.png`

## Tradeoffs

- The live provider is optional and intentionally wrapped behind a fallback-first adapter so the repo stays runnable without secrets.
- OCR is mocked locally to keep the project deterministic and portable.
- Amounts are stored as `Float` in SQLite for simplicity in local development; moving to Postgres would be a good place to harden monetary precision.
- The rules engine is intentionally explicit and reviewable instead of hiding logic inside an opaque model call.

## Future improvements

- Add a real OCR provider implementation behind the existing adapter interface.
- Support async background jobs for large file processing.
- Add richer per-field source spans and analyst annotations.
- Add user auth and reviewer ownership.
- Add CSV / webhook exports for downstream systems.
- Harden history search with full-text indexing when moving to Postgres.

## Repository structure

```text
app/
components/
lib/
prisma/
public/demo/
storage/uploads/
tests/
```

## Notes for reviewers

- The app runs in mock mode by default.
- No secrets are required for the local demo.
- `npm run db:migrate -- --name init` is enough to get a working local database with demo data.
- The build script uses webpack explicitly because Turbopack’s CSS worker model is not reliable in restricted sandbox environments.
