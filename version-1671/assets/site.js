(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(itemIndex);
        start();
      });
    });
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
  }

  function setupLocalFilters() {
    var homeInput = document.querySelector('#homeFilterInput');
    if (homeInput) {
      homeInput.addEventListener('input', function () {
        var keyword = homeInput.value.trim().toLowerCase();
        document.querySelectorAll('[data-local-filter-list] [data-card]').forEach(function (card) {
          card.classList.toggle('is-filter-hidden', keyword && textOf(card).indexOf(keyword) === -1);
        });
      });
    }
    var categoryInput = document.querySelector('[data-category-filter]');
    var yearSelect = document.querySelector('[data-category-year]');
    var regionSelect = document.querySelector('[data-category-region]');
    if (!categoryInput && !yearSelect && !regionSelect) {
      return;
    }
    function apply() {
      var keyword = categoryInput ? categoryInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      document.querySelectorAll('[data-local-filter-list] [data-card]').forEach(function (card) {
        var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        card.classList.toggle('is-filter-hidden', !(matchesKeyword && matchesYear && matchesRegion));
      });
    }
    [categoryInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(movie.genreFirst) + '</span>',
      '<span class="poster-time">' + escapeHtml(movie.duration) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var input = document.querySelector('#searchPageInput');
    var form = document.querySelector('#searchPageForm');
    var results = document.querySelector('#searchResults');
    if (!input || !form || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render(keyword) {
      var query = keyword.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        if (!query) {
          return true;
        }
        return [movie.title, movie.genre, movie.region, movie.year, movie.type, (movie.tags || []).join(' ')].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 240);
      results.innerHTML = list.map(createCard).join('');
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      history.replaceState(null, '', url);
      render(query);
    });
    input.addEventListener('input', function () {
      render(input.value);
    });
    render(initial);
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();

function initMoviePlayer(src) {
  var video = document.querySelector('[data-player-video]');
  var layer = document.querySelector('[data-player-layer]');
  var button = document.querySelector('[data-player-button]');
  var hls = null;

  if (!video || !src) {
    return;
  }

  function bind() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== src) {
        video.src = src;
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      }
      return;
    }
    if (video.src !== src) {
      video.src = src;
    }
  }

  function hideLayer() {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  }

  function start() {
    bind();
    hideLayer();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener('click', start);
  }
  if (button) {
    button.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', hideLayer);
  bind();
}
