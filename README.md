# Doc Intake Validator

Doc Intake Validator is a polished full-stack internal operations application for business intake and compliance-style document review.

A user uploads a PDF or image, the system stores the upload metadata, extracts raw text, maps structured fields, runs typed validation rules, and returns an actionable review outcome with confidence notes, history, and JSON export.

This project is intentionally built to show strong fit for full-stack roles that involve:

- Next.js App Router and TypeScript
- file upload and processing workflows
- structured backend logic and rule engines
- API integration patterns with safe local fallbacks
- recruiter-ready UI polish and documentation quality

## Why this project matters

Many engineering portfolios show CRUD apps or generic dashboards. This repository is closer to a real internal ops tool:

- it handles real file types
- it persists upload and processing history
- it separates extraction, validation, and recommendation concerns
- it exposes uncertainty instead of hiding it
- it gives reviewers a clear operational decision, not just raw parsed output

## Core capabilities

- Upload PDF, PNG, JPG, and JPEG files
- Store upload metadata and processing runs in SQLite via Prisma
- Extract text locally from PDFs when possible
- Support a pluggable OCR adapter path for image files
- Support a pluggable structured extraction provider architecture
- Run a typed rules engine for validation findings
- Surface confidence, issues, recommendation, and audit-style processing timeline
- Export any stored submission as JSON
- Revisit prior runs from a filterable history view
- Seed the project with demo data and bundled sample files

## Demo scenarios included

The seeded demo data and bundled sample assets cover three representative cases:

- `clean-intake`
  - complete document with consistent organization details
  - expected outcome: approved / processed cleanly
- `missing-fields`
  - incomplete intake missing key contact and billing fields
  - expected outcome: rejected or returned for correction
- `suspicious-review`
  - high-value document with low confidence and inconsistent organization mentions
  - expected outcome: manual review required

Bundled demo assets live in `public/demo/`:

- `clean-intake.pdf`
- `missing-fields.pdf`
- `suspicious-review.png`

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma
- SQLite for local development
- Zod
- React Hook Form
- Vitest

## Pages and routes

### UI routes

- `/`
  - landing page
- `/upload`
  - upload workspace and one-click demo scenarios
- `/results/[id]`
  - immediate processing result view
- `/submissions`
  - history and filtering
- `/submissions/[id]`
  - detailed operational review view

### API routes

- `POST /api/submissions`
  - upload a real file or trigger a bundled demo fixture
- `GET /api/submissions/[id]/export`
  - export a stored submission as JSON

## Product workflow

1. Upload a PDF or image from `/upload`, or trigger a bundled demo fixture.
2. Persist `Submission`, `UploadedFile`, and `ProcessingRun` records.
3. Extract raw text from the stored file.
4. Map the transcript into a typed document shape.
5. Run validation rules.
6. Generate a recommendation and final status.
7. Show the result with:
   - file summary
   - raw text preview
   - structured field table
   - JSON payload
   - validation findings
   - recommendation
   - processing timeline
8. Revisit the submission later from `/submissions`.

## Supported extracted fields

The demo domain is business intake / compliance review. Example extracted fields include:

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

### Frontend

`app/`
- App Router pages and route handlers
- landing, upload, result, history, and detail views

`components/`
- dashboard panels
- upload workflow UI
- status badges
- empty states

### Domain services

`lib/submissions/process-submission.ts`
- orchestration layer for storage, extraction, validation, and persistence

`lib/submissions/queries.ts`
- read-side queries for landing stats, history, and detail pages

`lib/extraction/`
- raw text extraction
- provider factory
- mock structured extraction provider
- optional OpenAI extraction provider
- OCR adapter interface and mock OCR implementation

`lib/validation/`
- normalization helpers
- typed validation rules
- recommendation engine

`lib/demo/fixtures.ts`
- bundled demo scenarios and fixture metadata

### Persistence

`prisma/schema.prisma`
- `Submission`
- `UploadedFile`
- `ExtractedDocument`
- `ValidationIssue`
- `ProcessingRun`

## Data flow

```text
Upload / Demo Fixture
  -> Route Handler
  -> Persist Submission + UploadedFile + ProcessingRun
  -> Local text extraction
  -> Structured extraction provider
  -> Zod-validated typed document
  -> Validation rules
  -> Recommendation engine
  -> Prisma persistence
  -> Result page / history / export
```

## Extraction architecture

The app is local-first and runs without secrets by default.

### Structured extraction providers

- `MockExtractionProvider`
  - default mode
  - uses local heuristics against extracted text
  - keeps the project fully runnable offline

- `OpenAiExtractionProvider`
  - optional live provider
  - calls the OpenAI Responses API through a thin `fetch` adapter
  - validates returned JSON against the same Zod schema used locally

### OCR layer

- `MockOcrAdapter`
  - default OCR fallback
  - keeps image-based demo flows deterministic in local development

### Local-first behavior

- PDFs attempt local text extraction first.
- If the file is a bundled fixture or no usable PDF text is returned, the app falls back to the fixture transcript.
- Image files flow through the OCR adapter interface.
- Confidence and notes remain visible in the UI.

## Validation and recommendation logic

### Validation rules included

- required fields missing
- invalid email format
- invalid or future date
- missing numeric amount
- reference / invoice format mismatch
- high amount threshold flag
- inconsistent organization names
- invalid phone normalization
- low-confidence extraction warning

Each finding includes:

- severity
- issue code
- message
- suggested fix

The recommendation engine turns those findings into statuses such as:

- `APPROVED`
- `PROCESSED`
- `NEEDS_REVIEW`
- `REJECTED`

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

### What `db:migrate` does

`npm run db:migrate -- --name init` will:

- create the local SQLite database
- apply Prisma migrations
- generate the Prisma client
- run the seed script configured in `prisma.config.ts`

After that, the app is ready to use immediately.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string. Local default uses SQLite. |
| `EXTRACTION_PROVIDER` | No | `mock` or `openai`. Default is `mock`. |
| `OPENAI_API_KEY` | No | Enables the optional live OpenAI extraction path. |
| `OPENAI_MODEL` | No | Model name for the optional live extraction path. Default is `gpt-4o-mini`. |
| `MAX_UPLOAD_SIZE_MB` | No | Upload size cap enforced in the API and UI. |
| `HIGH_AMOUNT_THRESHOLD` | No | Threshold used by the rules engine to flag high-value submissions. |

## Manual demo flow

1. Start the app.
2. Open `/upload`.
3. Click one of the built-in demo fixtures or upload a file manually.
4. Review the result page:
   - clean fixture should pass cleanly
   - missing-fields fixture should fail or require correction
   - suspicious fixture should require manual review
5. Open `/submissions` to review history.
6. Export any record as JSON from the result or detail page.

## Testing and verification

Focused automated coverage exists for:

- normalization helpers
- validation rules
- recommendation logic

Run tests:

```bash
npm test
```

Run additional checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Screenshots

Suggested screenshot placeholders for the repository:

- `docs/screenshots/landing.png`
- `docs/screenshots/upload.png`
- `docs/screenshots/result-clean.png`
- `docs/screenshots/result-review.png`
- `docs/screenshots/history.png`

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

## Tradeoffs

- The optional live extraction path exists because it was part of the product requirement, but the app still works fully in mock mode.
- OCR is mocked locally to keep the project deterministic, portable, and easy to demo.
- Amounts are stored as `Float` in SQLite for local simplicity; a stricter decimal strategy would be a good next step for Postgres.
- The rules engine is intentionally explicit and reviewable instead of hiding operational behavior inside opaque model output.

## Future improvements

- Add a real OCR provider behind the existing adapter interface
- Move long-running processing into background jobs
- Add per-field source spans and analyst annotations
- Add authentication and reviewer ownership
- Add CSV / webhook exports
- Harden history search with full-text indexing after a Postgres move

## Notes for reviewers

- The app runs in mock mode by default.
- No secrets are required for local evaluation.
- `npm run db:migrate -- --name init` is enough to get a working local database with demo data.
- The build script uses webpack explicitly for stable builds in restricted or locked-down environments.
