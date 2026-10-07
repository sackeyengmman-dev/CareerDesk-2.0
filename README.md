# Career Desk

A calm, private home for your job search. Keep opportunities, follow-ups, application documents and evidence-based fit assessments together on desktop and phone.

This repository is a **blank, reusable template**. It contains no resume, contact details, seeded applications or existing deployment identity. The source is public; each person's deployed tracker should be private.

## What you get

- **Today:** active applications, interviews, offers, deadlines and follow-ups.
- **Applications:** searchable list and status board; roles, companies, locations, posting links, vacancy text, contacts, notes and dates.
- **Documents:** private PDF / DOCX upload and download, up to 10 MB each.
- **Profile:** editable career facts, original master CV, contacts, region, role families and preferences.
- **Discover:** editable searches on LinkedIn, Indeed, StepStone and Arbeitsagentur. Your custom comma-separated role families appear in the search dropdown.
- **Reviewed assessments:** five weighted criteria, evidence, mandatory gaps and application realism. Unknown scores remain pending.
- **Optional Codex connection:** authenticated MCP tools to list applications and record explicit email outcomes.

## Open in Codex

Clone or download this repository, then open its folder as a local project in Codex. The project includes [AGENTS.md](AGENTS.md) and the project skill [.agents/skills/career-desk/SKILL.md](.agents/skills/career-desk/SKILL.md). This is a project you add to Codex, not a marketplace installer.

Paste this prompt into that project's chat:

> Use the career-desk project skill to set up my own private Career Desk from this blank template. Use a fresh Sites project and new D1/R2 storage owned by my account. Keep the profile blank until I supply career facts. Install dependencies, run the tests and production build, and prepare an owner-only deployment. Publish when authorized, verify sign-in and private data access, then help me connect the generated Career Desk plugin. Explain any unavailable tools or outstanding connections honestly. Do not reuse another person's site or data.

See [INSTALL-IN-CODEX.md](INSTALL-IN-CODEX.md) for setup, deployment and connection details. Sites deployment requires an available Sites integration and account access. If those tools are unavailable, Codex can prepare and validate the project while you arrange the deployment connection.

## Local development

Requires Node.js 22.13 or newer and npm. Install the lockfile's dependencies through the cross-platform helper:

```sh
npm run install:ci
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
```

Use `npm run dev` for development. `npm run start` previews the built Worker with local D1/R2 support. Local preview requires trusted signed-in request headers and initialized local storage; it is not an anonymous demo. Do not introduce a production sign-in bypass. Worker preview support can vary by host platform.

The repository includes its schema and initial migration. When changing `db/schema.ts`, run `npm run db:generate` and include the new SQL migration. Apply migrations through the deployment workflow; schema generation alone does not create a deployed database.

`.openai/hosting.json` declares D1 binding `DB`, R2 binding `BUCKET` and the `mcp` capability. It deliberately contains no project ID. A new deployment must provision fresh storage and identity. Secrets, runtime files, local credentials, databases, personal inputs and output documents must remain outside Git.

## Privacy and storage

The server page requires ChatGPT sign-in. Data routes and data-bearing MCP calls require a signed-in user identity. Database reads and writes, attachment downloads and storage keys are scoped to that user. Origin checks reject cross-origin mutations when an Origin is present. Service credentials alone do not grant access to a user's data.

Keep the deployed site owner-only. D1 stores applications and profile data; R2 stores documents. Uploads accept PDF or DOCX with a basic file-signature check, sanitized filenames and a 10 MB limit. Deleting an application also deletes its documents after confirmation. Documents are accessed through authenticated routes, not public bucket URLs.

The blank default profile lives in the public source. Enter private career facts through the deployed Profile screen so they are stored in your database, rather than committing them to this repository. Refresh retrieves changes made on another device signed into the same account.

## Assessments and limits

| Criterion | Weight |
| --- | ---: |
| Experience and seniority | 25% |
| Duties and responsibilities | 25% |
| Tools and functions | 20% |
| Qualifications and mandatory requirements | 20% |
| Original CV presentation | 10% |

All five reviewed scores are required to calculate overall alignment. Career evidence fit excludes presentation and normalizes the first four weights to 100%. Neither percentage is a hiring probability. Enter supporting evidence, distinguish direct and transferable experience, and record unverified requirements. Keyword overlap is informational; it never creates a fit assessment.

The app does not call an AI model, automatically tailor a CV or generate scores. Copy assessment request gives you a prompt to paste into your Codex project chat. Supply your own original master CV before asking for an assessment. Discovery links open external job-board searches; the app does not scrape listings or provide a live jobs feed.

## Optional email workflow

Gmail is a separate connection to your own account. This repository does not contain Gmail credentials, an active email sync or a recurring automation. After connecting Gmail and the generated Career Desk plugin, you can explicitly ask Codex to review application emails and update confirmed matches. Reconnection may be required separately for either service.

`POST /mcp` supports stateless initialization, tool discovery, `list_applications` and `record_email_outcome`. Private tool calls require authenticated user identity. Email updates require an owned job ID, exact company and role match, explicit rejection/interview/offer, message ID, sender, subject, ISO timestamp and supporting evidence. Duplicate messages are ignored, older events cannot overwrite newer ones, and withdrawn applications require review. Email history is retained during UI edits.

Ambiguous messages and unmatched opportunities need human review. Silence is not rejection. A recurring monitor must be requested and configured separately; no scheduler starts merely by deploying or connecting the plugin. Manual status editing and evidence notes always remain available.

## Contributing and licensing

CI installs dependencies, checks TypeScript, runs the model/template tests and builds on Node 22. Before publishing a change, also verify authenticated routes, user isolation, attachments and mobile layout in an appropriate deployment environment.

Career Desk application code is offered under the [MIT License](LICENSE). Retained starter and dependency notices are described in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
