/* =====================================================
   Gallery Window – Exhibition JS (Final Stable)
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
  window.location.href = "/";
}

const hallId = params.get("hall") || "hall01";

/* 방명록 ID */

const input = document.querySelector('input[name="exhibition_id"]');
if (input) input.value = exhibitionId;

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

    const res = await fetch("/assets/config/gallery.json");
    const data = await res.json();

    const exhibition =
      data.currentExhibitions?.find(e => e.id === id);

    if (!exhibition) {
      console.warn("전시 없음:", id);
      return;
    }

    document.title = `Gallery Window — ${exhibition.title}`;

    const basePath =
      `/assets/exhibitions/${exhibition.id}/`;

    /* ---------- theme ---------- */

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

    /* ---------- 이미지 ---------- */

    const imgBase = basePath + "images/";

    images = (exhibition.images || [])
      .map(name => imgBase + name);

    captions = exhibition.captions || [];

    slideSeconds = exhibition.slideSeconds || 10;

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
  if (!notice) return;

  setTimeout(() => {
    notice.style.opacity = "0";
  }, 5000);

});

/* -----------------------------------------------------
   Auto Slide
----------------------------------------------------- */

function startAuto() {

  stopAuto();
  autoMode = true;

  timer = setTimeout(() => {

    nextImage();

    timer = setInterval(nextImage, slideSeconds * 1000);

  }, 6000);

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

  /* analytics */

  if (typeof gtag !== "undefined") {

    gtag('event', 'view_artwork', {
      exhibition_id: exhibitionId,
      artwork_index: currentIndex + 1,
      artwork_file: images[currentIndex],
      device_type: getDeviceType()
    });

    if (currentIndex === images.length - 1) {

      gtag('event', 'exhibition_completed', {
        exhibition_id: exhibitionId,
        total_artworks: images.length,
        device_type: getDeviceType()
      });

    }
  }

  /* 이미지 */

  img.classList.remove("loaded");

  img.onload = () => {
    img.classList.add("loaded");
  };

  img.src = images[currentIndex];

  /* caption */

  if (caption) {

    caption.classList.add("fade");

    setTimeout(() => {
      caption.innerText = captions[currentIndex] || "";
      caption.classList.remove("fade");
    }, 180);
  }

  /* counter */

  if (counter) {
    counter.textContent =
      (currentIndex + 1) + " / " + images.length;
  }

  /* preload */

  const nextIndex = (currentIndex + 1) % images.length;
  new Image().src = images[nextIndex];

  /* loop effect */

  if (isLoopReset) {
    const viewer = document.querySelector(".viewer");
    viewer?.classList.add("loop-dark");

    setTimeout(() => {
      viewer?.classList.remove("loop-dark");
    }, 900);
  }
}

function preloadInitialImages() {
  for (let i = 1; i < Math.min(3, images.length); i++) {
    new Image().src = images[i];
  }
}

function nextImage() {
  showImage(currentIndex + 1);
}

function prevImage() {
  showImage(currentIndex - 1);
}

/* -----------------------------------------------------
   Image protection
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("exhibition-image")
    ?.addEventListener("dragstart", e => e.preventDefault());
});

/* -----------------------------------------------------
   Audio
----------------------------------------------------- */

function setupAudio(src) {

  audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = "auto";
  audio.muted = true;

  audio.play().catch(() => {});

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

  toggle?.addEventListener("click", () => {
    box.style.display =
      box.style.display === "none" ? "block" : "none";
  });

  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener("change", e => {
      e.target.value === "auto" ? startAuto() : stopAuto();
    });
  });

  document.getElementById("speed")?.addEventListener("input", e => {
    slideSeconds = Number(e.target.value);
    if (autoMode) startAuto();
  });

  document.getElementById("volume")?.addEventListener("input", e => {
    if (audio) audio.volume = Number(e.target.value);
  });

  document.getElementById("mute")?.addEventListener("click", e => {

    if (!audio) return;

    if (audio.paused) {
      audio.play();
      audio.muted = false;
      e.target.textContent = "Mute";
      return;
    }

    audio.muted = !audio.muted;
    e.target.textContent = audio.muted ? "Unmute" : "Mute";
  });

  window.addEventListener("keydown", e => {
    if (autoMode) return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });
}

/* -----------------------------------------------------
   Back Button
----------------------------------------------------- */

const backBtn = document.getElementById("backHome");

if (backBtn) {

  backBtn.href = `/hall.html?hall=${hallId}`;

  backBtn.addEventListener("click", e => {
    e.preventDefault();

    document.getElementById("pageFade")
      ?.classList.add("active");

    setTimeout(() => {
      window.location.href = backBtn.href;
    }, 500);
  });
}

/* -----------------------------------------------------
   PAGE READY
----------------------------------------------------- */

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});