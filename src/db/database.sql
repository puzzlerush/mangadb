CREATE DATABASE mangadb;

CREATE TABLE manga (
  manga_id INTEGER PRIMARY KEY,
  title TEXT,
  altTitles TEXT [],
  description TEXT,
  artist TEXT[],
  author TEXT[],
  language VARCHAR(20),
  status INTEGER,
  demographic INTEGER,
  tags INTEGER[],
  lastChapter VARCHAR(20),
  lastVolume VARCHAR(20),
  isHentai BOOLEAN,
  mal TEXT,
  engtl TEXT,
  relation_ids INTEGER[],
  relation_titles TEXT[],
  relation_types INTEGER[],
  relation_isHentais BOOLEAN[],
  rating_bayesian DECIMAL(4, 2),
  rating_mean DECIMAL(4, 2),
  rating_users INTEGER,
  views INTEGER,
  follows INTEGER,
  comments INTEGER,
  lastUploaded INTEGER,
  mainCover TEXT
);

CREATE TABLE downloads (
  id SERIAL PRIMARY KEY,
  start_id INTEGER,
  end_id INTEGER,
  success INTEGER[] DEFAULT '{}',
  failed INTEGER[] DEFAULT '{}',
  unknown INTEGER[] DEFAULT '{}',
  time_created TIMESTAMPTZ DEFAULT NOW()
);

create table manga_id_map (
  id SERIAL PRIMARY KEY,
  legacy_id INTEGER,
  new_id TEXT
);

copy manga_id_map (id, legacy_id, new_id)
from 'manga_map.csv'
delimiter ','
csv header;

\copy manga_id_map(id, legacy_id, new_id) from manga_map.csv csv header;