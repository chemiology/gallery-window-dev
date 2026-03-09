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
    const response = await fetch("/assets/config/gallery.json");
    const data = await response.json();

    renderHeadlineNotice(data.headlineNotice);

    const exhibitions =
      (data.currentExhibitions || [])
        // status 필터
        .filter(ex => ex.status !== "hidden")

        // order 정렬
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    renderExhibitions(exhibitions);

  } catch (error) {
    console.error("Gallery data load failed:", error);
  }
}


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
    img.src =
      `/assets/exhibitions/${exhibition.id}/poster.jpg`;
    img.alt = exhibition.title;
    img.style.cursor = "pointer";

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

  location.href = `hall.html?hall=${exhibition.hall}`;
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

