# NO PRESSURE!

React application for managing blood pressure data.

## Frontend container

Build locally:

```bash
docker build -t no-pressure:local --build-arg VITE_API_BASE_URL=https://api.example.com .
```

Run locally:

```bash
docker run --rm -p 8080:80 no-pressure:local
```

## Production compose

This repo includes `docker-compose-prod.yml` with Traefik labels and external `traefik` network.

Template for deploy-time env file:
- `.env.prod.template`

## GitHub Actions deploy workflow

Workflow file: `.github/workflows/deploy.yml`

Required repository secrets:

- `VITE_API_BASE_URL` (example: `https://api.example.com`)
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_SSH_PASSPHRASE` (optional, only if key is encrypted)

Required repository variables:
- `DOMAIN`

Notes:

- The workflow computes `DEPLOY_TARGET=/opt/<repo-name>` from the GitHub repository name.
- It copies this repo to the VPS target folder, generates `.env.prod` from template, then runs:
  - `docker compose -f docker-compose-prod.yml --env-file .env.prod pull`
  - `docker compose -f docker-compose-prod.yml --env-file .env.prod build`
  - `docker compose -f docker-compose-prod.yml --env-file .env.prod up -d`
- No container registry is required in this flow.
