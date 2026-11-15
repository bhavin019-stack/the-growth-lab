import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

export function computeFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (err) {
    return null;
  }
}

export function extractTextFromPptx(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();
    let fullText = [];

    // Filter slide xml entries
    const slideEntries = zipEntries
      .filter(entry => entry.entryName.match(/^ppt\/slides\/slide\d+\.xml$/i))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/\d+/)[0], 10);
        const numB = parseInt(b.entryName.match(/\d+/)[0], 10);
        return numA - numB;
      });

    slideEntries.forEach((entry, idx) => {
      const xmlContent = entry.getData().toString('utf8');
      // Strip XML tags and clean up whitespace
      const text = xmlContent
        .replace(/<a:t[^>]*>(.*?)<\/a:t>/gi, '$1 ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (text) {
        fullText.push(`[Slide ${idx + 1}]: ${text}`);
      }
    });

    return fullText.join('\n\n');
  } catch (err) {
    console.error(`Error extracting PPTX text from ${filePath}:`, err.message);
    return '';
  }
}

export function extractTextFromDocx(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const docEntry = zip.getEntry('word/document.xml');
    if (!docEntry) return '';

    const xmlContent = docEntry.getData().toString('utf8');
    const text = xmlContent
      .replace(/<w:p[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  } catch (err) {
    console.error(`Error extracting DOCX text from ${filePath}:`, err.message);
    return '';
  }
}

export function extractTextFromPdf(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Simple robust regex extraction of text streams from PDF
    const str = buffer.toString('binary');
    const regex = /BT\s+(.*?)\s+ET/gs;
    const matches = str.match(regex);
    if (!matches) {
      // Fallback: extract readable ascii strings
      const asciiStrings = str.match(/[\x20-\x7E]{5,}/g);
      if (asciiStrings) {
        return asciiStrings.slice(0, 500).join(' ');
      }
      return '';
    }

    let textChunks = [];
    for (const match of matches) {
      const tjMatches = match.match(/\((.*?)\)\s*Tj/g);
      if (tjMatches) {
        const line = tjMatches.map(m => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join('');
        textChunks.push(line);
      }
    }
    return textChunks.join('\n').replace(/\\([()\\])/g, '$1');
  } catch (err) {
    console.error(`Error extracting PDF text from ${filePath}:`, err.message);
    return '';
  }
}

export function extractDocumentText(filePath, fileType) {
  const ext = (fileType || path.extname(filePath)).toLowerCase().replace('.', '');
  if (ext === 'pptx' || ext === 'ppt') {
    return extractTextFromPptx(filePath);
  } else if (ext === 'docx' || ext === 'doc') {
    return extractTextFromDocx(filePath);
  } else if (ext === 'pdf') {
    return extractTextFromPdf(filePath);
  } else if (['txt', 'md', 'json'].includes(ext)) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return '';
    }
  }
  return '';
}
