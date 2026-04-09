// ═══════════════════════════════════════
// NetMap App Core
// ═══════════════════════════════════════

let CURRENT_USER = null;
let CURRENT_ORG = null;
let AUTH_MODE = 'signin';
let APP_STATE = {
  devices: [],
  software: [],
  user_accts: [],
  subnets: [],
  credentials: [],
  scans: [],
  selectedDevice: null,
  filters: { search: '', type: '', os: '', status: '', dept: '' },
  sort: { field: 'name', asc: true }
};

// ═══ CRYPTO HELPERS ═══
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':netmap:' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══ AUTH ═══
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 5000);
}

function setupAuthTabs() {
  document.querySelectorAll('[data-auth-tab]').forEach(el => {
    el.addEventListener('click', function() {
      AUTH_MODE = this.dataset.authTab;
      document.querySelectorAll('[data-auth-tab]').forEach(x => x.classList.remove('on'));
      this.classList.add('on');
      document.getElementById('auth-btn').textContent = AUTH_MODE === 'signin' ? 'Sign In' : 'Create Account';
    });
  });
}

async function handleAuth(ev) {
  ev.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!username || password.length < 4) {
    showAuthError('Username required, password minimum 4 characters');
    return false;
  }
  if (username === 'demo') {
    showAuthError('Use the Demo button below to explore the demo account');
    return false;
  }
  if (AUTH_MODE === 'register') {
    const existing = await DB.getUser(username);
    if (existing) { showAuthError('Username already exists'); return false; }
    const salt = genSalt();
    const hash = await hashPassword(password, salt);
    await DB.createUser(username, hash, salt);
    const org = await DB.createOrg('My Organization', username);
    toast('Account created', 'green');
    setTimeout(() => completeLogin(username, false), 400);
  } else {
    const user = await DB.getUser(username);
    if (!user) { showAuthError('Account not found'); return false; }
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.hash) { showAuthError('Invalid password'); return false; }
    completeLogin(username, false);
  }
  return false;
}

async function loginDemo() {
  // Ensure demo user exists
  let demoUser = await DB.getUser('demo');
  if (!demoUser) {
    await DB.createUser('demo', 'demo', 'demo');
  }
  // Delete all existing demo orgs (fresh demo every login)
  const existingOrgs = await DB.getOrgsByOwner('demo');
  for (const org of existingOrgs) {
    await DB.deleteOrg(org.id);
  }
  // Create fresh demo org
  CURRENT_USER = { username: 'demo', isDemo: true };
  sessionStorage.setItem('netmap_session', JSON.stringify(CURRENT_USER));
  const org = await DB.createOrg('Acme Corp (Demo)', 'demo');
  toast('Seeding demo inventory...', 'green');
  await seedDemoInventory(org.id);
  completeLogin('demo', true, org);
}

async function completeLogin(username, isDemo, org) {
  CURRENT_USER = { username, isDemo };
  sessionStorage.setItem('netmap_session', JSON.stringify(CURRENT_USER));

  if (!org) {
    const orgs = await DB.getOrgsByOwner(username);
    CURRENT_ORG = orgs[0] || await DB.createOrg('My Organization', username);
  } else {
    CURRENT_ORG = org;
  }

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  setupUI();
  await loadCurrentOrgData();
  showView('dashboard');
}

function logout() {
  CURRENT_USER = null;
  CURRENT_ORG = null;
  sessionStorage.removeItem('netmap_session');
  document.getElementById('app').classList.remove('active');
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-password').value = '';
}

async function restoreSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem('netmap_session') || 'null');
    if (s && s.username) {
      CURRENT_USER = s;
      const orgs = await DB.getOrgsByOwner(s.username);
      if (!orgs.length) {
        sessionStorage.removeItem('netmap_session');
        return false;
      }
      CURRENT_ORG = orgs[0];
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('app').classList.add('active');
      setupUI();
      await loadCurrentOrgData();
      showView('dashboard');
      return true;
    }
  } catch (e) { console.error(e); }
  return false;
}

async function loadCurrentOrgData() {
  if (!CURRENT_ORG) return;
  APP_STATE.devices = await DB.getDevices(CURRENT_ORG.id);
  APP_STATE.software = await DB.getSoftwareByOrg(CURRENT_ORG.id);
  APP_STATE.user_accts = await DB.getUserAcctsByOrg(CURRENT_ORG.id);
  APP_STATE.subnets = await DB.getSubnets(CURRENT_ORG.id);
  APP_STATE.credentials = await DB.getCredentials(CURRENT_ORG.id);
  APP_STATE.scans = await DB.getScans(CURRENT_ORG.id);
  updateSidebarCounts();
  updateOrgSelector();
}

function setupUI() {
  const u = CURRENT_USER.username;
  document.getElementById('user-name').textContent = u === 'demo' ? 'Demo User' : u;
  document.getElementById('user-role').textContent = CURRENT_USER.isDemo ? 'Demo · Read/Write' : 'Administrator';
  const avatar = document.getElementById('user-avatar');
  avatar.textContent = u[0].toUpperCase();
  avatar.className = 'user-avatar' + (CURRENT_USER.isDemo ? ' demo' : '');
  document.getElementById('demo-badge').style.display = CURRENT_USER.isDemo ? 'inline-flex' : 'none';
}

function updateOrgSelector() {
  if (!CURRENT_ORG) return;
  document.getElementById('org-name').textContent = CURRENT_ORG.name;
  document.getElementById('org-meta').textContent = APP_STATE.devices.length + ' devices';
}

function updateSidebarCounts() {
  document.getElementById('nav-devices-ct').textContent = APP_STATE.devices.length;
  const uniqueSw = new Set(APP_STATE.software.map(s => s.name)).size;
  document.getElementById('nav-software-ct').textContent = uniqueSw;
  const uniqueUsers = new Set(APP_STATE.user_accts.map(u => u.username)).size;
  document.getElementById('nav-users-ct').textContent = uniqueUsers;
  document.getElementById('nav-subnets-ct').textContent = APP_STATE.subnets.length;
  document.getElementById('nav-creds-ct').textContent = APP_STATE.credentials.length;
  document.getElementById('nav-scans-ct').textContent = APP_STATE.scans.length;
}

// ═══ NAVIGATION ═══
function showView(view) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (navItem) navItem.classList.add('active');
  const viewEl = document.getElementById('view-' + view);
  if (viewEl) viewEl.classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Asset inventory overview'],
    devices: ['Devices', 'All tracked devices and hosts'],
    software: ['Software Inventory', 'Applications installed across the fleet'],
    users: ['User Accounts', 'Local and domain accounts discovered on devices'],
    subnets: ['Networks', 'Subnets and VLAN inventory'],
    credentials: ['Credentials Vault', 'Authentication used by discovery scans'],
    discovery: ['Network Discovery', 'Scan configuration and history'],
    reports: ['Reports', 'Pre-built inventory reports'],
    audit: ['Audit Log', 'All actions performed in this organization']
  };
  const t = titles[view] || ['', ''];
  document.getElementById('topbar-title').textContent = t[0];
  document.getElementById('topbar-sub').textContent = t[1];

  // Render the view
  const renderer = VIEW_RENDERERS[view];
  if (renderer) renderer();
}

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => showView(item.dataset.view));
  });
}

// ═══ MODAL + TOAST ═══
function openModal(html, size) {
  const modal = document.getElementById('modal');
  const modalEl = document.getElementById('modal-content');
  modalEl.className = 'modal' + (size === 'lg' ? ' modal-lg' : '');
  modalEl.innerHTML = html;
  modal.classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }

function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ═══ UTILITIES ═══
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function formatBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b/1048576).toFixed(1) + ' MB';
  return (b/1073741824).toFixed(2) + ' GB';
}
function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString();
}
function timeAgo(d) {
  if (!d) return 'never';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + ' hr ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + ' days ago';
  return Math.floor(days / 30) + ' mo ago';
}

function statusBadge(s) {
  if (s === 'up') return '<span class="badge b-green"><span class="status-dot up"></span>Online</span>';
  if (s === 'down') return '<span class="badge b-crit"><span class="status-dot down"></span>Offline</span>';
  if (s === 'warn') return '<span class="badge b-warn"><span class="status-dot warn"></span>Warning</span>';
  return '<span class="badge b-mute">Unknown</span>';
}

function typeBadge(t) {
  const map = {
    desktop: 'b-info',
    server: 'b-acc',
    hypervisor: 'b-pink',
    network: 'b-warn',
    firewall: 'b-crit'
  };
  return `<span class="badge ${map[t] || 'b-mute'}">${t || 'unknown'}</span>`;
}

// ═══ EXPORT HELPERS ═══
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h];
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ═══ INIT ═══
async function init() {
  setupAuthTabs();
  setupNavigation();
  document.getElementById('auth-form').addEventListener('submit', handleAuth);

  // Modal backdrop click
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  const restored = await restoreSession();
  if (!restored) {
    document.getElementById('auth-username').focus();
  }
}

window.addEventListener('DOMContentLoaded', init);
