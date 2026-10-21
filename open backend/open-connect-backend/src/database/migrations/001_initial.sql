CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE user_role AS ENUM ('user','admin');
CREATE TYPE user_status AS ENUM ('active','suspended','deleted');
CREATE TYPE report_status AS ENUM ('pending','reviewing','resolved','rejected');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email varchar(255) UNIQUE NOT NULL,
  password_hash text NOT NULL, display_name varchar(120) NOT NULL, avatar_url text, bio varchar(500),
  location varchar(120), role user_role NOT NULL DEFAULT 'user', status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id uuid NOT NULL, token_hash char(64) UNIQUE NOT NULL, device_id uuid, expires_at timestamptz NOT NULL,
  revoked_at timestamptz, replaced_by uuid REFERENCES refresh_tokens(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_key varchar(255) NOT NULL, platform varchar(30), push_token text, last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, device_key)
);
ALTER TABLE refresh_tokens ADD CONSTRAINT refresh_device_fk FOREIGN KEY (device_id) REFERENCES user_devices(id) ON DELETE SET NULL;

CREATE TABLE genres (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(100) UNIQUE NOT NULL, image_url text, created_at timestamptz DEFAULT now());
CREATE TABLE artists (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, bio text, image_url text, verified boolean DEFAULT false, created_at timestamptz DEFAULT now());
CREATE TABLE albums (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), artist_id uuid REFERENCES artists(id) ON DELETE SET NULL, title varchar(255) NOT NULL, cover_url text, release_date date, created_at timestamptz DEFAULT now());
CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  album_id uuid REFERENCES albums(id) ON DELETE SET NULL, genre_id uuid REFERENCES genres(id) ON DELETE SET NULL,
  title varchar(255) NOT NULL, audio_url text NOT NULL, cover_url text, duration_seconds integer NOT NULL CHECK(duration_seconds > 0),
  language varchar(40), play_count bigint DEFAULT 0, is_trending boolean DEFAULT false, published_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now()
);

CREATE TABLE podcast_categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(120) UNIQUE NOT NULL, image_url text);
CREATE TABLE speakers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, bio text, image_url text, created_at timestamptz DEFAULT now());
CREATE TABLE podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category_id uuid REFERENCES podcast_categories(id) ON DELETE SET NULL,
  title varchar(255) NOT NULL, description text, cover_url text, language varchar(40), is_trending boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE podcast_speakers (podcast_id uuid REFERENCES podcasts(id) ON DELETE CASCADE, speaker_id uuid REFERENCES speakers(id) ON DELETE CASCADE, PRIMARY KEY(podcast_id,speaker_id));
CREATE TABLE podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), podcast_id uuid NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL, description text, audio_url text NOT NULL, cover_url text, duration_seconds integer NOT NULL CHECK(duration_seconds > 0),
  episode_number integer, published_at timestamptz DEFAULT now(), play_count bigint DEFAULT 0, created_at timestamptz DEFAULT now()
);

CREATE TABLE radio_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, description text, logo_url text, stream_url text NOT NULL,
  city varchar(120), genre varchar(100), language varchar(40), listeners integer DEFAULT 0, is_active boolean DEFAULT true, created_at timestamptz DEFAULT now()
);
CREATE TABLE rjs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), station_id uuid REFERENCES radio_stations(id) ON DELETE SET NULL,
  name varchar(180) NOT NULL, bio text, image_url text, is_live boolean DEFAULT false, listeners integer DEFAULT 0, created_at timestamptz DEFAULT now()
);
CREATE TABLE live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), station_id uuid REFERENCES radio_stations(id) ON DELETE CASCADE,
  rj_id uuid REFERENCES rjs(id) ON DELETE SET NULL, title varchar(255) NOT NULL, stream_url text,
  starts_at timestamptz NOT NULL, ends_at timestamptz, is_live boolean DEFAULT false, created_at timestamptz DEFAULT now()
);

CREATE TABLE events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title varchar(255) NOT NULL, description text, image_url text, venue varchar(255), city varchar(120), event_type varchar(80), starts_at timestamptz NOT NULL, ends_at timestamptz, ticket_url text, created_at timestamptz DEFAULT now());
CREATE TABLE channels (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, logo_url text, stream_url text NOT NULL, channel_number integer, language varchar(40), is_active boolean DEFAULT true, created_at timestamptz DEFAULT now());
CREATE TABLE ads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title varchar(255) NOT NULL, image_url text NOT NULL, target_url text, placement varchar(80) DEFAULT 'home_banner', priority integer DEFAULT 0, starts_at timestamptz, ends_at timestamptz, is_active boolean DEFAULT true, created_at timestamptz DEFAULT now());

CREATE TABLE favorite_songs (user_id uuid REFERENCES users(id) ON DELETE CASCADE, song_id uuid REFERENCES songs(id) ON DELETE CASCADE, created_at timestamptz DEFAULT now(), PRIMARY KEY(user_id,song_id));
CREATE TABLE favorite_podcasts (user_id uuid REFERENCES users(id) ON DELETE CASCADE, podcast_id uuid REFERENCES podcasts(id) ON DELETE CASCADE, created_at timestamptz DEFAULT now(), PRIMARY KEY(user_id,podcast_id));
CREATE TABLE favorite_rjs (user_id uuid REFERENCES users(id) ON DELETE CASCADE, rj_id uuid REFERENCES rjs(id) ON DELETE CASCADE, created_at timestamptz DEFAULT now(), PRIMARY KEY(user_id,rj_id));
CREATE TABLE favorite_stations (user_id uuid REFERENCES users(id) ON DELETE CASCADE, station_id uuid REFERENCES radio_stations(id) ON DELETE CASCADE, created_at timestamptz DEFAULT now(), PRIMARY KEY(user_id,station_id));
CREATE TABLE play_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type varchar(20) NOT NULL CHECK(content_type IN ('song','episode','station')), content_id uuid NOT NULL,
  played_seconds integer DEFAULT 0, played_at timestamptz DEFAULT now()
);
CREATE TABLE playback_progress (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE, episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  progress_seconds integer NOT NULL DEFAULT 0 CHECK(progress_seconds >= 0), completed boolean DEFAULT false, updated_at timestamptz DEFAULT now(), PRIMARY KEY(user_id,episode_id)
);

CREATE TABLE notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id) ON DELETE CASCADE, type varchar(80) NOT NULL, title varchar(255) NOT NULL, body text NOT NULL, data jsonb DEFAULT '{}', read_at timestamptz, created_at timestamptz DEFAULT now());
CREATE TABLE notification_subscriptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, event_id uuid REFERENCES events(id) ON DELETE CASCADE, live_session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE, created_at timestamptz DEFAULT now(), CHECK(event_id IS NOT NULL OR live_session_id IS NOT NULL));
CREATE UNIQUE INDEX notification_event_unique ON notification_subscriptions(user_id,event_id) WHERE event_id IS NOT NULL;
CREATE UNIQUE INDEX notification_live_unique ON notification_subscriptions(user_id,live_session_id) WHERE live_session_id IS NOT NULL;
CREATE TABLE reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, target_type varchar(30) NOT NULL, target_id uuid NOT NULL, reason varchar(255) NOT NULL, details text, status report_status DEFAULT 'pending', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE rj_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id) ON DELETE SET NULL, requester_name varchar(160) NOT NULL, rj_name varchar(180) NOT NULL, station_name varchar(180) NOT NULL, location varchar(180), message text, status varchar(30) DEFAULT 'pending', created_at timestamptz DEFAULT now());
CREATE TABLE live_chat_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, message varchar(1000) NOT NULL, created_at timestamptz DEFAULT now());

CREATE INDEX users_email_lower_idx ON users(lower(email));
CREATE INDEX refresh_tokens_user_family_idx ON refresh_tokens(user_id,family_id);
CREATE INDEX songs_published_idx ON songs(published_at DESC); CREATE INDEX songs_trending_idx ON songs(play_count DESC) WHERE is_trending;
CREATE INDEX songs_title_trgm_idx ON songs USING gin(title gin_trgm_ops); CREATE INDEX artists_name_trgm_idx ON artists USING gin(name gin_trgm_ops);
CREATE INDEX podcasts_title_trgm_idx ON podcasts USING gin(title gin_trgm_ops); CREATE INDEX podcasts_trending_idx ON podcasts(is_trending,created_at DESC);
CREATE INDEX rjs_name_trgm_idx ON rjs USING gin(name gin_trgm_ops); CREATE INDEX stations_name_trgm_idx ON radio_stations USING gin(name gin_trgm_ops);
CREATE INDEX events_title_trgm_idx ON events USING gin(title gin_trgm_ops); CREATE INDEX events_start_idx ON events(starts_at);
CREATE INDEX history_user_played_idx ON play_history(user_id,played_at DESC); CREATE INDEX notifications_user_idx ON notifications(user_id,created_at DESC);
CREATE INDEX chat_session_created_idx ON live_chat_messages(session_id,created_at DESC); CREATE INDEX ads_active_idx ON ads(placement,priority DESC) WHERE is_active;
