(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function() {
            mainNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterPanel && filterRoot) {
        var input = filterPanel.querySelector('[data-search-input]');
        var category = filterPanel.querySelector('[data-category-filter]');
        var year = filterPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var categoryValue = category ? category.value : 'all';
            var yearValue = year ? year.value : 'all';
            var visible = 0;

            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesCategory = categoryValue === 'all' || card.getAttribute('data-category') === categoryValue;
                var matchesYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
                var matched = matchesKeyword && matchesCategory && matchesYear;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        ['input', 'change'].forEach(function(eventName) {
            if (input) {
                input.addEventListener(eventName, applyFilter);
            }

            if (category) {
                category.addEventListener(eventName, applyFilter);
            }

            if (year) {
                year.addEventListener(eventName, applyFilter);
            }
        });

        applyFilter();
    }
})();
