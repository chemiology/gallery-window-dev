/* =====================================================
   Gallery Window – Exhibition JS (FINAL STABLE)
   ✔ BASE_PATH 완전 대응
   ✔ dev / 운영 / GitHub Pages 모두 안정
===================================================== */

/* =========================
   BASE PATH (🔥 핵심)
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

let images = [];
let captions = [];
let currentIndex = 0;
let timer = null;
let slideSeconds = 10;
let autoMode = true;

let artworkNarrationTimer = null;
let artworkNarrationDelay = 2000;

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
  window.location.href = BASE_PATH + "/";
}

const hallId = params.get("hall") || "hall01";

/* 방명록 ID */

const input = document.querySelector('input[name="exhibition_id"]');
if (input) input.value = exhibitionId;

/* -----------------------------------------------------
   INIT
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  if (!exhibitionId) return;

  loadExhibition(exhibitionId);
  setupControls();

  /* 🔒 이미지 보호 */
  const img = document.getElementById("exhibition-image");

  if (!img) return;

  protectImage(img);
});

function protectImage(img) {

  // 드래그 방지
  img.addEventListener("dragstart", e => e.preventDefault());

  // 우클릭 방지
    img.addEventListener("contextmenu", e => {
      e.preventDefault();
      return false;
    });

  // 더블클릭 방지
  img.addEventListener("dblclick", e => e.preventDefault());

  // 우클릭 마우스 다운 방지
  img.addEventListener("mousedown", e => {
    if (e.button === 2) e.preventDefault();
  });

  // 모바일 멀티터치 방지
  img.addEventListener("touchstart", e => {
    if (e.touches.length > 1) e.preventDefault();
  });

}


/* -----------------------------------------------------
   Load Exhibition Data
----------------------------------------------------- */

async function loadExhibition(id) {

  /* 🔥 상태 초기화 (정상) */
  images = [];
  captions = [];
  currentIndex = 0;

  try {

    const res = await fetch(
      BASE_PATH + "/assets/config/gallery.json?v=" + Date.now()
    );
    const data = await res.json();

    const exhibition =
      data.currentExhibitions?.find(e => e.id === id)
      || data.currentExhibitions?.[0];

    if (!exhibition) {
      console.warn("전시 없음:", id);
      return;
    }

    document.title = `Gallery Window — ${exhibition.title}`;

    const basePath =
      BASE_PATH + `/assets/exhibitions/${exhibition.id}/`;

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

    /* 🔥 핵심 안정 코드 */
    captions = Array.isArray(exhibition.captions)
      ? exhibition.captions
      : [];

    slideSeconds = exhibition.slideSeconds || 10;

    if (images.length > 0) {

      const firstImg = new Image();
      firstImg.src = images[0];

      firstImg.onload = () => {
        showImage(0);
        preloadInitialImages();
      };
    }

    /* ---------- 음악 ---------- */

  const musicFile = exhibition.music
    ? BASE_PATH + "/assets/audio/" + exhibition.music + ".mp3"
    : basePath + "music.mp3"; // 기존 fallback 유지

  const narrationFile =
      basePath + "curation.mp3";

  AudioManager.setupAudio(
      musicFile,
      narrationFile,
      exhibition.volume,
      exhibition.curationVolume ?? 1.0,
      startAuto,
      exhibition.fadeDuration ?? 500
  );

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

  console.log("★★★★★ startAuto 호출");

  stopAuto();
  autoMode = true;

  timer = setTimeout(async () => {

    /*
     * Curation이 아직 재생 중이라면
     * Curation 종료를 기다립니다.
     */
    if (
      AudioManager.hasNarration() &&
      AudioManager.isNarrationPlaying()
    ) {

      AudioManager.stopNarration();
      AudioManager.playMusic();

      /*
       * Curation 종료 후에는
       * 현재 작품의 Artwork Narration을 시작합니다.
       */
      const started =
        await playCurrentArtworkNarration();

      if (!started) {

        /*
         * Artwork Narration이 없으면
         * 기존 자동 슬라이드로 진행합니다.
         */
        nextImage();

        timer =
          setInterval(
            nextImage,
            slideSeconds * 1000
          );

      }

      return;
    }

    /*
     * Curation이 없는 경우
     * 현재 작품의 Artwork Narration을 시도합니다.
     */
    const started =
      await playCurrentArtworkNarration();

    if (!started) {

      nextImage();

      timer =
        setInterval(
          nextImage,
          slideSeconds * 1000
        );

    }

  });

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
   Stop Curation
----------------------------------------------------- */

function stopCurationIfPlaying() {

  if (
    AudioManager.hasNarration() &&
    AudioManager.isNarrationPlaying()
  ) {

    AudioManager.stopNarration();
    AudioManager.playMusic();

  }

}

/* -----------------------------------------------------
   Image Display
----------------------------------------------------- */

function showImage(index) {

  const img = document.getElementById("exhibition-image");
  const caption = document.getElementById("caption");
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

  img.classList.remove("loaded");

  img.onload = () => {
    img.classList.add("loaded");
  };

  img.src = images[currentIndex];

  protectImage(img); // 🔥 추가

  if (caption) {

    caption.innerText = captions[currentIndex] || "";

    caption.classList.add("fade");

    setTimeout(() => {
      caption.classList.remove("fade");
    }, 180);

  }

  if (counter) {
    counter.textContent =
      (currentIndex + 1) + " / " + images.length;
  }

  const nextIndex = (currentIndex + 1) % images.length;
  new Image().src = images[nextIndex];

  if (isLoopReset) {
    const viewer = document.querySelector(".viewer");
    viewer?.classList.add("loop-dark");

    setTimeout(() => {
      viewer?.classList.remove("loop-dark");
    }, 900);
  }
}

/* -----------------------------------------------------
   Artwork Narration
----------------------------------------------------- */

function getArtworkNarrationSrc() {

  if (!images.length) return null;

  const imagePath = images[currentIndex];

  if (!imagePath) return null;

  const fileName =
    imagePath.split("/").pop();

  if (!fileName) return null;

  const baseName =
    fileName.replace(/\.[^/.]+$/, "");

  return BASE_PATH
    + "/assets/exhibitions/"
    + exhibitionId
    + "/"
    + baseName
    + ".mp3";
}


function stopArtworkNarration() {

  if (artworkNarrationTimer) {

    clearTimeout(
      artworkNarrationTimer
    );

    artworkNarrationTimer = null;
  }

  if (
    AudioManager.isArtworkNarrationPlaying()
  ) {

    AudioManager.stopArtworkNarration();
  }

}


async function playCurrentArtworkNarration() {

  stopArtworkNarration();

  const narrationSrc =
    getArtworkNarrationSrc();

  if (!narrationSrc) {
    return false;
  }

  const started =
    await AudioManager.playArtworkNarration(
      narrationSrc,
      () => {

          AudioManager.playMusic();

          artworkNarrationTimer =
            setTimeout(() => {

              artworkNarrationTimer = null;

              if (autoMode) {

                nextImage();

                /*
                * 다음 작품의 narration을 시작한다.
                */
                startAuto();

              }

            }, artworkNarrationDelay);

      }
    );

  return started;
}

function preloadInitialImages() {
  for (let i = 1; i < Math.min(3, images.length); i++) {
    new Image().src = images[i];
  }
}

function nextImage() {

  // Curation 또는 Artwork Narration 중이면 즉시 중단
  stopCurationIfPlaying();
  stopArtworkNarration();

  if(currentIndex >= images.length-1){

      stopAuto();

      document
        .getElementById("endScreen")
        ?.classList.add("active");

      return;
  }

  showImage(currentIndex + 1);
}

function prevImage() {

  // Curation 또는 음성 재생 중이면 즉시 중단
  stopCurationIfPlaying();

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

      AudioManager.setMusicVolume(
            Number(e.target.value)
      );
  });

  document.getElementById("mute")
  ?.addEventListener("click", e => {

      const btn = e.target;

      if(btn.textContent === "Mute"){

          AudioManager.mute();
          btn.textContent = "Unmute";

      }else{

          AudioManager.unmute();
          btn.textContent = "Mute";
      }
  });

  window.addEventListener("keydown", e => {
    if (autoMode) return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });

/* 작품 이동 버튼 */

  document.getElementById("nextArtwork")
  ?.addEventListener("click", () => {

      nextImage();
      if(autoMode){
          startAuto();
      }
  });

}

document.addEventListener("keydown", e => {

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    console.log("🔒 저장 차단");
  }

});


/* -----------------------------------------------------
   Back Button
----------------------------------------------------- */

const backBtn = document.getElementById("backHome");

if (backBtn) {

  const from = params.get("from");

  if (from === "hall2") {
    backBtn.href = BASE_PATH + "/assets/event/hall2.html";
  } else {
    backBtn.href = BASE_PATH + `/hall.html?hall=${hallId}`;
  }

  backBtn.addEventListener("click", e => {
    e.preventDefault();

    document.getElementById("pageFade")
      ?.classList.add("active");

    setTimeout(() => {
      window.location.href = backBtn.href;
    }, 500);
  });
}

document
.getElementById("restartExhibition")
?.addEventListener("click",()=>{

    document
      .getElementById("endScreen")
      ?.classList.remove("active");

    showImage(0);

    startAuto();
});

document
.getElementById("goHallButton")
?.addEventListener("click",()=>{

    window.location.href =
      backBtn.href;

});

/* -----------------------------------------------------
   PAGE READY
----------------------------------------------------- */

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});