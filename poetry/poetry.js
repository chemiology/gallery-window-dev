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

const params = new URLSearchParams(window.location.search);
const exhibitionId = params.get("id");

const basePath = BASE_PATH + `/assets/poetry/${exhibitionId}/`;

let data = [];
let index = 0;
let autoMode = false;
let autoTimer = null;
let isPlaying = false;

const delays = [0.5, 1.5, 3];

async function loadData() {
  const res = await fetch(basePath + 'poetry.json');
  data = await res.json();
  showSlide();
}

function showSlide() {
  const item = data[index];

  document.getElementById("image").src = basePath + item.image;
  document.getElementById("title").innerText = item.title;

  // 텍스트 애니메이션
  const textEl = document.getElementById("text");
  textEl.innerHTML = "";

  item.text.forEach((line, i) => {
    const span = document.createElement("span");
    span.style.animationDelay = `${delays[i] || (i * 1.5)}s`;
    span.innerText = line;
    textEl.appendChild(span);
  });

  const audio = document.getElementById("audio");
  audio.src = basePath + item.audio;

  // 음성 끝나면 자동 다음 (2초 대기)
  audio.onended = () => {
    isPlaying = false;

    setTimeout(() => {
      if (autoMode) nextSlide();
    }, 2000);
  };
}

function nextSlide() {
  index = (index + 1) % data.length;
  stopAudio();
  showSlide();
}

function prevSlide() {
  index = (index - 1 + data.length) % data.length;
  stopAudio();
  showSlide();
}

function playAudio() {
  const audio = document.getElementById("audio");

  if (!isPlaying) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
  }
}

function stopAudio() {
  const audio = document.getElementById("audio");
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;
}

// 자동 넘김
function toggleAuto() {
  autoMode = !autoMode;

  if (autoMode) {
    autoTimer = setInterval(() => {
      nextSlide();
    }, 8000);
  } else {
    clearInterval(autoTimer);
  }
}

loadData();