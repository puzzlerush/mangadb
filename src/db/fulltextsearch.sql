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