# Install Career Desk in Codex

## 1. Add the project

Clone or download this repository to a new local folder. Open that folder as a project in Codex. Keep this reusable source separate from any existing tracker checkout or personal resume project.

The local skill is `.agents/skills/career-desk/SKILL.md`. You can ask for it by name or paste the setup prompt from README.md. No global skill installation or marketplace entry is required.

## 2. Prepare a private deployment

Ask Codex to inspect the project instructions and the available Sites integration. The setup must create a fresh project under your account, use new D1 and R2 resources, and keep owner-only access. `.openai/hosting.json` intentionally has no deployment ID; do not copy a project ID or service credential from another tracker.

Codex should install dependencies with `npm run install:ci`, run `npx tsc --noEmit` and `node --test tests/*.test.mjs`, then run `npm run build`. The initial migration is included. Generate an additional migration only if the schema changes. The Sites workflow should apply the migrations to your newly provisioned D1 database and provide `DB` and `BUCKET` bindings.

If Sites tools or account access are unavailable, keep the validated local project and arrange access before deployment. A build is not a published site, and a deployment is not proof that all connections work. Do not install unrelated tooling or substitute an anonymous public deployment for private access.

## 3. Publish and verify

Ask Codex to publish your prepared private deployment. After publishing, verify:

- Anonymous page requests go through sign-in and anonymous data requests are rejected.
- The empty workspace contains no applications or career facts.
- Your own saved application survives Refresh and a new browser session.
- Another authenticated identity cannot access your applications or documents.
- PDF / DOCX upload, download and confirmed deletion work.
- The phone layout is usable and shares data with your desktop account.

Keep credentials and local runtime files out of Git. Sites may create deployment metadata in your private checkout; retain that locally for updates, but do not put your deployment identity into the reusable public template.

## 4. Add your career information

Open Profile in your deployed tracker. Enter your name, contacts, confirmed career summary and original master CV. Set your role families as comma-separated text and choose your region and preferences. Save the profile. Keep private source documents in an ignored local `inputs/` folder if needed.

Add applications manually. New assessments remain pending until all five scores are entered after evidence review. Use Copy assessment request to ask Codex to assess the original master against a vacancy; paste the returned evidence and scores into the app. Do not treat textual keyword matches as fit scores or hiring probabilities.

## 5. Connect the optional Career Desk plugin

After deployment, ask Codex to retrieve your site's generated MCP connection and show its plugin installation/connection UI. If that UI is unavailable, open **Plugins > Personal > Created by you** and install or connect your Career Desk plugin. These are platform-managed connections; avoid creating a separate local stdio MCP configuration.

Verify a read-only `list_applications` call under your authenticated identity. Do not report the plugin as connected merely because the site was deployed. Hosting and plugin access are separate checks.

## 6. Connect your own Gmail, if wanted

Connect Gmail separately in Codex and reauthenticate if prompted. Then explicitly authorize an email review, for example:

> Review my recent application emails in my connected Gmail account. Use my connected Career Desk to match the exact company and role. Record explicit rejection, interview and offer outcomes with sender, subject, timestamp, message ID and evidence. Show ambiguous or unmatched messages for review. Do not infer rejection from silence.

Only run this when both connections are available and a live read call has succeeded. Recurring checks require a separate automation request and configuration. The app does not receive Gmail access or start a monitor by itself.

## Updates

Reuse your own private site and bindings when updating an existing deployment. Do not create a new site on every edit. Keep public template fixes generic, and never copy personal profile data, documents, email evidence or deployment metadata back into a public contribution.
