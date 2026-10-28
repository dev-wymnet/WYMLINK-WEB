# Wymlink Web

The Wymlink website, customer web app and staff admin console (Next.js).

- `/`: the public site (services, about, FAQ, blog)
- `/auth/*`, `/dashboard/*`: the customer web app
- `/admin/*`: the staff console (two-step sign-in with an authenticator app)

The browser never calls the backend directly: everything goes through this app's own
server routes (`/api/bff`, `/api/admin/bff`, `/api/session`, `/api/admin/session`), which
keep tokens in httpOnly cookies.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Environment

| Variable | What it is |
| --- | --- |
| `API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL` | Backend API, e.g. `https://wymlink-backend.onrender.com/api/v1` |
| `BFF_SHARED_SECRET` | Same value as the backend's `BFF_SHARED_SECRET` (lets it trust the client IP this server reports) |
| `NEXT_PUBLIC_BASE_URL` | The site's public address |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | The blog's Sanity project (public values) |
| `SANITY_API_WRITE_TOKEN` | Optional. Sanity Editor token so staff can write blog posts from `/admin/blog` |

## Deploy (Vercel)

Import the repository, add the variables above, deploy. No other settings are needed.

## Useful scripts

- `npm run build`: production build
- `npm run lint`: lint
- `node scripts/build-icons.mjs`: regenerate `components/app/icons.tsx` from the Iconify sets after changing the icon list
