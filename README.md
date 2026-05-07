# NO PRESSURE!

React application for managing blood pressure data.

## Frontend container

Build locally against a backend exposed on `http://localhost:3000`:

```bash
docker build -t no-pressure:local --build-arg VITE_API_BASE_URL=http://localhost:3000 .
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

- `VITE_API_BASE_URL` (production example: `/api`, local Docker example: `http://localhost:3000`)
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

## Backend auth

The frontend expects the server to expose cookie-based auth and user-scoped BP routes:

- `GET /auth/session`
- `GET /auth/google/start`
- `POST /auth/logout`
- `GET /bpreadings`
- `POST /bpreading`
- `PUT /bpreading/:id`
- `DELETE /bpreading/:id`

Set `VITE_API_BASE_URL` to the backend base path.

- Production behind Traefik: `/api`
- Local Docker deployment with the backend published on port 3000: `http://localhost:3000`
- `npm run dev`: keep the default `/api`, which Vite proxies to `http://localhost:3000` and rewrites the path to the backend root

The backend itself serves these routes at the root path, so `curl http://localhost:3000/api` returning 404 is expected unless you add a reverse proxy that rewrites `/api` to `/`.
