/* =====================================================
   Gallery Window – VIDEO JS (STABLE RESET)
   ✔ video.html 성공 코드 기반
   ✔ 다중 영상관 지원
   ✔ youtube 키 구조 유지
   ✔ dev 절대경로 사용
===================================================== */

/* =========================
   URL 파라미터
========================= */

const params = new URLSearchParams(location.search);
const exhibitionId = params.get("id");
const hall = params.get("hall");

/* =========================
   상태
========================= */

let videos = [];
let currentIndex = 0;

/* =========================
   전시 제목
========================= */

fetch("https://chemiology.github.io/gallery-window-dev/assets/config/gallery.json")
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

fetch("https://chemiology.github.io/gallery-window-dev/assets/config/videos.json")
.then(r => r.json())
.then(data => {

  videos = data[exhibitionId] || [];

  console.log("videos:", videos);

  if(!videos.length){
    alert("영상 없음");
    return;
  }

  loadVideo();

});

/* =========================
   영상 로드
========================= */

function loadVideo(){

  if(!videos.length) return;

  const video = videos[currentIndex];

  const container = document.querySelector(".video-container");
  const loading = document.querySelector(".video-loading");

  loading.style.display = "block";

  /* 기존 제거 */
  const oldFrame = document.getElementById("video-frame");
  if(oldFrame) oldFrame.remove();

  /* iframe 생성 */
  const frame = document.createElement("iframe");

  frame.id = "video-frame";
  frame.loading = "lazy";
  frame.allow = "autoplay; fullscreen";

  /* 🔥 핵심: youtube 구조 유지 */
  frame.src =
    "https://www.youtube.com/embed/" +
    video.youtube +
    "?autoplay=1&mute=1";

  container.appendChild(frame);

  /* 로딩 제거 */
  setTimeout(()=>{
    loading.style.display = "none";
    frame.classList.add("show");
  },800);

  /* 캡션 */
  const captionElement = document.getElementById("video-caption");
  if(captionElement){
    captionElement.innerText = video.caption || "";
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
   컨트롤 UI
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

document.getElementById("backToHall").addEventListener("click", () => {

  if(hall){
    location.href =
      "https://chemiology.github.io/gallery-window-dev/hall.html?hall=" + hall;
  }else{
    location.href =
      "https://chemiology.github.io/gallery-window-dev/";
  }

});

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