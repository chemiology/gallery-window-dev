/* =====================================================
   Gallery Window – Video JS (FINAL MASTER)
   ✔ iframe 방식 (완전 안정)
   ✔ 전시형 페이드
   ✔ 자동 흐름
===================================================== */

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
   URL
========================= */

const params = new URLSearchParams(location.search);
const exhibitionId = params.get("id");

/* 🔥 여기 추가 */
console.log("exhibitionId:", exhibitionId);

/* =========================
   상태
========================= */

let videos = [];
let currentIndex = 0;
let autoTimer = null;
let endFadeTimer = null;

/* =========================
   전시 제목
========================= */

fetch(BASE_PATH + "/assets/config/gallery.json")
.then(r => r.json())
.then(data => {

  const exhibitions =
    data.currentExhibitions || data.exhibitions || [];

  const ex = exhibitions.find(e => e.id === exhibitionId);

  if(ex){
    document.getElementById("videoTitle").innerText = ex.title;
  }

});

/* =========================
   영상 목록
========================= */

fetch("/assets/config/videos.json")
.then(r => r.json())
.then(data => {

  videos = data[exhibitionId] || [];

  /* 🔥 여기 추가 */
  console.log("videos:", videos);

  if(!videos.length){
    console.warn("영상 없음:", exhibitionId);
    return;
  }

  loadVideo();

});

/* =========================
   영상 로드 (핵심)
========================= */

function loadVideo(){

  if(!videos.length) return;

  clearTimeout(autoTimer);
  clearTimeout(endFadeTimer);

  const video = videos[currentIndex];

  const container = document.querySelector(".video-container");
  const loading = document.querySelector(".video-loading");

  if(!container) return;

  /* 🔥 페이드 아웃 */
  container.classList.remove("show");

  setTimeout(() => {

    loading.style.display = "block";

    /* 기존 제거 */
    const oldFrame = document.getElementById("video-frame");
    if(oldFrame) oldFrame.remove();

    /* iframe 생성 */
    const frame = document.createElement("iframe");

    frame.id = "video-frame";
    frame.loading = "lazy";
    frame.allow = "autoplay; fullscreen; encrypted-media";
    frame.allowFullscreen = true;

    /* =========================
       플랫폼 분기
    ========================= */

    if(video.type === "youtube"){

      frame.src =
        "https://www.youtube.com/embed/" +
        video.id +
        "?autoplay=1&mute=1&loop=1&playlist=" + video.id +
        "&rel=0&modestbranding=1&playsinline=1&enablejsapi=1";

    }else if(video.type === "vimeo"){

      frame.src =
        "https://player.vimeo.com/video/" +
        video.id +
        "?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0";

    }

    container.appendChild(frame);

    /* 🔥 페이드 인 */
    setTimeout(()=>{
      loading.style.display = "none";
      container.classList.add("show");
    },600);

    /* =========================
       캡션
    ========================= */

    const captionElement = document.getElementById("video-caption");

    if(captionElement){

      captionElement.style.opacity = 0;

      setTimeout(()=>{
        captionElement.innerText = video.caption || "";
        captionElement.style.opacity = 1;
      },300);

    }

  }, 300);

  /* =========================
     자동 흐름
  ========================= */

  if(videos.length > 1){

    autoTimer = setTimeout(() => {
      nextVideo();
    }, 30000);

  }

  /* =========================
     🔥 전시형 여운 효과
  ========================= */

  endFadeTimer = setTimeout(() => {

    const container = document.querySelector(".video-container");

    container.classList.remove("show");

    setTimeout(() => {
      container.classList.add("show");
    }, 800);

  }, 28000);

}

/* =========================
   다음 / 이전
========================= */

function nextVideo(){
  currentIndex++;
  if(currentIndex >= videos.length)
    currentIndex = 0;
  loadVideo();
}

function prevVideo(){
  currentIndex--;
  if(currentIndex < 0)
    currentIndex = videos.length - 1;
  loadVideo();
}

/* =========================
   키보드
========================= */

document.addEventListener("keydown", function(e){
  if(e.key === "ArrowRight") nextVideo();
  if(e.key === "ArrowLeft") prevVideo();
});

/* =========================
   컨트롤
========================= */

const controls = document.querySelector(".controls");

let hideTimer;

function showControls(){

  if(!controls) return;

  controls.classList.add("show");

  clearTimeout(hideTimer);

  hideTimer = setTimeout(()=>{
    controls.classList.remove("show");
  },2000);

}

document.addEventListener("mousemove", showControls);
document.addEventListener("touchstart", showControls);

showControls();

/* =========================
   전체화면
========================= */

function toggleFullscreen(){

  const elem = document.querySelector(".video-container");

  if(!document.fullscreenElement){
    elem?.requestFullscreen().catch(err => console.log(err));
  }else{
    document.exitFullscreen();
  }

}

document
.querySelector(".video-container")
?.addEventListener("dblclick", toggleFullscreen);

document.addEventListener("keydown", function(e){
  if(e.key === "f" || e.key === "F")
    toggleFullscreen();
});

/* =========================
   Hall 이동
========================= */

const backBtn = document.getElementById("backToHall");

if(backBtn){

  backBtn.addEventListener("click", () => {

    const hall = params.get("hall") || "hall50";

    window.location.href = BASE_PATH + `/hall.html?hall=${hall}`;

  });

}

/* =========================
   meta 자동 숨김
========================= */

const meta = document.querySelector(".meta");

let metaTimer;

function showMeta(){

  if(!meta) return;

  meta.classList.remove("hide");

  clearTimeout(metaTimer);

  metaTimer = setTimeout(()=>{
    meta.classList.add("hide");
  },3000);

}

document.addEventListener("mousemove", showMeta);
document.addEventListener("touchstart", showMeta);

showMeta();