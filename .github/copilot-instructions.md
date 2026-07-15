# Project Guidelines

## Secrets And Environment Files
- Do not read `.env`, `.env.*`, secret export files, key files, certificates, or other credential-bearing files unless the user explicitly asks for that file or asks for secret debugging.
- Prefer `.env.example`, typed config files, Expo config, and documented environment variable references when environment context is needed.
- If a task depends on a missing secret or runtime value, ask the user for the needed value or describe the expected variable name instead of opening secret files.

## Architecture
- Keep attribution, payments, and voice-provider integrations behind dedicated service boundaries instead of scattering SDK setup across screens.
- Treat Twilio as a quarantined transport layer for future phone capability, not as the product-level source of truth for in-app voice mode.

## Build And Test
- Prefer narrow validation for the touched surface.
- For mobile config changes, validate with `npx expo config --type public` from `mobile/`.
- For website changes, validate with `npm run build` from `website/` when the touched route or component affects production rendering.

## Conventions
- Keep changes minimal and preserve the existing product direction toward direct provider integrations for voice features.
- Use existing docs in `docs/` as the source of truth for product and attribution decisions before adding new architectural notes.