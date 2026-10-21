# CareerAI Phase 1

CareerAI's Phase 1 working slice covers account creation and login, the dashboard, PDF resume storage and text extraction, keyword-based skill identification, target role selection, and a skill-gap view. It also includes an optional retrieval-augmented career assistant: it chunks resume text, creates embeddings, retrieves relevant resume and role-guide passages, and asks a language model to answer with source names. Resume files, extracted text, and vectors are stored in PostgreSQL.

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

### Optional RAG assistant

The rest of the application works without an AI provider key. To enable the assistant, copy `.env.example` to `.env`, then set `OPENAI_API_KEY` and `RAG_CHAT_MODEL` to a Responses API model available to your account. The embedding model defaults to `text-embedding-3-small`. Restart/rebuild the API with `docker compose up --build`; upload a text-based resume or ask a question to index an already saved resume. The first assistant question also creates the shared role-guide embeddings. OpenAI API usage may incur charges. When enabled, extracted resume text is sent to OpenAI to create embeddings and answer questions; do not use sensitive resumes unless you are comfortable with that processing. See the [OpenAI embeddings guide](https://developers.openai.com/api/docs/guides/embeddings) and [Responses API reference](https://developers.openai.com/api/reference/responses/overview).

The retrieval MVP stores vectors as JSON in PostgreSQL and ranks them in the API, which keeps the local Docker setup simple for a small Phase 1 dataset. It is intended for a prototype, not a large-scale vector search deployment.

## Team ownership and delivered work

These are the project responsibilities from the team brief, mapped to this implementation so each member can review and own their part.

| Member | Responsibility | Work represented here |
| --- | --- | --- |
| Harsh | React UI | Landing and auth screens, dashboard, resume and skill-gap pages, API integration, and readable responsive styling (`src/`). |
| Ayush | FastAPI and PostgreSQL | Registration/login API, token-based sessions, user profile and target role, resume upload/list/delete API, and database models (`backend/app/main.py`). |
| Madhukar | Resume/skill analysis and RAG prototype | Text-based PDF extraction, deterministic skill identification, starter role requirements, skill-gap response, resume chunking, embeddings, similarity retrieval, and source-grounded assistant answers. |
| Pravesh | Local service/container foundation | Docker Compose setup for the API and PostgreSQL (`docker-compose.yml`, `backend/Dockerfile`). Coding execution, STT, and TTS are later-phase tasks. |

## Phase boundary

AI interview question generation and evaluation, roadmap generation, coding execution, speech-to-text, and text-to-speech remain future work. PDF analysis reads selectable text; scanned-PDF OCR is not included. Passwords are hashed and API requests use bearer tokens, but the sample Docker secrets must be replaced before sharing or deployment. The schema is created automatically for local development; production migrations, deployment hardening, password reset, and email verification are not included.
