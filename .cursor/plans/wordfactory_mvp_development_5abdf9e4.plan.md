---
name: WordFactory MVP Development
overview: Build a mnemonic flashcard generation PWA with step-by-step AI-powered card creation (Gemini for text/analysis, Imagen for visuals), user authentication, onboarding, and learning mode. Mobile-first minimalistic design with Supabase backend and Vercel deployment.
todos:
  - id: setup
    content: Initialize Next.js project with bun, Tailwind, PWA, and Supabase
    status: in_progress
  - id: db-schema
    content: Create Supabase database tables (users, cards, anchors, progress)
    status: pending
  - id: auth
    content: Implement authentication (login/register pages with Supabase Auth)
    status: pending
  - id: onboarding
    content: Build onboarding flow (language selection, preferences)
    status: pending
  - id: card-ui
    content: Create step-by-step card creation UI with confirmation stages
    status: pending
  - id: api-analyze
    content: Implement word analysis API endpoint with Gemini
    status: pending
  - id: api-anchors
    content: Implement phonetic anchor generation API with Gemini
    status: pending
  - id: api-scene
    content: Implement scene synthesis and image prompt API
    status: pending
  - id: api-image
    content: Implement image generation with Google Imagen
    status: pending
  - id: api-audio
    content: Implement audio fetching (Forvo or alternative)
    status: pending
  - id: learning
    content: Build learning mode with spaced repetition
    status: pending
  - id: deploy
    content: Configure PWA manifest and deploy to Vercel
    status: pending
---

# WordFactory MVP Development Plan

## Architecture Overview

```mermaid
flowchart TB
    subgraph Frontend["Frontend (Next.js PWA)"]
        Auth[Auth Pages]
        Onboard[Onboarding Flow]
        CardGen[Card Generation UI]
        Learn[Learning Mode]
    end
    
    subgraph Backend["API Routes"]
        AuthAPI[Auth API]
        WordAPI[Word Analysis API]
        AnchorAPI[Anchor Generation API]
        SceneAPI[Scene/Image API]
        CardAPI[Card Assembly API]
    end
    
    subgraph External["External Services"]
        Gemini[Gemini API]
        Imagen[Google Imagen]
        Forvo[Forvo Audio]
        Supabase[(Supabase)]
    end
    
    Frontend --> Backend
    Backend --> External
```

## Tech Stack

- **Package Manager**: bun
- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS (mobile-first)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **AI**: Google Gemini API (text/analysis), Google Imagen (images)
- **Audio**: Forvo API
- **Hosting**: Vercel
- **PWA**: next-pwa

## Database Schema

```mermaid
erDiagram
    users ||--o{ user_settings : has
    users ||--o{ cards : owns
    users ||--o{ learning_progress : tracks
    cards ||--o{ anchors : contains
    cards ||--o{ bindings : has
    
    users {
        uuid id PK
        string email
        timestamp created_at
    }
    
    user_settings {
        uuid id PK
        uuid user_id FK
        string learning_language
        string native_language
        jsonb preferences
    }
    
    cards {
        uuid id PK
        uuid user_id FK
        string word
        string pos
        string ipa
        string translation
        jsonb analysis
        jsonb scene
        string image_url
        string audio_url
        jsonb final_card
        timestamp created_at
    }
    
    anchors {
        uuid id PK
        uuid card_id FK
        string chunk
        string anchor_word
        float score
        string reason
    }
    
    learning_progress {
        uuid id PK
        uuid user_id FK
        uuid card_id FK
        int repetitions
        float ease_factor
        timestamp next_review
    }
```

## Project Structure

```
WordFactory/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── create/page.tsx
│   │   │   ├── learn/page.tsx
│   │   │   └── cards/page.tsx
│   │   ├── api/
│   │   │   ├── analyze/route.ts
│   │   │   ├── anchors/route.ts
│   │   │   ├── scene/route.ts
│   │   │   ├── image/route.ts
│   │   │   └── audio/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── card-creation/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── gemini/
│   │   └── utils/
│   └── types/
├── public/
├── .env.local
├── package.json
└── next.config.js
```

## Implementation Phases

### Phase 1: Project Setup and Auth

- Initialize Next.js with bun, Tailwind, PWA config
- Setup Supabase client and database schema
- Implement auth pages (login/register)
- Create base layout with mobile-first navigation

### Phase 2: Onboarding Flow

- Language selection (learning + native)
- User preferences storage
- Welcome tutorial screens

### Phase 3: Card Creation Pipeline (Core Feature)

Step-by-step UI with confirmation at each stage:

1. **Word Input** - User enters word to learn
2. **Analysis Display** - Show word analysis, POS, translation (Gemini)
3. **Phonetic Chunking** - Display chunks, allow user confirmation
4. **Anchor Selection** - Show anchor candidates with scores, user picks
5. **Binding Preview** - Show proposed scene structure
6. **Image Generation** - Generate and display image (Imagen)
7. **Audio Fetch** - Get pronunciation (Forvo)
8. **Final Card** - Assemble and save

### Phase 4: Learning Mode

- Card review with spaced repetition
- Show image, reveal word/translation
- Track progress

### Phase 5: Polish and Deploy

- PWA manifest and service worker
- Performance optimization
- Vercel deployment

## Key API Endpoints

- `POST /api/analyze` - Word analysis (Gemini)
- `POST /api/anchors` - Generate phonetic anchors (Gemini)
- `POST /api/scene` - Build scene structure (Gemini)
- `POST /api/image` - Generate image (Imagen)
- `GET /api/audio` - Fetch pronunciation (Forvo)
- `POST /api/cards` - Save final card (Supabase)

## Environment Variables

```env
GOOGLE_CLOUD_API_KEY=<from .env>
NEXT_PUBLIC_SUPABASE_URL=https://rfhlkeqbrumryvlnfmbl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<retrieved from MCP>
FORVO_API_KEY=<if needed>
```

## Git Workflow

After each feature completion:

1. Stage changes
2. Commit with descriptive message
3. Push to https://github.com/tairqaldy/WordFactory