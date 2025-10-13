const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const EXPIRATION_DURATION = 30 * 24 * 60 * 60 * 1000; 
const THEME_DATA_KEY = 'userThemeData';
const OPT_OUT_KEY = 'themeOptOut';
const HOURS_KEY = 'bbbs_hours_entries';
const SAVED_EVENTS_KEY = 'bbbs_saved_events';
const CONTACT_DRAFT_KEY = 'bbbs_contact_draft';

(function setYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

function setTheme(themeName, force = false) {
  const isOptedOut = localStorage.getItem(OPT_OUT_KEY) === 'true';

  if (!isOptedOut) {
    const now = Date.now();
    const expiryTime = now + EXPIRATION_DURATION;
    const themeData = { theme: themeName, expiry: expiryTime };
    localStorage.setItem(THEME_DATA_KEY, JSON.stringify(themeData));
  } else if (!force) {
    localStorage.removeItem(THEME_DATA_KEY);
  }

  document.body.className = themeName;
  $$('.theme-btn').forEach(btn => {
    const label = btn.textContent.toLowerCase();
    btn.classList.remove('active');
    if (label.includes(themeName) && (label.includes('light') || label.includes('dark'))) {
      btn.classList.add('active');
    }
  });
}

function getSavedTheme() {
  if (localStorage.getItem(OPT_OUT_KEY) === 'true') return null;
  const raw = localStorage.getItem(THEME_DATA_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (data.expiry && data.expiry < Date.now()) {
      localStorage.removeItem(THEME_DATA_KEY);
      return null;
    }
    return data.theme;
  } catch {
    localStorage.removeItem(THEME_DATA_KEY);
    return null;
  }
}

function resetTheme() {
  localStorage.removeItem(THEME_DATA_KEY);
  setTheme('light', true);
}

function clearAllLocalData() {
  localStorage.removeItem(THEME_DATA_KEY);
  localStorage.removeItem(OPT_OUT_KEY);
  localStorage.removeItem(HOURS_KEY);
  localStorage.removeItem(SAVED_EVENTS_KEY);
  localStorage.removeItem(CONTACT_DRAFT_KEY);

  const draftChk = $('#save-draft');
  if (draftChk) draftChk.checked = false;

  setTheme('light', true);
  alert('All saved preferences and data were cleared on this device.');
}

function toggleDataCollection(isOptedOut) {
  if (isOptedOut) {
    localStorage.setItem(OPT_OUT_KEY, 'true');
    localStorage.removeItem(THEME_DATA_KEY);
    setTheme('light', true);
  } else {
    localStorage.removeItem(OPT_OUT_KEY);
  }
}

function initializePrivacyControls() {
  const optOutCheckbox = $('#theme-opt-out');
  if (optOutCheckbox) {
    optOutCheckbox.checked = localStorage.getItem(OPT_OUT_KEY) === 'true';
  }
}

(function initTheme() {
  const saved = getSavedTheme();
  setTheme(saved || 'light', true);
})();

(function initNav() {
  const navToggle = $('.nav-toggle');
  const navMenu = $('.nav-menu');
  if (!navToggle || !navMenu) return;

  function showMenu() {
    const shown = navMenu.classList.toggle('show');
    if (shown) {
      navToggle.setAttribute('aria-expanded', 'true');
    } else {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  navToggle.addEventListener('click', showMenu);
  navToggle.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault();
      showMenu();
    }
  });
})();

(function initEvents() {
  const filterSelect = $('#event-type');
  const searchInput = $('#event-search');
  const clearBtn = $('#clear-filters');
  const eventCards = $$('.event-card');
  const savedList = $('#saved-events');

  function getSavedEvents() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_EVENTS_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function saveEvents(arr) {
    localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(arr));
  }
  function renderSaved() {
    if (!savedList) return;
    const saved = getSavedEvents();
    savedList.innerHTML = '';
    if (saved.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No saved events yet.';
      savedList.appendChild(li);
      return;
    }
    saved.forEach(title => {
      const li = document.createElement('li');
      li.textContent = title;
      savedList.appendChild(li);
    });
  }

  function applyFilters() {
    const typeVal = filterSelect ? filterSelect.value : 'all';
    const q = (searchInput ? searchInput.value : '').trim().toLowerCase();

    eventCards.forEach(card => {
      const type = card.getAttribute('data-type');
      const title = (card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '').toLowerCase();
      const typeOk = (typeVal === 'all' || type === typeVal);
      const searchOk = !q || title.includes(q);
      card.hidden = !(typeOk && searchOk);
    });
  }

  if (filterSelect || searchInput || clearBtn || savedList) {
    applyFilters();
    if (filterSelect) filterSelect.addEventListener('change', applyFilters);
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
      searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFilters(); });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (filterSelect) filterSelect.value = 'all';
        if (searchInput) searchInput.value = '';
        applyFilters();
      });
    }

    $$('#events-list .event-card [data-save]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.event-card');
        const title = card?.getAttribute('data-title') || card?.querySelector('h3')?.textContent || 'Event';
        const saved = getSavedEvents();
        if (!saved.includes(title)) {
          saved.push(title);
          saveEvents(saved);
          renderSaved();
          btn.textContent = 'Saved!';
        } else {
          btn.textContent = 'Saved';
        }
      });
    });

    renderSaved();
  }
})();

function getHours() {
  try {
    return JSON.parse(localStorage.getItem(HOURS_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveHours(arr) {
  localStorage.setItem(HOURS_KEY, JSON.stringify(arr));
}
function totalForCurrentMonth(entries) {
  const now = new Date();
  const ym = [now.getFullYear(), now.getMonth()];
  return entries
    .filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === ym[0] && d.getMonth() === ym[1];
    })
    .reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
}
function renderHoursSummary(targetTotalSel, targetListSel, limit = 5) {
  const totalEl = $(targetTotalSel);
  const listEl = $(targetListSel);
  const entries = getHours().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (totalEl) totalEl.textContent = totalForCurrentMonth(entries).toFixed(2);
  if (listEl) {
    listEl.innerHTML = '';
    entries.slice(0, limit).forEach(e => {
      const li = document.createElement('li');
      const text = `${e.date} — ${e.hours} hr${Number(e.hours) == 1 ? '' : 's'}${e.note ? ` • ${e.note}` : ''}`;
      li.textContent = text;
      listEl.appendChild(li);
    });
  }
}

(function wireHoursForms() {
  const f1 = $('#hours-form');
  if (f1) {
    f1.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = $('#hours-date')?.value;
      const hours = parseFloat($('#hours-amount')?.value || '0');
      const note = $('#hours-note')?.value || '';
      if (!date || isNaN(hours) || hours < 0) return;

      const entries = getHours();
      entries.push({ date, hours, note });
      saveHours(entries);

      f1.reset();
      renderHoursSummary('#hours-total', '#hours-recent');
      alert('Hours saved on this device!');
    });

    renderHoursSummary('#hours-total', '#hours-recent');
  }

  const f2 = $('#hours-form-2');
  if (f2) {
    f2.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = $('#v-date')?.value;
      const hours = parseFloat($('#v-hours')?.value || '0');
      if (!date || isNaN(hours) || hours < 0) return;

      const entries = getHours();
      entries.push({ date, hours });
      saveHours(entries);
      f2.reset();
      renderHoursSummary('#hours-total-2', null);
      alert('Hours saved on this device!');
    });
    renderHoursSummary('#hours-total-2', null);
  }
})();

(function initFeedback() {
  const box = $('.feedback');
  if (!box) return;
  const msg = $('#feedback-msg');

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-helpful]');
    if (!btn) return;
    const val = btn.getAttribute('data-helpful');
    if (val === 'yes') {
      if (msg) msg.textContent = 'Thank you! We’ll keep improving.';
    } else {
      if (msg) msg.textContent = 'Thanks for the feedback. We added clearer groupings and shortcuts based on user input.';
    }
  });
})();

(function initIdeaTags() {
  const list = $('#idea-list');
  const chips = $$('.chip');
  if (!list || chips.length === 0) return;

  function show(tag) {
    $$('#idea-list li').forEach(li => {
      const tags = (li.getAttribute('data-tags') || '').split(' ');
      li.style.display = (tag === 'all' || tags.includes(tag)) ? '' : 'none';
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      show(chip.getAttribute('data-tag') || 'all');
    });
  });

  chips[0].classList.add('active');
  show('all');
})();

(function initContact() {
  const form = $('#contact-form');
  if (!form) {
    initializePrivacyControls();
    return;
  }

  const nameEl = $('#name');
  const emailEl = $('#email');
  const topicEl = $('#topic');
  const msgEl = $('#message');
  const status = $('#form-status');
  const count = $('#char-count');
  const saveChk = $('#save-draft');

  try {
    const draft = JSON.parse(localStorage.getItem(CONTACT_DRAFT_KEY) || 'null');
    if (draft) {
      if (nameEl) nameEl.value = draft.name || '';
      if (emailEl) emailEl.value = draft.email || '';
      if (topicEl) topicEl.value = draft.topic || '';
      if (msgEl) msgEl.value = draft.message || '';
      if (saveChk) saveChk.checked = true;
      if (count && msgEl) count.textContent = `${msgEl.value.length} / ${msgEl.maxLength}`;
    }
  } catch {}

  function updateCount() {
    if (count && msgEl) {
      count.textContent = `${msgEl.value.length} / ${msgEl.maxLength}`;
    }
  }
  if (msgEl) {
    msgEl.addEventListener('input', updateCount);
    updateCount();
  }

  function maybeSaveDraft() {
    if (!saveChk || !saveChk.checked) {
      localStorage.removeItem(CONTACT_DRAFT_KEY);
      return;
    }
    const draft = {
      name: nameEl?.value || '',
      email: emailEl?.value || '',
      topic: topicEl?.value || '',
      message: msgEl?.value || ''
    };
    localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(draft));
  }

  form.addEventListener('input', maybeSaveDraft);
  if (saveChk) saveChk.addEventListener('change', maybeSaveDraft);

  form.addEventListener('submit', () => {
    if (status) status.textContent = 'Submitting…';
    localStorage.removeItem(CONTACT_DRAFT_KEY);
  });

  initializePrivacyControls();
})();