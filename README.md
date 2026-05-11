# No Pressure

React frontend for blood-pressure tracking.

## Development

```bash
npm install
npm run dev
```

Vite serves the app and proxies `/api` to `http://localhost:3000`.

## Production

Production uses `docker-compose-prod.yml` and the GitHub Actions deploy workflow.

- `.env.prod.template` is rendered on the VPS into `.env.prod`
- the workflow copies the repo to `/opt/<repo-name>` and runs:
  - `docker compose -f docker-compose-prod.yml --env-file .env.prod build`
  - `docker compose -f docker-compose-prod.yml --env-file .env.prod up -d`

The backend is expected to expose cookie-based auth and user-scoped BP routes under `/api`.
