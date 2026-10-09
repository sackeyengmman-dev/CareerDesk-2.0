# Changelog

## 2026-10-09

- Added Follow-up between Applied and Interview in all shared stage selectors.
- Added private dated daily lead history and a Discover shortlist view.
- Added source-grounded Germany-wide search with CV evidence, public-page verification and per-user deduplication.
- Added daily search caching and in-flight claims; missing CVs avoid provider calls.
- Added authenticated `refresh_daily_leads` and `list_daily_leads` tools; this reusable edition refreshes the caller only.
- Preserved manual application saving and separate, explicitly requested CV rewriting.
- Documented separate scheduling, shared server billing, limits and private account setup.
- Fixed Worker-compatible DNS redirect handling without following redirects.

## 2026-10-08

- Private family sharing readiness: blank new-user profile, personal greetings and setup prompt, owner bootstrap restricted to the trusted server identity, and isolation tests.

- Faster assessments: source excerpts are sent once, concise explanations, and explicit low reasoning for GPT-6 Luna. Existing verified results still use the private cache; other configured models retain their existing settings.

- Automatic evidence-based vacancy assessments through an approved server-side OpenAI connection.
- Primary/German and optional English master CVs, private caching and stale-result detection.
- Source-reference selection so the server supplies verbatim evidence without generated quotations or translations.
- Five weighted criterion scores, separate career-evidence fit, mandatory gaps, confidence and application realism.
- Manual CV tailoring, preservation of manual score edits and explicit application saving.
- Secure vacancy URL intake, mobile title-plus-link handling and raw-description autofill with restricted-site fallback.
- Persistent light/dark mode and clear setup, error, stale and quota states.
- Hosted redirect compatibility fix while rejecting unexpected redirects.
- Updated setup and sharing guides; public defaults remain blank with no credentials or deployment identity.
