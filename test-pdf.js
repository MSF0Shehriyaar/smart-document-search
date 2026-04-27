import { createRequire } from "module";
const require = createRequire(import.meta.url);
try {
  const pdfParse = require("pdf-parse");
  console.log("pdfParse type:", typeof pdfParse);
  console.log("pdfParse keys:", Object.keys(pdfParse));
  if (pdfParse.default) {
    console.log("pdfParse.default type:", typeof pdfParse.default);
  }
} catch (e) {
  console.error("Test failed:", e);
}
