(function () {
    var player = document.querySelector('[data-player]');
    var sourceNode = document.getElementById('video-source');
    var cover = document.querySelector('[data-player-cover]');
    var trigger = document.querySelector('[data-play-trigger]');
    var hls = null;
    var ready = false;

    if (!player || !sourceNode) {
        return;
    }

    function source() {
        var raw = sourceNode.textContent || '';

        try {
            return JSON.parse(raw);
        } catch (error) {
            return raw.trim();
        }
    }

    function prepare() {
        if (ready) {
            return;
        }

        var url = source();

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(player);
        } else {
            player.src = url;
        }

        ready = true;
    }

    function hideCover() {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    }

    function start() {
        prepare();
        hideCover();

        var result = player.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener('click', start);
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    player.addEventListener('click', function () {
        if (player.paused) {
            start();
        }
    });

    player.addEventListener('play', hideCover);

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
})();
