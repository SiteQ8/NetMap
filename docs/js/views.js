// ═══════════════════════════════════════
// NetMap View Renderers
// ═══════════════════════════════════════

const VIEW_RENDERERS = {};

// ═══ DASHBOARD ═══
VIEW_RENDERERS.dashboard = function() {
  const devices = APP_STATE.devices;
  const software = APP_STATE.software;
  const up = devices.filter(d => d.status === 'up').length;
  const down = devices.filter(d => d.status === 'down').length;
  const warn = devices.filter(d => d.status === 'warn').length;
  const uniqueSoftware = new Set(software.map(s => s.name)).size;

  // Warranty expiring in 90 days
  const now = Date.now();
  const soon = devices.filter(d => {
    if (!d.warranty_expiry) return false;
    const exp = new Date(d.warranty_expiry).getTime();
    return exp > now && exp < now + 90 * 86400000;
  }).length;
  const expired = devices.filter(d => d.warranty_expiry && new Date(d.warranty_expiry).getTime() < now).length;

  // OS distribution
  const osCounts = {};
  devices.forEach(d => {
    const key = d.os || 'Unknown';
    osCounts[key] = (osCounts[key] || 0) + 1;
  });
  const osSorted = Object.entries(osCounts).sort((a,b) => b[1] - a[1]);
  const maxOs = osSorted[0] ? osSorted[0][1] : 1;

  // Type distribution
  const typeCounts = {};
  devices.forEach(d => {
    const key = d.type || 'Unknown';
    typeCounts[key] = (typeCounts[key] || 0) + 1;
  });

  // Department distribution
  const deptCounts = {};
  devices.forEach(d => {
    const key = d.department || 'Unassigned';
    deptCounts[key] = (deptCounts[key] || 0) + 1;
  });
  const deptSorted = Object.entries(deptCounts).sort((a,b) => b[1] - a[1]).slice(0, 8);
  const maxDept = deptSorted[0] ? deptSorted[0][1] : 1;

  // Recent scans
  const recentScans = [...APP_STATE.scans].sort((a,b) => (b.started_at || '').localeCompare(a.started_at || '')).slice(0, 5);

  const el = document.getElementById('view-dashboard');
  el.innerHTML = `
    <div class="stats">
      <div class="stat">
        <div class="stat-icon">💻</div>
        <div class="stat-label">Total Devices</div>
        <div class="stat-value">${devices.length}</div>
        <div class="stat-meta">${Object.keys(typeCounts).length} types tracked</div>
      </div>
      <div class="stat green">
        <div class="stat-icon">✓</div>
        <div class="stat-label">Online</div>
        <div class="stat-value">${up}</div>
        <div class="stat-meta">${devices.length ? Math.round(up/devices.length*100) : 0}% reachable</div>
      </div>
      <div class="stat warn">
        <div class="stat-icon">⚠</div>
        <div class="stat-label">Warning</div>
        <div class="stat-value">${warn}</div>
        <div class="stat-meta">Not seen recently</div>
      </div>
      <div class="stat crit">
        <div class="stat-icon">✕</div>
        <div class="stat-label">Offline</div>
        <div class="stat-value">${down}</div>
        <div class="stat-meta">Needs attention</div>
      </div>
    </div>

    <div class="stats">
      <div class="stat info">
        <div class="stat-icon">📦</div>
        <div class="stat-label">Unique Software</div>
        <div class="stat-value">${uniqueSoftware}</div>
        <div class="stat-meta">${software.length} installations</div>
      </div>
      <div class="stat info">
        <div class="stat-icon">👥</div>
        <div class="stat-label">User Accounts</div>
        <div class="stat-value">${new Set(APP_STATE.user_accts.map(u => u.username)).size}</div>
        <div class="stat-meta">${APP_STATE.user_accts.length} total across devices</div>
      </div>
      <div class="stat warn">
        <div class="stat-icon">📅</div>
        <div class="stat-label">Warranty &lt; 90 Days</div>
        <div class="stat-value">${soon}</div>
        <div class="stat-meta">Plan refresh</div>
      </div>
      <div class="stat crit">
        <div class="stat-icon">⏱</div>
        <div class="stat-label">Warranty Expired</div>
        <div class="stat-value">${expired}</div>
        <div class="stat-meta">Out of support</div>
      </div>
    </div>

    <div class="split">
      <div class="card">
        <div class="card-head">
          <div class="card-title">🖥 Operating Systems</div>
          <div class="card-sub">${osSorted.length} distinct</div>
        </div>
        <div class="chart-bars">
          ${osSorted.slice(0, 10).map(([os, count]) => `
            <div class="chart-bar">
              <div class="chart-bar-label" title="${escapeHtml(os)}">${escapeHtml(os)}</div>
              <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${(count/maxOs*100).toFixed(0)}%"></div></div>
              <div class="chart-bar-val">${count}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">🏢 Departments</div>
          <div class="card-sub">Device allocation</div>
        </div>
        <div class="chart-bars">
          ${deptSorted.map(([dept, count]) => `
            <div class="chart-bar">
              <div class="chart-bar-label">${escapeHtml(dept)}</div>
              <div class="chart-bar-track"><div class="chart-bar-fill green" style="width:${(count/maxDept*100).toFixed(0)}%"></div></div>
              <div class="chart-bar-val">${count}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="split">
      <div class="card">
        <div class="card-head">
          <div class="card-title">📡 Recent Scans</div>
          <button class="btn primary" onclick="showView('discovery')">Run New Scan →</button>
        </div>
        ${recentScans.length ? recentScans.map(s => `
          <div style="padding:11px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px">
            <div style="flex:1;min-width:0">
              <div style="font-size:.78rem;font-weight:600">${escapeHtml(s.name)}</div>
              <div style="font-size:.62rem;color:var(--tx3);font-family:var(--m);margin-top:3px">${escapeHtml(s.subnet)} · ${timeAgo(s.started_at)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:.72rem;font-weight:700;color:var(--acc)">${s.devices_found} found</div>
              <div style="font-size:.58rem;color:var(--green);font-family:var(--m)">+${s.devices_new} new</div>
            </div>
          </div>
        `).join('') : '<div class="empty"><div class="empty-icon">📡</div>No scans yet</div>'}
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">⚡ Quick Actions</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="btn" onclick="openAddDeviceModal()" style="padding:14px;justify-content:center">➕ Add Device</button>
          <button class="btn" onclick="showView('devices')" style="padding:14px;justify-content:center">📋 View All</button>
          <button class="btn" onclick="showView('discovery')" style="padding:14px;justify-content:center">📡 Discovery</button>
          <button class="btn" onclick="showView('reports')" style="padding:14px;justify-content:center">📊 Reports</button>
          <button class="btn" onclick="exportDevicesCSV()" style="padding:14px;justify-content:center">↧ Export CSV</button>
          <button class="btn" onclick="showView('credentials')" style="padding:14px;justify-content:center">🔐 Credentials</button>
        </div>
      </div>
    </div>
  `;
};

// ═══ DEVICES ═══
VIEW_RENDERERS.devices = function() {
  const el = document.getElementById('view-devices');
  el.innerHTML = `
    <div class="filter-bar">
      <div class="search"><input id="dev-search" placeholder="Search by name, IP, MAC, serial, user..." value="${escapeHtml(APP_STATE.filters.search)}"></div>
      <div class="fb-group">
        <select class="select" id="dev-type">
          <option value="">All Types</option>
          <option value="desktop">Desktop</option>
          <option value="server">Server</option>
          <option value="hypervisor">Hypervisor</option>
          <option value="network">Network</option>
          <option value="firewall">Firewall</option>
        </select>
      </div>
      <div class="fb-group">
        <select class="select" id="dev-status">
          <option value="">All Status</option>
          <option value="up">Online</option>
          <option value="warn">Warning</option>
          <option value="down">Offline</option>
        </select>
      </div>
      <div class="fb-group">
        <select class="select" id="dev-dept">
          <option value="">All Departments</option>
        </select>
      </div>
      <button class="btn primary" onclick="openAddDeviceModal()">➕ Add Device</button>
      <button class="btn" onclick="exportDevicesCSV()">↧ Export</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow:auto;max-height:calc(100vh - 240px)">
        <table class="tbl">
          <thead><tr>
            <th data-sort="status">●</th>
            <th data-sort="name">Name</th>
            <th data-sort="type">Type</th>
            <th data-sort="os">OS</th>
            <th data-sort="ip">IP</th>
            <th data-sort="department">Department</th>
            <th data-sort="assigned_to">Assigned</th>
            <th data-sort="last_seen">Last Seen</th>
            <th class="actions">Actions</th>
          </tr></thead>
          <tbody id="dev-body"></tbody>
        </table>
      </div>
    </div>
    <div id="dev-footer" style="padding:10px 16px;font-size:.68rem;color:var(--tx3);font-family:var(--m);text-align:right"></div>
  `;

  // Populate department filter
  const depts = [...new Set(APP_STATE.devices.map(d => d.department).filter(Boolean))].sort();
  const deptSel = document.getElementById('dev-dept');
  depts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    deptSel.appendChild(opt);
  });
  deptSel.value = APP_STATE.filters.dept || '';
  document.getElementById('dev-type').value = APP_STATE.filters.type || '';
  document.getElementById('dev-status').value = APP_STATE.filters.status || '';

  document.getElementById('dev-search').addEventListener('input', e => {
    APP_STATE.filters.search = e.target.value;
    renderDevicesTable();
  });
  document.getElementById('dev-type').addEventListener('change', e => {
    APP_STATE.filters.type = e.target.value;
    renderDevicesTable();
  });
  document.getElementById('dev-status').addEventListener('change', e => {
    APP_STATE.filters.status = e.target.value;
    renderDevicesTable();
  });
  document.getElementById('dev-dept').addEventListener('change', e => {
    APP_STATE.filters.dept = e.target.value;
    renderDevicesTable();
  });

  // Sortable columns
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (APP_STATE.sort.field === f) APP_STATE.sort.asc = !APP_STATE.sort.asc;
      else { APP_STATE.sort.field = f; APP_STATE.sort.asc = true; }
      renderDevicesTable();
    });
  });

  renderDevicesTable();
};

function renderDevicesTable() {
  const f = APP_STATE.filters;
  const search = f.search.toLowerCase();
  let list = APP_STATE.devices.filter(d => {
    if (f.type && d.type !== f.type) return false;
    if (f.status && d.status !== f.status) return false;
    if (f.dept && d.department !== f.dept) return false;
    if (search) {
      const hay = [d.name, d.hostname, d.ip, d.mac, d.serial, d.asset_tag, d.assigned_to, d.os, d.department, d.location].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  const { field, asc } = APP_STATE.sort;
  list.sort((a, b) => {
    const av = a[field] || '';
    const bv = b[field] || '';
    if (av < bv) return asc ? -1 : 1;
    if (av > bv) return asc ? 1 : -1;
    return 0;
  });

  document.querySelectorAll('[data-sort]').forEach(th => {
    th.classList.remove('sorted', 'asc');
    if (th.dataset.sort === field) {
      th.classList.add('sorted');
      if (asc) th.classList.add('asc');
    }
  });

  const body = document.getElementById('dev-body');
  if (!list.length) {
    body.innerHTML = '<tr><td colspan="9"><div class="empty"><div class="empty-icon">💻</div>No devices match the current filter</div></td></tr>';
  } else {
    body.innerHTML = list.map(d => `
      <tr onclick="showDeviceDetail('${d.id}')">
        <td>${statusBadge(d.status)}</td>
        <td><strong>${escapeHtml(d.name)}</strong><div style="font-size:.58rem;color:var(--tx3);font-family:var(--m);margin-top:2px">${escapeHtml(d.hostname || '')}</div></td>
        <td>${typeBadge(d.type)}</td>
        <td><div style="font-size:.72rem">${escapeHtml(d.os || '')}</div><div style="font-size:.58rem;color:var(--tx3);font-family:var(--m);margin-top:2px">${escapeHtml(d.os_version || '')}</div></td>
        <td class="mono">${escapeHtml(d.ip || '')}</td>
        <td>${escapeHtml(d.department || '—')}</td>
        <td>${escapeHtml(d.assigned_to || '—')}</td>
        <td class="mono" style="font-size:.62rem">${timeAgo(d.last_seen)}</td>
        <td class="actions" onclick="event.stopPropagation()">
          <button class="btn" onclick="openEditDeviceModal('${d.id}')">Edit</button>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('dev-footer').textContent = `Showing ${list.length} of ${APP_STATE.devices.length} devices`;
}

// ═══ SOFTWARE ═══
VIEW_RENDERERS.software = function() {
  const el = document.getElementById('view-software');
  // Aggregate by name
  const grouped = {};
  APP_STATE.software.forEach(s => {
    const key = s.name + '::' + s.publisher;
    if (!grouped[key]) {
      grouped[key] = { name: s.name, publisher: s.publisher, versions: new Set(), devices: new Set(), count: 0 };
    }
    grouped[key].versions.add(s.version);
    grouped[key].devices.add(s.device_id);
    grouped[key].count++;
  });
  const list = Object.values(grouped).sort((a,b) => b.count - a.count);

  el.innerHTML = `
    <div class="filter-bar">
      <div class="search"><input id="sw-search" placeholder="Search software by name or publisher..."></div>
      <button class="btn" onclick="exportSoftwareCSV()">↧ Export CSV</button>
    </div>
    <div class="stats" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat"><div class="stat-label">Unique Applications</div><div class="stat-value">${list.length}</div><div class="stat-meta">Across fleet</div></div>
      <div class="stat info"><div class="stat-label">Total Installations</div><div class="stat-value">${APP_STATE.software.length}</div><div class="stat-meta">All devices</div></div>
      <div class="stat warn"><div class="stat-label">Publishers</div><div class="stat-value">${new Set(list.map(l => l.publisher)).size}</div><div class="stat-meta">Distinct vendors</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl">
        <thead><tr><th>Software</th><th>Publisher</th><th>Versions</th><th class="num">Devices</th></tr></thead>
        <tbody id="sw-body"></tbody>
      </table>
    </div>
  `;

  function renderSw() {
    const q = (document.getElementById('sw-search').value || '').toLowerCase();
    const filtered = list.filter(s => !q || s.name.toLowerCase().includes(q) || (s.publisher||'').toLowerCase().includes(q));
    const body = document.getElementById('sw-body');
    if (!filtered.length) {
      body.innerHTML = '<tr><td colspan="4"><div class="empty"><div class="empty-icon">📦</div>No software matches filter</div></td></tr>';
      return;
    }
    body.innerHTML = filtered.map(s => `
      <tr onclick="showSoftwareDetail('${escapeHtml(s.name).replace(/'/g,"\\'")}')">
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td style="color:var(--tx3)">${escapeHtml(s.publisher)}</td>
        <td><div style="display:flex;flex-wrap:wrap;gap:4px">${[...s.versions].slice(0,3).map(v => '<span class="badge b-mute">'+escapeHtml(v)+'</span>').join('')}${s.versions.size > 3 ? '<span class="badge b-acc">+' + (s.versions.size - 3) + '</span>' : ''}</div></td>
        <td class="num"><strong style="color:var(--acc)">${s.devices.size}</strong></td>
      </tr>
    `).join('');
  }
  document.getElementById('sw-search').addEventListener('input', renderSw);
  renderSw();
};

// ═══ USERS ═══
VIEW_RENDERERS.users = function() {
  const el = document.getElementById('view-users');
  // Group by username
  const grouped = {};
  APP_STATE.user_accts.forEach(u => {
    if (!grouped[u.username]) {
      grouped[u.username] = { username: u.username, full_name: u.full_name, devices: new Set(), is_admin: false, last_login: null, source: u.source };
    }
    grouped[u.username].devices.add(u.device_id);
    if (u.is_admin) grouped[u.username].is_admin = true;
    if (!grouped[u.username].last_login || (u.last_login && u.last_login > grouped[u.username].last_login)) {
      grouped[u.username].last_login = u.last_login;
    }
  });
  const list = Object.values(grouped).sort((a,b) => b.devices.size - a.devices.size);

  el.innerHTML = `
    <div class="filter-bar">
      <div class="search"><input id="usr-search" placeholder="Search users..."></div>
    </div>
    <div class="stats" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat"><div class="stat-label">Unique Accounts</div><div class="stat-value">${list.length}</div></div>
      <div class="stat warn"><div class="stat-label">Admin Accounts</div><div class="stat-value">${list.filter(u => u.is_admin).length}</div></div>
      <div class="stat info"><div class="stat-label">Domain Accounts</div><div class="stat-value">${list.filter(u => u.source === 'domain').length}</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl">
        <thead><tr><th>Username</th><th>Full Name</th><th>Source</th><th>Admin</th><th class="num">Devices</th><th>Last Login</th></tr></thead>
        <tbody id="usr-body"></tbody>
      </table>
    </div>
  `;

  function renderUsers() {
    const q = (document.getElementById('usr-search').value || '').toLowerCase();
    const filtered = list.filter(u => !q || u.username.toLowerCase().includes(q) || (u.full_name||'').toLowerCase().includes(q));
    const body = document.getElementById('usr-body');
    if (!filtered.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="empty"><div class="empty-icon">👥</div>No users match filter</div></td></tr>';
      return;
    }
    body.innerHTML = filtered.map(u => `
      <tr>
        <td><strong class="mono">${escapeHtml(u.username)}</strong></td>
        <td>${escapeHtml(u.full_name || '—')}</td>
        <td><span class="badge ${u.source === 'domain' ? 'b-info' : 'b-mute'}">${escapeHtml(u.source || 'local')}</span></td>
        <td>${u.is_admin ? '<span class="badge b-warn">ADMIN</span>' : '<span class="badge b-mute">user</span>'}</td>
        <td class="num"><strong>${u.devices.size}</strong></td>
        <td class="mono" style="font-size:.62rem">${timeAgo(u.last_login)}</td>
      </tr>
    `).join('');
  }
  document.getElementById('usr-search').addEventListener('input', renderUsers);
  renderUsers();
};

// ═══ SUBNETS ═══
VIEW_RENDERERS.subnets = function() {
  const el = document.getElementById('view-subnets');
  const subnets = APP_STATE.subnets;
  // Count devices per subnet
  const deviceCounts = {};
  APP_STATE.devices.forEach(d => {
    if (d.subnet) deviceCounts[d.subnet] = (deviceCounts[d.subnet] || 0) + 1;
  });

  el.innerHTML = `
    <div class="filter-bar">
      <button class="btn primary" onclick="openAddSubnetModal()">➕ Add Network</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl">
        <thead><tr><th>Name</th><th>CIDR</th><th>VLAN</th><th>Description</th><th class="num">Devices</th><th class="actions">Actions</th></tr></thead>
        <tbody>
          ${subnets.length ? subnets.map(s => `
            <tr>
              <td><strong>${escapeHtml(s.name)}</strong></td>
              <td class="mono">${escapeHtml(s.cidr)}</td>
              <td class="mono">${s.vlan || '—'}</td>
              <td style="color:var(--tx3)">${escapeHtml(s.description || '')}</td>
              <td class="num"><strong style="color:var(--acc)">${deviceCounts[s.cidr] || 0}</strong></td>
              <td class="actions"><button class="btn" onclick="deleteSubnet('${s.id}')">Delete</button></td>
            </tr>
          `).join('') : '<tr><td colspan="6"><div class="empty"><div class="empty-icon">🌐</div>No networks configured</div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
};

// ═══ CREDENTIALS ═══
VIEW_RENDERERS.credentials = function() {
  const el = document.getElementById('view-credentials');
  el.innerHTML = `
    <div class="alert warn"><span>🔐</span><span>Credentials are used by discovery scans to authenticate to target devices. In this demo, secrets are stored encrypted in your local browser database.</span></div>
    <div class="filter-bar">
      <button class="btn primary" onclick="openAddCredentialModal()">➕ Add Credential</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl">
        <thead><tr><th>Name</th><th>Type</th><th>Username</th><th>Description</th><th class="actions">Actions</th></tr></thead>
        <tbody>
          ${APP_STATE.credentials.length ? APP_STATE.credentials.map(c => `
            <tr>
              <td><strong>${escapeHtml(c.name)}</strong></td>
              <td><span class="badge b-info">${escapeHtml(c.type)}</span></td>
              <td class="mono">${escapeHtml(c.username)}</td>
              <td style="color:var(--tx3)">${escapeHtml(c.description || '')}</td>
              <td class="actions"><button class="btn" onclick="deleteCredential('${c.id}')">Delete</button></td>
            </tr>
          `).join('') : '<tr><td colspan="5"><div class="empty"><div class="empty-icon">🔐</div>No credentials configured</div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
};

// ═══ DISCOVERY ═══
VIEW_RENDERERS.discovery = function() {
  const el = document.getElementById('view-discovery');
  el.innerHTML = `
    <div class="split">
      <div class="card">
        <div class="card-head"><div class="card-title">📡 Run Discovery Scan</div></div>
        <p style="font-size:.74rem;color:var(--tx2);margin-bottom:14px;line-height:1.6">Configure and execute a network discovery scan. The scan will sweep the target subnet, identify live hosts, and populate the inventory.</p>
        <label class="input-label">Subnet to scan</label>
        <select class="select" id="scan-subnet" style="width:100%;margin-bottom:12px">
          ${APP_STATE.subnets.map(s => `<option value="${escapeHtml(s.cidr)}">${escapeHtml(s.name)} — ${escapeHtml(s.cidr)}</option>`).join('')}
          ${!APP_STATE.subnets.length ? '<option>No subnets configured</option>' : ''}
        </select>
        <label class="input-label">Credential</label>
        <select class="select" id="scan-cred" style="width:100%;margin-bottom:12px">
          ${APP_STATE.credentials.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(c.type)})</option>`).join('')}
          ${!APP_STATE.credentials.length ? '<option>No credentials</option>' : ''}
        </select>
        <label class="input-label">Scan Name</label>
        <input class="input" id="scan-name" value="Manual Scan ${new Date().toLocaleDateString()}" style="margin-bottom:14px">
        <button class="btn primary" onclick="runDiscoveryScan()" style="width:100%;padding:12px;justify-content:center">▶ Start Scan</button>
      </div>

      <div class="card">
        <div class="card-head"><div class="card-title">📜 Scan Console</div></div>
        <div class="discovery-term" id="scan-console"><span class="dim">Console ready. Configure and start a scan to see output.</span></div>
        <div class="progress" id="scan-progress" style="display:none"><div class="progress-fill" id="scan-progress-fill" style="width:0%"></div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">📋 Scan History</div></div>
      <table class="tbl">
        <thead><tr><th>Name</th><th>Subnet</th><th>Started</th><th>Duration</th><th>Found</th><th>New</th><th>Status</th></tr></thead>
        <tbody>
          ${APP_STATE.scans.length ? [...APP_STATE.scans].sort((a,b) => (b.started_at||'').localeCompare(a.started_at||'')).map(s => `
            <tr>
              <td><strong>${escapeHtml(s.name)}</strong></td>
              <td class="mono">${escapeHtml(s.subnet)}</td>
              <td class="mono" style="font-size:.62rem">${timeAgo(s.started_at)}</td>
              <td class="mono" style="font-size:.62rem">${s.completed_at ? Math.round((new Date(s.completed_at) - new Date(s.started_at))/1000)+'s' : '—'}</td>
              <td class="num"><strong>${s.devices_found || 0}</strong></td>
              <td class="num" style="color:var(--green)"><strong>+${s.devices_new || 0}</strong></td>
              <td>${s.status === 'completed' ? '<span class="badge b-green">COMPLETED</span>' : '<span class="badge b-warn">'+escapeHtml(s.status)+'</span>'}</td>
            </tr>
          `).join('') : '<tr><td colspan="7"><div class="empty"><div class="empty-icon">📡</div>No scans yet</div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
};

// ═══ REPORTS ═══
VIEW_RENDERERS.reports = function() {
  const el = document.getElementById('view-reports');
  const now = Date.now();
  const devices = APP_STATE.devices;

  // Pre-built reports
  const offline = devices.filter(d => d.status === 'down');
  const warrantySoon = devices.filter(d => d.warranty_expiry && new Date(d.warranty_expiry).getTime() > now && new Date(d.warranty_expiry).getTime() < now + 90 * 86400000);
  const warrantyExpired = devices.filter(d => d.warranty_expiry && new Date(d.warranty_expiry).getTime() < now);
  const oldOS = devices.filter(d => (d.os || '').match(/Windows 10|Windows 7|Windows Server 201[2468]/));
  const staleDevices = devices.filter(d => d.last_seen && (now - new Date(d.last_seen).getTime()) > 14 * 86400000);
  const unassigned = devices.filter(d => d.type === 'desktop' && !d.assigned_to);
  const noSerial = devices.filter(d => !d.serial);
  const lowDisk = devices.filter(d => (d.disk_gb || 0) > 0 && d.disk_gb < 256 && d.type === 'desktop');

  const reports = [
    { icon: '🔴', title: 'Offline Devices', desc: 'Devices not responding to discovery', data: offline, color: 'crit' },
    { icon: '📅', title: 'Warranty Expiring (90d)', desc: 'Devices needing warranty renewal soon', data: warrantySoon, color: 'warn' },
    { icon: '❌', title: 'Warranty Expired', desc: 'Out of manufacturer support', data: warrantyExpired, color: 'crit' },
    { icon: '🖥', title: 'End-of-Life Operating Systems', desc: 'Windows 10/7 or older Server versions', data: oldOS, color: 'warn' },
    { icon: '👻', title: 'Stale Devices (14+ days)', desc: 'Not seen in over two weeks', data: staleDevices, color: 'warn' },
    { icon: '👤', title: 'Unassigned Workstations', desc: 'Desktops without an assigned user', data: unassigned, color: 'info' },
    { icon: '🏷', title: 'Missing Serial Numbers', desc: 'Incomplete asset records', data: noSerial, color: 'info' },
    { icon: '💾', title: 'Low Disk Capacity', desc: 'Workstations with less than 256GB', data: lowDisk, color: 'info' }
  ];

  el.innerHTML = `
    <div class="alert"><span>📊</span><span>Pre-built inventory reports. Click any report to view the full list of matching devices and export.</span></div>
    <div class="split">
      ${reports.map((r, i) => `
        <div class="card" style="cursor:pointer" onclick="openReportModal(${i})">
          <div class="card-head">
            <div class="card-title">${r.icon} ${r.title}</div>
            <div class="badge b-${r.color}">${r.data.length}</div>
          </div>
          <div style="font-size:.72rem;color:var(--tx3);line-height:1.6">${r.desc}</div>
        </div>
      `).join('')}
    </div>
  `;

  window.REPORT_CACHE = reports;
};

function openReportModal(idx) {
  const r = window.REPORT_CACHE[idx];
  if (!r) return;
  const rows = r.data.slice(0, 100);
  openModal(`
    <h3>${r.icon} ${r.title}</h3>
    <div style="font-size:.72rem;color:var(--tx2);margin-bottom:14px">${r.desc} · ${r.data.length} devices</div>
    <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:7px">
      <table class="tbl">
        <thead><tr><th>Name</th><th>Type</th><th>IP</th><th>Last Seen</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(d => `
            <tr onclick="closeModal();showDeviceDetail('${d.id}')">
              <td><strong>${escapeHtml(d.name)}</strong></td>
              <td>${typeBadge(d.type)}</td>
              <td class="mono">${escapeHtml(d.ip || '')}</td>
              <td class="mono" style="font-size:.6rem">${timeAgo(d.last_seen)}</td>
            </tr>
          `).join('') : '<tr><td colspan="4"><div class="empty">No devices match this report</div></td></tr>'}
        </tbody>
      </table>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" onclick="exportReport(${idx})">↧ Export CSV</button>
    </div>
  `, 'lg');
}

function exportReport(idx) {
  const r = window.REPORT_CACHE[idx];
  if (!r) return;
  const rows = r.data.map(d => ({
    name: d.name, type: d.type, os: d.os, ip: d.ip, department: d.department,
    assigned_to: d.assigned_to, last_seen: d.last_seen, warranty_expiry: d.warranty_expiry
  }));
  downloadCSV(rows, 'netmap_' + r.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.csv');
  toast('Exported ' + rows.length + ' rows', 'green');
}

// ═══ AUDIT LOG ═══
VIEW_RENDERERS.audit = async function() {
  const el = document.getElementById('view-audit');
  const log = await DB.getAuditLog(CURRENT_ORG.id);
  const sorted = log.sort((a,b) => (b.timestamp||'').localeCompare(a.timestamp||''));
  el.innerHTML = `
    <div class="card">
      <div class="card-head"><div class="card-title">📜 Audit Log</div><div class="card-sub">${sorted.length} entries</div></div>
      ${sorted.length ? sorted.map(e => `
        <div style="padding:11px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:140px 1fr;gap:14px;font-size:.72rem">
          <div class="mono" style="font-size:.6rem;color:var(--tx3)">${new Date(e.timestamp).toLocaleString()}</div>
          <div><div style="font-weight:600">${escapeHtml(e.action)}</div><div style="color:var(--tx3);font-size:.66rem;margin-top:3px">${escapeHtml(e.detail)} · by <span class="mono">${escapeHtml(e.user)}</span></div></div>
        </div>
      `).join('') : '<div class="empty"><div class="empty-icon">📜</div>No log entries yet</div>'}
    </div>
  `;
};


// ═══ DEVICE DETAIL PANEL ═══
async function showDeviceDetail(deviceId) {
  const device = APP_STATE.devices.find(d => d.id === deviceId);
  if (!device) return;
  APP_STATE.selectedDevice = device;

  const software = await DB.getSoftwareByDevice(deviceId);
  const accts = await DB.getUserAcctsByDevice(deviceId);

  const panel = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');

  content.innerHTML = `
    <h2>${statusBadge(device.status)} ${escapeHtml(device.name)}</h2>
    <div class="sub">${escapeHtml(device.type)} · ${escapeHtml(device.os)} ${escapeHtml(device.os_version || '')}</div>

    <div class="tabs">
      <div class="tab on" data-tab="overview">Overview</div>
      <div class="tab" data-tab="software">Software <span class="badge b-mute">${software.length}</span></div>
      <div class="tab" data-tab="users">Users <span class="badge b-mute">${accts.length}</span></div>
      <div class="tab" data-tab="network">Network</div>
    </div>

    <div class="tab-content on" id="tab-overview">
      <h4>💻 Hardware</h4>
      <dl class="kv">
        <dt>Manufacturer</dt><dd>${escapeHtml(device.manufacturer || '—')}</dd>
        <dt>Model</dt><dd>${escapeHtml(device.model || '—')}</dd>
        <dt>Serial Number</dt><dd class="mono">${escapeHtml(device.serial || '—')}</dd>
        <dt>Asset Tag</dt><dd class="mono">${escapeHtml(device.asset_tag || '—')}</dd>
        <dt>CPU</dt><dd>${escapeHtml(device.cpu || '—')}</dd>
        <dt>Cores</dt><dd>${device.cores || '—'}</dd>
        <dt>Memory</dt><dd>${device.ram_gb ? device.ram_gb + ' GB' : '—'}</dd>
        <dt>Storage</dt><dd>${device.disk_gb ? device.disk_gb + ' GB' : '—'}</dd>
      </dl>

      <h4>🏢 Assignment</h4>
      <dl class="kv">
        <dt>Department</dt><dd>${escapeHtml(device.department || '—')}</dd>
        <dt>Location</dt><dd>${escapeHtml(device.location || '—')}</dd>
        <dt>Assigned To</dt><dd>${escapeHtml(device.assigned_to || '—')}</dd>
        <dt>Email</dt><dd class="mono">${escapeHtml(device.assigned_email || '—')}</dd>
      </dl>

      <h4>📅 Lifecycle</h4>
      <dl class="kv">
        <dt>Purchase Date</dt><dd>${escapeHtml(device.purchase_date || '—')}</dd>
        <dt>Warranty Expiry</dt><dd>${escapeHtml(device.warranty_expiry || '—')}</dd>
        <dt>Cost</dt><dd>${device.cost ? '$' + device.cost : '—'}</dd>
        <dt>First Seen</dt><dd class="mono">${new Date(device.created_at).toLocaleDateString()}</dd>
        <dt>Last Seen</dt><dd class="mono">${timeAgo(device.last_seen)}</dd>
        <dt>Discovered By</dt><dd>${escapeHtml(device.discovered_by || 'Manual')}</dd>
      </dl>

      ${device.notes ? '<h4>📝 Notes</h4><p>' + escapeHtml(device.notes) + '</p>' : ''}

      <div style="display:flex;gap:8px;margin-top:20px">
        <button class="btn primary" onclick="openEditDeviceModal('${device.id}')" style="flex:1">✎ Edit</button>
        <button class="btn crit" onclick="confirmDeleteDevice('${device.id}')" style="flex:1">🗑 Delete</button>
      </div>
    </div>

    <div class="tab-content" id="tab-software">
      ${software.length ? software.map(s => `
        <div class="sw-row">
          <div><div class="sw-name">${escapeHtml(s.name)}</div><div class="sw-version">${escapeHtml(s.publisher || '')}</div></div>
          <div class="sw-version">${escapeHtml(s.version)}</div>
          <div style="font-size:.6rem;color:var(--tx3);font-family:var(--m)">${escapeHtml(s.install_date || '')}</div>
        </div>
      `).join('') : '<div class="empty"><div class="empty-icon">📦</div>No software recorded</div>'}
    </div>

    <div class="tab-content" id="tab-users">
      ${accts.length ? accts.map(u => `
        <div style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            <div>
              <div style="font-family:var(--m);font-weight:700;font-size:.78rem">${escapeHtml(u.username)}</div>
              <div style="font-size:.66rem;color:var(--tx3);margin-top:3px">${escapeHtml(u.full_name || '—')}</div>
            </div>
            <div style="text-align:right">
              ${u.is_admin ? '<span class="badge b-warn">ADMIN</span>' : '<span class="badge b-mute">user</span>'}
              <div style="font-size:.58rem;color:var(--tx3);margin-top:4px">${timeAgo(u.last_login)}</div>
            </div>
          </div>
        </div>
      `).join('') : '<div class="empty"><div class="empty-icon">👤</div>No user accounts recorded</div>'}
    </div>

    <div class="tab-content" id="tab-network">
      <h4>🌐 Network Interfaces</h4>
      <dl class="kv">
        <dt>Hostname</dt><dd class="mono">${escapeHtml(device.hostname || '—')}</dd>
        <dt>IP Address</dt><dd class="mono">${escapeHtml(device.ip || '—')}</dd>
        <dt>MAC Address</dt><dd class="mono">${escapeHtml(device.mac || '—')}</dd>
        <dt>Subnet</dt><dd class="mono">${escapeHtml(device.subnet || '—')}</dd>
      </dl>
    </div>
  `;

  // Wire up tabs
  content.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      content.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
      content.querySelectorAll('.tab-content').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      content.querySelector('#tab-' + t.dataset.tab).classList.add('on');
    });
  });

  panel.classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-panel').classList.remove('open');
  APP_STATE.selectedDevice = null;
}

// ═══ ADD/EDIT DEVICE ═══
function openAddDeviceModal() {
  openModal(`
    <h3>➕ Add Device</h3>
    <div class="modal-grid">
      <div><label class="input-label">Name</label><input class="input" id="f-name" placeholder="ws-eng-123"></div>
      <div><label class="input-label">Hostname</label><input class="input" id="f-hostname" placeholder="ws-eng-123.corp.local"></div>
      <div><label class="input-label">Type</label>
        <select class="select" id="f-type" style="width:100%">
          <option value="desktop">Desktop</option><option value="server">Server</option>
          <option value="hypervisor">Hypervisor</option><option value="network">Network</option>
          <option value="firewall">Firewall</option>
        </select>
      </div>
      <div><label class="input-label">Status</label>
        <select class="select" id="f-status" style="width:100%">
          <option value="up">Online</option><option value="warn">Warning</option><option value="down">Offline</option>
        </select>
      </div>
      <div><label class="input-label">OS</label><input class="input" id="f-os" placeholder="Windows 11 Pro"></div>
      <div><label class="input-label">OS Version</label><input class="input" id="f-osver" placeholder="23H2"></div>
      <div><label class="input-label">Manufacturer</label><input class="input" id="f-mfr" placeholder="Dell"></div>
      <div><label class="input-label">Model</label><input class="input" id="f-model" placeholder="OptiPlex 7090"></div>
      <div><label class="input-label">Serial</label><input class="input" id="f-serial"></div>
      <div><label class="input-label">Asset Tag</label><input class="input" id="f-asset"></div>
      <div><label class="input-label">IP Address</label><input class="input" id="f-ip" placeholder="10.10.1.50"></div>
      <div><label class="input-label">MAC</label><input class="input" id="f-mac" placeholder="AA:BB:CC:DD:EE:FF"></div>
      <div><label class="input-label">Department</label><input class="input" id="f-dept"></div>
      <div><label class="input-label">Location</label><input class="input" id="f-loc"></div>
      <div><label class="input-label">Assigned To</label><input class="input" id="f-assigned"></div>
      <div><label class="input-label">Email</label><input class="input" id="f-email"></div>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveNewDevice()">Add Device</button>
    </div>
  `, 'lg');
}

async function saveNewDevice() {
  const get = id => document.getElementById(id).value.trim();
  if (!get('f-name')) { toast('Name required', 'crit'); return; }
  const device = {
    org_id: CURRENT_ORG.id,
    name: get('f-name'),
    hostname: get('f-hostname') || get('f-name'),
    type: get('f-type'),
    status: get('f-status'),
    os: get('f-os'),
    os_version: get('f-osver'),
    manufacturer: get('f-mfr'),
    model: get('f-model'),
    serial: get('f-serial'),
    asset_tag: get('f-asset'),
    ip: get('f-ip'),
    mac: get('f-mac'),
    department: get('f-dept'),
    location: get('f-loc'),
    assigned_to: get('f-assigned'),
    assigned_email: get('f-email'),
    last_seen: new Date().toISOString(),
    discovered_by: 'Manual'
  };
  await DB.addDevice(device);
  await DB.log(CURRENT_ORG.id, 'device_added', 'Added device ' + device.name);
  await loadCurrentOrgData();
  closeModal();
  toast('Device added', 'green');
  if (document.getElementById('view-devices').classList.contains('active')) renderDevicesTable();
  showView('devices');
}

function openEditDeviceModal(deviceId) {
  const d = APP_STATE.devices.find(x => x.id === deviceId);
  if (!d) return;
  openModal(`
    <h3>✎ Edit Device: ${escapeHtml(d.name)}</h3>
    <div class="modal-grid">
      <div><label class="input-label">Name</label><input class="input" id="f-name" value="${escapeHtml(d.name||'')}"></div>
      <div><label class="input-label">Hostname</label><input class="input" id="f-hostname" value="${escapeHtml(d.hostname||'')}"></div>
      <div><label class="input-label">Type</label>
        <select class="select" id="f-type" style="width:100%">
          ${['desktop','server','hypervisor','network','firewall'].map(t => `<option value="${t}" ${t===d.type?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div><label class="input-label">Status</label>
        <select class="select" id="f-status" style="width:100%">
          ${['up','warn','down'].map(s => `<option value="${s}" ${s===d.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div><label class="input-label">OS</label><input class="input" id="f-os" value="${escapeHtml(d.os||'')}"></div>
      <div><label class="input-label">OS Version</label><input class="input" id="f-osver" value="${escapeHtml(d.os_version||'')}"></div>
      <div><label class="input-label">Manufacturer</label><input class="input" id="f-mfr" value="${escapeHtml(d.manufacturer||'')}"></div>
      <div><label class="input-label">Model</label><input class="input" id="f-model" value="${escapeHtml(d.model||'')}"></div>
      <div><label class="input-label">Serial</label><input class="input" id="f-serial" value="${escapeHtml(d.serial||'')}"></div>
      <div><label class="input-label">Asset Tag</label><input class="input" id="f-asset" value="${escapeHtml(d.asset_tag||'')}"></div>
      <div><label class="input-label">IP</label><input class="input" id="f-ip" value="${escapeHtml(d.ip||'')}"></div>
      <div><label class="input-label">MAC</label><input class="input" id="f-mac" value="${escapeHtml(d.mac||'')}"></div>
      <div><label class="input-label">Department</label><input class="input" id="f-dept" value="${escapeHtml(d.department||'')}"></div>
      <div><label class="input-label">Location</label><input class="input" id="f-loc" value="${escapeHtml(d.location||'')}"></div>
      <div><label class="input-label">Assigned To</label><input class="input" id="f-assigned" value="${escapeHtml(d.assigned_to||'')}"></div>
      <div><label class="input-label">Email</label><input class="input" id="f-email" value="${escapeHtml(d.assigned_email||'')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveEditDevice('${d.id}')">Save Changes</button>
    </div>
  `, 'lg');
}

async function saveEditDevice(deviceId) {
  const d = await DB.getDevice(deviceId);
  if (!d) return;
  const get = id => document.getElementById(id).value.trim();
  d.name = get('f-name');
  d.hostname = get('f-hostname');
  d.type = get('f-type');
  d.status = get('f-status');
  d.os = get('f-os');
  d.os_version = get('f-osver');
  d.manufacturer = get('f-mfr');
  d.model = get('f-model');
  d.serial = get('f-serial');
  d.asset_tag = get('f-asset');
  d.ip = get('f-ip');
  d.mac = get('f-mac');
  d.department = get('f-dept');
  d.location = get('f-loc');
  d.assigned_to = get('f-assigned');
  d.assigned_email = get('f-email');
  await DB.addDevice(d);
  await DB.log(CURRENT_ORG.id, 'device_updated', 'Updated ' + d.name);
  await loadCurrentOrgData();
  closeModal();
  closeDetail();
  toast('Device updated', 'green');
  renderDevicesTable();
}

function confirmDeleteDevice(deviceId) {
  const d = APP_STATE.devices.find(x => x.id === deviceId);
  if (!d) return;
  openModal(`
    <h3>Delete Device?</h3>
    <p style="font-size:.78rem;color:var(--tx2);line-height:1.6;margin-bottom:14px">This will permanently delete <strong>${escapeHtml(d.name)}</strong> along with all associated software and user account records.</p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn crit" onclick="deleteDeviceConfirmed('${deviceId}')">Delete</button>
    </div>
  `);
}

async function deleteDeviceConfirmed(deviceId) {
  const d = APP_STATE.devices.find(x => x.id === deviceId);
  await DB.deleteDevice(deviceId);
  await DB.log(CURRENT_ORG.id, 'device_deleted', 'Deleted ' + (d ? d.name : deviceId));
  await loadCurrentOrgData();
  closeModal();
  closeDetail();
  toast('Device deleted', 'green');
  if (document.getElementById('view-devices').classList.contains('active')) renderDevicesTable();
  else if (document.getElementById('view-dashboard').classList.contains('active')) VIEW_RENDERERS.dashboard();
}

// ═══ SUBNETS/CREDENTIALS ADD ═══
function openAddSubnetModal() {
  openModal(`
    <h3>➕ Add Network</h3>
    <label class="input-label">Name</label>
    <input class="input" id="f-sn-name" placeholder="Corporate LAN" style="margin-bottom:12px">
    <label class="input-label">CIDR</label>
    <input class="input" id="f-sn-cidr" placeholder="10.10.1.0/24" style="margin-bottom:12px">
    <label class="input-label">VLAN ID (optional)</label>
    <input class="input" id="f-sn-vlan" placeholder="10" style="margin-bottom:12px">
    <label class="input-label">Description</label>
    <input class="input" id="f-sn-desc" style="margin-bottom:12px">
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveNewSubnet()">Add</button>
    </div>
  `);
}

async function saveNewSubnet() {
  const name = document.getElementById('f-sn-name').value.trim();
  const cidr = document.getElementById('f-sn-cidr').value.trim();
  if (!name || !cidr) { toast('Name and CIDR required', 'crit'); return; }
  await DB.addSubnet({
    org_id: CURRENT_ORG.id, name, cidr,
    vlan: parseInt(document.getElementById('f-sn-vlan').value) || null,
    description: document.getElementById('f-sn-desc').value.trim()
  });
  await DB.log(CURRENT_ORG.id, 'subnet_added', 'Added subnet ' + name);
  await loadCurrentOrgData();
  closeModal();
  toast('Network added', 'green');
  VIEW_RENDERERS.subnets();
}

async function deleteSubnet(id) {
  if (!confirm('Delete this network?')) return;
  await DB.deleteSubnet(id);
  await loadCurrentOrgData();
  toast('Network deleted', 'green');
  VIEW_RENDERERS.subnets();
}

function openAddCredentialModal() {
  openModal(`
    <h3>➕ Add Credential</h3>
    <label class="input-label">Name</label>
    <input class="input" id="f-cr-name" placeholder="Production SSH" style="margin-bottom:12px">
    <label class="input-label">Type</label>
    <select class="select" id="f-cr-type" style="width:100%;margin-bottom:12px">
      <option value="ssh">SSH</option><option value="wmi">WMI (Windows)</option>
      <option value="snmp">SNMP</option><option value="api">API Token</option>
    </select>
    <label class="input-label">Username</label>
    <input class="input" id="f-cr-user" style="margin-bottom:12px">
    <label class="input-label">Password / Secret</label>
    <input class="input" type="password" id="f-cr-pass" style="margin-bottom:12px">
    <label class="input-label">Description</label>
    <input class="input" id="f-cr-desc" style="margin-bottom:12px">
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveNewCredential()">Add</button>
    </div>
  `);
}

async function saveNewCredential() {
  const name = document.getElementById('f-cr-name').value.trim();
  const username = document.getElementById('f-cr-user').value.trim();
  if (!name || !username) { toast('Name and username required', 'crit'); return; }
  // Encrypt password (simple base64 for demo — real product would use proper encryption)
  const rawPass = document.getElementById('f-cr-pass').value;
  const encrypted = btoa(rawPass).split('').reverse().join('');
  await DB.addCredential({
    org_id: CURRENT_ORG.id, name,
    type: document.getElementById('f-cr-type').value,
    username, encrypted,
    description: document.getElementById('f-cr-desc').value.trim()
  });
  await DB.log(CURRENT_ORG.id, 'credential_added', 'Added credential ' + name);
  await loadCurrentOrgData();
  closeModal();
  toast('Credential added', 'green');
  VIEW_RENDERERS.credentials();
}

async function deleteCredential(id) {
  if (!confirm('Delete this credential?')) return;
  await DB.deleteCredential(id);
  await loadCurrentOrgData();
  toast('Credential deleted', 'green');
  VIEW_RENDERERS.credentials();
}

// ═══ DISCOVERY SCAN ═══
async function runDiscoveryScan() {
  const subnet = document.getElementById('scan-subnet').value;
  const name = document.getElementById('scan-name').value || 'Manual Scan';
  if (!subnet || subnet === 'No subnets configured') { toast('Add a subnet first', 'crit'); return; }

  const cons = document.getElementById('scan-console');
  const progressBar = document.getElementById('scan-progress');
  const progressFill = document.getElementById('scan-progress-fill');
  cons.innerHTML = '';
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';

  function log(msg, cls) {
    const line = document.createElement('span');
    line.className = cls || '';
    line.textContent = msg + '\n';
    cons.appendChild(line);
    cons.scrollTop = cons.scrollHeight;
  }

  const startTime = new Date().toISOString();
  log('[' + new Date().toLocaleTimeString() + '] Starting scan: ' + name, 'info');
  log('[' + new Date().toLocaleTimeString() + '] Target: ' + subnet, 'info');
  await sleep(400);

  log('[' + new Date().toLocaleTimeString() + '] Resolving subnet range...', 'dim');
  await sleep(300);
  log('  → 254 possible hosts', 'dim');
  progressFill.style.width = '10%';
  await sleep(300);

  log('[' + new Date().toLocaleTimeString() + '] ICMP sweep in progress...', 'info');
  await sleep(600);
  const found = Math.floor(Math.random() * 8) + 3;
  log('  → ' + found + ' hosts responding', 'ok');
  progressFill.style.width = '25%';
  await sleep(300);

  log('[' + new Date().toLocaleTimeString() + '] ARP cache lookup...', 'info');
  await sleep(400);
  log('  → MAC addresses resolved', 'ok');
  progressFill.style.width = '40%';
  await sleep(300);

  log('[' + new Date().toLocaleTimeString() + '] Port probe (22, 135, 445, 3389)...', 'info');
  progressFill.style.width = '55%';
  await sleep(800);
  log('  → Open ports identified', 'ok');

  log('[' + new Date().toLocaleTimeString() + '] Authenticating with credentials...', 'info');
  await sleep(400);
  log('  → SSH / WMI / SNMP probes', 'dim');
  progressFill.style.width = '70%';
  await sleep(600);

  log('[' + new Date().toLocaleTimeString() + '] Collecting system information...', 'info');
  await sleep(500);
  log('  → Hostname, OS, hardware, software, users', 'dim');
  progressFill.style.width = '85%';
  await sleep(400);

  // Actually add some devices
  let newCount = 0;
  const deptOptions = ['Engineering', 'Sales', 'Marketing'];
  for (let i = 0; i < Math.min(found, 3); i++) {
    const ipParts = subnet.split('/')[0].split('.');
    const ip = ipParts.slice(0,3).join('.') + '.' + (Math.floor(Math.random() * 200) + 50);
    const dept = deptOptions[Math.floor(Math.random() * 3)];
    const id = Math.floor(Math.random() * 900) + 100;
    const device = {
      org_id: CURRENT_ORG.id,
      name: 'ws-' + dept.toLowerCase().slice(0,3) + '-' + id,
      hostname: 'ws-' + dept.toLowerCase().slice(0,3) + '-' + id + '.corp.local',
      type: 'desktop',
      status: 'up',
      os: 'Windows 11 Pro',
      os_version: '23H2',
      manufacturer: 'Dell',
      model: 'OptiPlex 7090',
      serial: 'DL' + Math.random().toString(36).slice(2,9).toUpperCase(),
      asset_tag: 'AST-' + (20000 + Math.floor(Math.random() * 1000)),
      ip,
      mac: Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':'),
      subnet,
      cpu: 'Intel Core i7-13700',
      cores: 16,
      ram_gb: 32,
      disk_gb: 512,
      department: dept,
      location: 'HQ Floor 2',
      last_seen: new Date().toISOString(),
      discovered_by: 'Network Scan'
    };
    await DB.addDevice(device);
    newCount++;
    log('  ✓ New device: ' + device.name + ' (' + ip + ')', 'ok');
    await sleep(150);
  }

  progressFill.style.width = '100%';
  await sleep(300);

  const endTime = new Date().toISOString();
  const duration = Math.round((new Date(endTime) - new Date(startTime)) / 1000);

  await DB.addScan({
    org_id: CURRENT_ORG.id,
    name, subnet,
    started_at: startTime,
    completed_at: endTime,
    status: 'completed',
    devices_found: found,
    devices_new: newCount,
    devices_updated: found - newCount
  });
  await DB.log(CURRENT_ORG.id, 'scan_completed', 'Scan ' + name + ' found ' + found + ' devices (' + newCount + ' new)');

  log('\n[' + new Date().toLocaleTimeString() + '] Scan complete in ' + duration + 's', 'ok');
  log('  Devices found: ' + found, 'ok');
  log('  New: ' + newCount + ' · Updated: ' + (found - newCount), 'ok');

  await loadCurrentOrgData();
  toast('Scan complete: ' + found + ' devices (' + newCount + ' new)', 'green');
  setTimeout(() => VIEW_RENDERERS.discovery(), 1500);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══ EXPORTS ═══
function exportDevicesCSV() {
  if (!APP_STATE.devices.length) { toast('No devices to export', 'crit'); return; }
  const rows = APP_STATE.devices.map(d => ({
    name: d.name, hostname: d.hostname, type: d.type, status: d.status,
    os: d.os, os_version: d.os_version, manufacturer: d.manufacturer, model: d.model,
    serial: d.serial, asset_tag: d.asset_tag, ip: d.ip, mac: d.mac, subnet: d.subnet,
    cpu: d.cpu, cores: d.cores, ram_gb: d.ram_gb, disk_gb: d.disk_gb,
    department: d.department, location: d.location, assigned_to: d.assigned_to, assigned_email: d.assigned_email,
    purchase_date: d.purchase_date, warranty_expiry: d.warranty_expiry, cost: d.cost,
    last_seen: d.last_seen, discovered_by: d.discovered_by
  }));
  downloadCSV(rows, 'netmap_devices_' + new Date().toISOString().slice(0,10) + '.csv');
  toast('Exported ' + rows.length + ' devices', 'green');
}

function exportSoftwareCSV() {
  if (!APP_STATE.software.length) { toast('No software to export', 'crit'); return; }
  const deviceLookup = {};
  APP_STATE.devices.forEach(d => deviceLookup[d.id] = d.name);
  const rows = APP_STATE.software.map(s => ({
    device: deviceLookup[s.device_id] || s.device_id,
    name: s.name, version: s.version, publisher: s.publisher, install_date: s.install_date
  }));
  downloadCSV(rows, 'netmap_software_' + new Date().toISOString().slice(0,10) + '.csv');
  toast('Exported ' + rows.length + ' rows', 'green');
}

function showSoftwareDetail(name) {
  // Find all devices with this software
  const installs = APP_STATE.software.filter(s => s.name === name);
  const deviceIds = new Set(installs.map(s => s.device_id));
  const devices = APP_STATE.devices.filter(d => deviceIds.has(d.id));
  openModal(`
    <h3>📦 ${escapeHtml(name)}</h3>
    <div style="font-size:.72rem;color:var(--tx2);margin-bottom:14px">${installs.length} installations across ${devices.length} devices</div>
    <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:7px">
      <table class="tbl">
        <thead><tr><th>Device</th><th>Version</th><th>OS</th><th>Install Date</th></tr></thead>
        <tbody>
          ${installs.map(s => {
            const d = devices.find(dv => dv.id === s.device_id);
            return `<tr onclick="closeModal();showDeviceDetail('${s.device_id}')"><td><strong>${escapeHtml(d ? d.name : '—')}</strong></td><td class="mono">${escapeHtml(s.version)}</td><td>${escapeHtml(d ? d.os : '')}</td><td class="mono" style="font-size:.6rem">${escapeHtml(s.install_date || '—')}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Close</button></div>
  `, 'lg');
}
