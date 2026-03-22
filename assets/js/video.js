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

    // ⭐ 테마 적용 (순서 중요)
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
  frame.style.width = "70vw";
  frame.style.height = "39.375vw"; // 16:9 비율
  frame.style.maxHeight = "70vh";
  frame.style.border = "none";     // ⭐ 추가
  frame.loading = "lazy";
  frame.allow = "autoplay; fullscreen";
  frame.style.opacity = 0;

  frame.src =
    "https://www.youtube.com/embed/" +
    video.id +
    "?autoplay=1" +
    "&mute=1" +
    "&controls=1" +
    "&disablekb=1" +   // ⭐ 키보드 조작 제한
    "&loop=1" +
    "&playlist=" + video.id +
    "&rel=0" +
    "&modestbranding=1" +
    "&iv_load_policy=3" +
    "&showinfo=0";   // ⭐ 추가

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
   }, 32000);  // ⭐ 32초 (적당)

    // ⭐ 전환 예고 (여기에 넣는다)
    setInterval(() => {
      const fade = document.getElementById("fade-layer");
      if (fade) fade.style.opacity = 0.25;
    }, 28000);

  }

}

/* =========================
   영상 이동
========================= */

function nextVideo() {

  const fade = document.getElementById("fade-layer");
  if (!fade) return;

  // 1️⃣ 어두워짐
  fade.style.opacity = 1;

  setTimeout(() => {

    // 2️⃣ 영상 변경
    currentIndex = (currentIndex + 1) % videos.length;
    loadVideo();

    // 3️⃣ 다시 밝아짐
     setTimeout(() => {
      fade.style.opacity = 0;
    }, 600);

  }, 1200);

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
   Hall 이동
========================= */

const backBtn = document.getElementById("backToHall");

if (backBtn) {

  backBtn.addEventListener("click", () => {

    const hall = params.get("hall");

    if (!hall) {
      alert("hall 정보 없음"); // 🔥 디버그용
      window.location.href = "index.html";
      return;
    }

    window.location.href = `hall.html?hall=${hall}`;

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

  // 처음에는 완전히 어둡게 시작
  fade.style.opacity = 1;

  setTimeout(() => {

  // 천천히 밝아짐
  fade.style.opacity = 0;

  setTimeout(() => {
    fade.remove();
  }, 2000);

}, 1200);

});


/* =========================
   우클릭 방지
========================= */

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});