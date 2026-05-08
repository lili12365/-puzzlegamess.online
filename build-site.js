const fs = require("fs");
const path = require("path");
const vm = require("vm");
const pageContent = require("./game-page-content.js");

const ROOT = __dirname;
const SITE_URL = "https://puzzlegames.space";
const LASTMOD = "2026-05-01";
const THUMB_WIDTH = 1200;
const THUMB_HEIGHT = 675;
const ADSENSE_HEAD_SCRIPT =
  '  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3376278485410551" crossorigin="anonymous"></script>';
const PAGE_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};
const IMAGE_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
};

const CATEGORY_GUIDES = {
  "Logic & Drawing": {
    label: "Logic & Drawing",
    overview:
      "Logic and drawing puzzles reward players who can slow the board down, read the full state, and make one clean decision at a time. The best runs usually come from spotting constraints early rather than reacting after the board gets crowded.",
    playFocus:
      "Treat the opening as information gathering. Look at the full layout, identify the pressure point, and make sure each move improves the board rather than just changing it.",
    rhythm:
      "Most games in this lane feel better when you trade speed for accuracy. Small corrections early usually save much larger mistakes later.",
    tips: [
      "Pause before the first move and identify the one area of the board you cannot afford to lose.",
      "When several moves look equal, choose the one that keeps the most future routes open.",
      "If a puzzle gives you drawing or path freedom, prefer cleaner lines over flashy solutions."
    ]
  },
  "2048 & Merge": {
    label: "2048 & Merge",
    overview:
      "Merge games look relaxed on the surface, but they become much stronger when you manage board space deliberately. Good players protect a stable corner or lane, avoid wasteful merges, and build momentum without collapsing the whole layout.",
    playFocus:
      "The goal is not only to make the next merge. The real goal is to preserve the board shape that lets the next five merges happen without panic.",
    rhythm:
      "Longer sessions reward consistency. Small positioning habits matter more than single lucky combinations.",
    tips: [
      "Choose a primary build area early and try not to scatter your strongest pieces across the board.",
      "Avoid impulse merges that feel good now but destroy your structure for the next turn.",
      "When pressure rises, clear space first and score second."
    ]
  },
  "Blocks & Bricks": {
    label: "Blocks & Bricks",
    overview:
      "Block and brick games reward shape recognition, lane control, and efficient recovery. Whether pieces are falling, sliding, or bouncing, the best play usually comes from preserving space and removing the most dangerous clutter first.",
    playFocus:
      "Think in terms of board health. Every move should either create space, reduce chaos, or set up a reliable follow-up.",
    rhythm:
      "These games often punish tunnel vision. Looking one or two pieces ahead is usually enough to prevent a board from spiraling.",
    tips: [
      "Protect your cleanest lane or corner so you always have a recovery route.",
      "When a move can clear immediate danger, value that over a flashy combo that leaves a messy board.",
      "If the board starts to tighten, switch from scoring mode to space-management mode."
    ]
  },
  "Arcade Brain Games": {
    label: "Arcade Brain Games",
    overview:
      "Arcade brain games sit between puzzle logic and reflex play. They still reward planning, but execution speed, timing, and clean retries matter much more than in slower board-based titles.",
    playFocus:
      "The best approach is to learn the rhythm first. Once the pace feels natural, start optimizing routes, timing windows, and safer patterns.",
    rhythm:
      "Short sessions are an advantage here. Reset quickly, notice what failed, and carry one correction into the next run.",
    tips: [
      "Use early attempts to learn timing rather than chasing a perfect run immediately.",
      "When a section keeps failing, simplify your route instead of forcing riskier inputs.",
      "A stable repeatable pattern is usually stronger than one brilliant but inconsistent shortcut."
    ]
  }
};

const TAG_NOTES = {
  logic: "reading constrained board states and choosing the cleanest sequence",
  grid: "protecting open cells and understanding positional pressure",
  strategy: "thinking a couple of turns ahead instead of solving only the current move",
  golf: "judging angles and committing to a controlled line",
  trajectory: "estimating movement paths before you release an action",
  drawing: "using lines or paths as the main problem-solving tool",
  physics: "understanding how motion and contact affect the result",
  "brain teaser": "solving compact challenges that reward pattern recognition",
  calm: "slow, low-pressure problem solving that still rewards precision",
  escape: "finding the move that unlocks a blocked situation",
  twist: "reframing the obvious answer and looking for less literal solutions",
  casual: "quick onboarding and low-friction retries",
  path: "mapping routes before committing to the next action",
  arrows: "reading directional rules and chain reactions",
  route: "prioritizing movement order and clean sequencing",
  merge: "combining pieces while protecting board structure",
  numbers: "reading value progression and preserving high-value space",
  board: "controlling layout health rather than only chasing score",
  "2048": "building upward through disciplined number management",
  classic: "leaning on familiar rules that still reward strong fundamentals",
  fruit: "balancing placement and combination timing under growing pressure",
  meme: "using novelty presentation on top of a familiar core loop",
  roguelike: "accepting pressure and making longer-run survival decisions",
  variant: "working inside a familiar rule set with one strong twist",
  drop: "managing gravity and stack height at the same time",
  triples: "planning around less frequent but more valuable combinations",
  blend: "creating smooth value chains without crowding the board",
  tetris: "rotating and placing pieces with line efficiency in mind",
  blocks: "making every placement help future recovery",
  rows: "clearing danger before the board seals up",
  placement: "valuing piece position as much as immediate payoff",
  bricks: "using bounce geometry and target order efficiently",
  angles: "finding stronger rebounds with cleaner timing",
  arcade: "mixing timing pressure with puzzle-style planning",
  tetrix: "playing a recognizable falling-block formula with quick resets",
  lines: "tracking clear opportunities before they disappear",
  slide: "working around movement constraints and locked spaces",
  "3d": "reading shape pressure from a more visual presentation",
  visual: "solving through pattern recognition and image completion",
  assembly: "constructing a full result from smaller fragments",
  timing: "acting within short windows instead of relying only on planning",
  swing: "keeping momentum under control instead of overcorrecting",
  quirky: "working through unusual setups with lightweight rules",
  short: "getting value from compact sessions and fast restarts",
  stacking: "keeping balance and shape control under pressure",
  shots: "using limited actions efficiently rather than spamming attempts",
  targets: "breaking priorities down into the safest order",
  ball: "guiding movement through precision and rhythm",
  movement: "controlling pace and path at the same time",
  breakout: "managing rebounds so each touch creates a better next angle",
  jelly: "adjusting inputs delicately so momentum stays usable",
  hop: "timing repeated jumps without rushing the release",
  blocky: "reading obstacles early and favoring stable routes",
  rush: "balancing speed with enough control to avoid reset loops"
};

const CATEGORY_PALETTES = {
  "Logic & Drawing": {
    base: "#2457d8",
    secondary: "#69bbff",
    accent: "#a8dcff",
    deep: "#12204a",
    soft: "#e9efff"
  },
  "2048 & Merge": {
    base: "#ef8a45",
    secondary: "#ffc36a",
    accent: "#ffe4a8",
    deep: "#472411",
    soft: "#fff0e3"
  },
  "Blocks & Bricks": {
    base: "#2f9d8f",
    secondary: "#79d3b4",
    accent: "#c9f4e2",
    deep: "#103830",
    soft: "#e4f7f1"
  },
  "Arcade Brain Games": {
    base: "#cc5864",
    secondary: "#ffae72",
    accent: "#ffd8bf",
    deep: "#43171d",
    soft: "#ffecef"
  }
};

const CATEGORY_PAGES = {
  "Logic & Drawing": {
    slug: "logic-drawing-games",
    heroTitle: "Free Logic and Drawing Games Online",
    phrase: "logic and drawing games",
    description:
      "Explore route planning, drawing puzzles, physics puzzles, and compact browser brain teasers that reward patience, board reading, and clean sequencing.",
    playerNeed:
      "This category is a strong fit for players who want clear rules, thoughtful moves, and short sessions that still feel smart instead of noisy.",
    searchIntent:
      "It matches searches for logic puzzle games, drawing puzzle games, path puzzles, and calm browser puzzle games that are easy to start but still worth replaying.",
    searchTerms: ["logic puzzle games", "drawing games", "path puzzles", "physics puzzles"]
  },
  "2048 & Merge": {
    slug: "2048-merge-games",
    heroTitle: "Free 2048 and Merge Games Online",
    phrase: "2048 and merge games",
    description:
      "Browse 2048 games, merge loops, Suika-style board games, and browser number puzzles built around progression, space control, and longer repeat play.",
    playerNeed:
      "This category works best for players who enjoy structured progression, tidy board management, and the slow tension of keeping a run alive.",
    searchIntent:
      "It covers searches for 2048 games, merge games, number puzzle games, and fruit-merging browser games where the board shape matters as much as the next score bump.",
    searchTerms: ["2048 games", "merge games", "number puzzles", "suika-style games"]
  },
  "Blocks & Bricks": {
    slug: "blocks-bricks-games",
    heroTitle: "Free Block and Brick Games Online",
    phrase: "block and brick games",
    description:
      "Compare block puzzle games, falling-block classics, slide puzzles, and brick-breaking browser games that stay readable across short desktop and mobile sessions.",
    playerNeed:
      "This lane suits players who like shape recognition, line control, and practical recovery decisions more than random clicking or flashy gimmicks.",
    searchIntent:
      "It lines up with searches for block games online, Tetris-style games, brick breaker puzzle games, and browser board games that emphasize clean space management.",
    searchTerms: ["block games", "tetris-style games", "brick puzzles", "line clearing games"]
  },
  "Arcade Brain Games": {
    slug: "arcade-brain-games",
    heroTitle: "Fast Arcade Brain Games Online",
    phrase: "arcade brain games",
    description:
      "Find quick browser games that mix timing, movement, rebounds, and puzzle-style planning into short sessions with fast restarts and clear improvement loops.",
    playerNeed:
      "This category is best for players who still want a little thinking in the loop, but prefer pace, rhythm, and clean retries over slower board analysis.",
    searchIntent:
      "It catches searches for quick browser brain games, timing puzzle games, reflex puzzle games, and short online break games with simple controls.",
    searchTerms: ["timing puzzle games", "quick brain games", "reflex puzzle games", "short browser games"]
  }
};

function loadGames() {
  const filePath = path.join(ROOT, "games-data.js");
  const code = fs.readFileSync(filePath, "utf8");
  const context = { console, window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.PUZZLE_GAMES_DATA || [];
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lowerFirst(value) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : "";
}

function sentenceCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function trimEndingPunctuation(value) {
  return String(value).trim().replace(/[.!?]+$/, "");
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decodeHtml(value) {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function joinList(items) {
  if (!items.length) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return items[0] + " and " + items[1];
  }
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}

function sourceHostLabel(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "the original source";
  }
}

function categoryPalette(game) {
  return CATEGORY_PALETTES[game.category] || CATEGORY_PALETTES["Logic & Drawing"];
}

function categoryGuide(game) {
  return CATEGORY_GUIDES[game.category] || CATEGORY_GUIDES["Logic & Drawing"];
}

function gameContent(game) {
  return (
    pageContent[game.slug] || {
      controlsLabel: "Use the on-screen controls",
      controlLine: `Use the on-screen controls to work toward the goal of ${lowerFirst(game.summary)}.`,
      openingAdvice: "Use the first moments of the run to understand the board, pacing, and the one resource you need to protect most.",
      coreDetail: "The page is strongest when it explains not just the goal of the game, but the small decisions that make a cleaner run possible.",
      mistakeToAvoid: "Rushing the first obvious move is usually less effective than reading the full board state first.",
      sessionFeel: "The session loop is short enough for repeat attempts, which helps players improve quickly.",
      whyReplay: "It stays replayable because each run gives enough feedback to refine the next one."
    }
  );
}

function tagInsight(game) {
  const notes = game.tags
    .map((tag) => TAG_NOTES[tag])
    .filter(Boolean)
    .slice(0, 3);

  if (!notes.length) {
    return "clear rules, repeatable patterns, and measured decision-making";
  }

  return joinList(notes);
}

function deviceCopy(game) {
  if (game.playerUrl) {
    return "Playable in-browser with an embedded frame on hosts that allow framing, plus a direct source link if you prefer the original host.";
  }

  return "Opened through the original publisher page because that partner host prefers direct playback instead of third-party embedding.";
}

function modeLabel(game) {
  return game.playerUrl ? "Embedded play" : "Source-hosted play";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryPageInfo(category) {
  return {
    label: category,
    ...(
      CATEGORY_PAGES[category] || {
      slug: `${slugify(category)}-games`,
      heroTitle: `Free ${category} Games Online`,
      description: `Browse browser games in the ${category} category on PuzzleGames.space.`,
      playerNeed:
        "This category is designed to help players find a cleaner fit faster through grouped titles and dedicated game pages.",
      searchIntent:
        "It works as a category landing page for players who already know the style of puzzle game they want to browse.",
      searchTerms: [lowerFirst(category), "browser games", "online puzzle games"]
      }
    )
  };
}

function categorySlug(category) {
  return categoryPageInfo(category).slug;
}

function pageTitle(game) {
  return `Play ${game.title} Online | Guide, Tips, and Overview | PuzzleGames.space`;
}

function pageDescription(game) {
  return `${game.title} on PuzzleGames.space: ${game.summary} Read the overview, controls, tips, FAQ, and open the game in the embedded frame or on the original source site.`;
}

function categoryPageTitle(category) {
  return `${categoryPageInfo(category).heroTitle} | PuzzleGames.space`;
}

function buildGameHref(game, prefix = ".") {
  return `${prefix}/games/${encodeURIComponent(game.slug)}.html`;
}

function buildRelatedHref(game, prefix = ".") {
  return `${prefix}/${encodeURIComponent(game.slug)}.html`;
}

function buildCategoryHref(category, prefix = ".") {
  return `${prefix}/categories/${encodeURIComponent(categorySlug(category))}.html`;
}

function absoluteGameUrl(game) {
  return `${SITE_URL}/games/${encodeURIComponent(game.slug)}.html`;
}

function absoluteCategoryUrl(category) {
  return `${SITE_URL}/categories/${encodeURIComponent(categorySlug(category))}.html`;
}

function thumbnailAbsoluteUrl(game) {
  return `${SITE_URL}/assets/thumbs/${encodeURIComponent(game.slug)}.svg`;
}

function thumbnailRelativePath(game, prefix) {
  return `${prefix}/assets/thumbs/${encodeURIComponent(game.slug)}.svg`;
}

function categoryPageDescription(category, games) {
  const info = categoryPageInfo(category);
  const count = categoryGames(category, games).length;
  return `Browse ${count} free ${info.phrase || lowerFirst(category)} on PuzzleGames.space. ${info.description} ${info.playerNeed}`;
}

function difficultyLine(game) {
  return `${game.title} sits in the ${lowerFirst(game.difficulty)} range. That usually means the rules are readable quickly, but strong runs still depend on better sequencing, cleaner positioning, and fewer recovery mistakes.`;
}

function sessionLine(game) {
  return `A typical session runs ${lowerFirst(game.session)}, which makes it suitable for players who want a browser game that works in short breaks without feeling disposable after one round.`;
}

function hostNote(game) {
  const host = sourceHostLabel(game.sourceUrl);

  if (game.playerUrl) {
    return `${game.title} can be launched directly on this page, but PuzzleGames.space still keeps a visible route back to ${host} so visitors can choose the original host when they want the native source experience.`;
  }

  return `${game.title} is presented here as an editorial destination with facts, play advice, and related recommendations, while the actual gameplay opens on ${host}. That keeps the page useful even when the publisher does not expose a stable embed.`;
}

function fitBullets(game) {
  return [
    `Best for: ${game.bestFor}`,
    `Difficulty profile: ${game.difficulty}`,
    `Typical session: ${game.session}`,
    `Play mode: ${modeLabel(game)}`,
    `Primary controls: ${gameContent(game).controlsLabel}`
  ];
}

function howToPlaySteps(game) {
  const guide = categoryGuide(game);
  const content = gameContent(game);

  return [
    `Start with the immediate objective in mind: ${sentenceCase(trimEndingPunctuation(lowerFirst(game.summary)))}.`,
    content.controlLine,
    content.openingAdvice,
    `As the run develops, lean into ${tagInsight(game)}. That is usually where ${game.title} separates casual attempts from cleaner, more repeatable results.`
  ];
}

function strategyTips(game) {
  const guide = categoryGuide(game);
  const content = gameContent(game);

  return [
    guide.tips[0],
    guide.tips[1],
    `${guide.tips[2]} In ${game.title}, this matters because the game rewards ${tagInsight(game)}.`,
    `Avoid this common mistake: ${content.mistakeToAvoid}`
  ];
}

function standoutParagraphs(game) {
  const guide = categoryGuide(game);
  const insights = tagInsight(game);
  const content = gameContent(game);
  const categoryInfo = categoryPageInfo(game.category);

  return [
    `${game.intro} ${guide.overview}`,
    `${game.summary} ${sessionLine(game)} ${difficultyLine(game)}`,
    `${content.coreDetail} ${content.sessionFeel}`,
    `Compared with more generic browser puzzle listings, ${game.title} benefits from extra editorial context because the real appeal is not just that the game exists. The appeal is the way it combines ${insights} inside a browser-friendly ${categoryInfo.phrase || lowerFirst(game.category)} category that is easy to revisit. ${content.whyReplay}`
  ];
}

function sidebarFacts(game) {
  return [
    ["Category", game.category],
    ["Difficulty", game.difficulty],
    ["Session", game.session],
    ["Best for", game.bestFor],
    ["Source", sourceHostLabel(game.sourceUrl)]
  ];
}

function faqEntries(game) {
  const content = gameContent(game);
  return [
    {
      question: `What kind of challenge does ${game.title} offer?`,
      answer: `${game.title} is built around the core habits of the ${game.category} category. The main hook is to ${trimEndingPunctuation(lowerFirst(game.summary))}, and the strongest play usually comes from ${tagInsight(game)}.`
    },
    {
      question: `Is ${game.title} better for short sessions or long play?`,
      answer: `${sessionLine(game)} If you only have a few minutes, the game still works well because the objective is clear quickly. If you stay longer, the replay value comes from cleaner decision-making rather than from a complicated ruleset.`
    },
    {
      question: `How should I launch ${game.title} from this page?`,
      answer: game.playerUrl
        ? `Use the embedded player if you want to stay on PuzzleGames.space, or use the source button if you prefer the original host experience on ${sourceHostLabel(game.sourceUrl)}.`
        : `Use the source button to open the game on ${sourceHostLabel(game.sourceUrl)}. This page keeps the guide, facts, and related recommendations in one place even though the publisher handles playback on its own site.`
    },
    {
      question: `What should I pay attention to in ${game.title}?`,
      answer: `${content.coreDetail} ${content.mistakeToAvoid} ${content.whyReplay}`
    }
  ];
}

function categoryGames(category, games) {
  return games.filter((game) => game.category === category);
}

function featuredCategoryGames(category, games) {
  const matches = categoryGames(category, games);
  const featured = matches.filter((game) => game.featured);
  return featured.length ? featured : matches.slice(0, 4);
}

function categoryTagSet(category, games) {
  return Array.from(
    new Set(
      categoryGames(category, games)
        .flatMap((game) => game.tags)
        .filter(Boolean)
    )
  );
}

function categorySessionRange(category, games) {
  const sessions = categoryGames(category, games).map((game) => game.session);
  return joinList(Array.from(new Set(sessions)).slice(0, 3));
}

function categoryDifficultyRange(category, games) {
  const difficulty = categoryGames(category, games).map((game) => game.difficulty);
  return joinList(Array.from(new Set(difficulty)).slice(0, 3));
}

function relatedGames(game, games) {
  return games
    .filter((entry) => entry.category === game.category && entry.slug !== game.slug)
    .slice(0, 4);
}

function relatedCardsMarkup(game, games) {
  return relatedGames(game, games)
    .map(
      (entry) => `
        <a class="related-card" data-category="${escapeHtml(entry.category)}" href="${buildRelatedHref(entry)}">
          <span class="related-title">${escapeHtml(entry.title)}</span>
          <span class="related-copy">${escapeHtml(entry.summary)}</span>
        </a>`
    )
    .join("");
}

function factRowsMarkup(items) {
  return items
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>`
    )
    .join("");
}

function bulletListMarkup(items) {
  return items
    .map((item) => `<li class="detail-list-item">${escapeHtml(item)}</li>`)
    .join("");
}

function pillMarkup(game) {
  return `
    <span class="player-pill"><strong>Category</strong> ${escapeHtml(game.category)}</span>
    <span class="player-pill"><strong>Difficulty</strong> ${escapeHtml(game.difficulty)}</span>
    <span class="player-pill"><strong>Session</strong> ${escapeHtml(game.session)}</span>
    <span class="player-pill"><strong>Mode</strong> ${escapeHtml(modeLabel(game))}</span>`;
}

function tagMarkup(game) {
  return game.tags
    .map((tag) => `<span class="tag-badge">${escapeHtml(tag)}</span>`)
    .join("");
}

function paragraphMarkup(items) {
  return items.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function faqMarkup(entries) {
  return entries
    .map(
      (entry, index) => `
        <details class="faq-item"${index === 0 ? " open" : ""}>
          <summary>${escapeHtml(entry.question)}</summary>
          <p>${escapeHtml(entry.answer)}</p>
        </details>`
    )
    .join("");
}

function breadcrumbJson(game) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Games",
        item: `${SITE_URL}/games.html`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: game.category,
        item: absoluteCategoryUrl(game.category)
      },
      {
        "@type": "ListItem",
        position: 4,
        name: game.title,
        item: absoluteGameUrl(game)
      }
    ]
  };
}

function videoGameJson(game) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    url: absoluteGameUrl(game),
    genre: game.category,
    description: pageDescription(game),
    applicationCategory: "Game",
    operatingSystem: "Any",
    gamePlatform: ["Web Browser", "Desktop", "Mobile"],
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "PuzzleGames.space"
    }
  };
}

function faqJson(entries) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer
      }
    }))
  };
}

function collectionPageJson(category, games) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryPageTitle(category),
    url: absoluteCategoryUrl(category),
    description: categoryPageDescription(category, games),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "PuzzleGames.space",
      url: `${SITE_URL}/`
    }
  };
}

function categoryBreadcrumbJson(category) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Games",
        item: `${SITE_URL}/games.html`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category,
        item: absoluteCategoryUrl(category)
      }
    ]
  };
}

function gameplayMarkup(game) {
  if (game.playerUrl) {
    return `
      <div class="frame-topbar">
        <div>
          <span class="frame-label">${escapeHtml(modeLabel(game))}</span>
          <strong>${escapeHtml(game.title)}</strong>
        </div>
        <a class="catalog-secondary" href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>
      </div>
      <div class="frame-stage-body">
        <iframe
          class="game-frame"
          src="${escapeHtml(game.playerUrl)}"
          title="${escapeHtml(game.title)} playable game frame"
          loading="lazy"
          allowfullscreen
        ></iframe>
      </div>`;
  }

  return `
    <div class="frame-topbar">
      <div>
        <span class="frame-label">${escapeHtml(modeLabel(game))}</span>
        <strong>${escapeHtml(game.title)}</strong>
      </div>
      <a class="catalog-secondary" href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>
    </div>
    <div class="frame-stage-body">
      <div class="player-fallback">
        <h2>Open ${escapeHtml(game.title)} on the original source site</h2>
        <p>${escapeHtml(hostNote(game))}</p>
        <a class="catalog-primary" href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open on source site</a>
      </div>
    </div>`;
}

function playDetailRows(game) {
  const content = gameContent(game);
  return [
    ["Primary controls", content.controlsLabel],
    ["How it starts", content.openingAdvice],
    ["Core gameplay detail", content.coreDetail],
    ["Common mistake", content.mistakeToAvoid]
  ];
}

function categorySummaryCardsMarkup(category, games) {
  return categoryGames(category, games)
    .map(
      (game) => `
        <article class="related-card" data-category="${escapeHtml(game.category)}">
          <span class="related-title">${escapeHtml(game.title)}</span>
          <span class="related-copy">${escapeHtml(game.summary)}</span>
          <div class="catalog-actions">
            <a class="catalog-primary" href="${buildGameHref(game, "..")}">Open page</a>
            <a class="catalog-secondary" href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>
          </div>
        </article>`
    )
    .join("");
}

function categoryFaqEntries(category, games) {
  const info = categoryPageInfo(category);
  const entries = categoryGames(category, games);
  return [
    {
      question: `What kind of games are in the ${category} category?`,
      answer: `${info.description} On PuzzleGames.space, this category currently includes ${entries.length} playable or source-linked titles with dedicated summary pages.`
    },
    {
      question: `Who is this ${category} category best for?`,
      answer: `${info.playerNeed} Typical difficulty labels here include ${categoryDifficultyRange(category, games) || "easy to medium"}, and common session lengths include ${categorySessionRange(category, games) || "short browser sessions"}.`
    },
    {
      question: `Why use this category page instead of opening random games one by one?`,
      answer: `The category page groups similar titles in one place, which makes it easier to compare summaries, tags, session length, and difficulty before you click into a specific game page or open the original source host.`
    }
  ];
}

function categoryPageMarkup(category, games) {
  const info = categoryPageInfo(category);
  const entries = categoryGames(category, games);
  const featured = featuredCategoryGames(category, games);
  const faq = categoryFaqEntries(category, games);
  const tags = categoryTagSet(category, games).slice(0, 8);
  const ldJson = [collectionPageJson(category, games), categoryBreadcrumbJson(category), faqJson(faq)];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(categoryPageTitle(category))}</title>
  <meta name="description" content="${escapeHtml(categoryPageDescription(category, games))}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="theme-color" content="#f4efe7" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PuzzleGames.space" />
  <meta property="og:title" content="${escapeHtml(categoryPageTitle(category))}" />
  <meta property="og:description" content="${escapeHtml(categoryPageDescription(category, games))}" />
  <meta property="og:url" content="${escapeHtml(absoluteCategoryUrl(category))}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(categoryPageTitle(category))}" />
  <meta name="twitter:description" content="${escapeHtml(categoryPageDescription(category, games))}" />
  <link rel="canonical" href="${escapeHtml(absoluteCategoryUrl(category))}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="../styles.css" />
${ADSENSE_HEAD_SCRIPT}
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../tailwind-config.js"></script>
  <script type="application/ld+json">${JSON.stringify(ldJson)}</script>
</head>
<body class="bg-shell text-ink antialiased page-library" data-game-category="${escapeHtml(category)}">
  <div class="site-shell">
    <header class="site-header sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <a href="../index.html" class="brand-link flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.24em] text-ink">
          <span class="brand-mark inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-apple">PG</span>
          <span class="brand-wordmark">PuzzleGames.space</span>
        </a>
        <nav aria-label="Primary" class="nav-pillbar hidden items-center gap-2 text-sm font-semibold text-muted md:flex">
          <a class="transition hover:text-ink" href="../index.html">Home</a>
          <a class="transition hover:text-ink" href="../games.html">Games</a>
          <a class="transition hover:text-ink" href="../about.html">About</a>
          <a class="transition hover:text-ink" href="../contact.html">Contact</a>
          <a class="transition hover:text-ink" href="../privacy.html">Privacy</a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
      <section class="page-hero library-hero">
        <nav aria-label="Breadcrumb" class="breadcrumb-row">
          <a href="../index.html">Home</a>
          <span>/</span>
          <a href="../games.html">Games</a>
          <span>/</span>
          <span aria-current="page">${escapeHtml(category)}</span>
        </nav>
        <div class="library-stage">
          <div>
            <p class="eyebrow">Category landing page</p>
            <h1 class="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">${escapeHtml(info.heroTitle)}</h1>
            <p class="mt-5 max-w-4xl text-lg leading-8 text-muted">${escapeHtml(info.description)}</p>
            <div class="mt-6 player-pill-row">
              <span class="player-pill"><strong>Games</strong> ${escapeHtml(String(entries.length))}</span>
              <span class="player-pill"><strong>Difficulty</strong> ${escapeHtml(categoryDifficultyRange(category, games) || "Easy to medium")}</span>
              <span class="player-pill"><strong>Session</strong> ${escapeHtml(categorySessionRange(category, games) || "Short browser sessions")}</span>
            </div>
          </div>
          <aside class="player-hero-note">
            <p class="eyebrow">Why this page exists</p>
            <h2>${escapeHtml(category)} games, grouped with context</h2>
            <p>${escapeHtml(info.playerNeed)}</p>
            <p>${escapeHtml(info.searchIntent)}</p>
          </aside>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-3">
        <article class="section-card prose-copy">
          <p class="eyebrow">Category overview</p>
          <h2 class="mt-3 text-2xl font-extrabold text-ink">How these games tend to play</h2>
          <p>${escapeHtml(categoryGuide({ category }).overview)}</p>
          <p>${escapeHtml(categoryGuide({ category }).playFocus)}</p>
          <p>${escapeHtml(categoryGuide({ category }).rhythm)}</p>
        </article>
        <article class="section-card">
          <p class="eyebrow">What to expect</p>
          <h2 class="mt-3 text-2xl font-extrabold text-ink">Typical fit for this category</h2>
          <ul class="detail-list">
            <li class="detail-list-item">${escapeHtml(info.playerNeed)}</li>
            <li class="detail-list-item">${escapeHtml(`Popular search terms around this category include ${joinList(info.searchTerms)}.`)}</li>
            <li class="detail-list-item">${escapeHtml(`Common tags in this group include ${joinList(tags.slice(0, 5)) || "logic, strategy, and browser play"}.`)}</li>
          </ul>
        </article>
        <article class="section-card">
          <p class="eyebrow">Navigation</p>
          <h2 class="mt-3 text-2xl font-extrabold text-ink">Browse this section efficiently</h2>
          <div class="catalog-actions mt-4">
            <a class="catalog-primary" href="../games.html">Browse full library</a>
            <a class="catalog-secondary" href="../index.html">Back to homepage</a>
          </div>
          <div class="tag-row mt-5">
            ${tags.map((tag) => `<span class="tag-badge">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </article>
      </section>

      <section class="mt-10">
        <div class="mb-6 max-w-4xl">
          <p class="eyebrow">Featured ${escapeHtml(category)}</p>
          <h2 class="mt-3 text-3xl font-extrabold text-ink">Recommended pages to start with</h2>
          <p class="mt-4 text-base leading-7 text-muted">
            These entries are a practical first pass if you want to understand what this category feels like before opening everything in the full library.
          </p>
        </div>
        <div class="related-grid">
          ${featured
            .map(
              (game) => `
                <a class="related-card" data-category="${escapeHtml(game.category)}" href="${buildGameHref(game, "..")}">
                  <span class="related-title">${escapeHtml(game.title)}</span>
                  <span class="related-copy">${escapeHtml(game.summary)}</span>
                </a>`
            )
            .join("")}
        </div>
      </section>

      <section class="mt-10">
        <div class="mb-6 max-w-4xl">
          <p class="eyebrow">All ${escapeHtml(category)}</p>
          <h2 class="mt-3 text-3xl font-extrabold text-ink">Every game page in this category</h2>
          <p class="mt-4 text-base leading-7 text-muted">
            Compare titles, then open the dedicated game page for deeper tips, controls, FAQ content, and a direct path into play.
          </p>
        </div>
        <div class="related-grid">
          ${categorySummaryCardsMarkup(category, games)}
        </div>
      </section>

      <section class="mt-10">
        <div class="mb-6 max-w-4xl">
          <p class="eyebrow">FAQ</p>
          <h2 class="mt-3 text-3xl font-extrabold text-ink">Common questions about ${escapeHtml(category)}</h2>
        </div>
        <div class="grid gap-5 lg:grid-cols-2">
          ${faqMarkup(faq)}
        </div>
      </section>
    </main>

    <footer class="site-footer border-t border-line/70 bg-white/90">
      <div class="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p class="text-lg font-extrabold text-ink">PuzzleGames.space</p>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
            PuzzleGames.space groups browser puzzle games into clearer landing pages so players can compare categories before jumping into individual titles.
          </p>
        </div>
        <nav aria-label="Footer" class="flex flex-col gap-3 text-sm font-semibold text-muted">
          <a class="footer-link" href="../games.html">Games</a>
          <a class="footer-link" href="../about.html">About</a>
          <a class="footer-link" href="../terms.html">Terms</a>
          <a class="footer-link" href="../dmca.html">DMCA</a>
          <a class="footer-link" href="../privacy.html">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  </div>
</body>
</html>
`;
}

function thumbnailSvg(game) {
  const palette = categoryPalette(game);
  const tagCount = Math.max(2, Math.min(4, game.tags.length));
  const motifMarkup = game.tags
    .slice(0, tagCount)
    .map((tag, index) => {
      const x = 760 + (index % 2) * 154;
      const y = 132 + Math.floor(index / 2) * 154;
      const rotation = 8 + index * 6;
      return `
      <rect
        x="${x}"
        y="${y}"
        width="138"
        height="138"
        rx="34"
        fill="rgba(255,255,255,0.10)"
        transform="rotate(${rotation} ${x + 69} ${y + 69})"
      />
      <circle cx="${x + 48}" cy="${y + 114}" r="22" fill="rgba(255,255,255,0.12)" />
      <circle cx="${x + 112}" cy="${y + 38}" r="14" fill="rgba(255,255,255,0.18)" />`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" viewBox="0 0 ${THUMB_WIDTH} ${THUMB_HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">${xmlEscape(game.title)} thumbnail</title>
  <desc id="desc">${xmlEscape(game.summary)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.deep}" />
      <stop offset="48%" stop-color="${palette.base}" />
      <stop offset="100%" stop-color="${palette.secondary}" />
    </linearGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.36)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.08)" />
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="32" />
    </filter>
  </defs>

  <rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" rx="42" fill="url(#bg)" />
  <circle cx="1032" cy="106" r="164" fill="${palette.accent}" opacity="0.20" filter="url(#blur)" />
  <circle cx="172" cy="588" r="156" fill="#ffffff" opacity="0.08" filter="url(#blur)" />

  <rect x="58" y="58" width="1084" height="559" rx="34" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)" />
  <rect x="86" y="92" width="252" height="252" rx="62" fill="rgba(255,255,255,0.10)" />
  <circle cx="212" cy="218" r="54" fill="rgba(255,255,255,0.16)" />
  <path d="M195 186 L247 218 L195 250 Z" fill="#ffffff" opacity="0.94" />

  <rect x="86" y="390" width="188" height="56" rx="28" fill="rgba(255,255,255,0.16)" />
  <rect x="292" y="390" width="224" height="56" rx="28" fill="rgba(255,255,255,0.14)" />
  <rect x="86" y="470" width="430" height="22" rx="11" fill="rgba(255,255,255,0.16)" />
  <rect x="86" y="510" width="366" height="22" rx="11" fill="rgba(255,255,255,0.12)" />
  <rect x="86" y="548" width="298" height="22" rx="11" fill="rgba(255,255,255,0.10)" />

  ${motifMarkup}

  <circle cx="1014" cy="536" r="44" fill="rgba(255,255,255,0.12)" />
  <circle cx="936" cy="584" r="24" fill="rgba(255,255,255,0.14)" />
</svg>
`;
}

function imageThumbnailSvg(game, dataUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" viewBox="0 0 ${THUMB_WIDTH} ${THUMB_HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">${xmlEscape(game.title)} thumbnail</title>
  <desc id="desc">${xmlEscape(game.summary)}</desc>
  <defs>
    <clipPath id="frame">
      <rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" rx="42" />
    </clipPath>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(11,15,22,0.08)" />
      <stop offset="100%" stop-color="rgba(11,15,22,0.18)" />
    </linearGradient>
  </defs>
  <rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" rx="42" fill="#111827" />
  <image
    href="${xmlEscape(dataUrl)}"
    width="${THUMB_WIDTH}"
    height="${THUMB_HEIGHT}"
    preserveAspectRatio="xMidYMid slice"
    clip-path="url(#frame)"
  />
  <rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" rx="42" fill="url(#shade)" />
  <rect
    x="0.5"
    y="0.5"
    width="${THUMB_WIDTH - 1}"
    height="${THUMB_HEIGHT - 1}"
    rx="41.5"
    fill="none"
    stroke="rgba(255,255,255,0.14)"
  />
</svg>
`;
}

function firstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? decodeHtml(match[1].trim()) : "";
}

function resolveAssetUrl(pageUrl, assetUrl) {
  try {
    return new URL(assetUrl, pageUrl).toString();
  } catch {
    return "";
  }
}

function mimeFromUrl(url) {
  const cleanUrl = String(url).split("?")[0].toLowerCase();

  if (cleanUrl.endsWith(".png")) {
    return "image/png";
  }
  if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (cleanUrl.endsWith(".webp")) {
    return "image/webp";
  }
  if (cleanUrl.endsWith(".gif")) {
    return "image/gif";
  }
  if (cleanUrl.endsWith(".avif")) {
    return "image/avif";
  }
  if (cleanUrl.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: PAGE_HEADERS,
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }

  return response.text();
}

async function discoverThumbnailUrl(game) {
  const candidates = [];

  if (game.playerUrl) {
    candidates.push(game.playerUrl);
  }

  candidates.push(game.sourceUrl);

  for (const candidate of candidates) {
    try {
      const html = await fetchText(candidate);
      const ogImage =
        firstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        firstMatch(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
        firstMatch(html, /<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

      if (ogImage) {
        return resolveAssetUrl(candidate, ogImage);
      }

      const backgroundImage = firstMatch(
        html,
        /background-image:\s*url\(["']?([^"')]+)["']?\)/i
      );

      if (backgroundImage && !backgroundImage.startsWith("data:")) {
        return resolveAssetUrl(candidate, backgroundImage);
      }
    } catch (error) {
      continue;
    }
  }

  return "";
}

async function fetchImageDataUrl(imageUrl) {
  const response = await fetch(imageUrl, {
    headers: IMAGE_HEADERS,
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Image request failed with ${response.status} for ${imageUrl}`);
  }

  const contentType = (response.headers.get("content-type") || "").split(";")[0].trim();
  const mimeType = contentType || mimeFromUrl(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function buildThumbnail(game, thumbsDir) {
  const filePath = path.join(thumbsDir, `${game.slug}.svg`);

  try {
    const thumbnailUrl = await discoverThumbnailUrl(game);

    if (thumbnailUrl) {
      const dataUrl = await fetchImageDataUrl(thumbnailUrl);
      writeFile(filePath, imageThumbnailSvg(game, dataUrl));
      return { slug: game.slug, mode: "remote", source: thumbnailUrl };
    }
  } catch (error) {
    console.error(`[thumb] ${game.slug}: ${error.message}`);
  }

  writeFile(filePath, thumbnailSvg(game));
  return { slug: game.slug, mode: "fallback", source: "" };
}

function gamePageMarkup(game, games) {
  const faq = faqEntries(game);
  const guide = categoryGuide(game);
  const content = gameContent(game);
  const canonical = absoluteGameUrl(game);
  const thumbnailUrl = thumbnailAbsoluteUrl(game);
  const paragraphs = standoutParagraphs(game);
  const related = relatedCardsMarkup(game, games);
  const fit = fitBullets(game);
  const ldJson = [videoGameJson(game), breadcrumbJson(game), faqJson(faq)];
  const categoryInfo = categoryPageInfo(game.category);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle(game))}</title>
  <meta name="description" content="${escapeHtml(pageDescription(game))}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="theme-color" content="#f4efe7" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PuzzleGames.space" />
  <meta property="og:title" content="${escapeHtml(pageTitle(game))}" />
  <meta property="og:description" content="${escapeHtml(pageDescription(game))}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(thumbnailUrl)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(pageTitle(game))}" />
  <meta name="twitter:description" content="${escapeHtml(pageDescription(game))}" />
  <meta name="twitter:image" content="${escapeHtml(thumbnailUrl)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="../styles.css" />
${ADSENSE_HEAD_SCRIPT}
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../tailwind-config.js"></script>
  <script type="application/ld+json">${JSON.stringify(ldJson)}</script>
</head>
<body class="bg-shell text-ink antialiased page-player" data-game-category="${escapeHtml(game.category)}">
  <div class="site-shell">
    <header class="site-header sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <a href="../index.html" class="brand-link flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.24em] text-ink">
          <span class="brand-mark inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-apple">PG</span>
          <span class="brand-wordmark">PuzzleGames.space</span>
        </a>
        <nav aria-label="Primary" class="nav-pillbar hidden items-center gap-2 text-sm font-semibold text-muted md:flex">
          <a class="transition hover:text-ink" href="../index.html">Home</a>
          <a class="transition hover:text-ink" href="../games.html">Games</a>
          <a class="transition hover:text-ink" href="../about.html">About</a>
          <a class="transition hover:text-ink" href="../contact.html">Contact</a>
          <a class="transition hover:text-ink" href="../privacy.html">Privacy</a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
      <section class="page-hero player-hero">
        <nav aria-label="Breadcrumb" class="breadcrumb-row">
          <a href="../index.html">Home</a>
          <span>/</span>
          <a href="../games.html">Games</a>
          <span>/</span>
          <a href="${buildCategoryHref(game.category, "..")}">${escapeHtml(game.category)}</a>
          <span>/</span>
          <span aria-current="page">${escapeHtml(game.title)}</span>
        </nav>
        <div class="player-stage">
          <div class="max-w-5xl">
            <p class="eyebrow">${escapeHtml(game.category)}</p>
            <h1 class="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">Play ${escapeHtml(game.title)} Online</h1>
            <p class="mt-5 max-w-4xl text-lg leading-8 text-muted">${escapeHtml(game.summary)}</p>
            <div class="player-pill-row mt-6">
              ${pillMarkup(game)}
            </div>
            <div class="catalog-actions mt-5">
              <a class="catalog-secondary" href="${buildCategoryHref(game.category, "..")}">Browse ${escapeHtml(game.category)}</a>
            </div>
          </div>
          <aside class="player-hero-note">
            <p class="eyebrow">Editorial view</p>
            <h2>${escapeHtml(game.title)} at a glance</h2>
            <p>${escapeHtml(game.intro)}</p>
            <p>${escapeHtml(hostNote(game))}</p>
          </aside>
        </div>
      </section>

      <section class="game-detail-layout">
        <div class="game-detail-main">
          <div class="iframe-shell player-frame-shell">
            ${gameplayMarkup(game)}
          </div>

          <article class="section-card prose-copy">
            <p class="eyebrow">Overview</p>
            <h2 class="mt-3 text-3xl font-extrabold text-ink">Why ${escapeHtml(game.title)} is worth a dedicated page</h2>
            ${paragraphMarkup(paragraphs)}
          </article>

          <div class="section-split">
            <article class="section-card">
              <p class="eyebrow">How to play</p>
              <h2 class="mt-3 text-2xl font-extrabold text-ink">A clean way to approach the game</h2>
              <ol class="detail-list detail-list--ordered">
                ${bulletListMarkup(howToPlaySteps(game))}
              </ol>
            </article>

            <article class="section-card prose-copy">
              <p class="eyebrow">Game details</p>
              <h2 class="mt-3 text-2xl font-extrabold text-ink">What actually matters while playing</h2>
              <p>${escapeHtml(content.controlLine)}</p>
              <p>${escapeHtml(content.coreDetail)}</p>
              <p>${escapeHtml(content.mistakeToAvoid)}</p>
            </article>
          </div>

          <div class="section-split">
            <article class="section-card prose-copy">
              <p class="eyebrow">Category fit</p>
              <h2 class="mt-3 text-2xl font-extrabold text-ink">What this game rewards</h2>
              <p>${escapeHtml(guide.overview)}</p>
              <p>${escapeHtml(guide.rhythm)}</p>
              <p>${escapeHtml(`${game.title} is strongest for players who enjoy ${tagInsight(game)}.`)}</p>
            </article>

            <article class="section-card">
              <p class="eyebrow">Strategy tips</p>
              <h2 class="mt-3 text-2xl font-extrabold text-ink">Winning habits that usually help</h2>
              <ul class="detail-list">
                ${bulletListMarkup(strategyTips(game))}
              </ul>
            </article>

            <article class="section-card">
              <p class="eyebrow">Best fit</p>
              <h2 class="mt-3 text-2xl font-extrabold text-ink">Who should play ${escapeHtml(game.title)}</h2>
              <ul class="detail-list">
                ${bulletListMarkup(fit)}
              </ul>
              <div class="source-note">
                <p>${escapeHtml(deviceCopy(game))}</p>
              </div>
            </article>
          </div>

          <article class="section-card prose-copy">
            <p class="eyebrow">Source and context</p>
            <h2 class="mt-3 text-2xl font-extrabold text-ink">How PuzzleGames.space handles this title</h2>
            <p>${escapeHtml(`PuzzleGames.space adds editorial context, quick facts, tips, and related recommendations around ${game.title} so the page remains useful even before a visitor starts playing.`)}</p>
            <p>${escapeHtml(hostNote(game))}</p>
            <p>${escapeHtml(`If you prefer the original host, use the source button below. If you are reviewing similar games, the related links on this page keep the browsing path inside the same category. You can also open the ${game.category} category page for a broader comparison set.`)}</p>
            <div class="catalog-actions mt-5">
              <a class="catalog-primary" href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>
              <a class="catalog-secondary" href="${buildCategoryHref(game.category, "..")}">Browse ${escapeHtml(game.category)}</a>
            </div>
          </article>

          <section class="mt-10">
            <div class="mb-6 max-w-4xl">
              <p class="eyebrow">FAQ</p>
              <h2 class="mt-3 text-3xl font-extrabold text-ink">Common questions about ${escapeHtml(game.title)}</h2>
            </div>
            <div class="grid gap-5 lg:grid-cols-2">
              ${faqMarkup(faq)}
            </div>
          </section>

          <section class="mt-10">
            <div class="mb-6 max-w-4xl">
              <p class="eyebrow">Related games</p>
              <h2 class="mt-3 text-3xl font-extrabold text-ink">More from the ${escapeHtml(game.category)} category</h2>
            </div>
            <div class="related-grid">
              ${related}
            </div>
          </section>
        </div>

        <aside class="game-detail-sidebar">
          <article class="section-card">
            <p class="eyebrow">Thumbnail</p>
            <img
              class="game-preview-image mt-4"
              src="${escapeHtml(thumbnailRelativePath(game, ".."))}"
              alt="${escapeHtml(game.title)} thumbnail"
              loading="lazy"
            />
          </article>

          <article class="section-card">
            <p class="eyebrow">Quick facts</p>
            <dl class="fact-stack mt-4">
              ${factRowsMarkup(sidebarFacts(game))}
            </dl>
          </article>

          <article class="section-card">
            <p class="eyebrow">Play breakdown</p>
            <dl class="fact-stack mt-4">
              ${factRowsMarkup(playDetailRows(game))}
            </dl>
          </article>

          <article class="section-card">
            <p class="eyebrow">Tags</p>
            <div class="tag-row mt-4">
              ${tagMarkup(game)}
            </div>
          </article>

          <article class="section-card prose-copy">
            <p class="eyebrow">Why it stands out</p>
            <p>${escapeHtml(`${game.title} combines ${tagInsight(game)} in a format that stays readable for new visitors while still rewarding cleaner repeat attempts.`)}</p>
            <p>${escapeHtml(content.sessionFeel)}</p>
            <p>${escapeHtml(`That balance is a strong fit for PuzzleGames.space because it gives the page real editorial value beyond a bare embed. ${content.whyReplay}`)}</p>
          </article>

          <article class="section-card">
            <p class="eyebrow">Actions</p>
            <div class="catalog-actions mt-4">
              <a class="catalog-primary" href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>
              <a class="catalog-secondary" href="${buildCategoryHref(game.category, "..")}">Back to ${escapeHtml(game.category)}</a>
            </div>
          </article>
        </aside>
      </section>
    </main>

    <footer class="site-footer border-t border-line/70 bg-white/90">
      <div class="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p class="text-lg font-extrabold text-ink">PuzzleGames.space</p>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
            PuzzleGames.space pairs browser-playable puzzle titles with standalone editorial pages, source transparency, and browseable category paths.
          </p>
        </div>
        <nav aria-label="Footer" class="flex flex-col gap-3 text-sm font-semibold text-muted">
          <a class="footer-link" href="../games.html">Games</a>
          <a class="footer-link" href="../about.html">About</a>
          <a class="footer-link" href="../terms.html">Terms</a>
          <a class="footer-link" href="../dmca.html">DMCA</a>
          <a class="footer-link" href="../privacy.html">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  </div>
</body>
</html>
`;
}

function sitemapMarkup(games) {
  const staticPages = [
    { url: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
    { url: `${SITE_URL}/about.html`, priority: "0.7", changefreq: "monthly" },
    { url: `${SITE_URL}/games.html`, priority: "0.9", changefreq: "weekly" },
    { url: `${SITE_URL}/contact.html`, priority: "0.6", changefreq: "monthly" },
    { url: `${SITE_URL}/privacy.html`, priority: "0.5", changefreq: "monthly" },
    { url: `${SITE_URL}/terms.html`, priority: "0.5", changefreq: "monthly" },
    { url: `${SITE_URL}/dmca.html`, priority: "0.5", changefreq: "monthly" }
  ];

  const categoryPages = Array.from(new Set(games.map((game) => game.category))).map((category) => ({
    url: absoluteCategoryUrl(category),
    priority: "0.85",
    changefreq: "weekly"
  }));

  const gamePages = games.map((game) => ({
    url: absoluteGameUrl(game),
    priority: "0.8",
    changefreq: "weekly"
  }));

  const allPages = staticPages.concat(categoryPages, gamePages);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

async function build() {
  const games = loadGames();
  const gamesDir = path.join(ROOT, "games");
  const categoriesDir = path.join(ROOT, "categories");
  const thumbsDir = path.join(ROOT, "assets", "thumbs");
  const thumbResults = [];
  const categories = Array.from(new Set(games.map((game) => game.category)));

  ensureDir(gamesDir);
  ensureDir(categoriesDir);
  ensureDir(thumbsDir);

  for (const category of categories) {
    const filePath = path.join(categoriesDir, `${categorySlug(category)}.html`);
    writeFile(filePath, categoryPageMarkup(category, games));
  }

  for (const game of games) {
    const filePath = path.join(gamesDir, `${game.slug}.html`);
    writeFile(filePath, gamePageMarkup(game, games));
    thumbResults.push(await buildThumbnail(game, thumbsDir));
  }

  writeFile(path.join(ROOT, "sitemap.xml"), sitemapMarkup(games));

  const remoteCount = thumbResults.filter((item) => item.mode === "remote").length;
  const fallbackCount = thumbResults.length - remoteCount;

  console.log(`[build] Generated ${categories.length} category pages`);
  console.log(`[build] Generated ${games.length} game pages`);
  console.log(`[build] Real thumbnails: ${remoteCount}`);
  console.log(`[build] Fallback thumbnails: ${fallbackCount}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
