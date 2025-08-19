# Changelog

## [Unreleased] - 2025-08-19

### Added
-   Single Dockerized service for deployment on Railway.
-   Frontend served as static files from the same Express server to eliminate CORS.
-   Root-level scripts for development, building, and starting the application.
-   Multi-stage Dockerfile for optimized builds.
-   `railway.json` for configuration-as-code deployment on Railway.
-   Vitest unit tests for the API client and server routes.
-   Playwright E2E test for the chat streaming happy path.
-   GitHub Actions workflow for CI/CD.
-   `CHANGELOG.md` to track changes.

### Changed
-   Refactored the Express server to a single-origin setup.
-   Updated the health check endpoint to `/healthz`.
-   Simplified the frontend API configuration to use same-origin requests.
-   Updated the `README.md` with new local development and deployment instructions.

### Removed
-   Obsolete deployment instructions for Netlify, Vercel, and GitHub Pages from `README.md`.
-   Old deployment scripts.
