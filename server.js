const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

app.post("/api/gemini", async (req, res) => {
  try {
    console.log("Received prompt:", req.body.prompt);

    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured on the server.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: req.body.prompt }] }],
        }),
      }
    );

    console.log("Gemini status:", response.status, response.statusText);
    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    if (data.error) {
      throw new Error(data.error.message);
    }
    
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      throw new Error("No valid response text from Gemini.");
    }

    res.json({ text: data.candidates[0].content.parts[0].text });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({ error: "Failed to fetch Gemini response." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ Warning: VITE_GEMINI_API_KEY is not set in .env.local. The API will fail.");
  }
});
