// ═══════════════════════════════════════
// NetMap Demo Seed Data
// Builds a realistic 87-device inventory
// ═══════════════════════════════════════

const OS_LIST = [
  { name: 'Windows 11 Pro', ver: '23H2', type: 'desktop', weight: 25 },
  { name: 'Windows 11 Enterprise', ver: '23H2', type: 'desktop', weight: 18 },
  { name: 'Windows 10 Pro', ver: '22H2', type: 'desktop', weight: 12 },
  { name: 'macOS Sonoma', ver: '14.4', type: 'desktop', weight: 10 },
  { name: 'macOS Ventura', ver: '13.6', type: 'desktop', weight: 5 },
  { name: 'Ubuntu Server', ver: '22.04 LTS', type: 'server', weight: 8 },
  { name: 'Ubuntu Desktop', ver: '22.04 LTS', type: 'desktop', weight: 4 },
  { name: 'RHEL', ver: '9.3', type: 'server', weight: 6 },
  { name: 'Windows Server', ver: '2022', type: 'server', weight: 7 },
  { name: 'Windows Server', ver: '2019', type: 'server', weight: 3 },
  { name: 'VMware ESXi', ver: '8.0 U2', type: 'hypervisor', weight: 4 },
  { name: 'Cisco IOS', ver: '15.9', type: 'network', weight: 3 },
  { name: 'pfSense', ver: '2.7.2', type: 'firewall', weight: 2 }
];

const MANUFACTURERS_DESKTOP = ['Dell', 'HP', 'Lenovo', 'Apple', 'Microsoft'];
const MODELS_DELL = ['OptiPlex 7090', 'Latitude 5540', 'Precision 5570', 'XPS 13'];
const MODELS_HP = ['EliteBook 840 G10', 'ProBook 450 G9', 'Z2 Mini G9', 'EliteDesk 800 G9'];
const MODELS_LENOVO = ['ThinkPad X1 Carbon G11', 'ThinkCentre M90a', 'ThinkPad T14 G4', 'Yoga Pro 9'];
const MODELS_APPLE = ['MacBook Pro 14" M3', 'MacBook Air 15" M2', 'iMac 24" M3', 'Mac mini M2 Pro'];
const MODELS_MS = ['Surface Laptop 5', 'Surface Pro 9', 'Surface Studio 2+'];

const SERVER_MODELS = ['Dell PowerEdge R750', 'HPE ProLiant DL380 Gen11', 'Dell PowerEdge R640', 'Lenovo ThinkSystem SR650', 'Supermicro SYS-2029U'];
const NETWORK_MODELS = ['Cisco Catalyst 9300', 'Cisco Catalyst 2960-X', 'Aruba 2930F', 'Juniper EX4300', 'Ubiquiti UniFi Switch 48'];
const FIREWALL_MODELS = ['pfSense SG-5100', 'Fortinet FortiGate 200F', 'Palo Alto PA-440'];

const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Marketing', 'Sales', 'IT', 'Operations', 'Executive', 'Support', 'Legal'];
const LOCATIONS = ['HQ Floor 1', 'HQ Floor 2', 'HQ Floor 3', 'Datacenter A', 'Datacenter B', 'Branch Kuwait City', 'Branch Hawally', 'Remote'];

const FIRST_NAMES = ['Ahmad', 'Sara', 'Mohammed', 'Fatima', 'Ali', 'Layla', 'Omar', 'Noura', 'Hassan', 'Mariam', 'Youssef', 'Zainab', 'Khalid', 'Aisha', 'Ibrahim', 'Hala', 'Tariq', 'Rana', 'Waleed', 'Dana'];
const LAST_NAMES = ['AlEnezi', 'AlSabah', 'AlKhaled', 'AlOtaibi', 'AlFarhan', 'AlRashid', 'AlMutairi', 'AlDosari', 'AlShammari', 'AlHarbi', 'AlQahtani', 'AlGhanim'];

const SOFTWARE_CATALOG_WIN = [
  { name: 'Microsoft Office 365', ver: '2402 (Build 17328.20184)', pub: 'Microsoft' },
  { name: 'Google Chrome', ver: '122.0.6261.112', pub: 'Google' },
  { name: 'Mozilla Firefox', ver: '123.0.1', pub: 'Mozilla' },
  { name: 'Microsoft Edge', ver: '122.0.2365.80', pub: 'Microsoft' },
  { name: '7-Zip', ver: '23.01', pub: 'Igor Pavlov' },
  { name: 'Notepad++', ver: '8.6.4', pub: 'Notepad++ Team' },
  { name: 'VLC media player', ver: '3.0.20', pub: 'VideoLAN' },
  { name: 'Adobe Acrobat Reader DC', ver: '24.001.20629', pub: 'Adobe' },
  { name: 'Zoom', ver: '5.17.10.27295', pub: 'Zoom' },
  { name: 'Microsoft Teams', ver: '1.7.00.5368', pub: 'Microsoft' },
  { name: 'Slack', ver: '4.36.140', pub: 'Slack Technologies' },
  { name: 'Visual Studio Code', ver: '1.87.2', pub: 'Microsoft' },
  { name: 'Git', ver: '2.44.0', pub: 'Git Project' },
  { name: 'Python', ver: '3.12.2', pub: 'Python Foundation' },
  { name: 'Node.js', ver: '20.11.1', pub: 'OpenJS Foundation' },
  { name: 'WinRAR', ver: '6.24', pub: 'RARLAB' },
  { name: 'Dropbox', ver: '193.4.5847', pub: 'Dropbox' },
  { name: 'OneDrive', ver: '23.238.1124.0003', pub: 'Microsoft' },
  { name: 'TeamViewer', ver: '15.51.5', pub: 'TeamViewer' },
  { name: 'McAfee Total Protection', ver: '16.0 R53', pub: 'McAfee' }
];

const SOFTWARE_CATALOG_MAC = [
  { name: 'Safari', ver: '17.4', pub: 'Apple' },
  { name: 'Google Chrome', ver: '122.0.6261.112', pub: 'Google' },
  { name: 'Microsoft Office 365', ver: '16.83', pub: 'Microsoft' },
  { name: 'Xcode', ver: '15.3', pub: 'Apple' },
  { name: 'Homebrew', ver: '4.2.14', pub: 'Homebrew' },
  { name: 'iTerm2', ver: '3.5.0', pub: 'George Nachman' },
  { name: 'Visual Studio Code', ver: '1.87.2', pub: 'Microsoft' },
  { name: 'Slack', ver: '4.36.140', pub: 'Slack Technologies' },
  { name: 'Zoom', ver: '5.17.10', pub: 'Zoom' },
  { name: 'Firefox', ver: '123.0.1', pub: 'Mozilla' },
  { name: 'Spotify', ver: '1.2.33', pub: 'Spotify' },
  { name: 'Docker Desktop', ver: '4.28.0', pub: 'Docker' },
  { name: 'Postman', ver: '10.24.0', pub: 'Postman' },
  { name: 'Notion', ver: '3.8.0', pub: 'Notion' }
];

const SOFTWARE_CATALOG_LINUX = [
  { name: 'openssh-server', ver: '8.9p1', pub: 'OpenSSH' },
  { name: 'nginx', ver: '1.24.0', pub: 'nginx' },
  { name: 'apache2', ver: '2.4.58', pub: 'Apache Foundation' },
  { name: 'postgresql', ver: '15.6', pub: 'PostgreSQL' },
  { name: 'mysql-server', ver: '8.0.36', pub: 'Oracle' },
  { name: 'docker-ce', ver: '25.0.3', pub: 'Docker' },
  { name: 'python3', ver: '3.11.6', pub: 'Python Foundation' },
  { name: 'git', ver: '2.43.0', pub: 'Git Project' },
  { name: 'curl', ver: '8.5.0', pub: 'curl' },
  { name: 'openssl', ver: '3.2.1', pub: 'OpenSSL' },
  { name: 'systemd', ver: '255.4', pub: 'systemd' },
  { name: 'nodejs', ver: '20.11.1', pub: 'OpenJS Foundation' }
];

// Weighted random pick
function weightedPick(list) {
  const total = list.reduce((s, x) => s + (x.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of list) {
    r -= (item.weight || 1);
    if (r <= 0) return item;
  }
  return list[list.length - 1];
}

function randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genMAC() {
  const hex = '0123456789ABCDEF';
  return Array.from({length: 6}, () => hex[randInt(0,15)] + hex[randInt(0,15)]).join(':');
}

function genSerial(prefix) {
  return prefix + Array.from({length: 7}, () => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[randInt(0,33)]).join('');
}

function genDeviceName(os, dept) {
  if (os.type === 'server') return ['srv', dept.toLowerCase().slice(0,3), randInt(1,99).toString().padStart(2,'0')].join('-');
  if (os.type === 'hypervisor') return 'esxi-' + randInt(1,10).toString().padStart(2,'0');
  if (os.type === 'network') return 'sw-core-' + randInt(1,20).toString().padStart(2,'0');
  if (os.type === 'firewall') return 'fw-edge-' + randInt(1,5).toString().padStart(2,'0');
  return ['ws', dept.toLowerCase().slice(0,3), randInt(100,999)].join('-');
}

function genIP(subnet) {
  const parts = subnet.split('.');
  return parts.slice(0,3).join('.') + '.' + randInt(10, 250);
}

async function seedDemoInventory(orgId) {
  // Subnets
  const subnets = [
    { org_id: orgId, cidr: '10.10.1.0/24', vlan: 10, name: 'Corporate LAN', description: 'HQ workstations' },
    { org_id: orgId, cidr: '10.10.2.0/24', vlan: 20, name: 'Server VLAN', description: 'Production servers' },
    { org_id: orgId, cidr: '10.10.3.0/24', vlan: 30, name: 'DMZ', description: 'Internet-facing services' },
    { org_id: orgId, cidr: '10.10.4.0/24', vlan: 40, name: 'Management', description: 'Out-of-band management' },
    { org_id: orgId, cidr: '10.10.5.0/24', vlan: 50, name: 'Guest WiFi', description: 'Visitor network' }
  ];
  for (const s of subnets) await DB.addSubnet(s);

  // Credentials
  const creds = [
    { org_id: orgId, name: 'AD Domain Admin', type: 'ssh', username: 'domain\\admin', encrypted: '***encrypted***', description: 'Used for Windows WMI discovery' },
    { org_id: orgId, name: 'Linux Audit User', type: 'ssh', username: 'netmap-audit', encrypted: '***encrypted***', description: 'SSH key auth for Linux servers' },
    { org_id: orgId, name: 'SNMP v2c Community', type: 'snmp', username: 'public', encrypted: '***encrypted***', description: 'Read-only SNMP for network devices' },
    { org_id: orgId, name: 'VMware vCenter', type: 'api', username: 'administrator@vsphere.local', encrypted: '***encrypted***', description: 'ESXi host discovery' }
  ];
  for (const c of creds) await DB.addCredential(c);

  // Devices - build 87 diverse devices
  const TOTAL = 87;
  const devices = [];
  for (let i = 0; i < TOTAL; i++) {
    const os = weightedPick(OS_LIST);
    const dept = randPick(DEPARTMENTS);
    const loc = os.type === 'server' || os.type === 'hypervisor' ? randPick(['Datacenter A', 'Datacenter B']) : randPick(LOCATIONS);
    const subnet = os.type === 'server' ? '10.10.2.0' : os.type === 'network' || os.type === 'firewall' ? '10.10.4.0' : '10.10.1.0';

    let manufacturer, model;
    if (os.type === 'server' || os.type === 'hypervisor') {
      const serverModel = randPick(SERVER_MODELS);
      const parts = serverModel.split(' ');
      manufacturer = parts[0];
      model = parts.slice(1).join(' ');
    } else if (os.type === 'network') {
      const n = randPick(NETWORK_MODELS);
      const p = n.split(' ');
      manufacturer = p[0];
      model = p.slice(1).join(' ');
    } else if (os.type === 'firewall') {
      const f = randPick(FIREWALL_MODELS);
      const p = f.split(' ');
      manufacturer = p[0];
      model = p.slice(1).join(' ');
    } else if (os.name.includes('macOS')) {
      manufacturer = 'Apple';
      model = randPick(MODELS_APPLE);
    } else {
      manufacturer = randPick(MANUFACTURERS_DESKTOP.filter(m => m !== 'Apple'));
      if (manufacturer === 'Dell') model = randPick(MODELS_DELL);
      else if (manufacturer === 'HP') model = randPick(MODELS_HP);
      else if (manufacturer === 'Lenovo') model = randPick(MODELS_LENOVO);
      else model = randPick(MODELS_MS);
    }

    const assignedFirst = randPick(FIRST_NAMES);
    const assignedLast = randPick(LAST_NAMES);
    const assignedEmail = (assignedFirst + '.' + assignedLast).toLowerCase() + '@corp.local';

    const purchaseDate = new Date(Date.now() - randInt(90, 1500) * 86400000).toISOString().slice(0,10);
    const warrantyExpiry = new Date(new Date(purchaseDate).getTime() + randInt(365*2, 365*5) * 86400000).toISOString().slice(0,10);

    const ram = os.type === 'server' ? [64, 128, 256, 512][randInt(0,3)] : [8, 16, 32, 64][randInt(0,3)];
    const disk = os.type === 'server' ? [1000, 2000, 4000, 8000][randInt(0,3)] : [256, 512, 1000, 2000][randInt(0,3)];
    const cpu = os.type === 'server'
      ? ['Intel Xeon Gold 6338 @ 2.00GHz', 'AMD EPYC 7543 @ 2.80GHz', 'Intel Xeon Silver 4310 @ 2.10GHz'][randInt(0,2)]
      : ['Intel Core i7-1365U', 'Intel Core i5-1335U', 'AMD Ryzen 7 7840U', 'Apple M3', 'Intel Core i7-13700'][randInt(0,4)];
    const cores = os.type === 'server' ? [16, 24, 32, 48][randInt(0,3)] : [4, 6, 8, 10, 12][randInt(0,4)];

    const statuses = ['up', 'up', 'up', 'up', 'up', 'up', 'warn', 'down'];
    const status = statuses[randInt(0, statuses.length - 1)];
    const lastSeenMinutes = status === 'up' ? randInt(1, 30) : status === 'warn' ? randInt(60, 360) : randInt(1440, 10080);
    const lastSeen = new Date(Date.now() - lastSeenMinutes * 60000).toISOString();

    const name = genDeviceName(os, dept);

    const device = {
      id: 'dev_' + Date.now().toString(36) + '_' + i.toString(36).padStart(3, '0'),
      org_id: orgId,
      name: name,
      hostname: name + '.corp.local',
      type: os.type,
      os: os.name,
      os_version: os.ver,
      manufacturer,
      model,
      serial: genSerial(manufacturer.slice(0,2).toUpperCase()),
      asset_tag: 'AST-' + (10000 + i).toString(),
      ip: genIP(subnet),
      mac: genMAC(),
      subnet: subnet + '/24',
      status,
      last_seen: lastSeen,
      cpu, cores,
      ram_gb: ram,
      disk_gb: disk,
      department: dept,
      location: loc,
      assigned_to: os.type === 'desktop' ? (assignedFirst + ' ' + assignedLast) : null,
      assigned_email: os.type === 'desktop' ? assignedEmail : null,
      purchase_date: purchaseDate,
      warranty_expiry: warrantyExpiry,
      cost: randInt(500, 8000),
      notes: '',
      created_at: new Date(Date.now() - randInt(30, 500) * 86400000).toISOString(),
      updated_at: lastSeen,
      discovered_by: randInt(0,1) ? 'Network Scan' : 'Agent'
    };
    devices.push(device);
    await DB.addDevice(device);

    // Add software for this device
    let catalog;
    if (os.name.includes('Windows')) catalog = SOFTWARE_CATALOG_WIN;
    else if (os.name.includes('macOS')) catalog = SOFTWARE_CATALOG_MAC;
    else if (os.type === 'network' || os.type === 'firewall' || os.type === 'hypervisor') catalog = [];
    else catalog = SOFTWARE_CATALOG_LINUX;

    // Install random subset of apps
    const swCount = catalog.length > 0 ? randInt(Math.floor(catalog.length * 0.4), catalog.length) : 0;
    const shuffled = [...catalog].sort(() => Math.random() - 0.5);
    for (let j = 0; j < swCount; j++) {
      const sw = shuffled[j];
      await DB.addSoftware({
        org_id: orgId,
        device_id: device.id,
        name: sw.name,
        version: sw.ver,
        publisher: sw.pub,
        install_date: new Date(Date.now() - randInt(1, 900) * 86400000).toISOString().slice(0, 10),
        install_location: os.name.includes('Windows') ? 'C:\\Program Files\\' + sw.name : '/Applications/' + sw.name
      });
    }

    // Add user accounts on workstations/servers
    if (os.type === 'desktop' || os.type === 'server') {
      // Local admin
      await DB.addUserAcct({
        org_id: orgId,
        device_id: device.id,
        username: os.name.includes('Windows') ? 'Administrator' : 'root',
        full_name: 'Built-in administrator',
        last_login: new Date(Date.now() - randInt(1, 30) * 86400000).toISOString(),
        is_admin: true,
        enabled: true,
        source: 'local'
      });
      // Assigned user (on workstations)
      if (os.type === 'desktop') {
        await DB.addUserAcct({
          org_id: orgId,
          device_id: device.id,
          username: (assignedFirst + '.' + assignedLast).toLowerCase(),
          full_name: assignedFirst + ' ' + assignedLast,
          last_login: new Date(Date.now() - randInt(1, 7) * 86400000).toISOString(),
          is_admin: false,
          enabled: true,
          source: 'domain'
        });
      }
    }
  }

  // Sample scans
  const scans = [
    {
      org_id: orgId,
      name: 'Weekly Corporate LAN Scan',
      subnet: '10.10.1.0/24',
      credential_id: null,
      started_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 86400000 + 480000).toISOString(),
      status: 'completed',
      devices_found: 62,
      devices_new: 3,
      devices_updated: 59
    },
    {
      org_id: orgId,
      name: 'Datacenter Discovery',
      subnet: '10.10.2.0/24',
      credential_id: null,
      started_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 3 * 86400000 + 720000).toISOString(),
      status: 'completed',
      devices_found: 18,
      devices_new: 1,
      devices_updated: 17
    },
    {
      org_id: orgId,
      name: 'Nightly Agent Check-in',
      subnet: 'all',
      credential_id: null,
      started_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 12 * 3600000 + 180000).toISOString(),
      status: 'completed',
      devices_found: 87,
      devices_new: 0,
      devices_updated: 87
    }
  ];
  for (const s of scans) await DB.addScan(s);

  // Audit log
  await DB.log(orgId, 'org_created', 'Demo organization created and seeded with 87 devices');
  await DB.log(orgId, 'scan_completed', 'Nightly Agent Check-in completed: 87 devices updated');
  await DB.log(orgId, 'device_added', 'New device discovered: ws-fin-234');

  return devices;
}

window.seedDemoInventory = seedDemoInventory;
