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

const volumeParam = params.get("volume");
let bgmVolume = volumeParam ? parseFloat(volumeParam) : 0.2;

const basePath = BASE_PATH + `/assets/poetry/${exhibitionId}/`;

let data = [];
let index = 0;
let autoMode = false;
let isPlaying = false;
let bgmAudio = null;
let bgmStarted = false;
let bgmFadeInterval = null;

const delays = [0.5, 1.5, 3];

async function loadData() {
  const res = await fetch(basePath + 'poetry.json');
  data = await res.json();
  showSlide();
}

const music = params.get("music");

const themeMode = params.get("theme");
if (themeMode) {
  document.body.classList.add("theme-" + themeMode);
}

if (music) {
  bgmAudio = new Audio(BASE_PATH + `/assets/audio/${music}.mp3`);
  bgmAudio.loop = true;
  bgmAudio.volume = 0;
}

function showSlide() {

  const existing = document.querySelector(".ending");
  if (existing) existing.remove();

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

    fadeBGM(bgmVolume);

    if (index === data.length - 1) {
      autoMode = false;

      setTimeout(() => {
        showEndingMessage();
      }, 3000);

      return;
    }

    if (autoMode) {
      setTimeout(() => {
        nextSlide();
        playAudio();
      }, 5000);
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

  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;

  if (bgmAudio && !bgmStarted) {
    bgmStarted = true;
    bgmAudio.play().catch(() => {});
    bgmAudio.volume = bgmVolume;
  }

  if (bgmAudio) {
    fadeBGM(bgmVolume * 0.12);
  }

  audio.play();
  isPlaying = true;
}

function stopAudio() {
  const audio = document.getElementById("audio");
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;

  if (bgmAudio) {
    fadeBGM(bgmVolume);
  }
}

function fadeBGM(target) {
  if (!bgmAudio) return;

  if (bgmFadeInterval) {
    clearInterval(bgmFadeInterval);
  }

  let v = bgmAudio.volume;
  const step = (target - v) / 10;

  bgmFadeInterval = setInterval(() => {
    v += step;
    bgmAudio.volume = v;

    if ((step > 0 && v >= target) || (step < 0 && v <= target)) {
      bgmAudio.volume = target;
      clearInterval(bgmFadeInterval);
      bgmFadeInterval = null;
    }
  }, 50);
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

function showEndingMessage() {
  const existing = document.querySelector(".ending");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = "ending";

  el.innerHTML = `
    <div>
      <p>감상해 주셔서 감사합니다</p>
      <p style="opacity:.7;margin-top:10px;">
        다시 천천히 돌아보셔도 좋습니다
      </p>
    </div>
  `;

  document.body.appendChild(el);
}

loadData();

window.addEventListener("load", () => {
  const guide = document.getElementById("audioGuide");

  setTimeout(() => {
    guide.style.display = "none";
  }, 5000);
});

document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());

document.addEventListener("keydown", e => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && e.key === "I") ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});