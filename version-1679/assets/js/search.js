import { MOVIES } from "../data/search-index.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const escapeHtml = (value) => String(value || "").replace(/[&<>"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;"
})[char]);

const card = (movie) => {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

  return `
    <article class="movie-card">
      <a class="movie-card-link" href="${escapeHtml(movie.url)}" aria-label="查看${escapeHtml(movie.title)}">
        <div class="poster-box">
          <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="movie-badge badge-left">${escapeHtml(movie.year)}</span>
          <span class="movie-badge badge-right">热度 ${escapeHtml(movie.hot)}</span>
          <span class="play-ring">▶</span>
        </div>
        <div class="movie-card-body">
          <h2>${escapeHtml(movie.title)}</h2>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="tag-row">${tags}</div>
          <div class="movie-meta">
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
          </div>
        </div>
      </a>
    </article>
  `;
};

ready(() => {
  const input = document.querySelector("#movieSearchInput");
  const results = document.querySelector("#searchResults");
  const heading = document.querySelector("#searchHeading");
  const message = document.querySelector("#searchMessage");
  const form = document.querySelector(".search-box");

  if (!input || !results || !heading || !message) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  input.value = initialQuery;

  const render = (query) => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      heading.textContent = "热门影片";
      message.textContent = "可直接浏览推荐影片，也可使用上方搜索框筛选。";
      results.innerHTML = MOVIES.slice(0, 24).map(card).join("");
      return;
    }

    const matched = MOVIES.filter((movie) => {
      const text = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" ").toLowerCase();

      return text.includes(normalized);
    }).slice(0, 60);

    heading.textContent = `“${query}” 的搜索结果`;
    message.textContent = matched.length ? "以下影片与关键词相关。" : "没有找到相关影片，可以尝试更短的关键词。";
    results.innerHTML = matched.map(card).join("") || "";
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
      window.history.replaceState(null, "", url);
      render(query);
    });
  }

  input.addEventListener("input", () => render(input.value));
  render(initialQuery);
});
