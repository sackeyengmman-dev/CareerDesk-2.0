# Career Desk project instructions

This is a reusable blank application-tracker template. Read `.agents/skills/career-desk/SKILL.md` when setting up a deployment or working with job records and assessments.

## Template and private data

Keep `app/default-profile.json` generic. Do not add a real resume, personal contacts, employer examples, precomputed application scores, email evidence or a deployment identity to public source. Personal source documents belong in ignored `inputs/`; runtime data belongs in the user's private D1/R2 deployment. Never copy another person's tracker database, bucket, credentials or project ID.

## Deployment

For a new user's setup, create fresh Sites identity and bindings under that account. Keep the site owner-only, require ChatGPT sign-in and preserve user-scoped database and file access. For updates, reuse that user's existing deployment. Use the available Sites workflow and report unavailable tools or connections honestly. Complete local preparation and verification before publishing. Deployment credentials and metadata must not enter the reusable public template.

## Product behavior

Unknown fit scores remain pending. Preserve the weights 25/25/20/20/10 and first-four normalized career evidence fit. Scores are entered after evidence review, never inferred from keyword matches or represented as hiring probability. Require the user's own master CV for assessments; do not invent career facts. External discovery links are searches, not a live feed.

Gmail and the generated Career Desk plugin are optional, separate connections. They are not active merely because the app is published. Email updates need explicit user authorization, exact application matching and clear outcome evidence. Ambiguous outcomes require review; no rejection from silence. Recurring automation requires a separate request.

## Verification

Use `npm run install:ci`, `npx tsc --noEmit`, `node --test tests/*.test.mjs` and `npm run build`. Generate migrations only after schema changes. Validate authentication, ownership, persistence, document handling and mobile layout in a suitable runtime; distinguish local/simulated checks from live deployment verification.
