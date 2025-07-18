import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import connectDb from "./Utils/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./Routes/Auth.routes.js";
import sessionRoutes from "./Routes/Session.routes.js";
import questionRoutes from "./Routes/Question.Routes.js";
import verifyToken from "./Middlewares/Auth.Middleware.js";
import { conceptExplainPrompt, questionAnswerPrompt } from "./Utils/prompt.js";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS config for frontend deployment
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🔥 Required for sending/receiving cookies
  })
);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("✅ Backend API is running");
});

// ✅ AI: Generate Questions
app.post("/api/ai/generate-questions", verifyToken, async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: "No response from AI" });
    }

    const cleanText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const data = JSON.parse(cleanText);
    res.status(200).json({ data });
  } catch (error) {
    console.error("❌ AI Error:", error);
    res.status(500).json({ error: "Failed to generate interview questions" });
  }
});

// ✅ AI: Generate Explanations
app.post("/api/ai/generate-explanations", verifyToken, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = conceptExplainPrompt(question);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: "No response from AI" });
    }

    const cleanText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const data = JSON.parse(cleanText);
    res.status(200).json({ data });
  } catch (error) {
    console.error("❌ AI Explanation Error:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

// ✅ Static file serve
app.use("/uploads", express.static(path.join(__dirname, "src", "Uploads")));

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDb();
});
