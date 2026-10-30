import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limit for PDF documents and base64 payloads
app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI with required headers
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Studious',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * AI-assisted academic document extraction endpoint.
 * Supports:
 * - timetable: extracts days, subjects, course codes, start/end times, room, faculty
 * - syllabus: extracts subject, units, chapters, topics, subtopics
 * - hallticket: extracts exam subject, code, date, start/end time, center, room, reporting time
 */
app.post('/api/extract-pdf', async (req: Request, res: Response) => {
  try {
    const { docType, textContent, base64Data, mimeType } = req.body;

    if (!docType || (!textContent && !base64Data)) {
      return res.status(400).json({
        error: 'Missing required fields: docType and either textContent or base64Data are required.',
      });
    }

    if (!ai) {
      // Fallback parser if API key is not yet set or in restricted environment
      return res.status(503).json({
        error: 'Gemini AI service is not initialized. Please verify GEMINI_API_KEY configuration.',
      });
    }

    let contents: any[] = [];
    const targetMime = mimeType || 'application/pdf';

    if (base64Data) {
      contents.push({
        inlineData: {
          mimeType: targetMime,
          data: base64Data,
        },
      });
    }

    let systemInstruction = '';
    let promptText = '';

    if (docType === 'timetable') {
      systemInstruction =
        'You are an expert academic timetable parser. Extract structured weekly class schedules from the uploaded timetable document or text. Never hallucinate classes. Return valid JSON only.';
      promptText = `Extract all classes and weekly lectures from this timetable.
Return a JSON object in this exact schema:
{
  "institution": "string or null",
  "term": "string or null",
  "classes": [
    {
      "subject": "Full subject name",
      "courseCode": "Course code or abbreviation (e.g. CS301)",
      "dayOfWeek": 1, // 0 for Sunday, 1 for Monday, 2 for Tuesday, 3 for Wednesday, 4 for Thursday, 5 for Friday, 6 for Saturday
      "dayName": "Monday",
      "startTime": "HH:MM", // 24-hour format e.g. "09:00"
      "endTime": "HH:MM",   // 24-hour format e.g. "10:30"
      "room": "Room or lab number if found",
      "faculty": "Instructor or professor name if found",
      "color": "#3B82F6"
    }
  ],
  "confidenceNotes": "Brief notes on extraction clarity or ambiguities"
}
${textContent ? `\nContent:\n${textContent}` : ''}`;
    } else if (docType === 'syllabus') {
      systemInstruction =
        'You are an expert university curriculum parser. Extract structured syllabus hierarchies (Units, Chapters, and individual Topics) from the document. Do not invent topics. Return valid JSON only.';
      promptText = `Extract the syllabus structure from this document.
Return a JSON object in this exact schema:
{
  "subjectName": "Course title",
  "courseCode": "Course code if present",
  "credits": 3,
  "units": [
    {
      "unitNumber": "Unit I",
      "title": "Unit title",
      "chapters": [
        {
          "title": "Chapter title",
          "topics": [
            {
              "title": "Topic or subtopic name",
              "estimatedMinutes": 45,
              "difficulty": "medium" // "easy" | "medium" | "hard"
            }
          ]
        }
      ]
    }
  ],
  "confidenceNotes": "Brief notes on extraction structure"
}
${textContent ? `\nContent:\n${textContent}` : ''}`;
    } else if (docType === 'hallticket') {
      systemInstruction =
        'You are an academic exam hall ticket / admit card parser. Extract examination dates, times, paper titles, exam centers, and room details. Do not extract or retain sensitive personal identifiers. Return valid JSON only.';
      promptText = `Extract all scheduled examinations from this hall ticket.
Return a JSON object in this exact schema:
{
  "examSeries": "e.g. End Semester Examinations - Spring 2026",
  "center": "Examination center name or address",
  "exams": [
    {
      "subject": "Subject or Paper title",
      "courseCode": "Subject/Paper code (e.g. CS401)",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM", // 24-hour
      "endTime": "HH:MM",   // 24-hour
      "reportingTime": "HH:MM",
      "room": "Hall / Room number if specified",
      "instructions": "Key paper-specific instructions if any"
    }
  ],
  "confidenceNotes": "Brief notes on extraction details"
}
${textContent ? `\nContent:\n${textContent}` : ''}`;
    } else {
      return res.status(400).json({ error: 'Unsupported docType.' });
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(outputText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', outputText);
      return res.status(502).json({
        error: 'Model response was not valid JSON.',
        raw: outputText,
      });
    }

    return res.json({
      success: true,
      docType,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Extraction error in /api/extract-pdf:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error while processing academic document.',
    });
  }
});

// Start Express server and connect Vite in development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Studious server running on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
