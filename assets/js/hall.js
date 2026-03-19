alert("🔥 hall.js 연결됨");

/* =========================
   BASE PATH
========================= */

const BASE_PATH = location.pathname.includes('/archive/')
  || location.pathname.includes('/exhibition_pages/')
  ? '../'
  : '';


/* ======================================
   Hall Loader – Stable Clean Version
====================================== */

function getExhibitionStatus(ex) {

  const today = new Date();
  today.setHours(0,0,0,0);

  const start = ex.startDate ? new Date(ex.startDate) : null;
  const end = ex.endDate ? new Date(ex.endDate) : null;

  if (start && today < start) return "coming";
  if (end && today > end) return "past";

  return "current";
}


/* ======================================
   Load Hall
====================================== */

async function loadHall() {

  const params = new URLSearchParams(location.search);
  const hallId = params.get("hall") || "hall01";

  try {

    const res = await fetch(BASE_PATH + "assets/config/gallery.json");
    const data = await res.json();

    const exhibitions =
      data.currentExhibitions || data.exhibitions || [];

let exhibition = exhibitions.find(ex =>
  ex.hall === hallId &&
  getExhibitionStatus(ex) !== "past"
);

/* 🔥 먼저 fallback */
if (!exhibition) {
  console.warn("조건 매칭 실패 → fallback 사용");
  exhibition = exhibitions[0];
}

/* 🔥 그 다음 Hall Title */
const hallTitle = document.getElementById("hallTitle");

if (hallTitle) {
  hallTitle.textContent =
    exhibition?.hallTitle ||
    `${hallId.replace("hall","")}관`;
}

/* 🔥 그 다음 themeColor */
if (exhibition?.themeColor) {
  document.body.style.setProperty(
    "--theme-color",
    exhibition.themeColor
  );
  console.log("🎨 themeColor 적용됨:", exhibition.themeColor);
}

    /* 🔥 핵심 */
    loadHallEntry(exhibition, hallId);

  } catch (err) {
    console.error("Hall load failed:", err);
  }
}

/* ======================================
   Load Hall Entry
====================================== */

async function loadHallEntry(exhibition, hallId) {

  const basePath =
    BASE_PATH + `assets/exhibitions/${exhibition.id}/`;


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


  /* ---------- 방명록 ID 전달 ---------- */

  const guestbookInput =
    document.querySelector('input[name="exhibition_id"]');

  if (guestbookInput) {
    guestbookInput.value = exhibition.id;
  }


  /* ---------- 포스터 ---------- */

  const poster = document.getElementById("hallPoster");

  if (poster) {

    poster.src = basePath + "poster.jpg";

    poster.onclick = () => {

      const target =
        hallId.startsWith("hall5")
          ? BASE_PATH + `video.html?id=${exhibition.id}`
          : BASE_PATH + `exhibition.html?id=${exhibition.id}&hall=${hallId}`;

      window.location.href = target;

    };

  }


  /* ---------- 작품보기 버튼 ---------- */

  const enterBtn = document.getElementById("enterExhibition");

  if (enterBtn) {

    const target =
      hallId.startsWith("hall5")
        ? BASE_PATH + `video.html?id=${exhibition.id}`
        : BASE_PATH + `exhibition.html?id=${exhibition.id}&hall=${hallId}`;

    enterBtn.href = target;

    enterBtn.onclick = (e) => {

      e.preventDefault();

      gtag('event', 'enter_exhibition', {
        exhibition_id: exhibition.id,
        hall: hallId
      });

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

    const note = await fetch(basePath + "note.txt");

    const noteElement = document.getElementById("artistNote");

    if (noteElement) {
      noteElement.innerText = await note.text();
    }

  } catch {

    console.warn("Artist note missing");

  }


  /* ---------- 작가 프로필 ---------- */

  try {

    const profile = await fetch(basePath + "profile.txt");
    const text = await profile.text();

    const lines = text.split("\n");

    let html = "";
    let inList = false;

    lines.forEach(line => {

      line = line.trim();
      if(!line) return;

      if(line.startsWith("[") && line.endsWith("]")){

        if(inList){
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

    if(inList) html += "</div>";

    const profileElement = document.getElementById("artistProfile");

    if (profileElement) {
      profileElement.innerHTML = html;
    }

  } catch {

    console.warn("Artist profile missing");

  }

}


/* ======================================
   Page Load Events
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
