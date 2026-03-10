/* ======================================
   note-profile 자동으로 불러오기
====================================== */

async function loadNoteProfile(){

  const container = document.getElementById("note-profile");
  if(!container) return;

  try {

    // 현재 HTML 파일 이름 가져오기
    const file = window.location.pathname.split("/").pop();

    // exhibition-kks-20260215.html → kks-20260215
    const id = file
      .replace("exhibition-","")
      .replace(".html","")
      .replace(/P$/,"");

    // txt 파일 경로
    const path = `/exhibitions/txt/${id}.txt`;

    const res = await fetch(path);

    if(!res.ok){
      console.warn("profile txt not found");
      return;
    }

    const text = await res.text();

    const lines = text.split("\n");

    let html = "";
    let inList = false;

    lines.forEach(line => {

      line = line.trim();
      if(!line) return;

      // [제목]
      if(line.startsWith("[") && line.endsWith("]")){

        if(inList){
          html += "</div>";
          inList = false;
        }

        const title = line;

        html += `<div class="gap-lg section-title">${title}</div>`;

        if(title !== "작가노트"){
          html += `<div class="exhibition-text info">`;
          inList = true;
        }

      } else {

        if(inList){
          html += `<span>${line}</span>`;
        } else {
          html += `<p class="gap-lg">${line}</p>`;
        }

      }

    });

    if(inList) html += "</div>";

    container.innerHTML = html;

  } catch(err) {

    console.warn("note/profile load failed", err);

  }

}

// 페이지 로드 후 실행
document.addEventListener("DOMContentLoaded", loadNoteProfile);

document.addEventListener("DOMContentLoaded", () => {

  const ex = EXHIBITION;

  /* =========================
     TITLE
  ========================= */

  document.title =
    `${ex.artist} · ${ex.titleKR} | Gallery Window`;

  /* =========================
     META
  ========================= */

  document.querySelector('meta[property="og:title"]')
    .setAttribute("content",
      `${ex.titleEN} — Gallery Window`);

  document.querySelector('meta[property="og:description"]')
    .setAttribute("content",
      `${ex.artistEN} 개인전 · Gallery Window Online Exhibition`);

  document.querySelector('meta[property="og:url"]')
    .setAttribute("content",
      `https://gallerywindow.com/exhibitions/exhibition-${ex.id}.html`);

  document.querySelector('meta[property="og:image"]')
    .setAttribute("content",
      `https://gallerywindow.com${ex.poster}`);

  document.querySelector('meta[name="description"]')
    .setAttribute("content",
      `${ex.artistEN} photography exhibition — Gallery Window`);

  document.querySelector('meta[name="author"]')
    .setAttribute("content", ex.artistEN);

  document.querySelector('meta[name="keywords"]')
    .setAttribute("content",
      `${ex.artistEN}, ${ex.titleEN}, Photography Exhibition, Gallery Window`);

  /* =========================
     POSTER
  ========================= */

  document.getElementById("poster-image").src = ex.poster;

  /* =========================
     EXHIBITION TEXT
  ========================= */

  const info = document.getElementById("exhibition-info");

  info.innerHTML = `
  <p>${ex.artist} 온라인사진전_${ex.titleKR}</p>
  <p>- 전시제목 : ${ex.titleKR} / ${ex.titleEN}</p>
  <p>- 전시기간 : ${ex.start} ~ ${ex.end}</p>
  <p>- 전시장소 : 갤러리 창 (https://gallerywindow.com)</p>
  `;

});


/* =========================
   TXT 로드 (작가노트 + 프로필)
========================= */

async function loadNoteProfile(){

  const container = document.getElementById("note-profile");
  if(!container) return;

  try {

    const file = window.location.pathname.split("/").pop();

    const id = file
      .replace("exhibition-","")
      .replace(".html","")
      .replace(/P$/,"");

    const res = await fetch(`/exhibitions/txt/${id}.txt`);
    const text = await res.text();

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

        const title = line;

        html += `<div class="gap-lg section-title">${title}</div>`;

        if(title !== "[작가노트]"){
          html += `<div class="exhibition-text info">`;
          inList = true;
        }

      } else {

        if(inList){
          html += `<span>${line}</span>`;
        } else {
          html += `<p class="gap-lg">${line}</p>`;
        }

      }

    });

    if(inList) html += "</div>";

    container.innerHTML = html;

  } catch(err){

    console.warn("note/profile load failed");

  }

}

loadNoteProfile();