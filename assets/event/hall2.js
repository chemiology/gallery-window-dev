const BASE = "/assets/event";

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
    url = `/exhibition.html?id=${item.id}&from=hall2`;
  }

  if (item.type === "video") {
    url = `/video.html?id=${item.id}&from=hall2`;
  }

  if (item.type === "mixed") {
    url = `/mixed.html?id=${item.id}&from=hall2`;
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