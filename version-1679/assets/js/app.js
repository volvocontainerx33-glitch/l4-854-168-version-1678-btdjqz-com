import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const initNavigation = () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
};

const initHero = () => {
  const carousel = document.querySelector(".hero-carousel");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
  const next = carousel.querySelector("[data-hero-next]");
  const prev = carousel.querySelector("[data-hero-prev]");
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  if (next) {
    next.addEventListener("click", () => {
      show(current + 1);
      start();
    });
  }

  if (prev) {
    prev.addEventListener("click", () => {
      show(current - 1);
      start();
    });
  }

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  start();
};

const initPlayers = () => {
  const players = Array.from(document.querySelectorAll("video.media-player"));

  players.forEach((video) => {
    const source = video.querySelector("source");
    const src = source ? source.src : "";

    if (!src) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
    }

    const frame = video.closest(".video-frame");

    if (frame) {
      frame.addEventListener("click", () => {
        if (video.paused) {
          video.play().catch(() => {});
        }
      });
    }
  });
};

ready(() => {
  initNavigation();
  initHero();
  initPlayers();
});
