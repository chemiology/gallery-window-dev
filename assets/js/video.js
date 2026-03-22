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

  if (!videos.length) return;

  const iframe = document.getElementById("player");
  const loading = document.querySelector(".video-loading");
  const frame = document.querySelector(".video-frame");

  const video = videos[currentIndex];

  fadeOut();

  setTimeout(() => {

    iframe.src =
      "https://www.youtube.com/embed/" +
      video.id +
      "?autoplay=1" +
      "&mute=1" +
      "&controls=1" +
      "&rel=0" +
      "&modestbranding=1" +
      "&playsinline=1" +
      "&fs=0";

    /* 텍스트 */
    const caption = document.getElementById("video-caption");
    if (caption) caption.innerText = video.caption || "";

    const title = document.getElementById("videoTitle");
    if (title) title.innerText = video.title || "";

    if (loading) loading.style.display = "none";

    /* 🔥 여기 넣는 것이 정답 */
    if (frame) {
      frame.classList.remove("active");

      setTimeout(() => {
        frame.classList.add("active");
      }, 100);
    }

    fadeIn();

  }, 400);

  /* 타이머 */
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

  if (videos.length <= 1) return;

  currentIndex = (currentIndex + 1) % videos.length;

  loadVideo();
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
  }, 2500);
}

document.addEventListener("mousemove", showUI);
document.addEventListener("touchstart", showUI);

/* =========================
   사운드 (첫 클릭 시 활성화)
========================= */

let soundEnabled = false;

document.addEventListener("click", (e) => {

  if (soundEnabled) return;

  /* 버튼 클릭은 제외 */
  if (e.target.closest(".controls") || e.target.closest("#backToHall")) {
    return;
  }

  const iframe = document.getElementById("player");
  if (!iframe) return;

  iframe.src = iframe.src.replace("mute=1", "mute=0");

  soundEnabled = true;

  const guide = document.querySelector(".sound-guide");

  if (guide) {
    guide.style.opacity = 0;
  }

});

/* =========================
   초기 연출 (입장)
========================= */

window.addEventListener("load", () => {

  document.body.classList.add("page-ready");

  const guide = document.querySelector(".sound-guide");

  if (guide) {
    guide.innerText = "클릭하여 사운드를 활성화하세요";
  }

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

  /* 안내문 애니메이션 */
  setTimeout(() => {

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

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
});