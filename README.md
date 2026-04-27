# Smart Document Search

An AI-ready document search engine with a modern cyberpunk-inspired UI. Upload PDF or text documents and query them using a TF-IDF powered ranking algorithm. Built with React, Vite, Express, and Tailwind CSS.

## Features

- **Document Upload** — Drag and drop or select multiple PDF and TXT files
- **TF-IDF Search** — Information retrieval with term frequency and inverse document frequency scoring
- **Real-time Library** — View all uploaded documents in the active library sidebar
- **Ranked Results** — Search results sorted by relevance score with match confidence visualization
- **Modern UI** — Glassmorphism design with motion animations and responsive layout
- **In-Memory Storage** — Fast document indexing without external database dependencies
- **Gemini AI Ready** — Configured with `@google/genai` for future AI-powered enhancements

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS 4, Lucide React |
| Animations | Motion (Framer Motion) |
| Backend | Express 4, TypeScript, tsx |
| File Uploads | Multer (memory storage) |
| PDF Parsing | pdf-parse |
| AI SDK | @google/genai |

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React SPA     │──────▶  Express API    │──────▶  In-Memory    │
│  (Vite + HMR)   │      │   (Port 3000)   │      │  Document Store │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │
                                ▼
                         ┌─────────────────┐
                         │  TF-IDF Engine  │
                         │  Tokenizer +    │
                         │  Scoring Logic  │
                         └─────────────────┘
```

## How It Works

1. **Upload** — Files are sent to `POST /api/upload` via multipart form data
2. **Parse** — PDFs are parsed to raw text; TXT files are read as UTF-8 strings
3. **Store** — Documents are stored in memory with a unique ID, filename, and extracted content
4. **Search** — Queries are tokenized and scored against all documents using TF-IDF
5. **Rank** — Results are filtered by score > 0 and sorted descending by relevance

### TF-IDF Scoring

- **Term Frequency (TF)** — How often a query term appears in a document
- **Inverse Document Frequency (IDF)** — Rarity of the term across the entire corpus
- **Score** — Sum of TF × IDF for all unique query terms

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or compatible package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MSF0Shehriyaar/smart-document-search.git
   cd smart-document-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and set your Gemini API key (optional for current TF-IDF mode):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at: **http://127.0.0.1:3000**

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite + Express development server |
| `npm run build` | Build the React frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove the `dist` directory |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload PDF/TXT files (multipart/form-data, field: `files`) |
| `GET` | `/api/documents` | List all uploaded documents (metadata only) |
| `POST` | `/api/search` | Search documents with a query (`{ "query": "..." }`) |

## Project Structure

```
smart-document-search/
├── src/
│   ├── App.tsx          # Main React application component
│   ├── main.tsx         # React DOM entry point
│   └── index.css        # Global styles and Tailwind directives
├── server.ts            # Express server with API routes and Vite middleware
├── vite.config.ts       # Vite configuration with React and Tailwind plugins
├── tsconfig.json        # TypeScript compiler configuration
├── package.json         # Dependencies and scripts
├── index.html           # HTML entry point
├── metadata.json        # App metadata
├── .env.example         # Environment variable template
└── .gitignore           # Git ignore rules
```

## File Support

| Format | Parsing | Max Size |
|--------|---------|----------|
| PDF | Full text extraction via `pdf-parse` | 10 MB |
| TXT | UTF-8 string read | 10 MB |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Gemini API key for AI-powered features |
| `APP_URL` | No | Hosted application URL |
| `NODE_ENV` | No | Set to `production` to serve static `dist/` files |

## Future Enhancements

The project includes the `@google/genai` SDK and Vite environment injection for `GEMINI_API_KEY`, enabling seamless integration of:

- Semantic search with Gemini embeddings
- AI-generated document summaries
- Conversational query interfaces

## License

Apache-2.0
