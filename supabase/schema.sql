-- WordFactory Database Schema
-- Created: 2026-01-13

-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  learning_language TEXT NOT NULL DEFAULT 'en',
  native_language TEXT NOT NULL DEFAULT 'ru',
  preferences JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  pos TEXT NOT NULL CHECK (pos IN ('noun', 'verb', 'adjective')),
  ipa TEXT,
  translation TEXT NOT NULL,
  learning_language TEXT NOT NULL DEFAULT 'en',
  native_language TEXT NOT NULL DEFAULT 'ru',
  analysis JSONB,
  meaning_anchor JSONB,
  phonetics JSONB,
  scene JSONB,
  image_prompt JSONB,
  image_url TEXT,
  audio_url TEXT,
  example TEXT,
  example_translation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_word ON cards(word);

-- =====================================================
-- ANCHORS TABLE (Phonetic anchors for each card)
-- =====================================================
CREATE TABLE IF NOT EXISTS anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  chunk TEXT NOT NULL,
  chunk_ipa TEXT,
  anchor_word TEXT NOT NULL,
  score REAL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view anchors of own cards" ON anchors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cards WHERE cards.id = anchors.card_id AND cards.user_id = auth.uid())
  );

CREATE POLICY "Users can insert anchors for own cards" ON anchors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cards WHERE cards.id = anchors.card_id AND cards.user_id = auth.uid())
  );

CREATE POLICY "Users can delete anchors of own cards" ON anchors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM cards WHERE cards.id = anchors.card_id AND cards.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_anchors_card_id ON anchors(card_id);

-- =====================================================
-- BINDINGS TABLE (Relations between anchors in scene)
-- =====================================================
CREATE TABLE IF NOT EXISTS bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  anchor TEXT NOT NULL,
  relation TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bindings of own cards" ON bindings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cards WHERE cards.id = bindings.card_id AND cards.user_id = auth.uid())
  );

CREATE POLICY "Users can insert bindings for own cards" ON bindings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cards WHERE cards.id = bindings.card_id AND cards.user_id = auth.uid())
  );

CREATE POLICY "Users can delete bindings of own cards" ON bindings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM cards WHERE cards.id = bindings.card_id AND cards.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_bindings_card_id ON bindings(card_id);

-- =====================================================
-- LEARNING PROGRESS TABLE (Spaced repetition)
-- =====================================================
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review TIMESTAMPTZ DEFAULT now(),
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, card_id)
);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON learning_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON learning_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_next_review ON learning_progress(next_review);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
    BEFORE UPDATE ON learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, learning_language, native_language)
    VALUES (NEW.id, 'en', 'ru');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
