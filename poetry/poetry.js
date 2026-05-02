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

  audio.onended = () => {
    isPlaying = false;

    if (autoMode) {
      setTimeout(() => {
        nextSlide();
        playAudio();
      }, 2000);
    }
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

function toggleAuto(event) {
  autoMode = !autoMode;

  if (event) {
    event.target.style.background = autoMode ? "#fff" : "rgba(255,255,255,0.1)";
    event.target.style.color = autoMode ? "#000" : "#fff";
  }

  if (autoMode) {
    playAudio();
  }
}

function goBack() {
  history.back();
}

loadData();