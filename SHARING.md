# Share Career Desk

Send this public repository to your friend:

https://github.com/sackeyengmman-dev/CareerDesk-2.0

They can fork it or use **Code → Download ZIP**, extract the download and open the folder in Codex on their computer. Follow [INSTALL-IN-CODEX.md](INSTALL-IN-CODEX.md) and the setup prompt in [README.md](README.md).

## Each friend needs their own setup

- A fresh private deployment with their own database and document storage; the documented workflow requires Sites access.
- Their own account and OpenAI API connection for automatic assessment. The source code is free to copy under MIT; API usage is billed separately. Hosting costs and availability depend on the service used.
- Their own saved career facts, primary master CV and optional English version. Both represent one career; they do not create extra experience.
- The private deployment link on their phone, signed into the same account as on desktop. A home-screen shortcut is convenient; native installation depends on the browser and device.

Share the code rather than your personal tracker, CVs, database, email access or API key. Do not make your live tracker public to distribute this app. No payment system or monetization is needed. Retain the MIT and third-party notices in copies.

## First setup troubleshooting

- **Assessment engine setup required:** configure `OPENAI_API_KEY` as a protected server secret and choose `OPENAI_ASSESSMENT_MODEL`, then redeploy the saved version to apply settings.
- **Original master CV needed:** paste and save your own source CV in Profile. Add the English version if available.
- **Job board could not be read:** paste the complete description; restricted reads are not bypassed.
- **Assessment could not complete:** review the cause and correct it before Refresh assessment. Do not repeatedly retry billing, quota or model-access failures.
- **You want a tailored CV:** copy the job brief into your CV project and explicitly request tailoring. Automatic scoring never starts a rewrite.
- **Email updates are missing:** Gmail, the generated Career Desk plugin and any recurring monitor require separate connection and authorization.

## Updating an existing copy

Reuse your own deployment identity and storage when applying updates. Keep secrets and personal files ignored; do not replace your profile with the blank template or recreate the site on every update. Ask Codex to review the source changes, apply required migrations, validate and republish your existing private site.

## Inviting family to one private deployment

An owner can sponsor another person’s assessment usage through the existing server-side API connection. Keep the Site private and add only the invited person’s ChatGPT email to its access list, where external invitations are supported. Invite them as a viewer, not a source editor. They sign in using their own account and save their own original CV in Profile. Profiles, applications, documents and assessment caches are scoped to the signed-in user. A new account starts blank; it must never inherit an owner’s CV.

The API key stays on the server and is not sent to the invited person. Both people’s API usage is charged to the owner’s API account. The existing limit is 20 provider calls per user per UTC day; unchanged verified assessments are cached. Inviting a person to the app does not share Gmail access or automatically start a personal email monitor.


## Personal daily leads

Each user saves their own CV and receives their own Germany-wide shortlist. Dated history and application records stay separate. In this reusable source, the refresh tool processes only the authenticated caller; configure each person’s own connected daily schedule if wanted. Sharing a server key does not grant permission to read another user’s profile or listings. Daily web-search charges are additional to assessment calls. Never distribute the owner’s key in the repository or browser code.
