/* ======================================
   Hall Loader – Stable Final Version
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

async function loadHall() {

  const params = new URLSearchParams(location.search);
  const hallId = params.get("hall") || "hall01";

  try {

    // gallery 데이터 로드
    const res = await fetch("/assets/config/gallery.json");
    const data = await res.json();

    const exhibitions =
      data.currentExhibitions || data.exhibitions || [];

    // hall 번호에 해당하는 전시 찾기
    const exhibition = exhibitions.find(ex => {
      return ex.hall === hallId &&
             getExhibitionStatus(ex) !== "past";
    });

/* ---------- Hall 타이틀 ---------- */

const hallTitleElement = document.getElementById("hallTitle");

if (hallTitleElement) {
  hallTitleElement.textContent =
    exhibition?.hallTitle ||
    `${hallId.replace("hall","")}관`;
}

/* ---------- 전시 입구 또는 빈 Hall ---------- */

if (exhibition) {

  loadHallEntry(exhibition.id, hallId);

} else {

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

  console.log("Empty hall:", hallId);
}

  /* ---------- 전시 입구 로드 ---------- */
  if (exhibition) {
    loadHallEntry(exhibition.id, hallId);
  } else {
    console.warn("No exhibition assigned to:", hallId);
  }

  } catch (err) {
    console.error("Hall load failed:", err);
  }
}

/* ======================================
   Hall Entry Loader
====================================== */

async function loadHallEntry(exhibitionId, hallId) {

  try {

    const res = await fetch("/assets/config/gallery.json");
    const data = await res.json();

    const exhibition =
      (data.exhibitions || data.currentExhibitions || [])
        .find(ex => ex.id === exhibitionId);

    if (!exhibition) {
      console.warn("Exhibition not found:", exhibitionId);
      return;
    }

    const basePath =
      `/assets/exhibitions/${exhibition.id}/`;

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


    /* ---------- 포스터 ---------- */

    const poster = document.getElementById("hallPoster");

    if (poster) {
      poster.src = basePath + "poster.jpg";

      poster.onclick = () => {
        window.location.href =
          `/exhibition.html?id=${exhibition.id}&hall=${hallId}`;
      };
    }

    /* ---------- 작품보기 버튼 ---------- */

    const enterBtn = document.getElementById("enterExhibition");

    if (enterBtn) {

      const target =
        hallId.startsWith("hall5")
          ? `/video.html?id=${exhibition.id}`
          : `/exhibition.html?id=${exhibition.id}&hall=${hallId}`;

      enterBtn.href = target;

      enterBtn.onclick = (e) => {
        e.preventDefault();

      // ✅ Google Analytics — 전시장 입장 기록
      gtag('event', 'enter_exhibition', {
        exhibition_id: exhibition.id,
        hall: hallId
      });

     document.body.classList.add("transitioning"); // ⭐ 추가

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

      document.getElementById("artistNote").innerText =
        await note.text();

    } catch {
      console.warn("Artist note missing");
    }


    /* ---------- 작가 프로필 ---------- */

    try {
      const profile = await fetch(basePath + "profile.txt");

      document.getElementById("artistProfile").innerHTML =
        await profile.text();

    } catch {
      console.warn("Artist profile missing");
    }

  } catch (err) {
    console.error("Hall entry load failed:", err);
  }
}


/* ======================================
   Entrance Animation (single trigger)
====================================== */

window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelector(".hall-entry")
      ?.classList.add("show");
  }, 200);
});


/* ======================================
   Start
====================================== */

loadHall();

window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});

window.addEventListener("load", () => {
  const fade = document.getElementById("pageFade");
  if (fade) {
    fade.classList.remove("active");
  }
});

window.addEventListener("load", () => {
  document.body.classList.remove("transitioning");
});

