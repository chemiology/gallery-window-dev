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

  soundEnabled = false;   // 🔥 이 줄 추가

  const iframe = document.getElementById("player");
  const video = videos[currentIndex];

  /* 🎨 ambient */
const ambient = document.querySelector(".video-ambient");

const themeColor = getComputedStyle(document.body)
  .getPropertyValue("--theme-color")
  .trim();

if (ambient && themeColor) {
  ambient.style.setProperty("--ambient-color", themeColor);
}

  fadeOut();

  setTimeout(() => {

    let src = "";

    /* =========================
       🎬 플랫폼 분기
    ========================= */

    if (video.platform === "vimeo") {

      /* 🔥 Vimeo (전시 최적화) */
      src =
        "https://player.vimeo.com/video/" + video.id +
        "?h=" + video.hash +
        "&autoplay=1" +
        "&muted=1" +
        "&background=1" +
        "&title=0" +
        "&byline=0" +
        "&portrait=0";

    } else {

      /* 🔴 YouTube (기존 유지) */

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

      src =
        "https://www.youtube.com/embed/" + video.id +
        "?controls=1" +
        "&rel=0" +
        "&modestbranding=1" +
        "&iv_load_policy=3" +
        "&fs=0" +
        "&loop=1" +
        "&playlist=" + video.id +
        extraParams;

    }

    /* 🎬 iframe 적용 */
    iframe.src = src;

    /* 🔥 중요: autoplay 허용 */
    iframe.allow = "autoplay; fullscreen; picture-in-picture";

    /* 텍스트 */
    const caption = document.getElementById("video-caption");
    if (caption) caption.innerText = video.caption || "";

    const title = document.getElementById("videoTitle");
    if (title) title.innerText = video.title || "";

    /* 🎬 fade in */
    setTimeout(() => {
      fadeIn();
    }, 900);

  }, 800);

const btn = document.querySelector(".sound-button");

  if (btn) {
  btn.style.display = "block";   // 🔥 영상 바뀌면 버튼 다시 등장
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

/* 마우스 / 터치 / 클릭 모두 대응 */
document.addEventListener("mousemove", showUI);
document.addEventListener("touchstart", showUI);
document.addEventListener("click", showUI);

/* =========================
   🔊 사운드 (버튼 방식)
========================= */

let soundEnabled = false;

function enableSound() {

  if (soundEnabled) return;

  const iframe = document.getElementById("player");
  const video = videos[currentIndex];

  if (video.platform === "youtube") {

    iframe.src = iframe.src.replace("mute=1", "mute=0");

  } else {

    iframe.contentWindow.postMessage(
      JSON.stringify({ method: "setVolume", value: 1 }),
      "*"
    );
  }

  soundEnabled = true;

  const btn = document.querySelector(".sound-button");

  if (btn) {
  btn.style.display = "none";   // 🔥 클릭하면 사라짐
  }

} 

/* 🔥 버튼 클릭 연결 (밖에 있어야 함) */
document.querySelector(".sound-button")?.addEventListener("click", enableSound);


/* =========================
   초기 연출
========================= */

window.addEventListener("load", () => {

  document.body.classList.add("page-ready");

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


/* =========================
   🚫 우클릭 / 선택 / 드래그 방지
========================= */

document.addEventListener("selectstart", (e) => {
  e.preventDefault();
});

document.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "F12") e.preventDefault();
});