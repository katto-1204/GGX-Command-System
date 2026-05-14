# Vercel Deployment Variables

Use these values in the Vercel project settings for the frontend. Keep real secrets out of the repository.

## Frontend

- `VITE_API_URL=https://<your-deployed-backend-host>`
- `VITE_SUPABASE_URL=https://<your-project>.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<anon-key>`

## Backend

Deploy the Express API separately on a Node host such as Render, Railway, or Fly.io.

Required backend variables on that host:

- `DATABASE_URL=<postgresql-connection-string>`
- `SESSION_SECRET=<random-long-secret>`
- `PORT=8080`

## Local Development

- Copy the relevant variables into your local `.env` file.
- Do not commit `.env` or any other secret file.
- Leave `VITE_API_URL` empty locally if you want Vite to proxy `/api` to the backend on `localhost:8080`.

## Notes

- `DATABASE_URL` is required by the API server.
- `SESSION_SECRET` is required to sign auth tokens.
- `VITE_API_URL` is read by the frontend at build time.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read by the frontend at build time.
