# Marketplace Frontend

A modern, responsive React + Tailwind CSS frontend application built for the **Marketplace API** ([single-item marketplace](https://github.com/Chrono-QuasarDev/marketplace-api.git)).

---

## Features & Capabilities

### 1. 🔐 Complete Authentication & User Management
- **Sign Up** (`POST /api/auth/signup`): Create new accounts (`username`, `email`, `password`) defaulting to `buyer` role.
- **Sign In** (`POST /api/auth/login`): Authenticates credentials and stores JWT Bearer token.
- **Profile** (`GET /api/users/profile`): Displays profile, roles (`buyer`, `seller`, `admin`), and user ID.
- **Update Profile** (`PUT /api/users/profile`): Edit username in real-time.
- **Role-Based Experience**: Tailors navigation and features based on active user role.
- **Quick Account Switcher**: Easily test between `buyer1`, `seller1`, and custom accounts.

### 2. 🛍️ Marketplace & Product Discovery
- **Paginated Listing Catalog** (`GET /api/products`):
  - Category filters (Electronics, Home, Fashion, Sports, Books, Beauty, Office, Grocery, Toys, Garden, Vehicles).
  - Search keyword filtering by title, category, and description.
  - Stock availability toggle (All, In Stock, Sold Out).
  - Sorting by `createdAt` (Newest/Oldest), `price` (Low to High / High to Low), and `title` (A-Z / Z-A).
  - Pagination controls (`page`, `size`).
- **Product Card & Gallery**: Multi-image preview with fallback image rendering for broken or sample links, category badges, seller attribution, and stock status.

### 3. 🔍 Product Deep Dive & One-Click Purchasing
- **Product Details Modal** (`GET /api/products/:id`):
  - Interactive multi-image gallery with zoom and thumbnails.
  - Price, availability status, full description, and seller details.
  - **Purchase Action** (`POST /api/orders/purchase`): Allows buyers to purchase available items (automatically locking inventory and setting status to `Sold Out`).

### 4. 🏪 Seller Studio & Inventory Management
- **Create Listing** (`POST /api/products`):
  - Allowed for `seller` role.
  - Required fields: title, description, category, positive price, image URLs array, availability.
- **Edit Listing** (`PUT /api/products/:id`):
  - Update title, description, price, category, images, and toggle availability.
- **Delete Listing** (`DELETE /api/products/:id`):
  - Delete own products with confirmation.
- **Seller Fulfillment Board**:
  - Live incoming orders on seller's products.
  - Step-by-step state transition triggers conforming strictly to API rules:
    - `pending` ➔ `processing` or `cancelled`
    - `processing` ➔ `shipped` or `cancelled`
    - `shipped` ➔ `delivered` or `cancelled`

### 5. 📦 Order Management & Tracking
- **Order History** (`GET /api/orders`):
  - Filter tabs (`All`, `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Progress tracker showing the complete shipment timeline.
  - Order details modal with buyer/seller UUIDs, timestamps, and pricing.

### 6. ⭐ Verified Customer Reviews
- **Product Reviews** (`GET /api/reviews/:productId`):
  - Filter by star ratings (1 to 5 stars).
  - Sort by newest or rating.
  - Calculated rating averages and breakdown.
- **Submit Review** (`POST /api/reviews`):
  - Verified purchase requirement enforced (order must be in `delivered` status).
  - Interactive 1–5 star rating picker and comment input.
- **Edit & Delete Reviews** (`PUT /api/reviews/:id`, `DELETE /api/reviews/:id`).

### 7. 🛡️ Admin Panel
- System-wide overview of all products and transactions.
- Admin status overrides and review moderation.

### 8. ⚙️ Live API Configuration & Diagnostics
- Configurable base API URL (`/api` proxy or custom backend address).
- Connection status indicator with real-time ping testing.
- Active JWT Bearer Token viewer with one-click copy.

---

## Running the Application

### Development Mode

```bash
cd marketplace-frontend
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## API Contract Reference

| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | Public |
| `POST` | `/api/auth/login` | Login user & receive token | Public |
| `GET` | `/api/users/profile` | Get current user profile | Auth (Bearer) |
| `PUT` | `/api/users/profile` | Update username | Auth (Bearer) |
| `GET` | `/api/products` | Paginated product list | Auth (buyer, seller, admin) |
| `GET` | `/api/products/:id` | Get single product | Auth |
| `POST` | `/api/products` | Create product listing | Auth (seller) |
| `PUT` | `/api/products/:id` | Update product | Auth (seller / owner) |
| `DELETE` | `/api/products/:id` | Delete product | Auth (seller / owner) |
| `POST` | `/api/orders/purchase` | Purchase a product | Auth (buyer) |
| `GET` | `/api/orders` | Get user order history | Auth (buyer, seller, admin) |
| `GET` | `/api/orders/:id` | Get order details | Auth |
| `PATCH` | `/api/orders/:id` | Advance order status | Auth (seller, admin) |
| `POST` | `/api/reviews` | Review delivered order | Auth (buyer) |
| `GET` | `/api/reviews/:id` | Get product reviews | Auth |
| `PUT` | `/api/reviews/:id` | Edit own review | Auth (review owner) |
| `DELETE` | `/api/reviews/:id` | Delete review | Auth (buyer owner, admin) |
