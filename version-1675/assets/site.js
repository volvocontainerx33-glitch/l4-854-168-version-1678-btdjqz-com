(function () {
  function qs(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero-carousel]');
    if (!hero) {
      return;
    }
    var slides = qs('.hero-slide', hero);
    var dots = qs('.hero-dot', hero);
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (slides.length) {
      show(0);
      play();
    }
  }

  function setupFilters() {
    qs('[data-filter-root]').forEach(function (root) {
      var input = root.querySelector('[data-filter-input]');
      var cards = qs('[data-search]', root);
      if (!input || !cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        input.value = initial;
      }

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
        });
      }

      input.addEventListener('input', apply);
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
