(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.play-cover');
    if (!video) {
      return;
    }
    var src = video.getAttribute('data-hls');
    var ready = false;

    function load() {
      if (ready || !src) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        box._hls = hls;
      } else {
        video.src = src;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var boxes = document.querySelectorAll('[data-player]');
    Array.prototype.forEach.call(boxes, initPlayer);
  });
}());
