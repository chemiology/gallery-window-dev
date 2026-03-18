const BASE_PATH = location.pathname.includes('/exhibition_pages/')
  ? '../'
  : '';

/* =====================================================
   Gallery Window – Exhibition JS (Final)
===================================================== */

let images = [];
let captions = [];
let currentIndex = 0;
let timer = null;
let slideSeconds = 10;
let autoMode = true;

let audio = null;

function getDeviceType() {
  return window.matchMedia("(pointer: coarse)").matches
    ? "mobile"
    : "desktop";
}


/* -----------------------------------------------------
   URL Parameters
----------------------------------------------------- */

const params = new URLSearchParams(window.location.search);

const exhibitionId = params.get("id");

if (!exhibitionId) {
  window.location.href = "./";
}

const hallId = params.get("hall") || "hall01";

const input = document.querySelector('input[name="exhibition_id"]');
if (input) {
  input.value = exhibitionId;
}


/* -----------------------------------------------------
   Init
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  if (!exhibitionId) return;

  loadExhibition(exhibitionId);
  setupControls();

});

/* -----------------------------------------------------
   Load Exhibition Data
----------------------------------------------------- */

async function loadExhibition(id) {
  try {

    const res = await fetch(BASE_PATH + "assets/config/gallery.json");
    const data = await res.json();

    console.log("현재 전시 ID:", id);
    console.log("gallery 데이터:", data);

    const exhibition =
      data.currentExhibitions.find(e => e.id === id);

    if (!exhibition) return;

    /* 페이지 제목 설정 */
    document.title =
      `Gallery Window — ${exhibition.title}`;

    const basePath =
      BASE_PATH + `assets/exhibitions/${exhibition.id}/`;

    /* ---------- 테마 색 ---------- */
    if (exhibition.themeColor) {
      document.body.style.setProperty(
        "--theme-color",
        exhibition.themeColor
      );
    }

    /* ---------- 이미지 ---------- */
    const imgBase = basePath + "images/";

    images = (exhibition.images || [])
      .map(name => imgBase + name);

    captions = exhibition.captions || [];

    slideSeconds = exhibition.slideSeconds || 10;

    /* ⭐ 첫 이미지 preload */
    if (images.length > 0) {

      const firstImg = new Image();
      firstImg.src = images[0];

      firstImg.onload = () => {
        showImage(0);
        startAuto();

        preloadInitialImages();
      };
    }

    /* ---------- 음악 ---------- */
    setupAudio(basePath + "music.mp3");

  } catch (err) {
    console.error("Exhibition load failed:", err);
  }
}

/* -----------------------------------------------------
   Auto Slide Notice
----------------------------------------------------- */


window.addEventListener("load", () => {

  const notice = document.getElementById("slideshow-notice");

  if(!notice) return;

  setTimeout(()=>{
    notice.style.opacity = "0";
  },5000);

});


/* -----------------------------------------------------
   Auto Slide
----------------------------------------------------- */

function startAuto() {

  stopAuto();
  autoMode = true;

  /* 첫 슬라이드만 짧게 표시 */

  timer = setTimeout(() => {

    nextImage();

    /* 이후 정상 슬라이드 */

    timer = setInterval(nextImage, slideSeconds * 1000);

  }, 6000);   // 첫 작품 6초

}

function stopAuto() {

  if (timer) {
    clearTimeout(timer);
    clearInterval(timer);
    timer = null;
  }

  autoMode = false;

}

/* -----------------------------------------------------
   Image Display
----------------------------------------------------- */

function showImage(index) {

  const img = document.getElementById("exhibition-image");
  const caption = document.getElementById("exhibition-caption");
  const counter = document.getElementById("artwork-counter");

  if (!img || images.length === 0) return;

  const isLoopReset =
    (currentIndex === images.length - 1 && index === 0);

  currentIndex = (index + images.length) % images.length;

  /* 작품 조회 기록 */

  gtag('event', 'view_artwork', {
    exhibition_id: exhibitionId,
    artwork_index: currentIndex + 1,
    artwork_file: images[currentIndex],
    device_type: getDeviceType()
  });

  /* 전시 완주 체크 */

  if (currentIndex === images.length - 1) {

    gtag('event', 'exhibition_completed', {
      exhibition_id: exhibitionId,
      total_artworks: images.length,
      device_type: getDeviceType()
    });

  }

  /* -------------------------------------------------
     Fade-in transition
  ------------------------------------------------- */

  img.classList.remove("loaded");

  img.onload = () => {
    img.classList.add("loaded");
  };

  img.src = images[currentIndex];

  /* caption update */

  if (caption) {

  caption.classList.add("fade");

  setTimeout(() => {

    caption.innerText = captions[currentIndex] || "";

    caption.classList.remove("fade");

  }, 180);

  }

  /* 작품 번호 표시 */

  if (counter) {
    counter.textContent =
      (currentIndex + 1) + " / " + images.length;
  }

  /* 다음 작품 preload */

  const nextIndex = (currentIndex + 1) % images.length;

  const preload = new Image();
  preload.src = images[nextIndex];

  /* loop reset effect */

  if (isLoopReset) {
    const viewer = document.querySelector(".viewer");

    if (viewer) {
      viewer.classList.add("loop-dark");

      setTimeout(() => {
        viewer.classList.remove("loop-dark");
      }, 900);
    }
  }

}



function preloadInitialImages() {
  for (let i = 1; i < Math.min(3, images.length); i++) {
    const img = new Image();
    img.src = images[i];
  }
}

function nextImage() {
  showImage(currentIndex + 1);
}

function prevImage() {
  showImage(currentIndex - 1);
}

/* ======================================
   Image protection
====================================== */

document.addEventListener("DOMContentLoaded", () => {
  const img = document.getElementById("exhibition-image");

  if (img) {
    img.addEventListener("dragstart", e => e.preventDefault());
  }
});

/* -----------------------------------------------------
   Audio
----------------------------------------------------- */

function setupAudio(src) {
  audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = "auto";

  // 시작은 muted
  audio.muted = true;

  // 자동 재생 시도 (실패해도 괜찮음)
  audio.play().catch(() => {});

  // 어떤 클릭이든 강제로 활성화
  const enableAudio = () => {
    if (!audio) return;

    audio.muted = false;
    audio.play().catch(() => {});
  };

  window.addEventListener("pointerdown", enableAudio, { once: true });
}

/* -----------------------------------------------------
   Controls
----------------------------------------------------- */

function setupControls() {
  const toggle = document.querySelector(".control-toggle");
  const box = document.querySelector(".control-box");

  if (toggle && box) {
    toggle.addEventListener("click", () => {
      box.style.display = box.style.display === "none" ? "block" : "none";
    });
  }

  // Auto / Manual
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener("change", e => {
      if (e.target.value === "auto") {
        startAuto();
      } else {
        stopAuto();
      }
    });
  });

  // Speed
  const speed = document.getElementById("speed");
  if (speed) {
    speed.addEventListener("input", e => {
      slideSeconds = Number(e.target.value);
      if (autoMode) startAuto();
    });
  }

  // Volume
  const volume = document.getElementById("volume");
  if (volume) {
    volume.addEventListener("input", e => {
      if (audio) audio.volume = Number(e.target.value);
    });
  }

  // Mute
  const mute = document.getElementById("mute");
  if (mute) {
    mute.addEventListener("click", () => {
      if (!audio) return;

      if (audio.paused) {
        audio.play().catch(() => {});
        audio.muted = false;
        mute.textContent = "Mute";
        return;
      }

      audio.muted = !audio.muted;
      mute.textContent = audio.muted ? "Unmute" : "Mute";
    });
}

  // Keyboard (Manual)
  window.addEventListener("keydown", e => {
    if (autoMode) return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });
}

/* =========================
   Exhibition Guestbook Logic
========================= */

const storageKey = `guestbook_${exhibitionId}`;
const listEl = document.getElementById("guestbook-list");
const formEl = document.getElementById("guestbook-form");
const inputEl = document.getElementById("guestbook-input");

function loadGuestbook() {
  const data = JSON.parse(localStorage.getItem(storageKey) || "[]");
  listEl.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.date} · ${item.text}`;
    listEl.appendChild(li);
    li.classList.add("highlight-new");

  });
}

function saveGuestbook(text) {
  const data = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const date = new Date().toISOString().slice(0, 10);

  data.unshift({ text, date });
  localStorage.setItem(storageKey, JSON.stringify(data));
}

if (formEl && listEl) {
  loadGuestbook();

  formEl.addEventListener("submit", e => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    saveGuestbook(text);
    inputEl.value = "";
    loadGuestbook();

    const guestbookBox =
      document.querySelector(".exhibition-guestbook");

    guestbookBox.classList.add("flash");

    setTimeout(()=>{
      guestbookBox.classList.remove("flash");
}, 420);


  });
}

function isExhibitionEnded(endDate) {
  const today = new Date().toISOString().slice(0, 10);
  return today > endDate;
}

document.addEventListener("DOMContentLoaded", () => {
  const guestbook = document.querySelector(".exhibition-guestbook");
  const input = document.getElementById("guestbook-input");

  if (!guestbook || !input) return;

  input.addEventListener("focus", () => {
    guestbook.classList.add("active");
  });

  input.addEventListener("blur", () => {
    guestbook.classList.remove("active");
  });
});

/* -------------------------------------
   Slideshow notice interaction
------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  const notice = document.getElementById("slideshow-notice");
  if (!notice) return;

  let shownOnce = false;
  let interactionShown = false;

  function hideNotice(){
    notice.style.opacity = "0";
  }

  function showNotice(){
    notice.style.opacity = "1";

    setTimeout(hideNotice,3000);
  }

  /* 처음 표시 */

  setTimeout(()=>{
    hideNotice();
    shownOnce = true;
  },5000);

  /* 첫 인터랙션에서만 표시 */

  function interactionHandler(){

    if(!shownOnce || interactionShown) return;

    interactionShown = true;
    showNotice();

    document.removeEventListener("mousemove", interactionHandler);
    document.removeEventListener("click", interactionHandler);
    document.removeEventListener("touchstart", interactionHandler);
  }

  document.addEventListener("mousemove", interactionHandler);
  document.addEventListener("click", interactionHandler);
  document.addEventListener("touchstart", interactionHandler);

});




document.getElementById("backHome").href =
  `hall.html?hall=${hallId}`;

const backBtn = document.getElementById("backHome");

if (backBtn) {

  // 현재 hall 정보 읽기
  const params = new URLSearchParams(window.location.search);
  const hallId = params.get("hall") || "hall01";

  // Home 버튼 목적지 설정
  backBtn.href = BASE_PATH + `hall.html?hall=${hallId}`;

  // 페이드 전환
  backBtn.addEventListener("click", function(e) {
    e.preventDefault();

    const fade = document.getElementById("pageFade");
    fade.classList.add("active");

    setTimeout(() => {
      window.location.href = backBtn.href;
    }, 500);
  });
}

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});

let touchStartX = 0;
let touchEndX = 0;

const viewer = document.querySelector(".viewer");

if (viewer) {

  viewer.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });

}

viewer.addEventListener("touchend", e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const diff = touchEndX - touchStartX;

  if (Math.abs(diff) < 40) return;

  if (diff < 0) {
    nextImage();   // 왼쪽 스와이프
  } else {
    prevImage();   // 오른쪽 스와이프
  }
}

/* ======================================
   Exhibition Right-click Protection
====================================== */

document.addEventListener("contextmenu", function(e) {

  // viewer 영역 안이면 우클릭 차단
  const viewer = e.target.closest(".viewer");

  if (viewer) {
    e.preventDefault();
  }

});