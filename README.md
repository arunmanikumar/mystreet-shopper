# MyStreet Shoppers

MyStreet Shoppers is a sneakers shopping experience focused on browsing, saving, and ordering products from a clean storefront.

## What customers can do

- Browse featured sneakers and product collections
- View product details, sizes, and availability
- Add items to a cart and adjust quantities
- Sign in to manage a personal shopping session
- Place an order and review purchase history

## Customer experience

The storefront is designed to keep the shopping flow simple:

- Product discovery comes first
- Cart and checkout stay lightweight
- Account access is available when needed
- The interface is optimized for local shopping demos and previews

## At a glance

- Modern React storefront
- Fast product browsing
- Persistent cart experience
- Order history for signed-in customers

---

## Setup guide

### Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 8.0+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |

### 1. Database

**Option A — Docker (recommended)**

```bash
docker run --name mystreet-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=te$t1234 \
  -e POSTGRES_DB=mystreet \
  -p 5432:5432 \
  -d postgres:16
```

**Option B — Local PostgreSQL**

Create a database named `mystreet` with user `postgres` and password ``, listening on port `5432`.

The connection string is already configured in `backend/MyStreet.Api/appsettings.json`:

```
Host=localhost;Port=5432;Database=mystreet;Username=postgres;Password=te$t1234
```

### 2. Apply database migrations

```bash
cd backend
dotnet ef database update --project MyStreet.Infrastructure --startup-project MyStreet.Api
```

### 3. Start the backend

```bash
cd backend/MyStreet.Api
dotnet run
```

API runs at: `http://localhost:5197`

### 4. Start the frontend

```bash
cd frontend/mystreet-ui
npm install
npm run dev
```

UI runs at: `http://localhost:5173`

### Port reference

| Service | URL |
|---------|-----|
| Backend API | http://localhost:5197 |
| Frontend (dev) | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

---

## Running tests

### Backend

```bash
cd backend
dotnet test
```

With coverage:

```bash
dotnet test MyStreet.sln --collect:"XPlat Code Coverage"
```

### Frontend

```bash
cd frontend/mystreet-ui
npm test
```

---

## Postman

Import `postman/MyStreet.Shoppers.postman_collection.json` into Postman to explore and test the API endpoints.

---

## Privacy

- No analytics, telemetry, or remote logging
- No real payment processing
- Runs entirely on localhost — no data leaves your machine

---

## Sample AI prompt used to scaffold this project

The following prompt was used with GitHub Copilot to generate the initial boilerplate for this project:

```
Create a localhost-only sneakers ecommerce web app called "MyStreet Shoppers".

Backend:
- .NET 8 Minimal APIs / Controllers
- Clean architecture: Domain, Application, Infrastructure, Api layers
- PostgreSQL via Entity Framework Core
- JWT authentication (register + login endpoints)
- Entities: User, Product (name, brand, price, sizes, stock), Order, OrderItem
- Repository pattern with interfaces in Application layer
- Seed a default admin and customer user on startup

Frontend:
- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls with a shared apiClient
- Pages: Home, Products, Product Detail, Cart, Checkout, Order History, Login, Register, Admin
- Context for auth and cart state
- Zod + React Hook Form for checkout validation

Testing:
- Backend: xUnit unit tests for services and repositories (use in-memory or mocked DbContext)
- Frontend: Vitest unit tests for services and utilities

Constraints:
- No analytics, telemetry, or outbound data collection
- No real payment integration
- Localhost deployment only
```
