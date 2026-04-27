import express, { Request } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import cors from "cors";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

// Extend Request type for Multer
interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory document storage
interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
}

const documents: Document[] = [];

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Increase limit slightly to 10MB
});

// --- Information Retrieval (IR) Logic ---

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b(\w+)\b/g) || [];
}

function calculateScore(query: string, docContent: string, allDocs: string[]): number {
  const queryTokens = tokenize(query);
  const docTokens = tokenize(docContent);
  
  if (queryTokens.length === 0) return 0;

  let totalScore = 0;
  const uniqueQueryTokens = Array.from(new Set(queryTokens));

  uniqueQueryTokens.forEach(token => {
    // Term Frequency (TF) in current doc
    const tf = docTokens.filter(t => t === token).length / (docTokens.length || 1);
    
    // Inverse Document Frequency (IDF)
    const docsWithTerm = allDocs.filter(d => tokenize(d).includes(token)).length;
    const idf = Math.log((allDocs.length + 1) / (docsWithTerm + 1)) + 1;
    
    totalScore += tf * idf;
  });

  return totalScore;
}

// --- API Routes ---

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    const mReq = req as MulterRequest;
    const files = mReq.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    for (const file of files) {
      let content = "";
      if (file.mimetype.includes("pdf") || file.originalname.toLowerCase().endsWith(".pdf")) {
        try {
          const parser = new PDFParse({ data: file.buffer });
          const result = await parser.getText();
          content = result.text || "";
          await parser.destroy();
        } catch (pdfErr: any) {
          console.error(`Error parsing PDF ${file.originalname}:`, pdfErr);
          // Check for specific PDF.js errors
          const errMsg = pdfErr.message || String(pdfErr);
          if (errMsg.includes("InvalidPDFException") || errMsg.includes("FormatError") || errMsg.includes("AbortException")) {
            throw new Error(`The file "${file.originalname}" is not a valid PDF or is corrupted.`);
          }
          throw new Error(`Failed to parse PDF content for "${file.originalname}": ${errMsg}`);
        }
      } else {
        content = file.buffer.toString("utf-8");
      }

      documents.push({
        id: Math.random().toString(36).substring(7),
        name: file.originalname,
        content: content,
        type: file.mimetype,
      });
    }

    res.json({ message: `${files.length} files processed successfully` });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to process files" });
  }
});

app.get("/api/documents", (req, res) => {
  res.json(documents.map(d => ({ id: d.id, name: d.name, type: d.type })));
});

app.post("/api/search", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const allDocContents = documents.map(d => d.content);
  
  const results = documents.map(doc => {
    const score = calculateScore(query, doc.content, allDocContents);
    return {
      id: doc.id,
      name: doc.name,
      score: score,
      // Provide a small snippet
      snippet: doc.content.substring(0, 200) + "..."
    };
  });

  // Rank by score descending
  const sortedResults = results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  res.json(sortedResults);
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const HOST = "127.0.0.1";
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
