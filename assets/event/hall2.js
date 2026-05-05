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

const params = new URLSearchParams(location.search);
const eventId = params.get("id") || "event01";

const BASE = BASE_PATH + `/assets/event/${eventId}`;

/* =========================
   INIT
========================= */

async function init() {

  const res = await fetch(BASE + "/artist-hall.json");
  const data = await res.json();

  document.getElementById("title").innerText = data.title || "";
  document.getElementById("subtitle").innerText = data.subtitle || "";

  const container = document.getElementById("hall2-list");

  data.items.forEach(item => {

    const el = document.createElement("div");
    el.className = "hall2-item";

    el.innerHTML = `
      <img src="${BASE}/thumbs/${item.id}.jpg" />
      <div class="text">
        <h3>${item.title} <span class="year">${item.year || ""}</span></h3>
        <p>${item.desc || ""}</p>
      </div>
    `;

    el.onclick = () => goToExhibition(item);

    container.appendChild(el);

  });

}

/* =========================
   REVEAL
========================= */

function revealItems() {
  const items = document.querySelectorAll(".hall2-item");

  items.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("show");
    }, i * 120);
  });
}

/* =========================
   SCROLL BACKGROUND
========================= */

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const bg = document.querySelector(".site-background");

  if (bg) {
    bg.style.transform = `scale(${1 + y * 0.0002})`;
  }
});

/* =========================
   NAVIGATION
========================= */

function goToExhibition(item) {

  let url = "";

  if (item.type === "photo") {
    url = BASE_PATH + `/exhibition.html?id=${item.id}&from=hall2`;
  }

  if (item.type === "video") {
    url = BASE_PATH + `/video.html?id=${item.id}&from=hall2`;
  }

  if (item.type === "mixed") {
    url = BASE_PATH + `/mixed.html?id=${item.id}&from=hall2`;
  }

  if (!url) {
    alert("이 전시는 아직 준비 중입니다.");
    return;
  }

  location.href = url;
}

/* =========================
   START
========================= */

window.addEventListener("load", () => {

  document.body.classList.add("page-ready");

  init().then(() => {
    revealItems();
  });

});

