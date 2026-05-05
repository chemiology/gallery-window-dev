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

/* =========================
   LOAD NOTE (txt 파일)
========================= */

async function loadNote() {

  const noteEl = document.getElementById("hall2-note");
  if (!noteEl) return;

  try {

    const res = await fetch(`${BASE}/thumbs/${eventId}.txt`);
    const text = res.ok ? await res.text() : "";

    noteEl.innerText = text;

  } catch {
    noteEl.innerText = "";
  }

}

  // 🔥 방명록 ID 연결
  const guestbookInput =
    document.querySelector('input[name="exhibition_id"]');

  if (guestbookInput) {
    guestbookInput.value = eventId;
  }

  const container = document.getElementById("hall2-list");

  // 🔥 중복 방지
  container.innerHTML = "";

  data.items.forEach(item => {

    const el = document.createElement("div");
    el.className = "hall2-item";

    el.innerHTML = `
      <img src="${BASE}/thumbs/${item.id}.jpg" />
      <div class="text">
        <h3>${item.title} <span class="year">${item.year || ""}</span></h3>
        <p>${item.desc || ""}</p>
        <button class="enter-btn">전시 보기</button>
      </div>
    `;

    // 전체 클릭
    el.onclick = (e) => {
      e.stopPropagation();
      goToExhibition(item);
    };

    // 버튼 클릭
    el.querySelector(".enter-btn").onclick = (e) => {
      e.stopPropagation();
      goToExhibition(item);
    };

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
   GUESTBOOK
========================= */

async function loadGuestbook() {

  const area = document.getElementById("guestbook-list");
  if (!area) return;

  try {
    const res = await fetch(window.GUESTBOOK_URL + "?mode=list");
    const data = await res.json();

    area.innerHTML = "";

    if (!data || data.length === 0) {
      area.innerHTML = "<p>아직 방명록이 없습니다.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item.message;
      area.appendChild(div);
    });

  } catch {
    area.innerHTML = "<p>불러오기 실패</p>";
  }
}

/* =========================
   NAVIGATION
========================= */

function goToExhibition(item) {

  if (!item || !item.id) return;

  let url = "";

  if (item.type === "photo") {
    url = `${BASE_PATH}/exhibition.html?id=${item.id}&from=hall2`;
  }

  if (item.type === "video") {
    url = `${BASE_PATH}/video.html?id=${item.id}&from=hall2`;
  }

  if (item.type === "mixed") {
    url = `${BASE_PATH}/mixed.html?id=${item.id}&from=hall2`;
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
    loadNote();        // 🔥 추가
    loadGuestbook();
  });

});