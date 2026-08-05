# MyStreet Shoppers

A local ecommerce storefront for sneakers with a .NET backend API and React frontend.

## Features

- Browse a curated sneaker catalog
- Add items to cart
- Submit a local checkout order request
- Localhost-only configuration with no analytics or remote logging

## Build and run

### Backend

```powershell
cd mystreet-shoppers\backend
dotnet build
```

### Frontend

```powershell
cd mystreet-shoppers\frontend
npm install
npm run build
```

### Run locally

```powershell
cd mystreet-shoppers\backend
dotnet run
```

```powershell
cd mystreet-shoppers\frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5173`.
