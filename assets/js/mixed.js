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
let soundUnlocked = false;
let noticeShown = false;
let noticeTimer = null;

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
      audio.volume = currentExhibition?.volume ?? 0.5;

      audio.play().catch(() => {});
    }

    const basePath =
      BASE_PATH + `/assets/exhibitions/${id}/`;

    const res = await fetch(basePath + "mixed.json");
    const data = await res.json();

    items = data.items || [];
    slideSeconds =
      currentExhibition?.slideSeconds ??
      data.slideSeconds ??
      10;

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
   fade / audio 함수만 추가
========================= */

function fadeToBlack(duration = 500){
  const f = document.getElementById("cinema-fade");
  if(!f) return;
  f.style.transition = `opacity ${duration}ms ease`;
  f.style.opacity = 1;
}

function fadeFromBlack(duration = 500){
  const f = document.getElementById("cinema-fade");
  if(!f) return;
  f.style.transition = `opacity ${duration}ms ease`;
  f.style.opacity = 0;
}

function fadeAudio(target, duration = 500){
  if(!audio) return;

  const start = audio.volume;
  const step = (target - start) / (duration / 50);

  let v = start;

  const interval = setInterval(() => {
    v += step;
    audio.volume = Math.max(0, Math.min(1, v));

    if ((step > 0 && v >= target) || (step < 0 && v <= target)) {
      audio.volume = target;
      clearInterval(interval);
    }
  }, 50);
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
  const frame = document.querySelector(".video-frame");

  videoLayer.classList.add("layer-visible");
  videoLayer.classList.remove("layer-hidden");

  imageLayer.classList.remove("layer-visible");
  imageLayer.classList.add("layer-hidden");

  // 🔥 중요: 매번 초기화
  if (frame) {
    frame.classList.remove("active");
  }
}

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

    fadeToBlack(400);

    setTimeout(() => {

      if (soundBtn) soundBtn.style.display = "none";

      const notice = document.getElementById("slideshow-notice");

      if (notice && !noticeShown) {

        notice.style.display = "block";

        clearTimeout(noticeTimer);

        noticeTimer = setTimeout(() => {
          notice.style.display = "none";
        }, 5000);

        noticeShown = true;
      }

      if (audio) {
        fadeAudio(currentExhibition?.volume ?? 0.5, 800);
        audio.play().catch(() => {});
      }

      iframe.src = "";

      if (vimeoPlayer) {
        vimeoPlayer.unload();
        vimeoPlayer = null;
      }

      showImageLayer();

      img.src = basePath + "images/" + item.src;

      fadeFromBlack(600);

      startAuto();

      updateCounter();
      preloadNextItem();

    }, 300);
  }

/* =========================
   VIDEO
========================= */

else if (item.type === "video") {

  fadeToBlack(400);

  setTimeout(() => {

    if (soundBtn) soundBtn.style.display = "block";

    const notice = document.getElementById("slideshow-notice");
    if (notice) notice.style.display = "none";

    if (audio) {
      fadeAudio(0.1, 2000);   // 🔥 더 부드럽게

      setTimeout(() => {
        audio.pause();
      }, 1300);
    }

    showVideoLayer();

    iframe.style.background = "#000";

    iframe.style.opacity = 0;

    iframe.src =
      "https://player.vimeo.com/video/" + item.id +
      "?h=" + item.hash +
      "&autoplay=1&muted=1&controls=0&autopause=0&title=0&byline=0&portrait=0";

    setTimeout(() => {

      const frame = iframe.closest(".video-frame");

      if (frame) {
        frame.classList.add("active");
      }

      fadeFromBlack(800);

    }, 300);   // 🔥 여유 확보


    stopAuto();

    setTimeout(() => {

      if (vimeoPlayer) {
        vimeoPlayer.unload();
      }

      vimeoPlayer = new Vimeo.Player(iframe);

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
        }, 250);

      });

    }, 500);

    updateCounter();
    preloadNextItem();

  }, 300);
}

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

  // 이미지 드래그 방지 (추가 안전)
  document.querySelectorAll("img").forEach(img => {
    img.setAttribute("draggable", "false");
  });

});


/* =========================
   SOUND BUTTON
========================= */

const soundBtn = document.getElementById("sound-overlay");

soundBtn?.addEventListener("click", async () => {

  if (vimeoPlayer) {
    try {
      await vimeoPlayer.setMuted(false);
      await vimeoPlayer.setVolume(1);
    } catch(e){}
  }

  if (audio) {
    fadeAudio(0, 800);   // 🔥 완전히 정리
    setTimeout(()=>audio.pause(), 900);
  }

  soundBtn.style.display = "none";

});


/* =========================
   CONTROL PANEL (FULL)
========================= */

// 🔥 Control Panel Toggle
document.querySelector(".control-toggle")?.addEventListener("click", () => {

  const box = document.querySelector(".control-box");
  if (!box) return;

  box.style.display =
    box.style.display === "none" ? "block" : "none";

});


// 🔥 Viewing Mode (Auto / Manual)
document.querySelectorAll('input[name="mode"]').forEach(radio => {

  radio.addEventListener("change", (e) => {

    if (e.target.value === "manual") {
      autoMode = false;
      stopAuto();
    } else {
      autoMode = true;
      startAuto();
    }

  });

});


// 🔥 Slide Speed
document.getElementById("speed")?.addEventListener("input", (e) => {

  slideSeconds = parseInt(e.target.value);

  if (autoMode) {
    startAuto(); // 속도 변경 즉시 반영
  }

});


// 🔥 Volume
document.getElementById("volume")?.addEventListener("input", (e) => {

  const vol = parseFloat(e.target.value);

  if (audio) {
    audio.volume = vol;
  }

});


// 🔥 Mute
let isMuted = false;

document.getElementById("mute")?.addEventListener("click", () => {

  isMuted = !isMuted;

  if (audio) {
    audio.muted = isMuted;
  }

  const btn = document.getElementById("mute");
  if (btn) {
    btn.innerText = isMuted ? "Unmute" : "Mute";
  }

});


/* =========================
   HALL NAV
========================= */

const hallId = params.get("hall");

document.getElementById("backHome")?.addEventListener("click", () => {

  const from = params.get("from");

  if (from === "hall2") {
    location.href = "/assets/event/hall2.html";
    return;
  }

  if (hallId) {
    location.href = `hall.html?hall=${hallId}`;
  } else {
    window.history.back();
  }

});


/* =========================
   BASIC PROTECTION
========================= */

// 🔒 video-mask 우클릭 차단 (mixed)
document.querySelector(".video-mask.main")
  ?.addEventListener("contextmenu", e => e.preventDefault());

// 우클릭 방지
document.addEventListener("contextmenu", e => e.preventDefault());

// 드래그 방지
document.addEventListener("dragstart", e => e.preventDefault());

// 텍스트 선택 방지
document.addEventListener("selectstart", e => e.preventDefault());

/* =========================
   DEVTOOLS DETECTION
========================= */

let devtoolsOpen = false;

setInterval(() => {

  const threshold = 160;

  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {

    if (!devtoolsOpen) {
      devtoolsOpen = true;

      console.clear();

      // alert 제거 또는 1회만
      console.warn("DevTools detected");

      // 선택 1: 화면 블러
      document.body.style.filter = "blur(8px)";

      // 선택 2 (강력): 페이지 이동
      // location.href = "/";
    }

  } else {
    devtoolsOpen = false;
    document.body.style.filter = "none";
  }

}, 1000);


/* =========================
   KEY BLOCK
========================= */

document.addEventListener("keydown", e => {

  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }

  // Ctrl+Shift+I / J / C
  if (e.ctrlKey && e.shiftKey && (
    e.key === "I" || e.key === "J" || e.key === "C"
  )) {
    e.preventDefault();
  }

  // Ctrl+U (소스보기)
  if (e.ctrlKey && e.key === "u") {
    e.preventDefault();
  }

});


document.querySelector(".video-mask.main")
  ?.addEventListener("contextmenu", e => e.preventDefault());
