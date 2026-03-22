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
let videoTimer = null;

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

    document.body.setAttribute("data-theme", ex.themeMode || "warm");

    document.body.style.setProperty(
      "--theme-color",
      ex.themeColor || "#ffffff"
    );

  })
  .catch(err => {
    console.warn("gallery.json 로드 실패:", err);
  });

/* =========================
   영상 목록 로드
========================= */

fetch("assets/config/videos.json")
  .then(r => r.json())
  .then(data => {

    videos = data[exhibitionId] || [];

    if (!videos.length) {
      console.warn("영상 없음:", exhibitionId);
      return;
    }

    loadVideo();

  })
  .catch(err => {
    console.warn("videos.json 로드 실패:", err);
  });

/* =========================
   영상 로드
========================= */

function loadVideo() {

  const container = document.querySelector(".video-container");
  const loading = document.querySelector(".video-loading");

  if (!container || !videos.length) return;

  const video = videos[currentIndex];

  if (loading) loading.style.display = "block";

  /* 기존 iframe 제거 */
  const oldFrame = document.getElementById("video-frame");
  if (oldFrame) {
    oldFrame.style.opacity = 0;
    setTimeout(() => oldFrame.remove(), 500);
  }

  /* 새 iframe 생성 */
  const frame = document.createElement("iframe");

  frame.id = "video-frame";
  frame.style.width = "70vw";
  frame.style.height = "39.375vw";
  frame.style.maxHeight = "70vh";
  frame.style.border = "none";
  frame.style.opacity = 0;
  frame.loading = "lazy";

  frame.allow = "autoplay; fullscreen";

  frame.src =
    "https://www.youtube.com/embed/" +
    video.id +
    "?autoplay=1" +
    "&mute=1" +
    "&controls=1" +
    "&disablekb=1" +
    "&rel=0" +
    "&modestbranding=1" +
    "&iv_load_policy=3" +
    "&playsinline=1";

  container.appendChild(frame);

  /* 페이드 인 */
  setTimeout(() => {
    frame.style.transition = "opacity 1s ease";
    frame.style.opacity = 1;
  }, 100);

  /* 텍스트 */
  const caption = document.getElementById("video-caption");
  if (caption) caption.innerText = video.caption || "";

  const title = document.getElementById("videoTitle");
  if (title) title.innerText = video.title || "";

  if (loading) loading.style.display = "none";

  /* 자동 전환 (중복 방지) */
  if (videos.length > 1) {

    if (videoTimer) clearInterval(videoTimer);

    videoTimer = setInterval(() => {
      nextVideo();
    }, 32000);
  }
}

/* =========================
   영상 전환
========================= */

function nextVideo() {

  const fade = document.getElementById("fade-layer");
  if (!fade) return;

  fade.style.opacity = 1;

  setTimeout(() => {

    currentIndex = (currentIndex + 1) % videos.length;
    loadVideo();

    setTimeout(() => {
      fade.style.opacity = 0;
    }, 600);

  }, 800);
}

function prevVideo() {
  currentIndex = (currentIndex - 1 + videos.length) % videos.length;
  loadVideo();
}

/* =========================
   키보드 (전시용 최소 제어)
========================= */

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextVideo();
  if (e.key === "ArrowLeft") prevVideo();
});

/* =========================
   Hall 이동
========================= */

const backBtn = document.getElementById("backToHall");

if (backBtn) {

  backBtn.addEventListener("click", () => {

    const hall = params.get("hall");

    if (!hall) {
      window.location.href = "index.html";
      return;
    }

    window.location.href = `hall.html?hall=${hall}`;

  });

}

/* =========================
   UI 표시 (마우스 반응)
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
   사운드 (첫 클릭 시 활성화)
========================= */

document.addEventListener("click", () => {

  const iframe = document.getElementById("video-frame");
  if (!iframe) return;

  iframe.src = iframe.src.replace("mute=1", "mute=0");

}, { once: true });

/* =========================
   초기 연출 (입장)
========================= */

window.addEventListener("load", () => {

  document.body.classList.add("page-ready");

  setTimeout(() => {
    showUI();
  }, 1200);

  const fade = document.getElementById("fade-layer");

  if (fade) {

    fade.style.opacity = 1;

    setTimeout(() => {

      fade.style.opacity = 0;

      setTimeout(() => {
        fade.remove();
      }, 1500);

    }, 800);
  }

  /* 안내문 */
  setTimeout(() => {

    const guide = document.querySelector(".sound-guide");

    if (guide) {

      guide.classList.add("guide-strong");

      setTimeout(() => {
        guide.classList.remove("guide-strong");
        guide.classList.add("guide-dim");
      }, 4000);
    }

  }, 1500);

});

/* =========================
   보호 (우클릭 / 더블클릭)
========================= */

document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("dblclick", e => e.preventDefault());

const vc = document.querySelector(".video-container");

if (vc) {
  vc.addEventListener("dblclick", e => e.preventDefault());
}