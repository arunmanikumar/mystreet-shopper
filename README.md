# MyStreet Shoppers

MyStreet Shoppers is a localhost-only sneakers ecommerce foundation project.

It has:
- A .NET Web API backend with JWT authentication, product management, and order flows
- A React frontend with product browsing, cart, checkout simulation, and admin screens
- PostgreSQL as the primary database through EF Core

## Project overview

MyStreet Shoppers demonstrates a practical full-stack baseline for local development and feature expansion.

The project intentionally prioritizes:
- Clear code structure over framework complexity
- Simple authentication and authorization suitable for a starter product
- Local-first operation and development speed

## Features

- User registration and login with JWT
- Admin-restricted product create, update, and delete
- Product listing, filtering, and details
- Cart persisted in browser localStorage
- Checkout flow and order creation
- My orders and order details
- API exception handling with structured error responses
- Seeded default users and starter product catalog

## Architecture

Documentation:
- [docs/architecture.md](docs/architecture.md)
- [docs/trade-offs.md](docs/trade-offs.md)

Summary:
- API controllers orchestrate requests and authorization boundaries
- Application contracts and interfaces define service/repository boundaries
- Infrastructure implements services, repositories, JWT, password hashing, and EF Core persistence
- Domain contains core entities

## Technology stack

- Backend: ASP.NET Core Web API (.NET 10), Entity Framework Core, Npgsql, JWT Bearer Auth, Swagger
- Frontend: React 19, Vite 8, TypeScript 6, React Router 7, Axios, Tailwind CSS 4
- Testing:
- Backend: xUnit, Moq, FluentAssertions, coverlet collector
- Frontend: Vitest, React Testing Library, jsdom
- Database: PostgreSQL (primary)

## Prerequisites

- .NET SDK 10.x
- Node.js 20+ and npm
- PostgreSQL 15+ (local install or Docker)

Optional:
- dotnet-ef tool for migration commands

```powershell
dotnet tool install --global dotnet-ef
```

## Docker PostgreSQL setup

Run PostgreSQL in Docker:

```powershell
docker run --name mystreet-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=te$t1234 -e POSTGRES_DB=mystreet -p 5432:5432 -d postgres:16
```

Stop and start:

```powershell
docker stop mystreet-postgres
docker start mystreet-postgres
```

## Local PostgreSQL setup

1. Install PostgreSQL locally.
2. Create database and user credentials matching backend configuration.
3. Ensure this connection string works:

```text
Host=localhost;Port=5432;Database=mystreet;Username=postgres;Password=te$t1234
```

The current default is in [backend/MyStreet.Api/appsettings.json](backend/MyStreet.Api/appsettings.json).

## Port configuration

- Backend HTTP: http://localhost:5197
- Backend HTTPS: https://localhost:7204
- Frontend dev: http://localhost:5173
- PostgreSQL: localhost:5432

Backend launch profile ports are in [backend/MyStreet.Api/Properties/launchSettings.json](backend/MyStreet.Api/Properties/launchSettings.json).

## Environment configuration

Copy [frontend/mystreet-ui/.env.example](frontend/mystreet-ui/.env.example) to `.env` and set:

```bash
VITE_API_URL=http://localhost:5197/api
```

## Database migration commands

From [backend](backend):

Add migration:

```powershell
dotnet ef migrations add <MigrationName> --project MyStreet.Infrastructure --startup-project MyStreet.Api
```

Apply migrations:

```powershell
dotnet ef database update --project MyStreet.Infrastructure --startup-project MyStreet.Api
```

List migrations:

```powershell
dotnet ef migrations list --project MyStreet.Infrastructure --startup-project MyStreet.Api
```

Note: App startup already calls `Database.Migrate()` via the DB seeder.

## Backend startup

From [backend](backend):

```powershell
dotnet restore
dotnet build
dotnet run --project MyStreet.Api
```

Swagger UI:
- http://localhost:5197/swagger

Health:
- http://localhost:5197/health

## Frontend startup

From [frontend/mystreet-ui](frontend/mystreet-ui):

```powershell
npm install
npm run dev
```

Production build:

```powershell
npm run build
npm run preview
```

## Default users

Seeded in [backend/MyStreet.Infrastructure/Data/DbSeeder.cs](backend/MyStreet.Infrastructure/Data/DbSeeder.cs):

- Admin user
- Email: admin@mystreet.com
- Password: Admin@123
- Regular user
- Email: user@mystreet.com
- Password: User@123

## API list

Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

Products:
- GET /api/products
- GET /api/products/{id}
- POST /api/products (Admin only)
- PUT /api/products/{id} (Admin only)
- DELETE /api/products/{id} (Admin only)

Orders (Authenticated):
- POST /api/orders
- GET /api/orders/mine
- GET /api/orders/{id}

Utility:
- GET /health
- GET /

## Test commands

Backend tests from [backend](backend):

```powershell
dotnet test .\MyStreet.Tests\MyStreet.Tests.csproj
```

Frontend tests from [frontend/mystreet-ui](frontend/mystreet-ui):

```powershell
npm test
```

## Coverage instructions

Backend coverage (coverlet collector):

```powershell
dotnet test .\MyStreet.Tests\MyStreet.Tests.csproj --collect:"XPlat Code Coverage"
```

Coverage file output pattern:
- [backend/MyStreet.Tests/TestResults](backend/MyStreet.Tests/TestResults) -> <guid>/coverage.cobertura.xml

Optional report generation with ReportGenerator:

```powershell
dotnet tool install --global dotnet-reportgenerator-globaltool
reportgenerator -reports:backend/MyStreet.Tests/TestResults/*/coverage.cobertura.xml -targetdir:backend/MyStreet.Tests/TestResults/CoverageReport -reporttypes:Html
```

## Postman instructions

Collection file:
- [postman/MyStreet.Shoppers.postman_collection.json](postman/MyStreet.Shoppers.postman_collection.json)

Included requests:
- Register
- Login
- Get Products
- Filter Products
- Get Product
- Create Product
- Update Product
- Delete Product
- Create Order
- My Orders
- Order Details

Collection variables:
- baseUrl
- token
- adminToken
- productId
- orderId

Login automation:
- The Login request test script stores `token` automatically.
- If the logged-in user is admin, it also stores `adminToken`.

Suggested usage order:
1. Login as admin to set `adminToken`.
2. Create Product to populate `productId`.
3. Login as regular user to set `token`.
4. Create Order to populate `orderId`.
5. Run My Orders and Order Details.

## Troubleshooting

- Frontend cannot reach API:
- Verify `VITE_API_URL` in your frontend `.env` (template: [frontend/mystreet-ui/.env.example](frontend/mystreet-ui/.env.example))
- Confirm backend is running at http://localhost:5197

- CORS issues:
- Ensure frontend is running on http://localhost:5173
- Confirm CORS policy in [backend/MyStreet.Api/Program.cs](backend/MyStreet.Api/Program.cs)

- Database connection errors:
- Confirm PostgreSQL is running on port 5432
- Verify credentials in [backend/MyStreet.Api/appsettings.json](backend/MyStreet.Api/appsettings.json)

- Auth 401 on protected routes:
- Ensure `Authorization: Bearer <token>` is present
- Re-run Login in Postman to refresh collection variables

- EF package warning MSB3277:
- A known version conflict warning may appear during backend test/build
- This has been non-blocking in current local runs

## Privacy statement

This project is designed for local development only.

It includes:
- No analytics
- No telemetry
- No execution tracking
- No remote logging
- No real payments
- Localhost deployment only

No outbound data collection is intentionally implemented in this repository.
