/* =====================================================
   VIDEO JS – 완전 복구 안정 버전
===================================================== */

/* URL */
const params = new URLSearchParams(location.search);
const exhibitionId = params.get("id");
const hall = params.get("hall");

/* 상태 */
let videos = [];
let currentIndex = 0;

/* 제목 */
fetch("/assets/config/gallery.json")
.then(r => r.json())
.then(data => {

  const list = data.currentExhibitions || data.exhibitions || [];

  const ex = list.find(e => e.id === exhibitionId);

  if(ex){
    document.getElementById("videoTitle").innerText = ex.title;
  }

});

/* 영상 목록 */
fetch("/assets/config/videos.json")
.then(r => r.json())
.then(data => {

  videos = data[exhibitionId] || [];

  console.log("🔥 videos:", videos);

  if(!videos.length){
    alert("영상 데이터 없음");
    return;
  }

  loadVideo();

});

/* 영상 로드 */
function loadVideo(){

  const video = videos[currentIndex];

  const container = document.querySelector(".video-container");
  const loading = document.querySelector(".video-loading");

  loading.style.display = "block";

  /* 기존 제거 */
  const old = document.getElementById("video-frame");
  if(old) old.remove();

  /* iframe */
  const frame = document.createElement("iframe");

  frame.id = "video-frame";
  frame.style.width = "100%";
  frame.style.height = "100%";
  frame.style.border = "none";

  frame.allow = "autoplay; fullscreen";

  /* 🔥 가장 단순 & 확실한 방식 */
  frame.src =
    "https://www.youtube.com/embed/" +
    video.id +
    "?autoplay=1&mute=1";

  container.appendChild(frame);

  setTimeout(()=>{
    loading.style.display = "none";
  },800);

  /* caption */
  const caption = document.getElementById("video-caption");
  if(caption){
    caption.innerText = video.caption || "";
  }

}

/* 다음 */
function nextVideo(){
  currentIndex = (currentIndex + 1) % videos.length;
  loadVideo();
}

/* 이전 */
function prevVideo(){
  currentIndex = (currentIndex - 1 + videos.length) % videos.length;
  loadVideo();
}

/* 키보드 */
document.addEventListener("keydown", e=>{
  if(e.key === "ArrowRight") nextVideo();
  if(e.key === "ArrowLeft") prevVideo();
});

/* 🔥 back 버튼 (완전 수정) */
const backBtn = document.getElementById("backToHall");

if(backBtn){

  backBtn.addEventListener("click", () => {

    if(hall){
      location.href = BASE_PATH + `/hall.html?hall=${hall}`;
    }else{
      location.href = BASE_PATH + "/";
    }

  });

}