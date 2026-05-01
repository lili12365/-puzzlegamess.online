(function () {
  const games = window.PUZZLE_GAMES_DATA || [];
  const index = window.PUZZLE_GAMES_INDEX || {};
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get("game");
  const fallbackGame = games[0];
  const game = index[requestedSlug] || fallbackGame;

  if (!game) {
    return;
  }

  const titleEl = document.getElementById("player-title");
  const summaryEl = document.getElementById("player-summary");
  const introEl = document.getElementById("player-intro");
  const frameMount = document.getElementById("player-frame");
  const factsMount = document.getElementById("player-facts");
  const tagsMount = document.getElementById("player-tags");
  const pillsMount = document.getElementById("player-pills");
  const statusEl = document.getElementById("player-status");
  const relatedMount = document.getElementById("related-games");
  const sourceLink = document.getElementById("source-link");
  const libraryLink = document.getElementById("library-link");
  const canonical = document.querySelector('link[rel="canonical"]');
  const description = document.querySelector('meta[name="description"]');
  const pageTitle = game.title + " | Play Online on PuzzleGames.space";
  const playMode = game.playerUrl ? "Embedded play" : "Source-hosted";

  titleEl.textContent = game.title;
  summaryEl.textContent = game.summary;
  introEl.textContent = game.intro;
  sourceLink.href = game.sourceUrl;
  libraryLink.href = "./games.html";
  document.body.dataset.gameCategory = game.category;

  if (canonical) {
    canonical.href = "https://puzzlegames.space/play.html?game=" + encodeURIComponent(game.slug);
  }

  if (description) {
    description.setAttribute(
      "content",
      game.title +
        " on PuzzleGames.space. " +
        game.summary +
        " Read the overview, then play in the embedded frame or open the source page."
    );
  }

  document.title = pageTitle;

  if (pillsMount) {
    pillsMount.innerHTML =
      '<span class="player-pill"><strong>Category</strong> ' +
      game.category +
      "</span>" +
      '<span class="player-pill"><strong>Difficulty</strong> ' +
      game.difficulty +
      "</span>" +
      '<span class="player-pill"><strong>Session</strong> ' +
      game.session +
      "</span>" +
      '<span class="player-pill"><strong>Mode</strong> ' +
      playMode +
      "</span>";
  }

  tagsMount.innerHTML = game.tags
    .map(function (tag) {
      return '<span class="tag-badge">' + tag + "</span>";
    })
    .join("");

  factsMount.innerHTML =
    "<div><dt>Category</dt><dd>" +
    game.category +
    "</dd></div>" +
    "<div><dt>Difficulty</dt><dd>" +
    game.difficulty +
    "</dd></div>" +
    "<div><dt>Session</dt><dd>" +
    game.session +
    "</dd></div>" +
    "<div><dt>Best for</dt><dd>" +
    game.bestFor +
    "</dd></div>";

  frameMount.innerHTML =
    '<div class="frame-topbar">' +
    "<div>" +
    '<span class="frame-label">' +
    playMode +
    "</span>" +
    "<strong>" +
    game.title +
    "</strong>" +
    "</div>" +
    '<a class="catalog-secondary" href="' +
    game.sourceUrl +
    '" target="_blank" rel="noopener noreferrer">Open source</a>' +
    "</div>" +
    '<div class="frame-stage-body"></div>';

  if (game.playerUrl) {
    const frame = document.createElement("iframe");
    frame.className = "game-frame";
    frame.src = game.playerUrl;
    frame.title = game.title + " playable game frame";
    frame.loading = "eager";
    frame.allowFullscreen = true;
    frameMount.querySelector(".frame-stage-body").appendChild(frame);
    statusEl.innerHTML =
      "Embedded play is enabled for this entry. If the frame does not load on your device, use the source link below to open the original host.";
  } else {
    frameMount.querySelector(".frame-stage-body").innerHTML =
      '<div class="player-fallback">' +
      '<h2>Source-hosted play</h2>' +
      "<p>This partner page is better opened on the source site. Some hosts restrict third-party embedding, so this entry uses a direct open flow instead of forcing a broken iframe.</p>" +
      '<a class="catalog-primary" href="' +
      game.sourceUrl +
      '" target="_blank" rel="noopener noreferrer">Open on source site</a>' +
      "</div>";
    statusEl.innerHTML =
      "This title currently opens on the original source site instead of embedding inside PuzzleGames.space.";
  }

  const related = games
    .filter(function (entry) {
      return entry.category === game.category && entry.slug !== game.slug;
    })
    .slice(0, 4);

  relatedMount.innerHTML = related
    .map(function (entry) {
      return (
        '<a class="related-card" data-category="' +
        entry.category +
        '" href="./play.html?game=' +
        encodeURIComponent(entry.slug) +
        '">' +
        '<span class="related-title">' +
        entry.title +
        "</span>" +
        '<span class="related-copy">' +
        entry.summary +
        "</span>" +
        "</a>"
      );
    })
    .join("");
})();
