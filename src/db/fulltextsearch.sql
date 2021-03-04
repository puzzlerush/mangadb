/* Without weights */
SELECT * FROM manga
WHERE 
to_tsvector(title || ' ' || array_to_string(alttitles, ' ') || ' ' || description)
@@ plainto_tsquery('angel beats')

/* With weights */
SELECT * FROM manga
WHERE 
setweight(to_tsvector(title), 'A') ||
setweight(to_tsvector(array_to_string(alttitles, ' ')), 'B') ||
setweight(to_tsvector(description), 'C')
@@ plainto_tsquery('angel beats')

/* Weighted and ranked */
SELECT *, ts_rank_cd (
setweight(to_tsvector(title), 'A') ||
setweight(to_tsvector(array_to_string(alttitles, ' ')), 'B') ||
setweight(to_tsvector(description), 'C'),
plainto_tsquery('angel beats')
) AS rank FROM manga
WHERE 
setweight(to_tsvector(title), 'A') ||
setweight(to_tsvector(array_to_string(alttitles, ' ')), 'B') ||
setweight(to_tsvector(description), 'C')
@@ plainto_tsquery('angel beats')
ORDER BY rank DESC;

/*  Take into account relation_titles so main series is ranked
    before spin-off series  */

SELECT *, ts_rank_cd (
setweight(to_tsvector(title), 'A') ||
setweight(to_tsvector(array_to_string(alttitles, ' ')), 'B') ||
setweight(to_tsvector(array_to_string(relation_titles, ' ')), 'B') || 
setweight(to_tsvector(description), 'C'),
plainto_tsquery('tower of god')
) AS rank FROM manga
WHERE 
setweight(to_tsvector(title), 'A') ||
setweight(to_tsvector(array_to_string(alttitles, ' ')), 'B') ||
setweight(to_tsvector(array_to_string(relation_titles, ' ')), 'B') ||
setweight(to_tsvector(description), 'C')
@@ plainto_tsquery('tower of god')
ORDER BY rank DESC;

/* Create separate tsvector column to improve search speed */
ALTER TABLE manga ADD COLUMN textsearchable_index_col tsvector;
UPDATE manga SET textsearchable_index_col =
  setweight(to_tsvector(title), 'A') ||
  setweight(to_tsvector(array_to_string(alttitles, ' ')), 'B') ||
  setweight(to_tsvector(array_to_string(relation_titles, ' ')), 'B') ||
  setweight(to_tsvector(description), 'C');

/* Create stored generated column to hold tsvector */

/* First create immutable version of array_to_string */
create or replace function immutable_array_to_string(arr anyarray, delimiter text)
returns text
LANGUAGE plpgsql immutable
as
$$
declare
  concatenated text;
begin
  select array_to_string(arr, delimiter) into concatenated;
  return concatenated;
end;
$$;

/* Now to create stored generated column */
ALTER TABLE manga
  ADD COLUMN textsearchable_index_col tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', immutable_array_to_string(alttitles, ' ')), 'B') ||
      setweight(to_tsvector('english', immutable_array_to_string(relation_titles, ' ')), 'B') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;

/* Create GIN index to speed up search */
CREATE INDEX textsearch_idx ON manga USING GIN (textsearchable_index_col);

/* Insert new row to test the generated column */
insert into manga (manga_id, title, alttitles, description, relation_titles)
values (
	69696969, 
	'cory in the house', 
	'{"white house livin", "tomato town"}', 
	'disney classic anime',
	'{"cory in the house 2"}'
);