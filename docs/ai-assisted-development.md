# AI-Assisted Development

This project allows AI assistance when it improves speed, clarity, or consistency, but the implementation remains human-reviewed and human-owned.

## Appropriate AI usage

AI can be used for:
- Project scaffolding
- DTO boilerplate
- Test case suggestions
- Debugging migrations
- Explaining JWT
- Refactoring React components
- Reviewing validation
- Improving README content

## Representative prompts

Project scaffolding:
- "Create a minimal ASP.NET Core API project structure with controllers, services, repositories, and EF Core setup."

DTO boilerplate:
- "Generate request and response DTOs for product and order flows with validation attributes."

Test case suggestions:
- "Suggest meaningful xUnit test cases for the order service, including invalid size and stock checks."

Debugging migrations:
- "Help diagnose why an EF Core migration fails against PostgreSQL and suggest a safe fix."

Explaining JWT:
- "Explain how JWT authentication works in this app and how the token is validated by ASP.NET Core."

Refactoring React components:
- "Refactor this React page into smaller components without changing behavior."

Reviewing validation:
- "Review this checkout validation logic and point out missing edge cases."

Improving README:
- "Rewrite this README section so it is clearer for new contributors and includes run commands."

## Required guardrails

- Generated code was reviewed before being committed.
- Builds and tests were run after AI-assisted changes.
- Secrets were not shared with AI.
- AI was not used for telemetry or tracking.
- The developer remains responsible for the implementation.

## Usage guidance

AI is best used as an accelerator for repetitive work, documentation, and first-pass ideas. It should not replace understanding the codebase, verifying behavior, or making final design decisions.

When AI output is accepted, the result should still be checked against:
- the current code style
- the project architecture
- build and test results
- security and privacy constraints
