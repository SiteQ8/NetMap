// ═══════════════════════════════════════
// NetMap Database Layer (IndexedDB)
// ═══════════════════════════════════════

const DB_NAME = 'netmap_db';
const DB_VERSION = 1;

const STORES = {
  users:       { keyPath: 'username', indexes: [] },
  orgs:        { keyPath: 'id', indexes: ['owner'] },
  devices:     { keyPath: 'id', indexes: ['org_id', 'type', 'os', 'status', 'subnet'] },
  software:    { keyPath: 'id', indexes: ['org_id', 'device_id', 'name'] },
  user_accts:  { keyPath: 'id', indexes: ['org_id', 'device_id', 'username'] },
  credentials: { keyPath: 'id', indexes: ['org_id', 'type'] },
  subnets:     { keyPath: 'id', indexes: ['org_id'] },
  scans:       { keyPath: 'id', indexes: ['org_id', 'started_at'] },
  audit_log:   { keyPath: 'id', indexes: ['org_id', 'timestamp'] }
};

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      Object.entries(STORES).forEach(([name, def]) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: def.keyPath });
          def.indexes.forEach(idx => store.createIndex(idx, idx, { unique: false }));
        }
      });
    };
  });
}

async function tx(storeNames, mode) {
  const db = await openDB();
  return db.transaction(storeNames, mode);
}

// Generic CRUD
async function dbPut(storeName, obj) {
  const t = await tx([storeName], 'readwrite');
  return new Promise((resolve, reject) => {
    const req = t.objectStore(storeName).put(obj);
    req.onsuccess = () => resolve(obj);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(storeName, key) {
  const t = await tx([storeName], 'readonly');
  return new Promise((resolve, reject) => {
    const req = t.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(storeName, key) {
  const t = await tx([storeName], 'readwrite');
  return new Promise((resolve, reject) => {
    const req = t.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbAll(storeName, indexName, value) {
  const t = await tx([storeName], 'readonly');
  const store = t.objectStore(storeName);
  const source = indexName ? store.index(indexName) : store;
  return new Promise((resolve, reject) => {
    const results = [];
    const req = value !== undefined ? source.openCursor(IDBKeyRange.only(value)) : source.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

async function dbCount(storeName, indexName, value) {
  const t = await tx([storeName], 'readonly');
  const store = t.objectStore(storeName);
  const source = indexName ? store.index(indexName) : store;
  return new Promise((resolve, reject) => {
    const req = value !== undefined ? source.count(IDBKeyRange.only(value)) : source.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbClear(storeName) {
  const t = await tx([storeName], 'readwrite');
  return new Promise((resolve, reject) => {
    const req = t.objectStore(storeName).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Specialized helpers
const DB = {
  // Users (auth)
  async createUser(username, hash, salt) {
    const user = { username, hash, salt, created_at: new Date().toISOString() };
    await dbPut('users', user);
    return user;
  },
  async getUser(username) { return dbGet('users', username); },

  // Orgs
  async createOrg(name, owner) {
    const id = 'org_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const org = { id, name, owner, created_at: new Date().toISOString() };
    await dbPut('orgs', org);
    return org;
  },
  async getOrgsByOwner(owner) { return dbAll('orgs', 'owner', owner); },
  async getOrg(id) { return dbGet('orgs', id); },
  async deleteOrg(id) {
    // Cascade delete
    const stores = ['devices', 'software', 'user_accts', 'credentials', 'subnets', 'scans', 'audit_log'];
    for (const s of stores) {
      const items = await dbAll(s, 'org_id', id);
      for (const item of items) await dbDelete(s, item.id);
    }
    await dbDelete('orgs', id);
  },

  // Devices
  async addDevice(device) {
    if (!device.id) device.id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    if (!device.created_at) device.created_at = new Date().toISOString();
    device.updated_at = new Date().toISOString();
    await dbPut('devices', device);
    return device;
  },
  async getDevice(id) { return dbGet('devices', id); },
  async getDevices(orgId) { return dbAll('devices', 'org_id', orgId); },
  async deleteDevice(id) {
    const sw = await dbAll('software', 'device_id', id);
    for (const s of sw) await dbDelete('software', s.id);
    const ua = await dbAll('user_accts', 'device_id', id);
    for (const u of ua) await dbDelete('user_accts', u.id);
    await dbDelete('devices', id);
  },

  // Software
  async addSoftware(sw) {
    if (!sw.id) sw.id = 'sw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    await dbPut('software', sw);
    return sw;
  },
  async getSoftwareByDevice(deviceId) { return dbAll('software', 'device_id', deviceId); },
  async getSoftwareByOrg(orgId) { return dbAll('software', 'org_id', orgId); },

  // User accounts on devices
  async addUserAcct(ua) {
    if (!ua.id) ua.id = 'ua_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    await dbPut('user_accts', ua);
    return ua;
  },
  async getUserAcctsByDevice(deviceId) { return dbAll('user_accts', 'device_id', deviceId); },
  async getUserAcctsByOrg(orgId) { return dbAll('user_accts', 'org_id', orgId); },

  // Credentials (discovery)
  async addCredential(cred) {
    if (!cred.id) cred.id = 'cred_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    cred.created_at = cred.created_at || new Date().toISOString();
    await dbPut('credentials', cred);
    return cred;
  },
  async getCredentials(orgId) { return dbAll('credentials', 'org_id', orgId); },
  async deleteCredential(id) { return dbDelete('credentials', id); },

  // Subnets
  async addSubnet(subnet) {
    if (!subnet.id) subnet.id = 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    subnet.created_at = subnet.created_at || new Date().toISOString();
    await dbPut('subnets', subnet);
    return subnet;
  },
  async getSubnets(orgId) { return dbAll('subnets', 'org_id', orgId); },
  async deleteSubnet(id) { return dbDelete('subnets', id); },

  // Scans
  async addScan(scan) {
    if (!scan.id) scan.id = 'scan_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    await dbPut('scans', scan);
    return scan;
  },
  async getScans(orgId) { return dbAll('scans', 'org_id', orgId); },

  // Audit log
  async log(orgId, action, detail) {
    const entry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      org_id: orgId,
      timestamp: new Date().toISOString(),
      action,
      detail,
      user: CURRENT_USER ? CURRENT_USER.username : 'system'
    };
    await dbPut('audit_log', entry);
    return entry;
  },
  async getAuditLog(orgId) { return dbAll('audit_log', 'org_id', orgId); }
};

// Expose
window.DB = DB;
window.dbPut = dbPut;
window.dbGet = dbGet;
window.dbDelete = dbDelete;
window.dbAll = dbAll;
window.dbClear = dbClear;
