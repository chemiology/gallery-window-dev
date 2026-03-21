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
let videoTimer;

/* =========================
   전시 테마 적용
========================= */

fetch("assets/config/gallery.json")
  .then(r => r.json())
  .then(data => {

    const exhibitions =
      data.currentExhibitions || data.exhibitions || [];

    const ex = exhibitions.find(e => e.id === exhibitionId);

    if (!ex) return;

    document.body.style.setProperty("--theme-color", ex.themeColor || "#ffffff");
    document.body.setAttribute("data-theme", ex.themeMode || "neutral");

  });

/* =========================
   영상 목록 로드
========================= */

fetch("assets/config/videos.json")
  .then(r => r.json())
  .then(data => {

    videos = data[exhibitionId] || [];

    if (!videos.length) return;

    loadVideo();

  });

/* =========================
   영상 로드
========================= */

function loadVideo() {

  if (!videos.length) return;

  const video = videos[currentIndex];

  const container = document.querySelector(".video-container");
  const loading = document.querySelector(".video-loading");

  if (!container) return;

  if (loading) loading.style.display = "block";

  /* 기존 iframe 제거 (페이드 아웃) */
  const oldFrame = document.getElementById("video-frame");
  if (oldFrame) {
    oldFrame.style.opacity = 0;
    setTimeout(() => oldFrame.remove(), 800);
  }

  /* 새 iframe 생성 */
  const frame = document.createElement("iframe");

  frame.id = "video-frame";
  frame.loading = "lazy";
  frame.allow = "autoplay; fullscreen";
  frame.style.opacity = 0;

  frame.src =
    "https://www.youtube.com/embed/" +
    video.id +
    "?autoplay=1" +
    "&mute=1" +
    "&controls=1" +
    "&loop=1" +
    "&playlist=" + video.id +
    "&rel=0" +
    "&modestbranding=1" +
    "&iv_load_policy=3";

  container.appendChild(frame);

  /* 페이드 인 */
  setTimeout(() => {
    frame.style.transition = "opacity 1.2s ease";
    frame.style.opacity = 1;
  }, 100);

  /* 캡션 */
  const caption = document.getElementById("video-caption");
  if (caption) caption.innerText = video.caption || "";

  const title = document.getElementById("videoTitle");
  if (title) title.innerText = video.title || "";

  /* 자동 전환 */
  if (videos.length > 1) {

    clearInterval(videoTimer);

    videoTimer = setInterval(() => {
      nextVideo();
    }, 30000);

  }

}

/* =========================
   영상 이동
========================= */

function nextVideo() {
  currentIndex = (currentIndex + 1) % videos.length;
  loadVideo();
}

function prevVideo() {
  currentIndex = (currentIndex - 1 + videos.length) % videos.length;
  loadVideo();
}

/* =========================
   키보드 제어
========================= */

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextVideo();
  if (e.key === "ArrowLeft") prevVideo();
});

/* =========================
   전체 화면
========================= */

function toggleFullscreen() {

  const elem = document.querySelector(".video-container");
  if (!elem) return;

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }

}

document.querySelector(".video-container")?.addEventListener("dblclick", toggleFullscreen);

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "f") toggleFullscreen();
});

/* =========================
   Hall 이동
========================= */

const backBtn = document.getElementById("backToHall");

if (backBtn) {

  backBtn.addEventListener("click", () => {

    const hall = params.get("hall");

    const BASE_PATH = location.pathname.includes('/archive/') 
      || location.pathname.includes('/exhibition_pages/')
      ? '../'
      : '';

    if (!hall) {
      window.location.href = BASE_PATH + "index.html";
      return;
    }

    window.location.href =
      BASE_PATH + `hall.html?hall=${hall}`;

  });

}

/* =========================
   UI (마우스 기반 표시)
========================= */

const ui = document.getElementById("uiLayer");

let uiTimer;

function showUI() {

  if (!ui) return;

  ui.classList.add("active");

  clearTimeout(uiTimer);

  uiTimer = setTimeout(() => {
    ui.classList.remove("active");
  }, 2000);

}

document.addEventListener("mousemove", showUI);
document.addEventListener("touchstart", showUI);

/* =========================
   사운드 (첫 클릭 시 해제)
========================= */

document.addEventListener("click", () => {

  const iframe = document.getElementById("video-frame");
  if (!iframe) return;

  iframe.src = iframe.src.replace("mute=1", "mute=0");

}, { once: true });

/* =========================
   초기 연출 (암전 → 등장)
========================= */

window.addEventListener("load", () => {

  document.body.classList.add("page-ready");

  showUI();

  const fade = document.getElementById("fade-layer");

  if (!fade) return;

  setTimeout(() => {

    fade.style.opacity = 0;

    setTimeout(() => {
      fade.remove();
    }, 1600);

  }, 1000);

});