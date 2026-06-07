# DocMind — PDF Q&A Chatbot

Upload a PDF, ask questions about it in plain English. The app finds the relevant sections and uses Google's Gemini to answer — strictly from your document, not from the model's general knowledge.

## 🌐 Live Demo

| Layer    | URL                                                                                       |
| :------- | :---------------------------------------------------------------------------------------- |
| Frontend | [doc-mind-pdf-q-a-chatbot-pgl2cd3tu-onkar4160s-projects.vercel.app](https://doc-mind-pdf-q-a-chatbot-pgl2cd3tu-onkar4160s-projects.vercel.app) |
| Backend  | [onkarsarambale11-docmind-backend.hf.space](https://onkarsarambale11-docmind-backend.hf.space) |

---

## What it does

- Extracts text from any uploaded PDF using PyMuPDF (`fitz`)
- Splits the text into overlapping chunks using LangChain's `RecursiveCharacterTextSplitter`
- Embeds each chunk locally using the `paraphrase-MiniLM-L3-v2` Sentence Transformer model (CPU, normalized embeddings)
- Stores vectors in a FAISS index (in memory, no external database needed)
- On each question, retrieves the top 5 most similar chunks via FAISS similarity search
- Prepends the first 1 000 characters of the document (the "document opening") to every query context, giving the model awareness of the document's title, author, and structure
- Sends the retrieved context plus the question to Gemini with a strict grounding system prompt — answers only from the document, never from general knowledge
- If the answer isn't in the document, the model says so instead of making something up
- Falls back across multiple Gemini models (`gemini-flash-lite-latest` → `gemini-2.0-flash-lite` → `gemini-2.0-flash`) if one hits a quota limit
- Persists document info and chat history in the browser's `localStorage` so sessions survive page reloads

---

## Tech Stack

### Backend

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| Python | 3.11 (Docker) / 3.10+ (local) | Runtime |
| FastAPI | 0.111.0 | REST API framework |
| Uvicorn | 0.29.0 | ASGI server |
| LangChain | 0.2.6 | Text splitting, document abstraction, FAISS integration |
| LangChain Community | 0.2.6 | `HuggingFaceEmbeddings`, `FAISS` vector store |
| LangChain Google GenAI | 1.0.7 | Transitive dependency (not used directly in code) |
| FAISS CPU | 1.8.0 | In-memory vector similarity search |
| Sentence Transformers | 3.0.1 | Local embedding model loader |
| PyMuPDF (`fitz`) | 1.24.5 | PDF text extraction |
| Google Generative AI SDK | 0.7.2 | Gemini API calls with model fallback |
| python-dotenv | 1.0.1 | `.env` file loading |
| python-multipart | 0.0.9 | `multipart/form-data` file upload parsing |
| tiktoken | 0.7.0 | Token counting (transitive) |

### Frontend

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| React | 18.3.x | UI library |
| React DOM | 18.3.x | DOM rendering |
| Vite | 5.3.x | Dev server and bundler |
| @vitejs/plugin-react | 4.3.x | React fast refresh for Vite |

**Styling:** Vanilla CSS with a custom dark theme design system, Inter font from Google Fonts, CSS custom properties for colors/spacing/animations, responsive layout with a mobile breakpoint at 768 px.

### Deployment

| Layer | Platform |
| :--- | :--- |
| Backend | Hugging Face Spaces (Docker) |
| Frontend | Vercel |

---

## Project structure

```text
Rag_chatbot/
├── backend/
│   ├── main.py             # FastAPI app — upload, chat, health endpoints + CORS + lifespan
│   ├── rag_pipeline.py     # PDF extraction, chunking, embedding, FAISS index, Gemini generation
│   ├── requirements.txt    # Pinned Python dependencies
│   ├── Dockerfile          # Python 3.11-slim container for Hugging Face Spaces (port 7860)
│   ├── .env.example        # Template — copy to .env and add your Gemini API key
│   └── .env                # Not committed — contains your GEMINI_API_KEY
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx    # Message list, text input form, typing indicator, empty state
│   │   │   ├── MessageBubble.jsx # Single chat bubble (user / AI) with source drawer
│   │   │   ├── SourceDrawer.jsx  # Expandable panel showing retrieved source chunks
│   │   │   └── UploadZone.jsx    # Drag-and-drop / click-to-browse PDF upload with status states
│   │   ├── App.jsx         # Root component — sidebar + chat layout, localStorage persistence, toast system
│   │   ├── App.css          # Full design system — dark theme, CSS custom properties, animations, responsive
│   │   └── main.jsx         # React 18 entry point (StrictMode)
│   ├── index.html           # HTML shell — meta tags, Inter font, emoji favicon
│   ├── vite.config.js       # Vite dev server (port 5173) + proxy for /upload, /chat, /health → port 8000
│   └── package.json         # npm dependencies and scripts (dev, build, preview)
├── .gitignore               # Excludes .env, venv/, node_modules/, dist/, __pycache__/, IDE configs, OS files
└── README.md
```

---

## Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Gemini API key — get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Backend

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

> First run will download the `paraphrase-MiniLM-L3-v2` model (~60 MB) from Hugging Face. It gets cached after that.

Copy the env template and add your key:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and set:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Start the server:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

> **Note:** On startup, the FastAPI lifespan hook pre-loads the embedding model so the first `/upload` request is faster.

---

### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. Vite proxies all `/upload`, `/chat`, and `/health` requests to port 8000, so no CORS config is needed locally.

---

## Environment variables

| Variable         | Where        | Required | Description                                          |
| :--------------- | :----------- | :------- | :--------------------------------------------------- |
| `GEMINI_API_KEY` | Backend `.env` | **Yes**  | Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey) |

For production (Hugging Face Spaces), set `GEMINI_API_KEY` as a **secret** in the Space settings — do not use a `.env` file.

---

## API

All endpoints are defined in `backend/main.py` with Pydantic request/response models.

### `GET /health`

Returns a simple health check.

**Response** (`HealthResponse`):

```json
{ "status": "ok" }
```

### `POST /upload`

Accepts a PDF via `multipart/form-data` (field name: `file`). Resets any previous document state, then extracts text, splits into chunks, embeds, and builds a FAISS index.

**Validations:**
- File must have a `.pdf` extension (HTTP 400)
- File must not be empty (HTTP 400)
- PDF must contain extractable text — scanned/image-only PDFs are rejected (HTTP 422)

**Response** (`UploadResponse`):

```json
{
  "status": "ready",
  "chunk_count": 142
}
```

### `POST /chat`

**Request** (`ChatRequest`):

```json
{ "question": "What are the main findings?" }
```

**Validations:**
- Question must not be empty or whitespace-only (HTTP 400)
- A document must be uploaded first (HTTP 400)

**Response** (`ChatResponse`):

```json
{
  "answer": "According to the document...",
  "sources": [
    { "chunk_index": 12, "text": "The model exhibits..." }
  ]
}
```

The `sources` array contains the top-K chunks retrieved from the FAISS index for that query.

---

## RAG Pipeline Details

### Text Extraction

PDF text is extracted page-by-page using PyMuPDF (`fitz`). All pages are concatenated with newline separators. If no text is found (e.g. scanned documents), the upload is rejected.

### Chunking & Embedding

Text is split using LangChain's `RecursiveCharacterTextSplitter` with these separators in order: `\n\n`, `\n`, `. `, ` `, `""`. Each chunk is wrapped in a LangChain `Document` with a `chunk_index` metadata field.

Embeddings are generated locally using `paraphrase-MiniLM-L3-v2` on CPU with L2 normalization enabled. The model is loaded once and cached for the lifetime of the process.

### Context Assembly

On each question, the pipeline:

1. Retrieves the top-K most similar chunks from FAISS
2. Prepends the document's first 1 000 characters (the "document opening") to provide title/author/abstract context
3. Includes the document filename as a hint
4. De-duplicates chunks by `chunk_index`
5. Joins everything with `---` separators

### Gemini Generation

The assembled context and question are sent to Google Gemini. The system prompt enforces strict grounding:

> *"Answer ONLY using the provided context. If the answer is not in the context, say: 'I could not find that in the uploaded document.' Do not make up information."*

If a model's quota is exhausted (`ResourceExhausted`), the pipeline automatically tries the next candidate model in sequence.

### Tuning Constants

These constants are at the top of `backend/rag_pipeline.py`:

| Constant | Default | What it controls |
| :--- | :--- | :--- |
| `CHUNK_SIZE` | `500` | Characters per chunk |
| `CHUNK_OVERLAP` | `50` | Overlap between adjacent chunks |
| `TOP_K` | `5` | Chunks retrieved per query |
| `EMBEDDING_MODEL` | `paraphrase-MiniLM-L3-v2` | Local embedding model from Sentence Transformers |

### Gemini Generation Config

| Parameter | Value | What it controls |
| :--- | :--- | :--- |
| `temperature` | `0.2` | Low temperature for factual, grounded answers |
| `max_output_tokens` | `2048` | Maximum response length |
| `timeout` | `30s` | Request timeout per model attempt |

### Gemini Model Fallback Order

| Priority | Model Name |
| :--- | :--- |
| 1 | `gemini-flash-lite-latest` |
| 2 | `gemini-2.0-flash-lite` |
| 3 | `gemini-2.0-flash` |

Smaller chunks give more precise retrieval but may lose context within a single idea. Larger chunks preserve context but dilute the semantic signal. 500/50 is a reasonable starting point for most documents.

---

## Frontend Architecture

### Components

| Component | File | Responsibility |
| :--- | :--- | :--- |
| `App` | `src/App.jsx` | Root layout (sidebar + chat), state management, localStorage persistence, toast notifications |
| `UploadZone` | `src/components/UploadZone.jsx` | Drag-and-drop / click-to-browse PDF upload with idle, uploading, and done states |
| `ChatWindow` | `src/components/ChatWindow.jsx` | Message list, auto-scroll, textarea with auto-resize, typing indicator, empty state with step instructions |
| `MessageBubble` | `src/components/MessageBubble.jsx` | Individual chat bubble (user or AI) with timestamp and source drawer |
| `SourceDrawer` | `src/components/SourceDrawer.jsx` | Expandable panel showing retrieved source chunks with chunk index and text preview (120-char truncation) |

### State & Persistence

- **`docInfo`** — current document's filename and chunk count, saved to `localStorage` under `docmind_doc_info`
- **`messages`** — full chat history array, saved to `localStorage` under `docmind_messages`
- Both are restored on page load so sessions survive refreshes

### API Base URL

The production backend URL is hardcoded in two files:

- `src/App.jsx` line 5: `const BASE = "https://onkarsarambale11-docmind-backend.hf.space"`
- `src/components/UploadZone.jsx` line 3: `const BASE = 'https://onkarsarambale11-docmind-backend.hf.space'`

For local development, Vite's proxy config (`vite.config.js`) routes `/upload`, `/chat`, and `/health` to `http://localhost:8000`, so the hardcoded URL is only used in production builds.

### Design System

The CSS design system in `src/App.css` uses CSS custom properties:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--bg-base` | `#0d1117` | Page background |
| `--bg-panel` | `#161b22` | Sidebar background |
| `--bg-surface` | `#1c2330` | Card / elevated surface |
| `--accent` | `#00d4aa` | Primary accent (teal-green) |
| `--text-primary` | `#e6edf3` | Main text color |
| `--text-secondary` | `#8b949e` | Secondary text |
| `--text-muted` | `#484f58` | Muted / disabled text |
| `--font` | `'Inter', system-ui, sans-serif` | Primary typeface |
| `--sidebar-w` | `300px` | Sidebar width (100% on mobile) |

**Animations:** `slideUp` (message entry), `wave` (typing dots), `spin` (upload spinner), `fadeIn` (empty state), `expandDown` (source drawer), `slideInRight` / `fadeOut` (toast notifications).

**Responsive:** At ≤ 768 px, the layout switches from side-by-side to stacked (sidebar on top, capped at 280 px height).

---

## Pushing to GitHub

```bash
# From the project root
git init
git status  # confirm .env, venv/, and node_modules/ are not listed
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin <your_github_repo_url>
git push -u origin main
```

Never commit your `.env` file. If you accidentally push your API key, revoke it immediately at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## Deployment

### Backend — Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) with **Docker** as the SDK.
2. Connect the GitHub repository (or push the `backend/` directory to the Space repo).
3. The Space uses the `backend/Dockerfile` which:
   - Starts from `python:3.11-slim`
   - Installs all dependencies from `requirements.txt`
   - Runs `uvicorn main:app --host 0.0.0.0 --port 7860`
4. Add the `GEMINI_API_KEY` as a **secret** in the Space settings (Settings → Repository secrets).
5. Hugging Face auto-builds and deploys on every push.

Live backend URL: `https://onkarsarambale11-docmind-backend.hf.space`

### Frontend — Vercel

1. Connect the GitHub repository to [Vercel](https://vercel.com).
2. Set the **root directory** to `frontend`.
3. **Framework preset:** Vite.
4. **Build command:** `npm run build`
5. **Output directory:** `dist`
6. No environment variables are needed — the backend URL is hardcoded in `App.jsx` and `UploadZone.jsx` as:
   ```
   https://onkarsarambale11-docmind-backend.hf.space
   ```
7. Vercel auto-deploys on every push to `main`.

Live frontend URL: `https://doc-mind-pdf-q-a-chatbot-pgl2cd3tu-onkar4160s-projects.vercel.app`

### CORS

The backend allows requests from these origins (configured in `backend/main.py`):

- `http://localhost:5173` — local Vite dev server
- `https://doc-mind-pdf-q-a-chatbot-pgl2cd3tu-onkar4160s-projects.vercel.app` — production Vercel frontend
- `https://onkarsarambale11-docmind-backend.hf.space` — Hugging Face Spaces backend (self-origin)

If you redeploy the frontend to a different domain, add that domain to the `allow_origins` list in `backend/main.py`.

---

## License

MIT
