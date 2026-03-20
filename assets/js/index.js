/* =====================================================
   Gallery Window – INDEX JS (MASTER FINAL)
   ✔ BASE_PATH 안정
   ✔ COMING + 카운트다운
   ✔ 자동 오픈 반영
===================================================== */

/* =========================
   BASE PATH
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
   STATUS
========================= */

function getExhibitionStatus(ex) {

  const today = new Date();
  today.setHours(0,0,0,0);

  const start = ex.startDate ? new Date(ex.startDate) : null;
  const end = ex.endDate ? new Date(ex.endDate) : null;

  if (start && today < start) return "coming";
  if (end && today > end) return "past";

  return "current";
}

/* =========================
   COUNTDOWN
========================= */

function getCountdownText(startDate){

  if(!startDate) return "";

  const today = new Date();
  const start = new Date(startDate);

  const diff = Math.ceil((start - today) / (1000*60*60*24));

  if(diff <= 0) return "";

  if(diff === 1) return "D-1";
  if(diff <= 7) return `D-${diff}`;

  return `${diff}일 후`;
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {

  if (!document.body.classList.contains("home")) return;

  loadGallery();
  renderHomepageGuestbook();
  loadHeadlineNotice();

});

/* =========================
   LOAD
========================= */

async function loadGallery() {

  try {

    const response = await fetch(BASE_PATH + "/assets/config/gallery.json", { cache: "no-store" });

    if (!response.ok) throw new Error("Network error");

    const data = await response.json();

    const exhibitions =
      (data.currentExhibitions || [])
        .filter(ex => ex && ex.status !== "hidden")
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    renderExhibitions(exhibitions);

  } catch (error) {

    console.error("Gallery load failed:", error);
    showErrorMessage();

  }

}

/* =========================
   ERROR
========================= */

function showErrorMessage() {

  const container = document.querySelector(".exhibitions");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:60px;color:#aaa;">
      Exhibition data could not be loaded.
    </div>
  `;
}

/* =========================
   RENDER (🔥 핵심)
========================= */

function renderExhibitions(exhibitions) {

  const container = document.querySelector(".exhibitions");
  if (!container) return;

  container.innerHTML = "";

  const visible = exhibitions.filter(ex =>
    getExhibitionStatus(ex) !== "past"
  );

  visible.forEach((exhibition, index) => {

    const block = document.createElement("div");
    block.className = "exhibition";

    /* 🔥 시작일 저장 (여기 위치 중요) */
    block.dataset.start = exhibition.startDate;

    const status = getExhibitionStatus(exhibition);

    if (status === "coming") {
      block.classList.add("coming");
    }

    /* ===== 전시관 이름 ===== */

    const hall = document.createElement("div");
    hall.className = "hall-label";
    hall.textContent =
      exhibition.hallTitle || `${index + 1}관`;

    const body = document.createElement("div");
    body.className = "exhibition-body";

    const posterWrap = document.createElement("div");

    const img = document.createElement("img");

    img.src = BASE_PATH + `/assets/exhibitions/${exhibition.id}/poster.jpg`;
    img.alt = exhibition.title;
    img.loading = "lazy";

    img.onerror = () => {
      img.src = BASE_PATH + "/assets/images/poster-placeholder.jpg";
    };

    img.onclick = () => {

      const isVideoHall = exhibition.hall.startsWith("hall5");
      const hasImages = exhibition.images && exhibition.images.length;

      if (!isVideoHall && !hasImages) {
        alert("이 전시는 아직 준비 중입니다.");
        return;
      }

      location.href = BASE_PATH + `/hall.html?hall=${exhibition.hall}`;
    };

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<h3>${exhibition.title}</h3><p>${exhibition.artist}</p>`;

    posterWrap.appendChild(img);
    posterWrap.appendChild(meta);

    /* ===== COMING + COUNTDOWN ===== */

    if (status === "coming") {

      const badge = document.createElement("div");
      badge.className = "coming-badge";

      const countdown = getCountdownText(exhibition.startDate);

      badge.innerHTML = `
        <div>COMING</div>
        <div style="font-size:14px;margin-top:4px;opacity:.8;">
          ${countdown}
        </div>
      `;

      posterWrap.appendChild(badge);
    }

    body.appendChild(posterWrap);
    block.appendChild(hall);
    block.appendChild(body);
    container.appendChild(block);
  });

  /* =========================
     🔥 자동 오픈 처리 (핵심)
  ========================= */

  setInterval(() => {

    const now = new Date();

    document.querySelectorAll(".exhibition").forEach(block => {

      const startDate = block.dataset.start;
      if (!startDate) return;

      const start = new Date(startDate);

      if (now >= start && block.classList.contains("coming")) {

        block.classList.remove("coming");

        /* 🔥 여기가 new-open 위치 */
        block.classList.add("new-open");

        const badge = block.querySelector(".coming-badge");
        if (badge) badge.remove();
      }

    });

  }, 60000);

}

/* =========================
   GUESTBOOK
========================= */

async function renderHomepageGuestbook() {

  const area = document.getElementById("guestbook-area");
  if (!area) return;

  area.innerHTML = "";
  const ul = document.createElement("ul");
  area.appendChild(ul);

  try {

    const res = await fetch(window.GUESTBOOK_URL + "?mode=list");
    const data = await res.json();

    if (!data || data.length === 0) {
      ul.innerHTML = "<li>아직 방명록이 없습니다.</li>";
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.message;
      ul.appendChild(li);
    });

  } catch {

    ul.innerHTML = "<li>방명록을 불러올 수 없습니다.</li>";

  }

}

/* =========================
   NOTICE
========================= */

async function loadHeadlineNotice() {

  const container = document.getElementById("headline-notice");
  if (!container) return;

  try {

    const response = await fetch(BASE_PATH + "/assets/notice/headlineNotice.html");

    if (!response.ok) return;

    const html = await response.text();
    container.innerHTML = html;

  } catch (error) {

    console.error("Headline notice load failed:", error);

  }

}

/* =========================
   READY
========================= */

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});