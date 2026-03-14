# AI Journal System

Full-stack AI powered journaling application that analyzes emotional patterns from nature-based reflection sessions using Groq LLM.

## Features

- **📝 Journal Entry Management**: Store journal entries with session ambience (forest, ocean, mountain)
- **🤖 AI Emotion Analysis**: Uses Groq LLM to analyze emotions, extract keywords, and summarize entries
- **📊 Personal Insights**: View emotion trends, favorite settings, and common themes
- **⚡ Fast Response**: Caching system for repeated analysis
- **🌐 Simple Frontend**: Clean, intuitive React interface

## Demo

Example Journal Entry:
"I felt peaceful listening to forest rain today."

AI Analysis Output:

Emotion: peaceful  
Summary: User experienced a sense of calm and relaxation  
Keywords: calm, serene, quiet, relaxed

## Application Preview


## Tech Stack

## System Architecture

Frontend (React UI)
↓
Express API (Node.js)
↓
SQLite Database
↓
Groq LLM API

Flow:
User writes journal entry → Entry stored in database →
User clicks "Analyze Emotion" → Backend calls Groq LLM →
Emotion, keywords, and summary returned → Displayed in UI

### Backend

- **Framework**: Node.js + Express
- **Database**: SQLite
- **LLM**: Groq API (free tier)
- **Middleware**: CORS, Body Parser

### Frontend

- **Framework**: React 18
- **Styling**: CSS3 with Flexbox
- **API Client**: Fetch API

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Groq API key (free at https://console.groq.com)

### Installation

1. **Clone and setup**

```bash
cd c:\ai-journal
npm install
```

2. **Set up environment variables**

```bash
copy .env.example .env
# Edit .env and add your Groq API key
```

3. **Start the backend**

```bash
npm start
```

The server will start on `http://localhost:5000`

4. **Start the frontend** (in another terminal)

```bash
cd client
python -m http.server 3000
# or use any simple HTTP server
```

Open your browser to `http://localhost:3000`

## API Endpoints

### Health Check

GET /api/health

Response:
{
"status": "ok",
"service": "AI Journal API"
}

### Create Journal Entry

```
POST /api/journal
Content-Type: application/json

{
  "userId": "123",
  "ambience": "forest",
  "text": "I felt calm today after listening to the rain."
}

Response: { "message": "Entry saved successfully" }
```

### Get User Entries

```
GET /api/journal/:userId

Response: [
  {
    "id": 1,
    "userId": "123",
    "ambience": "forest",
    "text": "...",
    "createdAt": "2026-03-14T12:00:00Z"
  }
]
```

### Analyze Emotion

```
POST /api/journal/analyze
Content-Type: application/json

{
  "text": "I felt calm today after listening to the rain"
}

Response: {
  "emotion": "calm",
  "keywords": ["rain", "nature", "peace"],
  "summary": "User experienced relaxation during the forest session",
  "cached": false
}
```

### Get User Insights

```
GET /api/journal/insights/:userId

Response: {
  "totalEntries": 8,
  "topEmotion": "calm",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["focus", "nature", "rain"],
  "emotionBreakdown": { "calm": 5, "happy": 3 },
  "ambienceBreakdown": { "forest": 6, "ocean": 2 }
}
```

## Project Structure

```
ai-journal/
├── server/
│   ├── server.js          # Express app & routes
│   ├── db.js              # SQLite connection & init
│   ├── llm.js             # Groq LLM integration
│   └── package.json
├── client/
│   ├── index.html         # Main HTML
│   ├── app.js             # React app
│   └── package.json
├── .env.example           # Environment template
├── README.md              # This file
└── ARCHITECTURE.md        # Architecture decisions
```

## Database Schema

### entries table

```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  ambience TEXT NOT NULL,
  text TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### analysis_cache table

```sql
CREATE TABLE analysis_cache (
  id INTEGER PRIMARY KEY,
  textHash TEXT UNIQUE,
  emotion TEXT,
  keywords TEXT,
  summary TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Usage Example

1. Open the frontend at `http://localhost:3000`
2. Enter your user ID
3. Select the ambience type (Forest, Ocean, Mountain)
4. Write your journal entry
5. Click "Save Entry"
6. Go to "Previous Entries" tab
7. Click "Analyze Emotion" to see AI analysis
8. Check "Insights" to see your emotional trends

## Features Implemented

- ✅ Journal entry CRUD operations
- ✅ Real LLM emotion analysis via Groq
- ✅ Caching system to reduce API calls
- ✅ User insights dashboard
- ✅ Responsive UI
- ✅ Error handling
- ✅ Clean API design

## Future Enhancements

- Streaming LLM responses for real-time analysis
- Advanced data visualization with charts
- Export entries as PDF
- Email reminders for journal entries
- Mobile app version
- User authentication and profiles
- Advanced filtering and search

## License

MIT
