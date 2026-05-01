(function () {
  const games = window.PUZZLE_GAMES_DATA || [];
  const mount = document.getElementById("home-featured-grid");

  if (!mount) {
    return;
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  const featuredGames = games.filter(function (game) {
    return game.featured;
  });

  function categoryHref(category) {
    const map = {
      "Logic & Drawing": "./categories/logic-drawing-games.html",
      "2048 & Merge": "./categories/2048-merge-games.html",
      "Blocks & Bricks": "./categories/blocks-bricks-games.html",
      "Arcade Brain Games": "./categories/arcade-brain-games.html"
    };
    return map[category] || "./games.html";
  }

  function thumbPath(slug) {
    return "./assets/thumbs/" + encodeURIComponent(slug) + ".svg";
  }

  mount.innerHTML = featuredGames
    .map(function (game, index) {
      const spotlight = index === 0 ? " catalog-card--spotlight" : "";
      const order = String(index + 1).padStart(2, "0");
      const spotlightThumbBody =
        index === 0
          ? '<div class="catalog-thumb-body">' +
            '<span class="catalog-play-glyph" aria-hidden="true"></span>' +
            "<h3>" +
            escapeHtml(game.title) +
            "</h3>" +
            '<div class="catalog-quickline">' +
            '<span>' +
            escapeHtml(game.difficulty) +
            "</span>" +
            '<span>' +
            escapeHtml(game.session) +
            "</span>" +
            "</div>" +
            "</div>"
          : '<div class="catalog-thumb-body catalog-thumb-body--compact">' +
            '<span class="catalog-play-glyph catalog-play-glyph--compact" aria-hidden="true"></span>' +
            "</div>";
      const summary = '<p class="catalog-summary catalog-summary--clamp">' + escapeHtml(game.summary) + "</p>";
      const bodyMeta =
        index === 0
          ? ""
          : '<div class="catalog-quickline catalog-quickline--body">' +
            '<span>' +
            escapeHtml(game.difficulty) +
            "</span>" +
            '<span>' +
            escapeHtml(game.session) +
            "</span>" +
            "</div>";
      return (
        '<article class="catalog-card' +
        spotlight +
        '" data-category="' +
        escapeHtml(game.category) +
        '">' +
        '<div class="catalog-thumb">' +
        '<img class="catalog-thumb-image" src="' +
        thumbPath(game.slug) +
        '" alt="' +
        escapeHtml(game.title) +
        ' thumbnail" loading="lazy" />' +
        '<div class="catalog-thumb-art" aria-hidden="true"><span></span><span></span><span></span></div>' +
        '<div class="catalog-topline">' +
        '<a class="catalog-kicker" href="' +
        categoryHref(game.category) +
        '">' +
        escapeHtml(game.category) +
        "</a>" +
        '<span class="catalog-no">' +
        order +
        "</span>" +
        "</div>" +
        spotlightThumbBody +
        "</div>" +
        '<div class="catalog-card-body">' +
        '<div class="catalog-body-copy">' +
        (index === 0
          ? ""
          : "<h3>" + escapeHtml(game.title) + "</h3>") +
        summary +
        bodyMeta +
        "</div>" +
        '<div class="tag-row">' +
        game.tags
          .map(function (tag) {
            return '<span class="tag-badge">' + escapeHtml(tag) + "</span>";
          })
          .join("") +
        "</div>" +
        '<div class="catalog-actions">' +
        '<a class="catalog-primary" href="./games/' +
        encodeURIComponent(game.slug) +
        '.html">Play now</a>' +
        '<a class="catalog-secondary" href="./games.html">Browse library</a>' +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
})();
