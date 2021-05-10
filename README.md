# MangaDex Search API

Search API for MangaDex. Hosted at http://mangadb-search.herokuapp.com/

Contains over 50,000 manga entries scraped from MangaDex.

## Usage

<br>

### List Manga Endpoint
```
/mangadb
```

Gets a list of all manga.

Query parameters:
| Key  | Value |
| ------------- | ------------- |
| sortby  | views, title, rating |
| ascending  | true, false |
| nsfw | true, false |
| limit | the number of results to return |
| skip | the number of results to offset by |

<br>

Example:
```
https://mangadb-search.herokuapp.com/mangadb?sortby=views&ascending=false&nsfw=false&limit=12&skip=0
```
<br>
<br>

### Search Endpoint

```
/mangadb/search
```

Search for a specific title or keyword

Query parameters:
| Key  | Value |
| ------------- | ------------- |
| q | your search query |
| nsfw | true, false |
| limit | the number of results to return |
| skip | the number of results to offset by |

<br>

Example:
```
https://mangadb-search.herokuapp.com/mangadb/search?q=chainsaw+man&nsfw=false&limit=12&skip=0
```
