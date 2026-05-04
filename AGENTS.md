# no-pressure

This repo is a React frontend for blood-pressure tracking.

## Working rules
- Prefer minimal changes over refactors.
- Keep environment variables in `.env` files; do not hardcode secrets.
- The app is dockerized. Traefik routing is handled by labels in compose.
- GitHub Actions is the deployment entrypoint. Follow the existing tagmate-style flow: copy the repo to the shared Docker server, render the deploy env file from a template, then run `docker compose` on the host.
- Treat tests as optional unless the user asks for them.
- When editing UI, keep changes local to the affected component and preserve existing patterns.
- Use the shortest matching context under `.codex-context` for related work.
