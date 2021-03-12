const convertToMangaDexFormat = (result) => {
  const converted = { ...result }
  delete converted.manga_id
  converted.id = result.manga_id
  delete converted.rating_bayesian
  converted.rating = { bayesian: result.rating_bayesian }
  delete converted.maincover
  converted.mainCover = result.maincover
  return converted
}

module.exports = {
  convertToMangaDexFormat
}