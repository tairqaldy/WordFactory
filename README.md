# WordFactory

AI-powered mnemonic flashcard generator for vocabulary learning.

## Features

- **AI-Powered Card Creation**: Uses Google Gemini to analyze words, generate phonetic anchors, and build mnemonic scenes
- **Visual Memory**: AI-generated images to create memorable associations
- **Phonetic Anchors**: Sound-alike words in your native language
- **Spaced Repetition**: SM-2 algorithm for optimal review scheduling
- **Mobile-First PWA**: Installable app with offline support
- **Multi-Language**: Support for English, Russian, German, French, Spanish, Dutch, and Kazakh

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Google Gemini API, Google Imagen
- **Deployment**: Vercel
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Supabase project
- Google Cloud API key with Gemini and Imagen access

### Installation

```bash
# Clone the repository
git clone https://github.com/tairqaldy/WordFactory.git
cd WordFactory

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your keys
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# GOOGLE_CLOUD_API_KEY=your-google-api-key

# Run development server
bun dev
```

### Database Setup

The database schema is in `supabase/schema.sql`. Run it in your Supabase SQL editor.

## Card Creation Pipeline

1. **Word Input** - User enters a word to learn
2. **Analysis** - Gemini analyzes the word (POS, IPA, translation)
3. **Chunking** - Word is split into phonetic chunks
4. **Anchors** - AI generates sound-alike words in native language
5. **Scene** - AI builds a visual scene connecting anchors to meaning
6. **Image** - Scene is rendered as an image
7. **Save** - Card is saved with spaced repetition tracking

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tairqaldy/WordFactory)

## License

MIT
