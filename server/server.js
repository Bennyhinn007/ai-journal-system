require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const { analyzeEmotion, getTextHash } = require("./llm");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to run database queries
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Store journal entry
app.post("/api/journal", async (req, res) => {
  try {
    const { userId, ambience, text } = req.body;
    if (!userId || !ambience || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await dbRun(
      "INSERT INTO entries (userId, ambience, text) VALUES (?, ?, ?)",
      [userId, ambience, text]
    );
    res.status(201).json({ message: "Entry saved successfully" });
  } catch (error) {
    console.error("Error saving entry:", error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

// Get all entries for a user
app.get("/api/journal/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await dbAll(
      "SELECT * FROM entries WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    res.json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Analyze emotion in text
app.post("/api/journal/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const hash = getTextHash(text);
    const cached = await dbGet(
      "SELECT emotion, keywords, summary FROM analysis_cache WHERE textHash = ?",
      [hash]
    );
    if (cached) {
      console.log("? Cache hit for analysis");
      return res.json({
        emotion: cached.emotion,
        keywords: JSON.parse(cached.keywords),
        summary: cached.summary,
        cached: true
      });
    }
    const analysis = await analyzeEmotion(text);
    try {
      await dbRun(
        "INSERT INTO analysis_cache (textHash, emotion, keywords, summary) VALUES (?, ?, ?, ?)",
        [hash, analysis.emotion, JSON.stringify(analysis.keywords), analysis.summary]
      );
    } catch (cacheError) {
      console.log("Cache storage skipped (may be duplicate)");
    }
    res.json({ ...analysis, cached: false });
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    res.status(500).json({ error: "Failed to analyze emotion" });
  }
});

// Get insights for a user
app.get("/api/journal/insights/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await dbAll(
      "SELECT * FROM entries WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    if (entries.length === 0) {
      return res.json({
        totalEntries: 0,
        topEmotion: null,
        mostUsedAmbience: null,
        recentKeywords: []
      });
    }
    const emotionCounts = {};
    const ambienceCounts = {};
    const allKeywords = {};
    for (const entry of entries) {
      try {
        const analysis = await analyzeEmotion(entry.text);
        emotionCounts[analysis.emotion] = (emotionCounts[analysis.emotion] || 0) + 1;
        ambienceCounts[entry.ambience] = (ambienceCounts[entry.ambience] || 0) + 1;
        for (const keyword of analysis.keywords) {
          allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
        }
      } catch (e) {
        console.error("Error analyzing entry:", e);
      }
    }
    const topEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b) || null;
    const mostUsedAmbience = Object.keys(ambienceCounts).reduce((a, b) => ambienceCounts[a] > ambienceCounts[b] ? a : b) || null;
    const recentKeywords = Object.keys(allKeywords).sort((a, b) => allKeywords[b] - allKeywords[a]).slice(0, 5);
    res.json({
      totalEntries: entries.length,
      topEmotion,
      mostUsedAmbience,
      recentKeywords,
      emotionBreakdown: emotionCounts,
      ambienceBreakdown: ambienceCounts
    });
  } catch (error) {
    console.error("Error getting insights:", error);
    res.status(500).json({ error: "Failed to get insights" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
