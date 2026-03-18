/* =========================
   BASE PATH
========================= */

const BASE_PATH = '';


function getExhibitionStatus(ex) {

  const today = new Date();
  today.setHours(0,0,0,0);

  const start = ex.startDate ? new Date(ex.startDate) : null;
  const end = ex.endDate ? new Date(ex.endDate) : null;

  if (start && today < start) return "coming";
  if (end && today > end) return "past";

  return "current";
}

document.addEventListener("DOMContentLoaded", () => {
  // 대표화면(home)에서만 실행
  if (!document.body.classList.contains("home")) return;

  loadGallery();
  renderHomepageGuestbook();
});


async function loadGallery() {
  try {

    const response = await fetch(BASE_PATH + "assets/config/gallery.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", e);
      showErrorMessage();
      return;
    }

    // 데이터 검증
    if (!data || typeof data !== "object") {
      console.error("Invalid gallery data");
      showErrorMessage();
      return;
    }

    // 공지 표시
    if (data.headlineNotice) {
      loadHeadlineNotice(data.headlineNotice);
    }

    // 전시 목록 처리
    const exhibitions =
      (data.currentExhibitions || [])
        .filter(ex => ex && ex.status !== "hidden")
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    renderExhibitions(exhibitions);

  } catch (error) {

    console.error("Gallery data load failed:", error);
    showErrorMessage();

  }
}

function showErrorMessage() {

  const container = document.querySelector(".exhibitions");

  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:60px;color:#aaa;">
      Exhibition data could not be loaded.
    </div>
  `;
}

function renderExhibitions(exhibitions) {
  const container = document.querySelector(".exhibitions");
  if (!container) return;

  container.innerHTML = "";

  const visible = exhibitions.filter(ex =>
    getExhibitionStatus(ex) !== "past"
  );

  /* =========================
     Grid Auto Layout
  ========================= */

  const count = visible.length;

  container.classList.remove("grid-2","grid-3","grid-4");

  if (count <= 2) {
    container.classList.add("grid-2");
  } 
  else if (count <= 6) {
    container.classList.add("grid-3");
  } 
  else {
    container.classList.add("grid-4");
  }

  /* ========================= */


  visible.forEach((exhibition, index) => {

    const block = document.createElement("div");
    block.className = "exhibition";

    if (getExhibitionStatus(exhibition) === "coming") {
      block.classList.add("coming");
    }

    const hall = document.createElement("div");
    hall.className = "hall-label";
    hall.textContent = `${index + 1}관`;
    block.appendChild(hall);

  // ↓↓↓ 이하 기존 코드 그대로

    const body = document.createElement("div");
    body.className = "exhibition-body";

    const posterWrap = document.createElement("div");

    const img = document.createElement("img");

    img.src = BASE_PATH + `assets/exhibitions/${exhibition.id}/poster.jpg`;
    img.alt = exhibition.title;

    img.style.cursor = "pointer";
    img.loading = "lazy";

    img.onerror = () => {
      img.src = BASE_PATH + "assets/images/poster-placeholder.jpg";
    };

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<h3>${exhibition.title}</h3><p>${exhibition.artist}</p>`;

    posterWrap.appendChild(img);
    posterWrap.appendChild(meta);

    img.onclick = () => {

      if (exhibition.status === "coming") {
        alert("이 전시는 곧 시작됩니다.");
        return;
      }

  location.href = BASE_PATH + `hall.html?hall=${exhibition.hall}`;
};
    body.appendChild(posterWrap);
    block.appendChild(body);
    container.appendChild(block);
  });
}

async function renderHomepageGuestbook() {

  const area = document.getElementById("guestbook-area");
  if (!area) return;

  area.innerHTML = "";
  const ul = document.createElement("ul");
  area.appendChild(ul);

  try {

    const res = await fetch(
      window.GUESTBOOK_URL + "?mode=list"
    );

    const data = await res.json();

    if (!data || data.length === 0) {
      const li = document.createElement("li");
      li.textContent = "아직 방명록이 없습니다.";
      ul.appendChild(li);
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.message;
      ul.appendChild(li);
    });

  } catch (err) {
    const li = document.createElement("li");
    li.textContent = "방명록을 불러올 수 없습니다.";
    ul.appendChild(li);
  }
}


function renderHeadlineNotice(notice) {
  const container = document.getElementById("headline-notice");
  if (!container) return;

  if (!notice || !notice.text || notice.text.trim() === "") {
    container.style.display = "none";
    return;
  }

  container.innerHTML = notice.text;
}

document.addEventListener("click", function(e) {

  const link = e.target.closest("a[href*='exhibition.html']");
  if (!link) return;

  e.preventDefault();

  const url = new URL(link.href);
  const id = url.searchParams.get("id");

  gtag('event', 'enter_hall', {
    hall: 'hall01'
  });

  window.location.href = `hall.html?hall=hall01`;

});
window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});

const response = await fetch(`/gallery-window-dev/${noticeConfig.file}`);

  if (!noticeConfig || !noticeConfig.file) return;

  try {

    const response = await fetch(noticeConfig.file);
    const html = await response.text();

    if (noticeContainer) {
      noticeContainer.innerHTML = html;
    }

  } catch (error) {

    console.error("Headline notice load failed:", error);

  }

}
