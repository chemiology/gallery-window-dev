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

const params = new URLSearchParams(location.search);
const eventId = params.get('id') || 'event01';

const BASE = `${BASE_PATH}/assets/event/${eventId}`;

/* =========================
   INIT
========================= */

async function init() {

  try {

    const [hallRes, galleryRes] = await Promise.all([
      fetch(`${BASE}/artist-hall.json`),
      fetch(`${BASE_PATH}/assets/config/gallery.json`)
    ]);

    const hallData = await hallRes.json();
    const galleryData = await galleryRes.json();

    document.getElementById('title').innerText =
      hallData.title || '';

    document.getElementById('subtitle').innerText =
      hallData.subtitle || '';

    /* 작가노트 */
    loadNote();

    /* 그리드 */
    renderGrid(
      hallData.items || [],
      galleryData.currentExhibitions || []
    );

  } catch (err) {

    console.error(err);

  }

}

/* =========================
   LOAD NOTE
========================= */

async function loadNote() {

  const noteEl = document.getElementById('hall2-note');

  if (!noteEl) return;

  try {

    const res = await fetch(`${BASE}/thumbs/${eventId}.txt`);

    if (!res.ok) {
      noteEl.innerText = '';
      return;
    }

    const text = await res.text();

    noteEl.innerText = text;

  } catch {

    noteEl.innerText = '';

  }

}

/* =========================
   GRID
========================= */

function renderGrid(items, galleryData) {

  const grid = document.getElementById('hall2-grid');

  grid.innerHTML = '';

  items.forEach((entry, index) => {

    const exhibition = galleryData.find(g => g.id === entry.id);

    if (!exhibition) return;

    const card = document.createElement('article');

    card.className = 'poster-card';

    card.style.animationDelay = `${index * 80}ms`;

    const poster = exhibition.poster ||
      `${BASE_PATH}/assets/exhibitions/${exhibition.id}/poster.jpg`;

    const hallLink = `${BASE_PATH}/hall.html?hall=${exhibition.hall}`;

    card.innerHTML = `

      <a href="${hallLink}" class="poster-link">
        <img src="${poster}" alt="${exhibition.title}">
      </a>

      <div class="poster-info">

        <div class="poster-title">
          ${exhibition.title}
        </div>

        <div class="poster-artist">
          ${exhibition.artist || ''}
        </div>

        <div class="poster-buttons">

          <a href="${BASE_PATH}/index.html"
             class="poster-btn">
            ←대표화면
          </a>

          <a href="${hallLink}"
             class="poster-btn">
            작품보기 →
          </a>

        </div>

      </div>

    `;

    grid.appendChild(card);

  });

}

/* =========================
   START
========================= */

window.addEventListener('load', () => {

  document.body.classList.add('page-ready');

  init();

});

/* =========================
   PARALLAX
========================= */

window.addEventListener('scroll', () => {

  const bg = document.querySelector('.site-background');

  if (!bg) return;

  const y = window.scrollY * 0.08;

  bg.style.transform =
    `translateY(${y}px) scale(1.03)`;

});
