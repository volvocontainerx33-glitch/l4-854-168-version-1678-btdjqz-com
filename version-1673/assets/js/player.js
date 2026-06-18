(function() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var stream = player.getAttribute('data-stream');
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached || !video || !stream) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function playVideo() {
            attachStream();
            player.classList.add('is-playing');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        }

        if (button && video) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function() {
                player.classList.add('is-playing');
            });

            video.addEventListener('ended', function() {
                player.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
