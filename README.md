# 🗺️ NetMap

**IT Asset Inventory & Network Discovery** — a real, working asset inventory tool that runs entirely in your browser.

**Live demo:** https://siteq8.github.io/NetMap

![NetMap](https://img.shields.io/badge/status-live-brightgreen) ![Storage](https://img.shields.io/badge/database-IndexedDB-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

## What it does

NetMap tracks every device, application, user account, and network in your environment — the kind of visibility every IT team needs but rarely has time to build.

- **Devices** — workstations, servers, hypervisors, switches, firewalls. Hardware specs, OS, IP/MAC, serial, warranty, department, assignment.
- **Software inventory** — every installed application aggregated across the fleet with version tracking.
- **User accounts** — local and domain accounts discovered on devices, admin detection, last login.
- **Networks** — subnet and VLAN inventory with device allocation.
- **Credentials vault** — SSH/WMI/SNMP/API credentials used by discovery scans.
- **Discovery scans** — simulated network sweep that actually adds new devices to the database.
- **Reports** — 8 pre-built reports: offline devices, warranty expiring, EOL operating systems, stale devices, unassigned workstations, and more.
- **Audit log** — every action timestamped and attributed.

## Real working features

- **Real authentication** — SHA-256 password hashing with random 16-byte salt via browser-native SubtleCrypto.
- **Real database** — IndexedDB with 9 object stores, proper indexes, and cascade deletes. Not just localStorage.
- **Real persistence** — cases, devices, software, users, scans all survive tab refresh, browser restart, everything.
- **Sortable, searchable, filterable** device table. Click any column to sort.
- **Full device CRUD** — add, edit, delete with confirmation.
- **CSV export** for devices, software, and every report.
- **Slide-out detail panel** with 4 tabs: Overview, Software, Users, Network.
- **Simulated discovery console** with live progress bar and realistic scan output.

## Demo account

Click **"Explore with Demo Account"** on the login screen. You'll get a fresh "Acme Corp" organization seeded with:

- **87 devices** across 13 OS types (Windows 11 Pro/Ent, Windows 10, macOS, Ubuntu, RHEL, Windows Server, ESXi, Cisco IOS, pfSense)
- Realistic hardware from Dell, HP, Lenovo, Apple, Microsoft, HPE, Supermicro
- Assigned users, departments, locations, warranty dates, purchase costs
- Hundreds of software installations across the fleet
- Local and domain user accounts
- 5 subnets, 4 credentials, 3 sample scans
- Audit log entries

The demo account has full read/write access — add devices, run scans, edit anything. It resets on each login so you can experiment freely.

## Tech stack

- **Pure HTML/CSS/JS** — zero build step, zero dependencies, zero backend
- **IndexedDB** — real database with 9 object stores and indexes
- **SubtleCrypto** — native browser password hashing
- **GitHub Pages** — static hosting from `docs/`

## Structure

```
docs/
  index.html       Shell + login screen
  css/style.css    Dark blue theme, JetBrains Mono + Inter
  js/db.js         IndexedDB wrapper (228 lines)
  js/seed.js       Demo inventory generator (343 lines)
  js/app.js        Auth, state, navigation (337 lines)
  js/views.js      All view renderers (1214 lines)
```

## Privacy

Everything runs in your browser. No data ever leaves your machine. No tracking, no analytics, no telemetry, no backend server. Your inventory database lives in IndexedDB under the NetMap origin and nowhere else.

## Author

Ali AlEnezi (@SiteQ8) — Security Architecture Principal
[github.com/SiteQ8](https://github.com/SiteQ8) · [3li.info](https://3li.info)

## License

MIT
