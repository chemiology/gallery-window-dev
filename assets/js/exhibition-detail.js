/* ======================================
   EXHIBITION DETAIL SCRIPT (UNIFIED FINAL)
====================================== */

/* =========================
   BASE PATH (통합)
========================= */

const BASE_PATH =
  location.hostname.includes("github.io")
    ? "./"
    : "/";


document.addEventListener("DOMContentLoaded", () => {

  if (typeof EXHIBITION === "undefined") {
    console.error("EXHIBITION not defined");
    return;
  }

  const ex = EXHIBITION;

  /* =========================
     BASIC URL
  ========================= */

  const url = window.location.href;
  const posterURL = ex.poster;

  /* =========================
     TITLE
  ========================= */

  document.title =
    `${ex.titleEN} — ${ex.artistEN} | Gallery Window`;

  /* =========================
     META / SEO
  ========================= */

  const setContent = (id, value) => {
    document.getElementById(id)?.setAttribute("content", value);
  };

  const setMeta = (selector, value) => {
    document.querySelector(selector)?.setAttribute("content", value);
  };

  setContent("meta-desc",
    `${ex.titleEN}, a conceptual photography exhibition by ${ex.artistEN} at Gallery Window.`);

  setContent("meta-author", ex.artistEN);

  setContent("meta-keywords",
    `${ex.artistEN}, ${ex.titleEN}, photography exhibition, conceptual photography, online exhibition`);

  /* =========================
     OPEN GRAPH
  ========================= */

  setContent("og-title", `${ex.titleEN} — Gallery Window`);
  setContent("og-desc",
    `${ex.artistEN} photography exhibition at Gallery Window`);
  setContent("og-url", url);
  setContent("og-image", posterURL);

  /* =========================
     TWITTER
  ========================= */

  setMeta('meta[name="twitter:title"]',
    `${ex.titleEN} — ${ex.artistEN}`);

  setMeta('meta[name="twitter:description"]',
    `${ex.titleEN} conceptual photography exhibition by ${ex.artistEN} at Gallery Window`);

  setMeta('meta[name="twitter:image"]', posterURL);

  /* =========================
     IMAGE SEO
  ========================= */

  document.getElementById("meta-image")?.setAttribute("href", posterURL);
  document.getElementById("schema-image")?.setAttribute("content", posterURL);

  /* =========================
     POSTER IMAGE
  ========================= */

  const posterImg = document.getElementById("poster-image");

  if (posterImg) {
    posterImg.src = posterURL;
    posterImg.alt =
      `${ex.titleEN} conceptual photography exhibition poster by ${ex.artistEN} at Gallery Window`;
  }

  /* =========================
     EXHIBITION INFO
  ========================= */

  const info = document.getElementById("exhibition-info");

  if (info) {
    info.innerHTML = `
      <p>${ex.artist} _${ex.titleKR}</p>
      <p>- 전시제목 : ${ex.titleKR} / ${ex.titleEN}</p>
      <p>- 전시기간 : ${ex.start} ~ ${ex.end}</p>
      <p>- 전시장소 : 갤러리 창 (gallerywindow.com)</p>
    `;
  }

  /* =========================
     BACK LINK (통합)
  ========================= */

  const state = ex.state || "upcoming";

  const listPage =
    state === "past"
      ? BASE_PATH + "archive/past.html"
      : BASE_PATH + "archive/upcoming.html";

  const listText =
    state === "past"
      ? "← 지난 전시 목록으로"
      : "← 예정 전시 목록으로";

  const backLink = document.getElementById("back-link");

  if (backLink) {
    backLink.href = listPage;
    backLink.textContent = listText;
  }

  /* =========================
     STRUCTURED DATA
  ========================= */

  const structured = {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    "name": ex.titleEN,
    "alternateName": ex.titleKR,
    "startDate": ex.start,
    "endDate": ex.end,
    "url": url,
    "image": posterURL,
    "location": {
      "@type": "VirtualLocation",
      "url": "https://gallerywindow.com"
    },
    "organizer": {
      "@type": "Organization",
      "name": "Gallery Window",
      "url": "https://gallerywindow.com"
    },
    "creator": {
      "@type": "Person",
      "name": ex.artistEN
    }
  };

  const script = document.getElementById("structured-data");

  if (script) {
    script.textContent =
      JSON.stringify(structured, null, 2);
  }

  /* =========================
     TXT LOAD
  ========================= */

  loadNoteProfile();

});


/* ======================================
   TXT LOAD (통합)
====================================== */

async function loadNoteProfile() {

  const container = document.getElementById("note-profile");
  if (!container) return;

  try {

    const file = window.location.pathname.split("/").pop();
    const id = file.replace(".html", "");

    const res = await fetch(
      BASE_PATH + `exhibition_pages/txt/${id}.txt`
    );

    if (!res.ok) {
      console.warn("TXT not found:", id);
      return;
    }

    const text = await res.text();
    const lines = text.split("\n");

    let html = "";
    let inList = false;

    lines.forEach(line => {

      const raw = line;
      line = line.trim();

      if (!line) {
        html += `<div class="gap-md"></div>`;
        return;
      }

      if (line.startsWith("[") && line.endsWith("]")) {

        if (inList) {
          html += "</div>";
          inList = false;
        }

        html += `<div class="gap-lg section-title">${raw}</div>`;

        if (raw !== "[작가노트]") {
          html += `<div class="exhibition-text info">`;
          inList = true;
        }

      } else {

        if (inList) {
          html += `<span>${raw}</span>`;
        } else {
          html += `<p class="gap-lg">${raw}</p>`;
        }

      }

    });

    if (inList) html += "</div>";

    container.innerHTML = html;

  } catch (err) {

    console.warn("note/profile load failed", err);

  }

}