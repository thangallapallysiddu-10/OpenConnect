import { query } from './pool';

const statements = [
  'CREATE EXTENSION IF NOT EXISTS pgcrypto',
  "DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user','admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
  "DO $$ BEGIN CREATE TYPE report_status AS ENUM ('pending','reviewing','resolved','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio varchar(500)",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS location varchar(120)",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'",
  'ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()',
  'ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT now()',
  'ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS family_id uuid',
  'ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS replaced_by uuid',
  "DO $$ BEGIN IF to_regclass('public.devices') IS NOT NULL THEN ALTER TABLE devices ALTER COLUMN id SET DEFAULT gen_random_uuid(); END IF; END $$",
  "DO $$ BEGIN IF to_regclass('public.refresh_tokens') IS NOT NULL THEN ALTER TABLE refresh_tokens ALTER COLUMN id SET DEFAULT gen_random_uuid(); END IF; END $$",
  "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='refresh_tokens' AND column_name='jti') THEN ALTER TABLE refresh_tokens ALTER COLUMN jti SET DEFAULT gen_random_uuid()::text; END IF; END $$",
  'CREATE TABLE IF NOT EXISTS genres (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(100) UNIQUE NOT NULL, image_url text, created_at timestamptz DEFAULT now())',
  'CREATE TABLE IF NOT EXISTS artists (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, bio text, image_url text, verified boolean DEFAULT false, created_at timestamptz DEFAULT now())',
  'CREATE TABLE IF NOT EXISTS albums (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), artist_id uuid REFERENCES artists(id) ON DELETE SET NULL, title varchar(255) NOT NULL, cover_url text, release_date date, created_at timestamptz DEFAULT now())',
  `CREATE TABLE IF NOT EXISTS songs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
    album_id uuid REFERENCES albums(id) ON DELETE SET NULL,
    genre_id uuid REFERENCES genres(id) ON DELETE SET NULL,
    title varchar(255) NOT NULL,
    audio_url text NOT NULL,
    cover_url text,
    duration_seconds integer NOT NULL CHECK(duration_seconds > 0),
    language varchar(40),
    play_count bigint DEFAULT 0,
    is_trending boolean DEFAULT false,
    published_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
  )`,
  'CREATE TABLE IF NOT EXISTS podcast_categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(120) UNIQUE NOT NULL, image_url text)',
  `CREATE TABLE IF NOT EXISTS podcasts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES podcast_categories(id) ON DELETE SET NULL,
    title varchar(255) NOT NULL,
    description text,
    cover_url text,
    language varchar(40),
    is_trending boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS radio_stations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(180) NOT NULL,
    description text,
    logo_url text,
    stream_url text NOT NULL,
    city varchar(120),
    genre varchar(100),
    language varchar(40),
    listeners integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS rjs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id uuid REFERENCES radio_stations(id) ON DELETE SET NULL,
    name varchar(180) NOT NULL,
    bio text,
    image_url text,
    is_live boolean DEFAULT false,
    listeners integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    description text,
    image_url text,
    venue varchar(255),
    city varchar(120),
    event_type varchar(80),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz,
    ticket_url text,
    created_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(180) NOT NULL,
    logo_url text,
    stream_url text NOT NULL,
    channel_number integer,
    language varchar(40),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    image_url text NOT NULL,
    target_url text,
    placement varchar(80) DEFAULT 'home_banner',
    priority integer DEFAULT 0,
    starts_at timestamptz,
    ends_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  )`,
];

export async function ensureDatabaseCompatibility() {
  for (const statement of statements) {
    await query(statement);
  }
}
