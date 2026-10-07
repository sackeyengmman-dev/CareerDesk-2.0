# Third-party notices

The root MIT license covers original Career Desk application code and documentation. It does not replace licenses or copyright notices belonging to third-party code.

- OpenAI Sites starter infrastructure is retained. The OpenAI copyright and MIT license for the Sites Vite plugin are preserved in `build/sites-vite-plugin.LICENSE`. Preserve this file when redistributing the plugin and related starter code.
- The bundled shadcn Tailwind stylesheet retains its upstream license in `vendor/shadcn-tailwind-4.13.0.LICENSE.md`. UI component sources and dependency packages retain their applicable upstream licenses.
- Dependencies are recorded in `package.json` and `package-lock.json`; their published package license files remain applicable. This repository does not redistribute a checked-in `node_modules` directory.
- The visual interface loads DM Sans and Manrope through Google Fonts. Those font families are distributed by their respective authors under the SIL Open Font License; fonts are fetched at runtime rather than bundled in this repository. External font loading can be replaced with system fonts for an installation that avoids that network request.

Review the retained files and each dependency's license for applicable redistribution requirements. Do not remove existing upstream notices when copying or modifying the template.
