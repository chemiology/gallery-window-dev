/* ======================================
   EXHIBITION DETAIL SCRIPT (FINAL)
   Gallery Window
====================================== */

document.addEventListener("DOMContentLoaded", () => {

  const ex = EXHIBITION;


/* =========================
   BASE PATH / URL
========================= */

  const BASE_PATH = location.pathname.includes('/exhibition_pages/')
    ? '../'
    : '';

  const BASE_URL = location.origin;


  /* =========================
     BASIC URL
  ========================= */

  const url = window.location.href;
  const posterURL = `${BASE_URL}${ex.poster}`;

  /* =========================
     TITLE
  ========================= */

  document.title =
    `${ex.titleEN} — ${ex.artistEN} | Gallery Window`;

  /* =========================
     META / SEO
  ========================= */

  document.getElementById("meta-desc").content =
    `${ex.titleEN}, a conceptual photography exhibition by ${ex.artistEN} at Gallery Window.`;

  document.getElementById("meta-author").content =
    ex.artistEN;

  document.getElementById("meta-keywords").content =
    `${ex.artistEN}, ${ex.titleEN}, photography exhibition, conceptual photography, online exhibition`;

  /* =========================
     OPEN GRAPH
  ========================= */

  document.getElementById("og-title").content =
    `${ex.titleEN} — Gallery Window`;

  document.getElementById("og-desc").content =
    `${ex.artistEN} photography exhibition at Gallery Window`;

  document.getElementById("og-url").content = url;
  document.getElementById("og-image").content = posterURL;

  /* =========================
     TWITTER CARD
  ========================= */

  document.querySelector('meta[name="twitter:title"]').content =
    `${ex.titleEN} — ${ex.artistEN}`;

  document.querySelector('meta[name="twitter:description"]').content =
    `${ex.titleEN} conceptual photography exhibition by ${ex.artistEN} at Gallery Window`;

  document.querySelector('meta[name="twitter:image"]').content =
    posterURL;

  /* =========================
     IMAGE SEO
  ========================= */

  document.getElementById("meta-image").href = posterURL;
  document.getElementById("schema-image").content = posterURL;

  /* =========================
     POSTER IMAGE
  ========================= */

  const posterImg = document.getElementById("poster-image");

  if(posterImg){
    posterImg.src = ex.poster;
    posterImg.alt =
      `${ex.titleEN} conceptual photography exhibition poster by ${ex.artistEN} at Gallery Window`;
  }

  /* =========================
     EXHIBITION INFO
  ========================= */

  const info = document.getElementById("exhibition-info");

  if(info){
    info.innerHTML = `
      <p>${ex.artist} 온라인전시_${ex.titleKR}</p>
      <p>- 전시제목 : ${ex.titleKR} / ${ex.titleEN}</p>
      <p>- 전시기간 : ${ex.start} ~ ${ex.end}</p>
      <p>- 전시장소 : 갤러리 창 (gallerywindow.com)</p>
    `;
  }

  /* =========================
     BACK TO LIST
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

  if(backLink){
    backLink.href = listPage;
    backLink.textContent = listText;
  }

  /* =========================
     STRUCTURED DATA
  ========================= */

  const structured = {

    "@context":"https://schema.org",

    "@type":"ExhibitionEvent",

    "name": ex.titleEN,

    "alternateName": ex.titleKR,

    "startDate": ex.start,

    "endDate": ex.end,

    "url": url,

    "image": posterURL,

    "location":{
      "@type":"VirtualLocation",
      "url":"https://gallerywindow.com"
    },

    "organizer":{
      "@type":"Organization",
      "name":"Gallery Window",
      "url":"https://gallerywindow.com"
    },

    "creator":{
      "@type":"Person",
      "name":ex.artistEN,
      "url":"https://www.kimkyoungsoo.com"
    }

  };

  const script = document.getElementById("structured-data");

  if(script){
    script.textContent =
      JSON.stringify(structured, null, 2);
  }

  /* =========================
     NOTE / PROFILE TXT LOAD
  ========================= */

  loadNoteProfile();

});


/* ======================================
   TXT LOAD (Artist Note / Profile)
====================================== */

async function loadNoteProfile(){

  const container = document.getElementById("note-profile");
  if(!container) return;

  try{

    const file = window.location.pathname.split("/").pop();
    const id = file.replace(".html","");

    const res = await fetch(
      BASE_PATH + `exhibition_pages/txt/${id}.txt`
    );

    if(!res.ok){
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

      /* 빈 줄 → 간격 유지 */

      if(!line){
        html += `<div class="gap-md"></div>`;
        return;
      }

      /* [TITLE] */

      if(line.startsWith("[") && line.endsWith("]")){

        if(inList){
          html += "</div>";
          inList = false;
        }

        html += `<div class="gap-lg section-title">${raw}</div>`;

        if(raw !== "[작가노트]"){
          html += `<div class="exhibition-text info">`;
          inList = true;
        }

      } else {

        if(inList){
          html += `<span>${raw}</span>`;
        } else {
          html += `<p class="gap-lg">${raw}</p>`;
        }

      }

    });

    if(inList) html += "</div>";

    container.innerHTML = html;

  }catch(err){

    console.warn("note/profile load failed", err);

  }

}