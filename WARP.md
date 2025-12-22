# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands (npm)
- Install deps: `npm install`
- Dev server (Vite): `npm run dev`
- Production build: `npm run build`
- Preview production build locally: `npm run preview`
- Lint (ESLint flat config): `npm run lint`
- Lint a single file: `npx eslint src/routes/AppRoutes.jsx`

Notes
- This repo currently has no test runner configured (no `test` script / Jest/Vitest deps). If tests are added, document the exact `npm run test` (and single-test) invocations here.

## Tech stack (as implemented)
- React (React 19) + Vite
- React Router (`react-router-dom`) for routing
- TanStack React Query for server-state fetching/caching
- Axios for HTTP
- Tailwind CSS for styling
- Recharts for charts
- lucide-react for icons

## High-level architecture
### App bootstrap
- Entry point is `src/main.jsx`: mounts React, wraps the app in:
  - `QueryClientProvider` (see `src/api/queryClient.js`)
  - `BrowserRouter`
- `src/App.jsx` is intentionally thin and delegates to the routing layer.

### Routing & layouts
- Route definitions live in `src/routes/AppRoutes.jsx`.
  - Pages are code-split via React `lazy()` in `src/routes/lazyPages.js` and rendered under a top-level `<Suspense>`.
  - Public/auth routes render under `src/layouts/AuthLayout.jsx`.
  - Authed routes render under `src/layouts/DashboardLayout.jsx` (Topbar + Sidebar + `<Outlet>`).
- Centralized path helpers are in `src/routes/routePaths.js`.

### Auth model (client-side)
- Auth is a simple bearer token stored in `localStorage` under the key `tesoro_token` (see `src/utils/authToken.js`).
- `src/routes/ProtectedRoute.jsx` gates the dashboard area:
  - If no token is present, it redirects to `/login` and preserves the intended destination in router `state.from`.
- Login UI is currently a “paste token” flow (`src/pages/Auth/LoginPage.jsx`) that writes directly to `localStorage`.

### Data access: Axios + services + React Query hooks
- Axios client is defined in `src/api/http.js`:
  - `baseURL` is taken from `import.meta.env.VITE_API_BASE_URL` (defaults to empty string).
  - A request interceptor attaches `Authorization: Bearer <token>` when a token exists.
  - A response interceptor clears the token on `401`.
- Endpoint strings are centralized in `src/api/endpoints.js`.
- “Service” modules (`src/api/services/*.js`) are thin wrappers around `http` + `endpoints` and return `res.data`.
- React Query hooks live in `src/hooks/*Query.js` and are the preferred way for pages to fetch data.
  - List queries generally use `placeholderData: (prev) => prev` to keep previous-page results while paginating.
  - Query defaults (staleTime, retry, etc.) are set in `src/api/queryClient.js`.

### Screens and reusable UI
- Route-level screens are in `src/pages/**`.
- Reusable building blocks are grouped under `src/components/`:
  - `ui/` for small primitives (Button, Card, Input, etc.)
  - `tables/` for list/table rendering + pagination
  - `charts/` for Recharts-based widgets
- Styling is Tailwind-first; global Tailwind directives are in `src/index.css`.

## Established patterns to follow when extending
- Adding a new API call:
  1) Add/extend the path in `src/api/endpoints.js`
  2) Add a function in `src/api/services/<domain>Service.js`
  3) Add a React Query hook in `src/hooks/` (queryKey should include relevant params)
  4) Use the hook from a page/component
- Adding a new page/route:
  1) Create the page under `src/pages/...`
  2) Export it from `src/routes/lazyPages.js` for code-splitting
  3) Add a `<Route>` in `src/routes/AppRoutes.jsx`
  4) Add a path helper in `src/routes/routePaths.js` (and sidebar entry if needed)
