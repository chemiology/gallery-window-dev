/* =========================
   BASE PATH (DEV용 핵심)
========================= */

const BASE_PATH = location.pathname.includes('/archive/') 
  || location.pathname.includes('/exhibition_pages/')
  ? '../'
  : '';

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
let autoTimer = null;

/* =========================
   전시 제목
========================= */

fetch(BASE_PATH + "assets/config/gallery.json")
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

fetch(BASE_PATH + "assets/config/videos.json")
.then(r => r.json())
.then(data => {

  videos = data[exhibitionId] || [];

  if(!videos.length){
    console.warn("영상 없음:", exhibitionId);
    return;
  }

  loadVideo();

});

/* =========================
   영상 로드
========================= */

function loadVideo(){

  if(!videos.length) return;

  clearTimeout(autoTimer);

  const video = videos[currentIndex];

  const container = document.querySelector(".video-container");
  const loading = document.querySelector(".video-loading");

  if(!container) return;

  loading.style.display = "block";

  /* 기존 iframe 제거 */

  const oldFrame = document.getElementById("video-frame");
  if(oldFrame) oldFrame.remove();

  /* 새 iframe */

  const frame = document.createElement("iframe");

  frame.id = "video-frame";
  frame.loading = "lazy";
  frame.allow = "autoplay; encrypted-media";
  frame.allowFullscreen = true;

  /* =========================
     플랫폼 분기
  ========================= */

  let src = "";

  if(video.type === "youtube"){

    src =
      "https://www.youtube.com/embed/" +
      video.id +
      "?autoplay=1&mute=1&enablejsapi=1&rel=0&playsinline=1&loop=1&playlist=" + video.id;

  }else if(video.type === "vimeo"){

    src =
      "https://player.vimeo.com/video/" +
      video.id +
      "?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0";

  }else{

    console.warn("지원되지 않는 video type:", video);
    return;

  }

  frame.src = src;

  container.appendChild(frame);

  /* 로딩 제거 */

  setTimeout(()=>{
    loading.style.display = "none";
    frame.classList.add("show");
  }, 800);

  /* =========================
     캡션
  ========================= */

  const captionElement = document.getElementById("video-caption");

  if(captionElement){

    captionElement.style.opacity = 0;

    setTimeout(()=>{
      captionElement.innerText = video.caption || "";
      captionElement.style.opacity = 1;
    }, 200);

  }

  /* =========================
     자동 흐름
  ========================= */

  if(videos.length > 1){

    autoTimer = setTimeout(() => {
      nextVideo();
    }, 30000);

  }

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
    elem.requestFullscreen().catch(err => console.log(err));
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

    window.location.href = BASE_PATH + `hall.html?hall=${hall}`;

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