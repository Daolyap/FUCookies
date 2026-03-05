document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hostname = extractHostname(tab.url);

  document.getElementById('site-name').textContent = hostname || '(unsupported page)';

  const toggleBtn = document.getElementById('toggle-btn');
  if (!hostname) {
    toggleBtn.disabled = true;
  }

  const { exceptions = [] } = await chrome.storage.sync.get({ exceptions: [] });
  updateStatus(hostname, exceptions);
  renderList(exceptions);

  toggleBtn.addEventListener('click', async () => {
    if (!hostname) return;
    const { exceptions: exc = [] } = await chrome.storage.sync.get({ exceptions: [] });
    const match = matchingException(hostname, exc);
    const updated = match
      ? exc.filter(e => e !== match)
      : [...exc, hostname];
    await chrome.storage.sync.set({ exceptions: updated });
    updateStatus(hostname, updated);
    renderList(updated);
  });
});

function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (_) {
    return '';
  }
}

function isExcepted(hostname, exceptions) {
  return exceptions.some(e => hostname === e || hostname.endsWith('.' + e));
}

function matchingException(hostname, exceptions) {
  return exceptions.find(e => hostname === e || hostname.endsWith('.' + e));
}

function updateStatus(hostname, exceptions) {
  const active = !hostname || !isExcepted(hostname, exceptions);
  const badge = document.getElementById('badge');
  const btn = document.getElementById('toggle-btn');
  badge.textContent = active ? 'Active' : 'Excepted';
  badge.className = 'badge' + (active ? '' : ' excepted');
  btn.textContent = active ? 'Add Exception' : 'Remove Exception';
}

function renderList(exceptions) {
  const list = document.getElementById('exceptions-list');
  const empty = document.getElementById('empty-msg');

  list.querySelectorAll('.exc-item').forEach(el => el.remove());

  empty.style.display = exceptions.length ? 'none' : '';

  exceptions.forEach(host => {
    const li = document.createElement('li');
    li.className = 'exc-item';
    const span = document.createElement('span');
    span.textContent = host;
    const btn = document.createElement('button');
    btn.className = 'del-btn';
    btn.setAttribute('aria-label', `Remove exception for ${host}`);
    btn.textContent = '✕';
    btn.addEventListener('click', async () => {
      const { exceptions: exc = [] } = await chrome.storage.sync.get({ exceptions: [] });
      const updated = exc.filter(e => e !== host);
      await chrome.storage.sync.set({ exceptions: updated });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentHostname = extractHostname(tab.url);
      updateStatus(currentHostname, updated);
      renderList(updated);
    });
    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
}
