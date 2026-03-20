/* =====================================================
   Gallery Window – Video JS (MASTER FINAL)
   ✔ BASE_PATH 완전 대응
   ✔ YouTube API
   ✔ 추천영상 차단
   ✔ 전시형 UI
===================================================== */

/* =========================
   BASE PATH (🔥 핵심)
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
let player = null;
let ytReady = false;

/* =========================
   YouTube API 로드
========================= */

function loadYouTubeAPI(){
  return new Promise(resolve => {

    if(window.YT && YT.Player){
      ytReady = true;
      return resolve();
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    window.onYouTubeIframeAPIReady = function(){
      ytReady = true;
      resolve();
    };

    document.head.appendChild(tag);
  });
}

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

fetch(BASE_PATH + "/assets/config/videos.json")
.then(r => r.json())
.then(async data => {

  videos = data[exhibitionId] || [];

  if(!videos.length){
    console.warn("영상 없음:", exhibitionId);
    return;
  }

  await loadYouTubeAPI();

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

  container.classList.remove("show");

  setTimeout(() => {

    loading.style.display = "block";

    if(player){
      player.destroy();
      player = null;
    }

    const oldFrame = document.getElementById("video-frame");
    if(oldFrame) oldFrame.remove();

    /* =========================
       YouTube
    ========================= */

    if(video.type === "youtube"){

      const div = document.createElement("div");
      div.id = "video-frame";
      container.appendChild(div);

      player = new YT.Player("video-frame", {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            loading.style.display = "none";
            container.classList.add("show");
          },

          onStateChange: (event) => {

            if(event.data === YT.PlayerState.ENDED){

              if(videos.length > 1){
                nextVideo();
              }else{
                setTimeout(()=>{
                  player.seekTo(0);
                  player.playVideo();
                },150);
              }

            }

          }
        }
      });

    }

    /* =========================
       Vimeo
    ========================= */

    else if(video.type === "vimeo"){

      const frame = document.createElement("iframe");

      frame.id = "video-frame";
      frame.src =
        "https://player.vimeo.com/video/" +
        video.id +
        "?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0&controls=0";

      frame.allow = "autoplay; fullscreen";
      frame.allowFullscreen = true;

      container.appendChild(frame);

      setTimeout(()=>{
        loading.style.display = "none";
        container.classList.add("show");
      },500);

    }

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