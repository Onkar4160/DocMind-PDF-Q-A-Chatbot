# DocMind: PDF Q&A RAG Chatbot

DocMind is a robust, production-ready Retrieval-Augmented Generation (RAG) chatbot application. It enables users to upload any PDF document, automatically extracts and chunks its contents, embeds them using local sentence-transformers, indexes them with FAISS, and provides highly-grounded answers to user queries using Google's Gemini models with a multi-model failover mechanism.

---

## 🚀 Key Features

*   **Offline Local Embeddings**: Uses the `all-MiniLM-L6-v2` model from Hugging Face (`sentence-transformers`) to generate 384-dimensional dense vectors locally—no external API calls or costs for embedding.
*   **In-Memory Vector Search**: Employs **FAISS** (Facebook AI Similarity Search) for ultra-fast, lightweight similarity searches.
*   **Zero-Hallucination Grounding**: Configured with a system instruction that forces the LLM to reply *only* using retrieved context or explicitly state if it is not found.
*   **Robust Multi-Model Failover**: Sequentially retries candidate models (`gemini-flash-lite-latest`, `gemini-2.0-flash-lite`, `gemini-2.0-flash`) in case of rate-limiting, quota exhaustion, or API version issues.
*   **Interactive React UI**: Features a sleek, modern chat interface with drag-and-drop file uploading, auto-scrolling chat history, processing indicator, and an interactive drawer to inspect retrieved sources.
*   **Proxy-Backed Dev Setup**: Vite is pre-configured to proxy API requests to FastAPI, bypassing CORS issues entirely during local development.

---

## 🛠️ Tech Stack

*   **Backend**: Python 3.10+, FastAPI, Uvicorn, LangChain, FAISS (CPU), PyMuPDF (`fitz`), Google Generative AI SDK, `python-dotenv`
*   **Frontend**: React 18, Vite, Vanilla CSS

---

## 📂 Project Structure

```text
Rag_chatbot/
├── backend/
│   ├── main.py            # FastAPI entrypoint (upload, chat, and health check endpoints)
│   ├── rag_pipeline.py    # Core RAG pipeline (extraction, chunking, embedding, vector store, generation)
│   ├── requirements.txt   # Python package dependencies
│   ├── .env.example       # Template for environment configuration
│   └── .env               # Environment secrets (ignored by git)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── SourceDrawer.jsx
│   │   │   └── UploadZone.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore             # Root git ignore file (protects venv, node_modules, keys)
└── README.md              # Documentation
```

---

## 💻 Local Development Setup

### Prerequisites
*   **Python**: Version `3.10` or higher
*   **Node.js**: Version `18` or higher
*   **Gemini API Key**: Retrieve a free key from the [Google AI Studio Key Manager](https://aistudio.google.com/app/apikey)

---

### Backend Configuration

1.  **Navigate into the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    *   **Windows (PowerShell/CMD)**:
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```
    *   **macOS / Linux**:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    > 📝 *Note: During the first run, the app will download the `all-MiniLM-L6-v2` embedding model (~90MB) from Hugging Face. This will be cached locally for all subsequent runs.*

4.  **Configure environment variables**:
    Copy the sample configuration file and create a `.env` file:
    *   **Windows**:
        ```powershell
        copy .env.example .env
        ```
    *   **macOS / Linux**:
        ```bash
        cp .env.example .env
        ```

    Open the `.env` file and insert your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```

5.  **Start the FastAPI server**:
    ```bash
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    ```
    *   API running at: [http://localhost:8000](http://localhost:8000)
    *   Interactive API Documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Frontend Configuration

1.  **Navigate into the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    *   Frontend running at: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Reference

### `GET /health`
Liveness probe to verify that the backend API is up and running.
*   **Response**:
    ```json
    { "status": "ok" }
    ```

### `POST /upload`
Uploads a PDF file, extracts its text, builds chunks, embeds them, and indexes them in a local FAISS database.
*   **Content-Type**: `multipart/form-data`
*   **Body**: `file` (Binary PDF File)
*   **Response**:
    ```json
    {
      "status": "ready",
      "chunk_count": 142
    }
    ```

### `POST /chat`
Queries the vector database for the top matches and passes them along with the question to Gemini.
*   **Body**:
    ```json
    {
      "question": "What are the core capabilities of the model?"
    }
    ```
*   **Response**:
    ```json
    {
      "answer": "According to the document, the model is capable of...",
      "sources": [
        {
          "chunk_index": 12,
          "text": "The model exhibits advanced capabilities in multi-modal tasks..."
        }
      ]
    }
    ```

---

## ⚙️ RAG Hyperparameters

If you want to tune the retrieval performance, you can adjust the values at the top of `backend/rag_pipeline.py`:

| Constant | Default Value | Description |
| :--- | :--- | :--- |
| `CHUNK_SIZE` | `500` | Target character count for each extracted text chunk. |
| `CHUNK_OVERLAP` | `50` | Number of characters to overlap between sequential chunks to preserve context across boundaries. |
| `TOP_K` | `5` | The number of nearest-neighbor chunks retrieved from the FAISS database to feed to the LLM. |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | The local sentence-transformers model utilized for mapping text to vectors. |

---

## 🚢 Git & GitHub Deployment Guide

Follow these steps to safely initialize Git and push the project to your GitHub repository:

### 1. Initialize Git Repository
In the root directory of the project, run:
```bash
git init
```

### 2. Verify `.gitignore` is Configured
Ensure you have the `.gitignore` file in your root folder. This file prevents committing heavy dependencies (`node_modules/`, `venv/`), environment configurations (`.env`), and OS/IDE cache folders to the public repository.
> ⚠️ **IMPORTANT**: Never publish your `.env` file or commit your real API keys. If you accidentally push your key, immediately revoke it on [Google AI Studio](https://aistudio.google.com/app/apikey).

Verify which files will be tracked:
```bash
git status
```
*Make sure `.env`, `venv/`, and `node_modules/` are not listed under untracked files.*

### 3. Commit Code
```bash
git add .
git commit -m "feat: initial commit of PDF RAG Chatbot with FastAPI and React"
```

### 4. Create and Link a GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository (do not initialize it with a README or license since you already have them locally).
2. Copy the remote URL (HTTPS or SSH).
3. Associate it with your local repository and push:
```bash
git branch -M main
git remote add origin <your_github_repo_url>
git push -u origin main
```

---

## 🌐 Production Deployment Options

### Backend (FastAPI)
You can deploy the FastAPI server to services like **Render**, **Railway**, or **Heroku**:
1. Add a production server script command in backend (e.g. `gunicorn -k uvicorn.workers.UvicornWorker main:app`).
2. Add your `GEMINI_API_KEY` as an environment variable in the dashboard of your hosting provider.
3. Make sure to update the frontend API target URL if no longer proxied by Vite.

### Frontend (React/Vite)
You can build and deploy the React frontend to **Vercel**, **Netlify**, or **GitHub Pages**:
1. Run `npm run build` inside `frontend/` to output static assets to `frontend/dist/`.
2. Deploy the `dist` folder to your provider.
3. When using separate hosting providers, configure CORS in `backend/main.py` by adding the production frontend domain to `allow_origins`.
