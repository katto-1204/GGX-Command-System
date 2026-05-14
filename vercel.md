# Vercel Deployment Variables

Use these values in the Vercel project settings. Keep real secrets out of the repository.

## Vercel Build

- `DATABASE_URL=<postgresql-connection-string>`
- `SESSION_SECRET=<random-long-secret>`
- `VITE_SUPABASE_URL=https://<your-project>.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<anon-key>`

## Runtime

- `PORT=8080`
- `WEB_PORT=5174`

## Local Development

- Copy the same variables into your local `.env` file.
- Do not commit `.env` or any other secret file.
- Replace placeholders with your own production or development values outside the repository.

## Notes

- `DATABASE_URL` is required by the API server.
- `SESSION_SECRET` is required to sign auth tokens.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read by the frontend at build time.
- `PORT` and `WEB_PORT` are used for local startup defaults.
