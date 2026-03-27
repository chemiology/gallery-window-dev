/* =========================
   디바이스 체크
========================= */
const isMobile = window.innerWidth <= 768;

/* =========================
   URL 파라미터
========================= */
const params = new URLSearchParams(location.search);
const exhibitionId = params.get("id");

/* =========================
   상태
========================= */
let videos = [];
let currentIndex = 0;

/* =========================
   페이드
========================= */
function fadeOut() {
  const fade = document.getElementById("fade-layer");
  if (fade) fade.style.opacity = 1;
}

function fadeIn() {
  const fade = document.getElementById("fade-layer");
  if (fade) fade.style.opacity = 0;
}

/* =========================
   전시 테마
========================= */
fetch("assets/config/gallery.json")
  .then(r => r.json())
  .then(data => {

    const exhibitions =
      data.currentExhibitions || data.exhibitions || [];

    const ex = exhibitions.find(e => e.id === exhibitionId);
    if (!ex) return;

    document.body.setAttribute("data-theme", ex.themeMode || "warm");

    document.body.style.setProperty(
      "--theme-color",
      ex.themeColor || "#ffffff"
    );

  });

/* =========================
   영상 목록
========================= */
fetch("assets/config/videos.json")
  .then(r => r.json())
  .then(data => {

    videos = data[exhibitionId] || [];

    if (!videos.length) return;

    loadVideo();

  });

/* =========================
   🎬 영상 로드 (핵심)
========================= */
function loadVideo() {

  if (!videos.length) return;

  const iframe = document.getElementById("player");
  const video = videos[currentIndex];

  /* 🎨 ambient */
  const ambient = document.querySelector(".video-ambient");
  if (ambient && video.themeColor) {
    ambient.style.setProperty("--ambient-color", video.themeColor);
  }

  fadeOut();

  setTimeout(() => {

    /* 🔥 모바일/PC 완전 분리 */
    let extraParams = "";

    if (isMobile) {
      extraParams =
        "&playsinline=1" +
        "&autoplay=1";
    } else {
      extraParams =
        "&autoplay=1" +
        "&mute=1";
    }

    iframe.src =
      "https://www.youtube.com/embed/" + video.id +
      "?controls=1" +
      "&rel=0" +
      "&modestbranding=1" +
      "&iv_load_policy=3" +
      "&fs=0" +
      "&loop=1" +
      "&playlist=" + video.id +
      extraParams;

    /* 텍스트 */
    const caption = document.getElementById("video-caption");
    if (caption) caption.innerText = video.caption || "";

    const title = document.getElementById("videoTitle");
    if (title) title.innerText = video.title || "";

    /* 안내문구 */
    const guide = document.querySelector(".sound-guide");
    if (guide) guide.style.opacity = 1;

    /* 🎬 fade in (길게) */
    setTimeout(() => {
      fadeIn();
    }, 900);

  }, 800);

}

/* =========================
   영상 전환
========================= */
function nextVideo() {
  if (videos.length <= 1) return;
  currentIndex = (currentIndex + 1) % videos.length;
  loadVideo();
}

function prevVideo() {
  currentIndex = (currentIndex - 1 + videos.length) % videos.length;
  loadVideo();
}

/* =========================
   키보드
========================= */
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextVideo();
  if (e.key === "ArrowLeft") prevVideo();
});

/* =========================
   Hall 이동
========================= */
document.getElementById("backToHall")?.addEventListener("click", () => {

  const hall = params.get("hall");

  if (!hall) {
    location.href = "index.html";
    return;
  }

  location.href = `hall.html?hall=${hall}`;
});

/* =========================
   UI
========================= */
const ui = document.getElementById("uiLayer");
let uiTimer;

function showUI() {

  if (!ui) return;

  ui.classList.add("active");

  clearTimeout(uiTimer);

  uiTimer = setTimeout(() => {
    ui.classList.remove("active");
  }, 2500);
}

document.addEventListener("mousemove", showUI);
document.addEventListener("touchstart", showUI);

/* =========================
   🔊 사운드 (안정 버전)
========================= */
let soundEnabled = false;

document.querySelector(".ui-layer")?.addEventListener("click", (e) => {

  if (soundEnabled) return;

  const iframe = document.getElementById("player");
  if (!iframe) return;

  iframe.src = iframe.src.replace("mute=1", "mute=0");

  soundEnabled = true;

  const guide = document.querySelector(".sound-guide");
  if (guide) guide.style.opacity = 0;

});

/* =========================
   초기 연출
========================= */
window.addEventListener("load", () => {

  document.body.classList.add("page-ready");

  const guide = document.querySelector(".sound-guide");

  if (guide) {
    guide.innerText = "클릭하여 사운드를 활성화하세요";
  }

  setTimeout(showUI, 1200);

  const fade = document.getElementById("fade-layer");

  if (fade) {
    fade.style.opacity = 1;

    setTimeout(() => {
      fade.style.opacity = 0;
    }, 1200);
  }

});

/* =========================
   보호
========================= */
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dblclick", e => e.preventDefault());

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
});

/* =========================
   🔥 모바일 UI 버그 방지 핵심
========================= */
if (isMobile) {
  document.addEventListener("touchstart", () => {

    const iframe = document.getElementById("player");

    if (iframe && iframe.src) {
      iframe.src = iframe.src;
    }

  }, { once: true });
}