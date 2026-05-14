# Deploy Backend to Railway

This guide deploys only the GGX / Quepon backend API to Railway.

The backend package is:

```txt
artifacts/api-server
```

The repo is a shared pnpm workspace, so deploy from the repository root, not only from `artifacts/api-server`.

## 1. Prepare The Repository

Make sure your latest code is pushed to GitHub.

Run these locally first:

```bash
corepack pnpm run typecheck
corepack pnpm --filter @workspace/api-server run build
```

If both pass, commit and push your changes.

## 2. Create A Railway Project

1. Open Railway.
2. Click `New Project`.
3. Choose `Deploy from GitHub repo`.
4. Select this repository.
5. Create one service for the backend API.

If Railway auto-detects multiple workspace services, choose the API service or create a separate service for `@workspace/api-server`.

## 3. Configure The Backend Service

Open the backend service, then go to `Settings`.

Use these values:

```txt
Root Directory: /
Build Command: corepack pnpm --filter @workspace/api-server run build
Start Command: corepack pnpm --filter @workspace/api-server run start
```

Do not set the root directory to `artifacts/api-server`, because the API imports shared workspace packages such as `@workspace/db`.

## 4. Add Environment Variables

Open the Railway backend service, then go to `Variables`.

Add:

```txt
NODE_ENV=production
SESSION_SECRET=use-a-long-random-secret
DATABASE_URL=your-postgres-connection-string
```

Do not manually set `PORT` unless you have a specific reason. Railway provides `PORT`, and the backend already requires `process.env.PORT`.

If you are using Supabase Postgres, use the Supabase connection string:

```txt
postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?sslmode=require
```

If you are using Railway Postgres, add a PostgreSQL service in the same Railway project and set `DATABASE_URL` from Railway's generated Postgres variable.

## 5. Apply Database Schema

After setting `DATABASE_URL`, apply the Drizzle schema.

From your local machine, use the same production database URL:

```bash
corepack pnpm --filter @workspace/db run push
```

This matters because sessions now save fields like:

```txt
session_type
allocated_amount
max_cost
wallet_balance_at_start
duration_seconds
```

Without the schema update, session creation can fail in production.

## 6. Deploy

In Railway:

1. Open the backend service.
2. Click `Deploy`.
3. Wait for build and deploy logs to finish.

Expected successful flow:

```txt
install dependencies
build @workspace/api-server
start @workspace/api-server
Server listening
```

## 7. Test The Backend

Open the generated Railway domain.

Test the health route:

```txt
https://your-backend.up.railway.app/api/healthz
```

Expected result:

```json
{
  "status": "ok"
}
```

## 8. Connect The Frontend

Set the frontend API base URL to the Railway backend domain.

Use:

```txt
https://your-backend.up.railway.app
```

Do not include `/api` if the frontend helper already appends API paths.

## 9. Update CORS If Needed

The backend currently allows these origins in:

```txt
artifacts/api-server/src/app.ts
```

Allowed frontend origins include:

```txt
http://localhost:5174
http://127.0.0.1:5174
https://quepon.vercel.app
https://ggx-quepon.vercel.app
*.vercel.app
```

If your frontend is deployed on a different domain, add it to `allowedOrigins`, then redeploy the backend.

Example:

```ts
const allowedOrigins = new Set([
  "https://your-frontend-domain.com",
]);
```

## 10. Common Errors

### Error: PORT environment variable is required

Railway should provide `PORT` automatically. Check that the service is deployed as a web service and that the start command is:

```txt
corepack pnpm --filter @workspace/api-server run start
```

### Error: database connection failed

Check `DATABASE_URL`.

For Supabase, make sure the URL includes:

```txt
sslmode=require
```

### Error: column does not exist

Run:

```bash
corepack pnpm --filter @workspace/db run push
```

Make sure it points to the same production database used by Railway.

### Frontend gets CORS errors

Add the deployed frontend domain to `allowedOrigins` in:

```txt
artifacts/api-server/src/app.ts
```

Then redeploy the backend.

## 11. Recommended Railway Settings

Use these watch paths so backend deploys only run when backend or shared packages change:

```txt
/artifacts/api-server/**
/lib/db/**
/lib/api-zod/**
/lib/api-spec/**
/pnpm-lock.yaml
/pnpm-workspace.yaml
/package.json
```

Keep the backend and frontend as separate Railway services if you deploy both to Railway.

