# Install Career Desk in Codex

## 1. Open your own copy

Fork the repository or download and extract its ZIP, then open the folder as a local project in Codex on your computer. Read README.md and AGENTS.md. The local skill is `.agents/skills/career-desk/SKILL.md`; no global skill installation is required.

Use the setup prompt in README.md. Keep the source separate from another person's deployment or personal CV project.

## 2. Prepare private hosting and storage

The documented workflow requires available Sites tools and account access. Ask Codex to create a fresh Sites project, D1 database binding `DB` and R2 bucket binding `BUCKET` under your account. Keep owner-only access and ChatGPT sign-in. Never copy someone else's project ID, storage, credentials or runtime data.

Install dependencies, check TypeScript, run fixture tests and build:

```sh
npm run install:ci
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
```

Apply both supplied migrations through deployment:
- `drizzle/0000_lazy_moon_knight.sql`
- `drizzle/0001_third_the_call.sql`

Schema generation alone does not create the deployed tables. Generate additional migrations only for schema changes. If hosting access is unavailable, retain validated source while arranging access; do not substitute an anonymous public tracker.

## 3. Activate automatic assessments

Use your own paid OpenAI API account. Install the OpenAI Developers plugin and connect its Platform app. Have Codex use the secure key-setup workflow and obtain required confirmation before creating a key or saving a secret. Do not paste keys in a chat, commit them to GitHub or put them in browser code.

Configure these protected hosting settings using the native Sites workflow:
- `OPENAI_API_KEY`: your own key, marked as a server secret.
- `OPENAI_ASSESSMENT_MODEL`: an explicitly chosen model with Responses API and structured-output support.

See [OpenAI Developers setup](https://developers.openai.com/learn/developers-codex-plugin) and [available models](https://developers.openai.com/api/docs/models). No key or default model is bundled. The key must be configured on the hosted server: setting it only on your computer does not activate the live app.

After changing hosted settings, redeploy the saved site version to apply the new configuration. Confirm that the deployment uses the current environment revision. API charges belong to the configured account; check its billing and usage settings.

## 4. Add your own career information

Open Profile. Save your contacts, career facts, role families, region and preferences. Paste your original primary/German master CV and optional English master. Both represent the same career; don't count experience twice or treat translations as new qualifications.

Private information belongs in your deployment's database, not public source. Optional source files may be retained in ignored local `inputs/`. The template defaults are blank.

## 5. Publish and verify

Publish owner-only. Verify:
- Anonymous visitors must sign in; anonymous data requests are rejected.
- A new tracker has no previous user's applications or CVs.
- Your profile and application persist across refresh and a new session.
- Another identity cannot read your records or attachments.
- PDF/DOCX upload, download and confirmed deletion work.
- The phone layout is usable and shares your signed-in account's data.
- After approved activation, a real vacancy assessment returns all five scores, supporting evidence and gaps.

A successful build is not a deployment, and a deployment alone is not proof of inference or plugin access. Report incomplete checks honestly.

## 6. Use the tracker

Paste a public vacancy URL into Add application. If the board blocks the reader or requires login, paste the full description instead. Extraction autofills blank company, role and location fields; verify any conflicting-employer warning. It does not bypass site restrictions, save an application or rewrite a CV.

A configured engine automatically assesses a meaningful vacancy after intake or when an unassessed job opens. It checks the saved sources in either language and selects source references; the server supplies verbatim passages and computes the weighted rubric. Review approximate scores and gaps before using them. They are not hiring probabilities.

Save the application explicitly. Copy job brief into your CV project and request tailoring separately when ready. Manual scores remain available; automatic results don't overwrite manual edits unless you choose Refresh assessment. Changed masters or vacancies invalidate prior automatic results, and unchanged inputs are cached. Failed calls require explicit refresh; provider attempts are limited to 20 per user per UTC day.

## 7. Use your phone

Open your own deployed URL in your phone browser and sign in with the same account. Add a home-screen shortcut if useful; native installation availability varies by browser and device. Your phone does not need the source code or API key.

Use the Light/Dark toggle for a preference stored in that browser.

## 8. Optional Career Desk and Gmail connections

After deployment, ask Codex to retrieve the site's generated MCP connection and show the plugin installation/connection interface. Verify a read-only `list_applications` call. Hosting and plugin access are separate; do not claim a plugin is connected merely because deployment succeeded.

Connect your own Gmail separately if wanted. Explicitly authorize review of application emails and exact company/role matching before recording confirmed rejection, interview or offer outcomes. Retain sender, subject, timestamp, message ID and evidence. Ambiguous emails require review; silence is not rejection.

Connecting either plugin does not start email sync or monitoring. Recurring reviews and daily job leads need a separate automation request and configuration.

## 9. Activate daily matched leads

Save your own CV and search preferences. **Discover → Find today’s leads** makes a paid, server-side web search using the existing approved key/model; the chosen Responses model must support `web_search`. It checks Germany nationwide, attempts the four boards, and returns up to five new publicly verified matches. Fewer are returned when access or suitable vacancies are limited. Existing shortlists remain saved by date.

The tables `lead_members` and `daily_leads` initialize automatically on first authenticated use. No personal records or scheduler credentials are included. Verify a real authorized search and read the saved day back before claiming readiness.

For an explicitly requested daily schedule, connect the generated Career Desk plugin and use `refresh_daily_leads` followed by `list_daily_leads`. Configure 09:00 in Europe/Berlin (including daylight-saving changes). Keep the task quiet when unchanged; report useful new results, a failure or setup action. This reusable edition refreshes only the authenticated caller, so another account needs its own scheduling connection. Reuse an existing matching schedule rather than making duplicates. A deployment is not proof that an unattended schedule can write; verify its tool access and first run separately.

Searches are cached per user per Germany calendar day and are independent of the assessment-call budget. A failed day is retained without automatic paid retries. CV rewriting, application submission and recruiter contact remain separately authorized actions.

## Updates and sharing

Reuse your own existing site identity and storage for updates. Keep deployment metadata, secrets, private documents and runtime data out of public contributions. Follow [SHARING.md](SHARING.md) to give someone else their own copy; do not distribute your personal tracker or key.
