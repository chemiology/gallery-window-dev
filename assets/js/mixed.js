/* =====================================================
   Gallery Window – Mixed Exhibition JS (FINAL CLEAN)
===================================================== */

/* =========================
   USER INTERACTION
========================= */

let userInteracted = false;

document.addEventListener("touchstart", async () => {

  userInteracted = true;

  if (userActivatedSound) return;
  userActivatedSound = true;

  // 🔥 배경음 활성화
  if (audio) {
    audio.muted = false;
    audio.volume = currentExhibition?.volume ?? 0.5;
    audio.play().catch(() => {});
  }

  // 🔥 Vimeo 영상 소리 ON
  if (vimeoPlayer) {
    try {
      await vimeoPlayer.setMuted(false);
      await vimeoPlayer.setVolume(1);
    } catch (e) {}
  }

}, { once: true });

/* =========================
   BASE PATH
========================= */

const BASE_PATH = (() => {
  const path = location.pathname;

  if (path.includes('/gallery-window-dev/')) {
    return '/gallery-window-dev';
  }

  const segments = path.split('/').filter(Boolean);
  if (location.hostname.includes('github.io') && segments.length > 0) {
    return '/' + segments[0];
  }

  return '';
})();

/* =========================
   STATE
========================= */

let currentType = "image";
let vimeoPlayer = null;

let items = [];
let currentIndex = 0;

let timer = null;
let slideSeconds = 10;
let autoMode = true;

let audio = null;
let userActivatedSound = false;
let currentExhibition = null;

/* =========================
   PARAMS
========================= */

const params = new URLSearchParams(window.location.search);
const exhibitionId = params.get("id");

if (!exhibitionId) {
  window.location.href = BASE_PATH + "/";
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadMixed(exhibitionId);
});

/* =========================
   LOAD MIXED DATA
========================= */

async function loadMixed(id) {

  try {

    const galleryRes = await fetch(
      BASE_PATH + "/assets/config/gallery.json"
    );
    const gallery = await galleryRes.json();

    const exhibition =
      gallery.currentExhibitions?.find(e => e.id === id);

    currentExhibition = exhibition;

    if (!exhibition) return;

    document.title = `Gallery Window — ${exhibition.title}`;

    /* theme */
    if (exhibition.themeColor) {
      document.body.style.setProperty(
        "--theme-color",
        exhibition.themeColor
      );
    }

    if (exhibition.themeMode) {
      document.body.classList.add(
        "theme-" + exhibition.themeMode
      );
    }

    /* 🔥 배경음악 */
    if (exhibition.music) {

      audio = new Audio(
        BASE_PATH + "/assets/audio/" + exhibition.music + ".mp3"
      );

      audio.loop = true;
      audio.volume = 0.5;

      audio.play().catch(() => {});
    }

    const basePath =
      BASE_PATH + `/assets/exhibitions/${id}/`;

    const res = await fetch(basePath + "mixed.json");
    const data = await res.json();

    items = data.items || [];
    slideSeconds = data.slideSeconds || 10;

    if (!items.length) return;

    showItem(0);
    startAuto();

  } catch (err) {
    console.error("Mixed load error:", err);
  }
}

/* =========================
   AUTO
========================= */

function startAuto() {
  stopAuto();
  autoMode = true;

  timer = setInterval(() => {
    nextItem();
  }, slideSeconds * 1000);
}

function stopAuto() {
  clearInterval(timer);
}

/* =========================
   LAYER CONTROL
========================= */

function showImageLayer() {

  const imageLayer = document.getElementById("image-layer");
  const videoLayer = document.getElementById("video-layer");

  imageLayer.classList.add("layer-visible");
  imageLayer.classList.remove("layer-hidden");

  videoLayer.classList.remove("layer-visible");
  videoLayer.classList.add("layer-hidden");
}

function showVideoLayer() {

  const imageLayer = document.getElementById("image-layer");
  const videoLayer = document.getElementById("video-layer");

  videoLayer.classList.add("layer-visible");
  videoLayer.classList.remove("layer-hidden");

  imageLayer.classList.remove("layer-visible");
  imageLayer.classList.add("layer-hidden");
}

/* =========================
   SHOW ITEM
========================= */

function showItem(index) {

  const img = document.getElementById("mixed-image");
  const iframe = document.getElementById("mixed-video");

  if (!items.length) return;

  currentIndex = (index + items.length) % items.length;

  const item = items[currentIndex];
  currentType = item.type;

  const basePath =
    BASE_PATH + `/assets/exhibitions/${exhibitionId}/`;

  /* caption */
  const caption = document.getElementById("exhibition-caption");
  if (caption) {
    caption.innerText = item.caption || "";
  }

  /* =========================
     IMAGE
  ========================= */

  if (item.type === "image") {

    const notice = document.getElementById("slideshow-notice");
    if (notice) notice.style.display = "block";

    if (audio) {
      audio.volume = currentExhibition?.volume ?? 0.5;
      audio.play().catch(() => {});
    }

    iframe.src = "";

    if (vimeoPlayer) {
      vimeoPlayer.unload();
      vimeoPlayer = null;
    }

    showImageLayer();

    img.src = basePath + "images/" + item.src;

    startAuto();
  }

  /* =========================
     VIDEO
  ========================= */

  if (item.type === "video") {

    // 🔥 여기 추가
    const notice = document.getElementById("slideshow-notice");
    if (notice) notice.style.display = "none";

    if (audio) {
      audio.volume = 0;
      audio.pause();
    }

    showVideoLayer();

    iframe.src =
      "https://player.vimeo.com/video/" + item.id +
      "?h=" + item.hash +
      "&autoplay=1&muted=1" +
      "&title=0&byline=0&portrait=0";

    if (window.matchMedia("(pointer: coarse)").matches) {
      setTimeout(() => {
        iframe.src = iframe.src;
      }, 300);
    }

    stopAuto();

    setTimeout(() => {

      if (vimeoPlayer) {
        vimeoPlayer.unload();
      }

      vimeoPlayer = new Vimeo.Player(iframe);

      // 🔥 이미 터치된 상태면 바로 소리 ON
      if (userActivatedSound) {
        vimeoPlayer.setMuted(false);
        vimeoPlayer.setVolume(1);
      }

      vimeoPlayer.on('ended', () => {

        const videoLayer = document.getElementById("video-layer");
        videoLayer.classList.add("fade-out");

        setTimeout(() => {
          videoLayer.classList.remove("fade-out");
          nextItem();
          startAuto();
        }, 300);

      });

    }, 500);
  }

  updateCounter();
  preloadNextItem();
}

/* =========================
   PRELOAD
========================= */

function preloadNextItem() {

  const nextIndex = (currentIndex + 1) % items.length;
  const nextItem = items[nextIndex];

  const basePath =
    BASE_PATH + `/assets/exhibitions/${exhibitionId}/`;

  if (nextItem.type === "image") {

    const img = new Image();
    img.src = basePath + "images/" + nextItem.src;

  }
}

/* =========================
   NAVIGATION
========================= */

function nextItem() {
  showItem(currentIndex + 1);
}

function prevItem() {
  showItem(currentIndex - 1);
}

/* =========================
   COUNTER
========================= */

function updateCounter() {

  const counter = document.getElementById("artwork-counter");
  if (!counter) return;

  counter.textContent =
    (currentIndex + 1) + " / " + items.length;
}

/* =========================
   INPUT CONTROL
========================= */

document.addEventListener("keydown", e => {

  if (autoMode) return;

  if (e.key === "ArrowRight") nextItem();
  if (e.key === "ArrowLeft") prevItem();

});

let touchLocked = false;

document.addEventListener("touchend", () => {

  if (!autoMode) return;

  // 영상일 때는 무시
  if (currentType === "video") return;

  if (touchLocked) return;

  touchLocked = true;

  nextItem();

  setTimeout(() => {
    touchLocked = false;
  }, 800);

});

/* =========================
   PAGE READY
========================= */

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});