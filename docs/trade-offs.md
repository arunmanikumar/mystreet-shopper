# Trade-offs

This document records intentional trade-offs and why each is appropriate for a foundation-stage project.

## JWT logout is client-side

Choice:
- Logout removes local token on client; server does not maintain token revocation list.

Why appropriate now:
- Keeps API stateless and simple.
- Avoids session storage or blacklist infrastructure.
- Works well for localhost development and short iteration loops.

## No refresh token

Choice:
- Access token only; no refresh token issuance/rotation.

Why appropriate now:
- Smaller auth surface area.
- Fewer token lifecycle edge cases.
- Faster implementation and easier debugging while core features stabilize.

## No real payment

Choice:
- Payment options are simulated (COD, UPI, Zelle labels only).

Why appropriate now:
- Removes PCI and gateway integration scope.
- Enables end-to-end order flow validation without financial risk.
- Fits a demo/foundation product focused on architecture and core flows.

## SizesCsv instead of normalized size table

Choice:
- Product sizes are stored as a comma-separated string.

Why appropriate now:
- Very fast to implement for simple sneaker size lists.
- Avoids extra join table and migration complexity in the first iteration.
- Keeps CRUD flows straightforward while product model is still evolving.

Constraint acknowledged:
- This is less normalized and less flexible for advanced inventory analytics.

## Basic stock management

Choice:
- Stock is reduced during order creation with straightforward checks.

Why appropriate now:
- Covers essential sellability constraints.
- Avoids reservation engines and complex inventory states.
- Good baseline for single-instance localhost usage.

## Local image URLs

Choice:
- Product images currently use simple URL strings.

Why appropriate now:
- No file upload pipeline needed yet.
- Keeps product create/update payloads easy to test.
- Avoids object storage/CDN concerns during foundation phase.

## Localhost-only deployment

Choice:
- The app is intended for localhost development only.

Why appropriate now:
- Fast onboarding and zero deployment overhead.
- Safer experimentation without production exposure.
- Matches project scope and privacy expectations.

## PostgreSQL as primary database

Choice:
- PostgreSQL is the main persistence target.

Why appropriate now:
- Strong relational capabilities and reliable local tooling.
- Good EF Core provider support.
- Aligns with realistic production-like relational behavior.

## SQLite optional fallback

Choice:
- SQLite can be used as an optional fallback by switching EF Core provider configuration for constrained environments.

Why appropriate now:
- Offers lightweight local option for contributors who cannot run PostgreSQL.
- Useful for quick prototyping and simplified CI setups.
- Keeps primary design relational while retaining practical flexibility.

Constraint acknowledged:
- PostgreSQL remains the canonical target and behavior reference.

## No advanced RBAC

Choice:
- Authorization uses a single `isAdmin` claim for admin routes.

Why appropriate now:
- Satisfies current admin/non-admin boundary requirements.
- Easy to maintain and test.
- Defers role/permission matrix complexity until business rules justify it.

## No distributed caching

Choice:
- No Redis or distributed cache layer.

Why appropriate now:
- Reduces infrastructure and invalidation complexity.
- Current workload and localhost scale do not need it.
- Keeps debugging deterministic and straightforward.

## No event-driven architecture

Choice:
- Core flows run synchronously in request-response handlers.

Why appropriate now:
- Easier to understand and trace for a small team.
- Avoids message brokers, retries, and eventual consistency concerns.
- Speeds feature delivery during foundation stage.

Constraint acknowledged:
- As domain complexity increases, selected workflows can be split into asynchronous events.

## Summary

These decisions intentionally optimize for:
- Simplicity
- Local developer productivity
- Clear architecture learning value

They are appropriate for a foundation project and keep future evolution paths open when scale and business requirements increase.
