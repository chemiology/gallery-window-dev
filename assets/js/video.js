/* video page override */


/* URL 파라미터 */

const params = new URLSearchParams(location.search);
const exhibitionId = params.get("id");

/* 상태 */

let videos = [];
let currentIndex = 0;

/* =========================
   전시 테마 적용
========================= */

fetch("https://chemiology.github.io/gallery-window-dev/assets/config/gallery.json")
.then(r => r.json())
.then(data => {

  const exhibitions =
    data.currentExhibitions || data.exhibitions || [];

  const ex = exhibitions.find(e => e.id === exhibitionId);

  if (!ex) return;

  /* 🔥 CSS 변수 적용 */
  document.body.style.setProperty("--theme-color", ex.themeColor || "#ffffff");
  document.body.setAttribute("data-theme", ex.themeMode || "neutral");

});

/* 영상 목록 */

fetch("https://chemiology.github.io/gallery-window-dev/assets/config/videos.json")
.then(r => r.json())
.then(data => {

videos = data[exhibitionId] || [];

if(!videos.length) return;

loadVideo();

});

/* 영상 로드 */

function loadVideo(){

if(!videos.length) return;

const video = videos[currentIndex];

const container = document.querySelector(".video-container");
const loading = document.querySelector(".video-loading");

loading.style.display = "block";

/* 기존 iframe 서서히 사라짐 */

const oldFrame = document.getElementById("video-frame");
if (oldFrame) {
  oldFrame.style.opacity = 0;
  setTimeout(() => oldFrame.remove(), 800);
}

/* 새 iframe 생성 */

const frame = document.createElement("iframe");

frame.id = "video-frame";
frame.loading = "lazy";
frame.style.opacity = 0;

/* src */
frame.src =
  "https://www.youtube.com/embed/" +
  video.id +
  "?autoplay=1&mute=1&loop=1&playlist=" + video.id +
  "&rel=0&modestbranding=1";

container.appendChild(frame);

/* 🔥 부드러운 페이드 인 */
setTimeout(()=>{
  frame.style.transition = "opacity 1.2s ease";
  frame.style.opacity = 1;
}, 100);

/* 🔥 로딩 제거 */
setTimeout(()=>{
  document.querySelector(".meta")?.classList.add("hide");
}, 4000);

/* 캡션 */

const captionElement = document.getElementById("video-caption");
if(captionElement) captionElement.innerText = video.caption || "";

/* =========================
   자동 전환 (여러 영상일 때)
========================= */

if (videos.length > 1) {

  clearInterval(window.videoTimer);

  window.videoTimer = setInterval(() => {
    nextVideo();
  }, 30000); // 30초

}


}

/* 다음 영상 */

function nextVideo(){

currentIndex++;

if(currentIndex >= videos.length)
currentIndex = 0;

loadVideo();

}

/* 이전 영상 */

function prevVideo(){

currentIndex--;

if(currentIndex < 0)
currentIndex = videos.length - 1;

loadVideo();

}

/* 키보드 이동 */

document.addEventListener("keydown", function(e){

if(e.key === "ArrowRight") nextVideo();
if(e.key === "ArrowLeft") prevVideo();

});

/* 컨트롤 표시 */

const controls = document.querySelector(".controls");

let hideTimer;

function showControls(){

controls.classList.add("show");

clearTimeout(hideTimer);

hideTimer = setTimeout(()=>{
controls.classList.remove("show");
},2000);

}

document.addEventListener("mousemove", showControls);
document.addEventListener("touchstart", showControls);

showControls();

/* 전체 화면 */

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
.addEventListener("dblclick", toggleFullscreen);

document.addEventListener("keydown", function(e){

if(e.key === "f" || e.key === "F")
toggleFullscreen();

});

/* =========================
   Hall 이동 (정상 수정)
========================= */

const backBtn = document.getElementById("backToHall");

if (backBtn) {

  backBtn.addEventListener("click", () => {

    const hall = params.get("hall");

    if (!hall) {
      // hall 정보 없으면 홈으로 (안전 처리)
      window.location.href =
        "https://chemiology.github.io/gallery-window-dev/";
      return;
    }

    window.location.href =
      "https://chemiology.github.io/gallery-window-dev/hall.html?hall=" + hall;

  });

}

/* meta 자동 숨김 */

const meta = document.querySelector(".meta");

let metaTimer;

function showMeta(){

meta.classList.remove("hide");

clearTimeout(metaTimer);

metaTimer = setTimeout(()=>{
meta.classList.add("hide");
},3000);

}

document.addEventListener("mousemove", showMeta);
document.addEventListener("touchstart", showMeta);

showMeta();

/* =========================
   첫 클릭 시 음소거 해제
========================= */

document.addEventListener("click", () => {

  const iframe = document.getElementById("video-frame");
  if (!iframe) return;

  iframe.src = iframe.src.replace("mute=1", "mute=0");

}, { once: true });

/* =========================
   전시 흐름 (UI 사라짐)
========================= */

setTimeout(() => {
  document.querySelector(".meta")?.classList.add("hide");
}, 4000);

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});

/* =========================
   사운드 안내 (전시형 UX)
========================= */

const soundNotice = document.createElement("div");
soundNotice.innerText = "Click to enable sound";
soundNotice.style.position = "fixed";
soundNotice.style.bottom = "40px";
soundNotice.style.left = "50%";
soundNotice.style.transform = "translateX(-50%)";
soundNotice.style.padding = "10px 18px";
soundNotice.style.background = "rgba(0,0,0,0.6)";
soundNotice.style.color = "#ddd";
soundNotice.style.fontSize = "12px";
soundNotice.style.letterSpacing = "1px";
soundNotice.style.borderRadius = "4px";
soundNotice.style.zIndex = "999";

document.body.appendChild(soundNotice);

document.addEventListener("click", () => {

  const iframe = document.getElementById("video-frame");
  if (!iframe) return;

  iframe.src = iframe.src.replace("mute=1", "mute=0");

  soundNotice.remove();

}, { once: true });