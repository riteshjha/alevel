// ---- THEME TOGGLE ----
const themeBtn = document.getElementById('theme-btn');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ---- TABS ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

// ---- TOPIC CARDS ----
document.querySelectorAll('.topic-card').forEach(card => {
  card.addEventListener('click', () => {
    const detailId = card.dataset.detail;
    const detail = document.getElementById(detailId);
    if (!detail) return;
    const isOpen = detail.classList.contains('open');
    // Close all
    document.querySelectorAll('.topic-detail.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.topic-card.active-card').forEach(c => c.classList.remove('active-card'));
    if (!isOpen) {
      detail.classList.add('open');
      card.classList.add('active-card');
      setTimeout(() => detail.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  });
});

document.querySelectorAll('.close-detail').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.closest('.topic-detail').classList.remove('open');
  });
});

// ---- PROGRESS TRACKER ----
const completedTopics = new Set(JSON.parse(localStorage.getItem('completedTopics') || '[]'));

function updateProgress() {
  const total = document.querySelectorAll('.check-btn').length;
  const done = completedTopics.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const fill = document.querySelector('.progress-bar-large .fill');
  const text = document.querySelector('.progress-text');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${done} of ${total} topics studied (${pct}%)`;
}

document.querySelectorAll('.check-btn').forEach(btn => {
  const id = btn.dataset.topic;
  if (completedTopics.has(id)) btn.classList.add('done');

  btn.addEventListener('click', () => {
    if (completedTopics.has(id)) {
      completedTopics.delete(id);
      btn.classList.remove('done');
    } else {
      completedTopics.add(id);
      btn.classList.add('done');
    }
    localStorage.setItem('completedTopics', JSON.stringify([...completedTopics]));
    updateProgress();
    updateCardProgress();
  });
});

function updateCardProgress() {
  document.querySelectorAll('.topic-card').forEach(card => {
    const id = card.dataset.detail;
    const bar = card.querySelector('.progress-fill');
    if (bar) {
      bar.style.width = completedTopics.has(id) ? '100%' : '0%';
    }
  });
}

updateProgress();
updateCardProgress();

// ---- SEARCH ----
const searchInput = document.getElementById('search-input');
const searchOverlay = document.getElementById('search-overlay');
const searchResults = document.getElementById('search-results');

const searchData = [];
document.querySelectorAll('.topic-card').forEach(card => {
  const title = card.querySelector('.card-title')?.textContent || '';
  const num = card.querySelector('.card-num')?.textContent || '';
  const tags = [...card.querySelectorAll('.tag')].map(t => t.textContent).join(', ');
  searchData.push({ title, num, tags, detailId: card.dataset.detail, card });
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchOverlay.classList.remove('open'); return; }
  searchOverlay.classList.add('open');
  const matches = searchData.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.num.toLowerCase().includes(q) ||
    d.tags.toLowerCase().includes(q)
  );
  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No topics found</div>';
  } else {
    searchResults.innerHTML = matches.map(m => `
      <div class="search-result-item" data-detail="${m.detailId}">
        <h4>${m.title}</h4>
        <p>${m.num} &middot; ${m.tags}</p>
      </div>
    `).join('');
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        searchOverlay.classList.remove('open');
        searchInput.value = '';
        const card = document.querySelector(`[data-detail="${item.dataset.detail}"]`);
        if (card) {
          card.click();
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
});

searchOverlay.addEventListener('click', e => {
  if (e.target === searchOverlay) {
    searchOverlay.classList.remove('open');
    searchInput.value = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchOverlay.classList.remove('open');
    searchInput.value = '';
  }
});
