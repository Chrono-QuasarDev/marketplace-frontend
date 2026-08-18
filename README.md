# Marketplace Frontend — README

This README explains the app structure, how the frontend runs, where to find specific features in the codebase, and how to develop and test locally.

Important note: the active app entrypoint is src/main.jsx which mounts src/App.jsx. AppRoutes/route-based pages, a separate Axios API layer, and Zustand stores were part of a legacy architecture and have been removed from the running app. The current app uses a context + services/api.js architecture and switches views with local state in App.jsx.

## Table of contents
- Quick start
- Architecture & runtime flow
- Where to find functionality (files & folders)
- Development scripts & mock server
- What was removed (legacy code)
- Contributing notes

---

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run full development environment (mock API + frontend):

   ```bash
   npm run dev
   ```

   - The mock API will attempt to start on port 3000 (resilient: it will try next ports if 3000 is taken). Set MOCK_PORT to prefer a port: `MOCK_PORT=3002 npm run dev:api`.
   - The frontend dev server (Vite) runs on 5173 by default. If 5173 is taken Vite will choose another free port.

3. Run frontend only:

   ```bash
   npm run dev:frontend
   ```

4. Run mock API only:

   ```bash
   npm run dev:api
   ```

5. Build production bundle:

   ```bash
   npm run build
   npm run preview
   ```


## Architecture & runtime flow (high level)

The app follows a simple, centralized flow:

```
main.jsx (/src/main.jsx)
  └── App.jsx (/src/App.jsx)
       ├── ToastProvider (/src/context/ToastContext.jsx)
       └── AuthProvider (/src/context/AuthContext.jsx)
            └── services/api.js (/src/services/api.js)
```

- main.jsx mounts App (no React Router used for main navigation).
- App.jsx contains MarketplaceApp which manages a currentView state ("marketplace", "orders", "seller", "admin", "profile"). Views are switched by updating this state and are rendered directly, not via routes.
- Global modal components (AuthModal, ProductDetailModal, Create/Edit product modals, OrderDetailModal, ReviewFormModal) are defined in src/components and controlled from App.jsx so they can be opened from multiple places.
- AuthContext handles authentication (login, signup, logout), stores token and API URL in localStorage and uses services/api.js to call the backend.
- services/api.js is the single canonical API surface: authApi, usersApi, productsApi, ordersApi, reviewsApi. It centralizes fetch requests, JSON parsing and error handling.


## Where to look for features (file pointers)

- Entry point: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/main.jsx
- App shell & view switching: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/App.jsx
- Authentication & user state: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/context/AuthContext.jsx
- Toasts: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/context/ToastContext.jsx
- API client: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/services/api.js
- Views: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/views/
  - Marketplace: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/views/MarketplaceView.jsx
  - Orders: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/views/OrdersView.jsx
  - Seller Studio: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/views/SellerStudioView.jsx
  - Admin: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/views/AdminView.jsx
  - Profile: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/views/ProfileView.jsx
- Key components (global): /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/
  - Navbar: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/Navbar.jsx
  - ToastContainer: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/ToastContainer.jsx
  - Modals: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/AuthModal.jsx, /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/ProductDetailModal.jsx, /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/CreateProductModal.jsx, /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/EditProductModal.jsx, /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/OrderDetailModal.jsx, /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/src/components/ReviewFormModal.jsx


## Development scripts & mock server

- package.json scripts:
  - `dev` — runs both mock API and frontend concurrently.
  - `dev:api` — runs the mock API server (mock-server.mjs).
  - `dev:frontend` — runs Vite frontend only.
  - `build` — production build.

- Mock server: /home/quasardev/Repos/afrif/marketplace-frontend.worktrees/cleanup-redundant-routing-architecture/mock-server.mjs
  - Attempts to bind to a default port (3000) or to the port set with the environment variable MOCK_PORT.
  - If the default port is taken it will try subsequent ports (up to a small number of attempts).
  - This mock implements endpoints compatible with services/api.js so the app works out-of-the-box.

## What was removed (legacy)

The repository previously contained a parallel route-based architecture and an Axios + Zustand implementation. Those were removed because the current entrypoint (src/main.jsx -> src/App.jsx) does not use them:
- src/AppRoutes.jsx and the old route pages under src/pages/ (deleted)
- src/api/ (Axios-based helpers) (deleted)
- src/stores/ (Zustand stores) (deleted)

If you need any of these removed files, they exist in commit history on branch `agents/cleanup-redundant-routing-architecture`.

Contributing notes & code organization suggestions
------------------------------------------------
- Keep services/api.js as the single VANILLA fetch-based API surface. If the file grows, split into modular files (services/api.auth.js, services/api.products.js, ...), and update AuthContext imports accordingly.
- Keep UI state that controls which view is shown in App.jsx (currentView) rather than introducing router-based navigation unless you intentionally switch to route-based UX.
- Use context providers for application-wide concerns (auth, toasts, feature flags) and pass callbacks into views to open global modals from anywhere.

Need help or more detail?
-------------------------
If you'd like a short architecture diagram, a contributor primer (how to add a feature), or specific instructions for testing particular flows (login, purchase, seller flow), tell me which area to expand and I will update this README accordingly.

---
_This README was regenerated to match the current running frontend architecture and to describe where things live in the codebase._
