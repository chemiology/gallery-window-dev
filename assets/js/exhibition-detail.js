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
    const id = file.replace("exhibition-","").replace(".html","");

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

        const title = line.replace(/\[|\]/g,"");

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