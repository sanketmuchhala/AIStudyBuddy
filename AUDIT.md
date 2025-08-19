# AUDIT.md

This document outlines the audit of the AIStudyBuddy repository and the plan to refactor it for a single, Dockerized deployment on Railway.

## Current State & Issues

1.  **Deployment:** The `README.md` provides deployment instructions for Netlify, Vercel, and GitHub Pages. These are now obsolete and will be removed. The `DEPLOYMENT.md` is for Railway but needs updates. There are also shell scripts for deployment (`deploy.sh`, `deploy-railway.sh`) that will be replaced by the `railway.json` configuration.
2.  **CORS:** The frontend and backend are separate projects (`client` and `server`), which will lead to CORS issues if not handled. The plan is to serve the frontend as static files from the Express server to eliminate CORS problems in production.
3.  **Backend:** The backend is in the `server` directory. It needs to be refactored to align with the new API structure, including a `/healthz` endpoint, streaming chat, and quick action endpoints.
4.  **Environment Variables:** The environment variable handling is inconsistent. `DEPLOYMENT.md` mentions `OPENAI_API_KEY`, but the new implementation will use `GEMINI_API_KEY` or `GOOGLE_API_KEY`. A `PROVIDER` environment variable will be used to switch between `gemini` and a `mock` provider. A `.env.example` file needs to be created at the root level.
5.  **Scripts:** The `package.json` files in `client` and `server` have their own scripts. Root-level scripts for concurrent development, building, and starting the application are missing.
6.  **Docker:** A `Dockerfile` exists, but it needs to be reviewed and updated to a multi-stage build that handles both the frontend and backend.
7.  **CI/CD:** A GitHub Actions workflow exists in `.github/workflows/ci.yml`. It will be updated to run tests, build the Docker image, and optionally deploy to Railway.
8.  **Frontend:** The frontend needs to be updated to communicate with the new API endpoints on the same origin. The API calls need to be updated to use the new endpoints.

## Plan

The plan is to execute the following steps as outlined in the prompt:

- **A) Server Refactoring:** Refactor the Express server to serve the static frontend, provide the specified API endpoints, and handle errors and logging.
- **B) Frontend Refactoring:** Update the Vite/React frontend to communicate with the new same-origin API endpoints.
- **C) Config & Scripts:** Create root-level `package.json` scripts and a `.env.example` file.
- **D) Dockerization:** Create a new multi-stage `Dockerfile`.
- **E) Railway Configuration:** Create a `railway.json` file for deployment.
- **F) Testing & CI:** Add Vitest and Playwright tests and update the GitHub Actions workflow.
- **G) Polishing:** Improve the README, add a CHANGELOG, and address any remaining issues.
