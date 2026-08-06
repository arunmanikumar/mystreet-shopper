# Git Workflow

This repository uses a simple branch and review flow that keeps `main` stable and easy to release.

## Branching model

- `main` is the stable branch.
- All new work should happen in `feature/*` branches.
- Pull requests are required before merging to `main`.

Example branches:
- `feature/authentication`
- `feature/product-catalog`
- `feature/shopping-cart`
- `feature/orders`
- `feature/admin-products`
- `feature/unit-tests`

## Commit expectations

Commit messages should be meaningful and specific. Prefer short imperative summaries that describe the change, not the implementation detail.

Good examples:
- `Add JWT login token handling`
- `Implement product filtering service`
- `Add cart reducer tests`
- `Document checkout flow in README`
- `Fix order stock validation`
- `Add Postman collection for API`

Avoid vague messages like:
- `update`
- `fix`
- `stuff`
- `changes`

## Repository hygiene

Do not commit:
- Generated folders such as `bin`, `obj`, `dist`, `node_modules`, or build output
- Secrets or credentials
- Local environment files containing private values

Keep commits focused on a single logical change when possible. That makes reviews simpler and reduces merge risk.

## Suggested workflow

1. Create a branch from `main`.
2. Make the change in a small, reviewable set of commits.
3. Run the relevant build and test commands.
4. Open a pull request into `main`.
5. Review and merge only after checks pass.

## Why this workflow works here

The project is small enough that a lightweight process is enough, but it still benefits from:
- a stable main branch
- isolated feature work
- explicit review before merge
- clean commit history

This keeps the repo easy to understand and lowers the chance of accidentally merging generated files or secrets.
