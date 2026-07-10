console.log("hall.js version check");

/* =====================================================
   Gallery Window – HALL JS (FINAL STABLE) 
   ✔ BASE_PATH 완전 대응
   ✔ dev / 운영 모두 안정
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
   EXHIBITION STATUS
========================= */

function parseLocalDate(dateStr){

    if(!dateStr) return null;

    const [y,m,d] =
        dateStr.split("-").map(Number);

    return new Date(y,m-1,d);

}

function getExhibitionStatus(ex) {

  const today = new Date();
  today.setHours(0,0,0,0);

  const start = ex.startDate ? parseLocalDate(ex.startDate) : null;
  const end = ex.endDate ? parseLocalDate(ex.endDate) : null;

  if (start && today < start) return "coming";
  if (end && today > end) return "past";

  return "current";
}

/* =========================
   NEW BADGE (20일)
========================= */

function isNewExhibition(ex){

  if(!ex.startDate) return false;

  const today = new Date();
  today.setHours(0,0,0,0);

  const start = parseLocalDate(ex.startDate);
  start.setHours(0,0,0,0);

  const diff =
    (today - start) / (1000*60*60*24);

  return diff >= 0 && diff <= 20;

}

/* ======================================
   LOAD HALL
====================================== */

async function loadHall() {

  const params = new URLSearchParams(location.search);
  const hallId = params.get("hall") || "hall01";

  try {

    const res = await fetch(BASE_PATH + "/assets/config/gallery.json");
    const data = await res.json();

    const exhibitions =
      data.currentExhibitions || data.exhibitions || [];

    let exhibition = exhibitions.find(ex =>
      ex.hall === hallId &&
      getExhibitionStatus(ex) !== "past"
    );

    if (!exhibition) {
      console.error("hall 매칭 실패:", hallId);
      return;
    }

    /* ---------- Hall Title ---------- */

    const hallTitle = document.getElementById("hallTitle");

    if (hallTitle) {
      hallTitle.textContent =
        exhibition?.hallTitle ||
        `${hallId.replace("hall","")}관`;
    }

    /* ---------- Empty Hall ---------- */

    if (!exhibition) {

      const entry = document.querySelector(".hall-entry");

      if (entry) {
        entry.innerHTML = `
          <div class="hall-empty">
            <p>이 전시장은 현재 준비 중입니다.</p>
            <p style="opacity:.6;margin-top:8px;">
              곧 새로운 전시가 시작됩니다.
            </p>
          </div>
        `;
      }

      console.warn("Empty hall:", hallId);
      return;
    }

    /* ---------- themeColor ---------- */

    if (exhibition.themeColor) {
      document.body.style.setProperty(
        "--theme-color",
        exhibition.themeColor
      );
    }

    /* ---------- themeMode ---------- */

    if (exhibition.themeMode) {
      document.body.classList.add(
        "theme-" + exhibition.themeMode
      );
    }

    loadHallEntry(exhibition, hallId);

  } catch (err) {

    console.error("Hall load failed:", err);

  }

}

/* ======================================
   LOAD HALL ENTRY
====================================== */

async function loadHallEntry(exhibition, hallId) {

  const basePath =
    exhibition.type === "event"
      ? BASE_PATH + `/assets/event/`
      : BASE_PATH + `/assets/exhibitions/${exhibition.id}/`;

  /* ---------- COMING 상태 ---------- */

  if (getExhibitionStatus(exhibition) === "coming") {

    const entry = document.querySelector(".hall-entry");

    if (entry) {
      entry.innerHTML = `
        <div class="hall-empty">
          <p>이 전시는 곧 시작됩니다.</p>
          <p style="opacity:.6;margin-top:8px;">
            조금만 기다려 주세요.
          </p>
        </div>
      `;
    }

    return;
  }

  /* ---------- 방명록 ID ---------- */

  const guestbookInput =
    document.querySelector('input[name="exhibition_id"]');

  if (guestbookInput) {
    guestbookInput.value = exhibition.id;
  }

  /* ---------- 포스터 ---------- */

  const poster = document.getElementById("hallPoster");

  const posterContainer =
    poster?.parentElement;

  if (poster) {

    poster.src =
      exhibition.type === "event"
        ? BASE_PATH + `/assets/event/${exhibition.id}/thumbs/${exhibition.id}.jpg`
        : basePath + "poster.jpg";

    poster.onload = () => {

      if(!posterContainer) return;

      posterContainer
        .querySelector(".new-badge")
        ?.remove();

      if(!isNewExhibition(exhibition))
        return;

      const badge =
        document.createElement("div");

      badge.className = "new-badge";
      badge.textContent = "NEW";
      posterContainer.appendChild(badge);

    };

    poster.onerror = () => {
      poster.src = BASE_PATH + "/assets/images/poster-placeholder.jpg";
    };

    poster.onclick = () => {

      if (exhibition.type === "event") {
        window.location.href =
          BASE_PATH + `/assets/event/hall2.html?id=${exhibition.id}`;
        return;
      }

      const target =
        exhibition.type === "poetry"
          ? BASE_PATH + `/poetry/poetry.html?id=${exhibition.id}`
          : exhibition.type === "mixed"
            ? BASE_PATH + `/mixed.html?id=${exhibition.id}&hall=${hallId}`
            : exhibition.type === "video"
              ? `video.html?id=${exhibition.id}&hall=${hallId}`
              : BASE_PATH + `/exhibition.html?id=${exhibition.id}&hall=${hallId}`;

     const fade = document.getElementById("pageFade");

     if (fade) {
       fade.style.opacity = 1;
     }

     setTimeout(() => {
       window.location.href = target;
     }, 500);

    };

  }

  /* ---------- 작품보기 버튼 ---------- */

  const enterBtn = document.getElementById("enterExhibition");

  if (enterBtn) {

    const target =
      exhibition.type === "poetry"
        ? BASE_PATH + `/poetry/poetry.html?id=${exhibition.id}&music=${exhibition.music}&theme=${exhibition.themeMode}&volume=${exhibition.volume}`
          : exhibition.type === "event"
            ? BASE_PATH + `/assets/event/hall2.html?id=${exhibition.id}`
            : exhibition.type === "mixed"
              ? BASE_PATH + `/mixed.html?id=${exhibition.id}&hall=${hallId}`
              : exhibition.type === "video"
                ? `video.html?id=${exhibition.id}&hall=${hallId}`
                : BASE_PATH + `/exhibition.html?id=${exhibition.id}&hall=${hallId}`;

    enterBtn.href = target;

    enterBtn.onclick = (e) => {

      e.preventDefault();

      if (typeof gtag !== "undefined") {
        gtag('event', 'enter_exhibition', {
          exhibition_id: exhibition.id,
          hall: hallId
        });
      }

      document.body.classList.add("transitioning");

      const fade = document.getElementById("pageFade");
      fade?.classList.add("active");

      setTimeout(() => {
        window.location.href = target;
      }, 280);

    };

  }

  /* ---------- 작가노트 ---------- */

  try {

    const res = await fetch(basePath + "note.txt");

    const noteText = res.ok ? await res.text() : "";

    document.getElementById("artistNote").innerText = noteText;

  } catch {

    document.getElementById("artistNote").innerText = "";

  }

  /* ---------- 작가 프로필 ---------- */

  try {

    const res = await fetch(basePath + "profile.txt");

    const text = res.ok ? await res.text() : "";

    if (!text) {
      document.getElementById("artistProfile").innerHTML = "";
      return;
    }

    const lines = text.split("\n");

    let html = "";
    let inList = false;

    lines.forEach(line => {

      line = line.trim();
      if (!line) return;

      if (line.startsWith("[") && line.endsWith("]")) {

        if (inList) {
          html += "</div>";
          inList = false;
        }

        html += `<div class="profile-subtitle">${line}</div>`;
        html += `<div class="exhibition-text info">`;
        inList = true;

      } else {

        html += `<span>${line}</span>`;

      }

    });

    if (inList) html += "</div>";

    document.getElementById("artistProfile").innerHTML = html;

  } catch {

    document.getElementById("artistProfile").innerHTML = "";

  }

}

/* ======================================
   INIT
====================================== */

window.addEventListener("load", () => {

  loadHall();

  setTimeout(() => {
    document.querySelector(".hall-entry")
      ?.classList.add("show");
  }, 200);

  document.body.classList.add("page-ready");

  const fade = document.getElementById("pageFade");
  fade?.classList.remove("active");

  document.body.classList.remove("transitioning");

});