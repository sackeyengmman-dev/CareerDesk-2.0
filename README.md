# Career Desk

Track job applications, save interesting vacancies and get a rough, evidence-based view of how your existing experience fits each role. Use your private deployment on desktop and phone.

**This is a blank, reusable template under the MIT License.** No personal CVs, applications, API keys, email credentials or existing deployment identity are included. Each person sets up their own private tracker. OpenAI API usage is billed to their own account; hosting availability and costs depend on the deployment service.

## Features

- Application list and status board, follow-ups, dates, contacts, notes and private PDF/DOCX attachments.
- Vacancy URL extraction and automatic raw-description autofill. Paste the complete description when a job board blocks access; review extracted fields before saving.
- Automatic assessment against a saved primary/German master CV, optional English master and confirmed career facts.
- Five criterion scores, overall alignment, career-evidence fit, original evidence, mandatory gaps and application realism.
- Both masters represent one career: no translated evidence or double-counted experience.
- Copyable job briefs and assessment requests. **CV rewriting remains separately and manually requested.**
- Persistent light/dark mode and the same signed-in workspace on desktop and phone.
- Follow-up stage between Applied and Interview for recruiter conversations.
- Personal daily job shortlists grouped by date, retained separately for each signed-in account. Search Germany nationwide using LinkedIn, Indeed, StepStone, Arbeitsagentur and public employer vacancies. Up to five verified new matches, without padding.
- External job-board search links remain available alongside the saved shortlist.

## Set up your own copy

1. Fork this repository or use **Code → Download ZIP**, extract it and open the folder in Codex on your computer.
2. Follow [INSTALL-IN-CODEX.md](INSTALL-IN-CODEX.md) to create your own private deployment, sign-in and fresh storage.
3. Configure your own OpenAI API key as a server secret and explicitly choose an assessment model. Installing a plugin alone does not activate assessments.
4. Save your career facts and master CVs in **Profile**. Paste a vacancy, review the extracted details and save it when ready.
5. Open your deployment link on your phone and sign in with the same account.

Paste this into the new project's Codex chat:

> Read AGENTS.md and the career-desk project skill. Set up my own private Career Desk from this blank template using a fresh Sites project and fresh D1/R2 storage under my account. Keep career facts blank until I provide them. Use secure OpenAI Developers key setup, obtain required credential approvals and configure OPENAI_API_KEY as a server secret with an explicitly chosen OPENAI_ASSESSMENT_MODEL. Apply both migrations, run checks and build, publish owner-only and verify a real assessment after activation. Help me save my primary and English master CVs without counting experience twice. Do not rewrite my CV or submit applications unless I explicitly ask. Explain unavailable integrations or outstanding setup honestly.

The project includes [AGENTS.md](AGENTS.md) and a local [career-desk skill](.agents/skills/career-desk/SKILL.md). It is a project opened in Codex, not a one-click marketplace installer. The documented deployment needs Sites tools and account access; if unavailable, prepare the source while arranging hosting access.

## Sharing

Send the public repository link and [SHARING.md](SHARING.md). Friends use their own account, CVs, API key and private deployment. Share the source rather than your personal tracker or credentials. The [MIT License](LICENSE) permits copying and modification without buying a license; retain license notices.

## Assessment rubric

| Criterion | Weight |
| --- | ---: |
| Experience and seniority | 25% |
| Duties and responsibilities | 25% |
| Tools and functions | 20% |
| Qualifications and mandatory requirements | 20% |
| Original CV presentation | 10% |

The model reviews concrete requirements and selects server-listed source references. The server inserts original quotations, verifies sources and computes the scores. Direct/transferable/partial/limited/absent/conflicting evidence earns 100/75/50/25/0/0 credit; mandatory/core/preferred requirements weigh 3/2/1. Career-evidence fit excludes presentation and normalizes the first four weights to 100%.

**Scores are rough evidence-based estimates, not hiring probabilities.** Review quoted evidence and gaps: verified quotations do not guarantee correct interpretation. Language, credentials and eligibility cannot be inferred from transferable experience.

The saved CVs, confirmed summary and vacancy are sent to the configured OpenAI model through the Responses API with `store:false`. Unchanged inputs are cached privately. Changing either master, the vacancy, role, model or rubric invalidates previous automatic results. Duplicate calls are guarded; provider attempts are capped at 20 per user per UTC day. Failed calls require explicit refresh. Existing manual scores are retained unless you request a fresh automatic review. No automatic assessment rewrites a CV, saves an application or contacts an employer.

## Privacy and optional connections

Sign-in is required. Records, assessment caches and attachments are scoped to their authenticated owner. D1 stores records; R2 stores documents. Enter private information through Profile rather than committing it here. PDF/DOCX uploads have a 10 MB limit.

The generated Career Desk plugin can list applications and record explicitly matched email outcomes. Gmail is a separate connection. Installing or deploying the app does not start email sync, monitoring or recurring job searches. Authorize email reviews or recurring checks separately; ambiguous emails require review and silence is not rejection.

## Development

Requires Node.js 22.13+ and npm:

```sh
npm run install:ci
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
```

Use `npm run dev` for development and `npm run start` for built Worker preview with local storage. Preview support varies by host; never add a production sign-in bypass.

Apply both SQL migrations in `drizzle/` through the deployment workflow. Generate additional migrations only for schema changes. `.openai/hosting.json` declares `DB`, `BUCKET` and MCP, with no project ID. Keep keys in protected server configuration, never source, client code or that manifest.

Automated tests use injected provider fixtures and incur no API charges. Verify real inference only after approved activation. See [CHANGELOG.md](CHANGELOG.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Assessment performance: both master CVs and the full vacancy are sent once as referenced excerpts, without duplicate full-text copies. GPT-6 Luna uses low reasoning and concise explanations; all five scores and verbatim evidence checks remain. Existing unchanged assessments reuse the private cache. A local Uniresta trial completed in about 18 seconds; the prior request exceeded its 45-second deadline. This is an indicative single comparison, not a timing guarantee.


## Daily matched leads

Save your own original CV in Profile, then open **Discover → Find today’s leads**. The approved server API uses web search, grounds suggestions in your career, validates source URLs and verbatim career evidence, and rechecks public vacancy pages. Blocked or unverifiable candidates are excluded. Results include the company, role, location, application link, match explanation, main gap and any displayed pay/date information. Match tiers are rough assessments, not hiring probabilities. The complete five-criterion assessment runs when you prepare a selected vacancy; preparing does not submit or automatically save an application.

Shortlists remain private and grouped by **Europe/Berlin calendar date**. Completed daily searches are cached, with an atomic claim to prevent duplicate calls. Missing CVs do not invoke the provider. Failed days are shown honestly and are not automatically retried; the next day starts a fresh search. Changing search preferences applies to subsequent daily searches; existing dated shortlists are historical records.

**Scheduling needs separate setup.** Publishing the template does not start a recurring task. Connect its generated Career Desk plugin, verify authenticated calls, and explicitly request a daily schedule, for example at 09:00 Europe/Berlin. The schedule should call `refresh_daily_leads`, then `list_daily_leads` to verify persistence. The reusable template refreshes only the caller’s own CV and shortlist. Each account needs its own authenticated scheduling connection; it does not give an owner access to another person’s CV. API web-search/tool usage is charged to the configured server API account separately from the assessment limit of 20 provider calls per user per UTC day. Each lead search allows at most eight hosted search-tool calls.

The lead tables (`lead_members` and `daily_leads`) are created idempotently on first authenticated use. Both existing SQL migrations are still required for applications, profiles, documents and assessment cache/usage. A service bearer alone is not a visitor identity and cannot call private data tools.

## Verification and public packaging

Run the documented checks before publishing. The source package is kept below 100 files for GitHub browser upload; unused starter illustrations and example-only D1 notes are omitted. Retain the hidden `.agents`, `.github` and `.openai` directories. No existing Site identity, API key, personal CV, contacts or private family allowlist is included.
