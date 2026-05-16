let currentFilter = 'all';

async function apiFetch(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  return res.json();
}

async function loadStats() {
  const data = await apiFetch('/stats');
  if (!data.success) return;
  const s = data.data;
  document.getElementById('stat-total').textContent = s.total;
  document.getElementById('stat-active').textContent = s.active;
  document.getElementById('stat-completed').textContent = s.completed;
  const badge = document.getElementById('env-badge');
  badge.textContent = 'Node ' + s.nodeVersion;
}

async function loadItems() {
  const list = document.getElementById('items-list');
  list.innerHTML = '<p class="loading">Duke ngarkuar...</p>';
  const query = currentFilter === 'all' ? '' : '?status=' + currentFilter;
  const data = await apiFetch('/items' + query);
  if (!data.success) { list.innerHTML = '<p class="empty">Gabim gjatë ngarkimit.</p>'; return; }
  if (data.data.length === 0) { list.innerHTML = '<p class="empty">Nuk ka tasks për këtë filtër.</p>'; return; }
  list.innerHTML = data.data.map(item => `
    <div class="item-card ${item.status}" id="item-${item.id}">
      <div class="item-info">
        <div class="item-title">
          <span class="status-dot ${item.status}"></span>${item.title}
        </div>
        ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
        <div class="item-meta">ID: ${item.id} &bull; ${new Date(item.createdAt).toLocaleString('sq-AL')}</div>
      </div>
      <div class="item-actions">
        ${item.status === 'active'
          ? `<button class="btn btn-success" onclick="toggleStatus(${item.id}, 'completed')">&#10003;</button>`
          : `<button class="btn btn-secondary btn-sm" onclick="toggleStatus(${item.id}, 'active')">&#8635;</button>`
        }
        <button class="btn btn-danger" onclick="deleteItem(${item.id})">&#10005;</button>
      </div>
    </div>
  `).join('');
}

async function toggleStatus(id, status) {
  await apiFetch('/items/' + id, { method: 'PUT', body: JSON.stringify({ status }) });
  await loadItems();
  await loadStats();
}

async function deleteItem(id) {
  await apiFetch('/items/' + id, { method: 'DELETE' });
  await loadItems();
  await loadStats();
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('input-title').value.trim();
  const description = document.getElementById('input-desc').value.trim();
  if (!title) return;
  const data = await apiFetch('/items', { method: 'POST', body: JSON.stringify({ title, description }) });
  if (data.success) {
    document.getElementById('input-title').value = '';
    document.getElementById('input-desc').value = '';
    currentFilter = 'all';
    document.querySelectorAll('.filter-bar .btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    await loadItems();
    await loadStats();
  }
});

document.querySelectorAll('.filter-bar .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-bar .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    loadItems();
  });
});

async function checkHealth() {
  const el = document.getElementById('health-output');
  el.textContent = 'Duke kontrolluar...';
  const res = await fetch('/health');
  const data = await res.json();
  el.textContent = JSON.stringify(data, null, 2);
}

// Init
loadStats();
loadItems();