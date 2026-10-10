# CareerAI Phase 1

CareerAI's first working slice covers account creation and login, the dashboard, PDF resume storage and text extraction, keyword-based skill identification, target role selection, and a skill-gap view. Resume files and profile data are stored by the local FastAPI service in PostgreSQL.

## Start the project

Requirements: Node.js/npm and Docker Desktop with Docker Compose.

1. Start PostgreSQL and the API from the project root:

   ```powershell
   docker compose up --build
   ```

   The API docs are at <http://localhost:8000/docs>; its health endpoint is <http://localhost:8000/api/health>.

2. In a second terminal, install and start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

3. Open <http://localhost:5173> and register an account. Use at least 8 characters for the password.

To stop the services, press Ctrl+C in the Docker terminal. `docker compose down` stops containers and keeps the local database volume. `docker compose down -v` also deletes the saved local database.

For anything beyond a local demo, set unique `POSTGRES_PASSWORD` and `JWT_SECRET` values in a `.env` file before starting Compose. Do not commit real secrets.

## Team ownership and delivered work

These are the project responsibilities from the team brief, mapped to this implementation so each member can review and own their part.

| Member | Responsibility | Work represented here |
| --- | --- | --- |
| Harsh | React UI | Landing and auth screens, dashboard, resume and skill-gap pages, API integration, and readable responsive styling (`src/`). |
| Ayush | FastAPI and PostgreSQL | Registration/login API, token-based sessions, user profile and target role, resume upload/list/delete API, and database models (`backend/app/main.py`). |
| Madhukar | Resume/skill analysis prototype | Text-based PDF extraction, deterministic skill identification, starter role requirements, and skill-gap response in the API. This is a baseline prototype, not LLM/RAG yet. |
| Pravesh | Local service/container foundation | Docker Compose setup for the API and PostgreSQL (`docker-compose.yml`, `backend/Dockerfile`). Coding execution, STT, and TTS are later-phase tasks. |

## Phase boundary

The first slice intentionally excludes the LLM/RAG pipeline, AI interview question generation and evaluation, roadmap generation, coding execution, speech-to-text, and text-to-speech. PDF analysis reads selectable text; scanned-PDF OCR is not included. Passwords are hashed and API requests use bearer tokens, but the sample Docker secrets must be replaced before sharing or deployment. The schema is created automatically for local development; production migrations, deployment hardening, password reset, and email verification are not included.
