(function () {
  const games = window.PUZZLE_GAMES_DATA || [];
  const grid = document.getElementById("games-grid");
  const featuredGrid = document.getElementById("featured-games-grid");
  const searchInput = document.getElementById("game-search");
  const filterBar = document.getElementById("filter-bar");
  const gameCount = document.getElementById("game-count");
  const categoryCount = document.getElementById("category-count");

  if (!grid || !filterBar || !searchInput) {
    return;
  }

  const categories = Array.from(
    new Set(
      games.map(function (game) {
        return game.category;
      })
    )
  );

  let activeCategory = "All";
  let query = "";

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function badgeList(tags) {
    return tags
      .map(function (tag) {
        return '<span class="tag-badge">' + escapeHtml(tag) + "</span>";
      })
      .join("");
  }

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

  function cardMarkup(game, number, spotlight) {
    const spotlightClass = spotlight ? " catalog-card--spotlight" : "";
    const thumbBody = spotlight
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
    const title = spotlight ? "" : "<h3>" + escapeHtml(game.title) + "</h3>";
    const summary = '<p class="catalog-summary catalog-summary--clamp">' + escapeHtml(game.summary) + "</p>";
    const bodyMeta = spotlight
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
      spotlightClass +
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
      escapeHtml(String(number).padStart(2, "0")) +
      "</span>" +
      "</div>" +
      thumbBody +
      "</div>" +
      '<div class="catalog-card-body">' +
      '<div class="catalog-body-copy">' +
      title +
      summary +
      bodyMeta +
      "</div>" +
      '<div class="tag-row">' +
      badgeList(game.tags) +
      "</div>" +
      '<div class="catalog-actions">' +
      '<a class="catalog-primary" href="./games/' +
      encodeURIComponent(game.slug) +
      '.html">Play now</a>' +
      '<a class="catalog-secondary" href="' +
      escapeHtml(game.sourceUrl) +
      '" target="_blank" rel="noopener noreferrer">Source</a>' +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderFilters() {
    const items = ["All"].concat(categories);
    filterBar.innerHTML = items
      .map(function (category) {
        const active = category === activeCategory ? " is-active" : "";
        return (
          '<button class="filter-chip' +
          active +
          '" data-category="' +
          escapeHtml(category) +
          '" type="button">' +
          escapeHtml(category) +
          "</button>"
        );
      })
      .join("");
  }

  function filteredGames() {
    return games.filter(function (game) {
      const categoryMatch = activeCategory === "All" || game.category === activeCategory;
      const haystack = [game.title, game.category, game.summary].concat(game.tags).join(" ").toLowerCase();
      const queryMatch = !query || haystack.includes(query);
      return categoryMatch && queryMatch;
    });
  }

  function renderFeatured() {
    if (!featuredGrid) {
      return;
    }

    const featured = games.filter(function (game) {
      return game.featured;
    });

    featuredGrid.innerHTML = featured
      .map(function (game, index) {
        return cardMarkup(game, index + 1, index === 0);
      })
      .join("");
  }

  function renderGrid() {
    const results = filteredGames();
    if (!results.length) {
      grid.innerHTML =
        '<article class="empty-state">' +
        "<div>" +
        "<h3>No games match that filter</h3>" +
        "<p>Try a broader keyword or switch back to All categories to see the full library again.</p>" +
        "</div>" +
        "</article>";
    } else {
      grid.innerHTML = results
        .map(function (game, index) {
          return cardMarkup(game, index + 1, false);
        })
        .join("");
    }
    gameCount.textContent = String(games.length);
    categoryCount.textContent = String(categories.length);
    document.getElementById("results-count").textContent = String(results.length);
  }

  filterBar.addEventListener("click", function (event) {
    const button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }

    activeCategory = button.getAttribute("data-category") || "All";
    renderFilters();
    renderGrid();
  });

  searchInput.addEventListener("input", function (event) {
    query = event.target.value.trim().toLowerCase();
    renderGrid();
  });

  renderFilters();
  renderFeatured();
  renderGrid();
})();
