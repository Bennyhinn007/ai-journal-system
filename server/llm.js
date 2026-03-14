const crypto = require('crypto');

// Try to use Groq if API key is valid, otherwise use demo mode
let groq = null;
try {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('DEBUG: API Key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('DEBUG: Starts with gsk_?', apiKey ? apiKey.startsWith('gsk_') : 'N/A');
  
  if (apiKey && apiKey.trim() && apiKey.startsWith('gsk_')) {
    const { Groq } = require('groq-sdk');
    groq = new Groq({
      apiKey: apiKey.trim(),
    });
    console.log('✅ Groq SDK initialized with API key');
  } else {
    console.log('⚠️  Using DEMO mode - Groq API key not configured. Install real key in .env');
  }
} catch (e) {
  console.log('⚠️  Using DEMO mode - Groq SDK error:', e.message);
}

// Simple in-memory cache for analysis results
const analysisCache = new Map();

// Demo emotion database for realistic responses
const demoEmotions = {
  'peaceful': { keywords: ['calm', 'serene', 'quiet', 'relaxed'], summary: 'User experienced a sense of peace and tranquility' },
  'calm': { keywords: ['peaceful', 'soothed', 'centered', 'grounded'], summary: 'User felt centered and emotionally balanced' },
  'happy': { keywords: ['joy', 'contentment', 'pleasure', 'delight'], summary: 'User experienced positive emotions and happiness' },
  'energized': { keywords: ['vibrant', 'motivated', 'active', 'alive'], summary: 'User felt invigorated and full of energy' },
  'relaxed': { keywords: ['unwound', 'at ease', 'comfortable', 'loose'], summary: 'User found rest and comfort' },
  'inspired': { keywords: ['wonder', 'awe', 'motivated', 'creativity'], summary: 'User felt inspired and creatively stimulated' },
  'grateful': { keywords: ['thankful', 'appreciation', 'blessed', 'valued'], summary: 'User felt appreciation and gratitude' },
  'contemplative': { keywords: ['thoughtful', 'reflective', 'meditative', 'introspective'], summary: 'User engaged in deep reflection' },
};

function getTextHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function analyzeDemoEmotion(text) {
  // Extract keywords from text to determine emotion
  const textLower = text.toLowerCase();
  const emotionKeywords = {
    'peaceful': ['peaceful', 'peace', 'serene', 'tranquil', 'quiet', 'still'],
    'calm': ['calm', 'composed', 'centered', 'grounded', 'centered'],
    'happy': ['happy', 'joy', 'joyful', 'cheerful', 'delighted', 'glad'],
    'energized': ['energized', 'energetic', 'vibrant', 'motivated', 'active', 'alive'],
    'relaxed': ['relaxed', 'unwound', 'ease', 'comfortable', 'chill'],
    'inspired': ['inspired', 'awe', 'wonder', 'creative', 'amazing'],
    'grateful': ['grateful', 'thankful', 'appreciate', 'blessed', 'blessed'],
    'contemplative': ['think', 'reflect', 'ponder', 'meditate', 'consider'],
  };

  let detectedEmotion = 'peaceful'; // Default emotion
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(kw => textLower.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
    }
  }

  const emotionData = demoEmotions[detectedEmotion];
  return {
    emotion: detectedEmotion,
    keywords: emotionData.keywords,
    summary: emotionData.summary,
  };
}

async function analyzeEmotion(text) {
  try {
    // Check cache first
    const hash = getTextHash(text);
    if (analysisCache.has(hash)) {
      console.log('✅ Cache hit - returning cached analysis');
      return analysisCache.get(hash);
    }

    let analysis;

    if (groq) {
      // Use real Groq API
      console.log('📡 Calling Groq API for emotion analysis...');
      try {
        const message = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: `Analyze the emotional content and extract keywords from this journal entry. Return ONLY valid JSON (no markdown, no code blocks).

Journal entry: "${text}"

Return this exact JSON structure:
{
  "emotion": "primary emotion (one word)",
  "keywords": ["word1", "word2", "word3"],
  "summary": "brief summary of emotional state"
}`,
            },
          ],
          model: 'mixtral-8x7b-32768',
          temperature: 0.7,
          max_tokens: 500,
        });

        const responseText = message.choices[0].message.content.trim();
        analysis = JSON.parse(responseText);
        console.log('✅ Successfully analyzed with Groq:', analysis.emotion);
      } catch (groqError) {
        console.log('⚠️  Groq API failed, falling back to demo mode');
        analysis = analyzeDemoEmotion(text);
      }
    } else {
      // Use demo mode
      console.log('🎭 Demo mode - analyzing with keyword matching');
      analysis = analyzeDemoEmotion(text);
    }
    
    // Cache the result
    analysisCache.set(hash, analysis);
    
    return analysis;
  } catch (error) {
    console.error('❌ Error in analyzeEmotion:', error.message);
    // Return demo analysis as fallback
    return analyzeDemoEmotion(text);
  }
}

module.exports = { analyzeEmotion, getTextHash };
