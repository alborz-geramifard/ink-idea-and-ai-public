"use strict";
// Ink Stats: data.json is AES-256-GCM; the key is PBKDF2-SHA256(username + "\n" + password), derived in the
// browser. Nothing readable is on the server. After sign-in the derived key (never the password) is kept in
// this browser's storage for SESSION_MS so reloads don't ask again; Lock signs out and deletes it.

const PLAT = [
  {k: "tiktok", label: "TikTok", c: "--p-tiktok", brand: "tiktok", tag: ""},
  {k: "instagram_reel", label: "Instagram", c: "--p-ig", brand: "instagram", tag: ""},   // the Reel: shown as plain Instagram
  {k: "youtube", label: "YouTube", c: "--p-yt", brand: "youtube", tag: ""},
  {k: "facebook", label: "Facebook", c: "--p-fb", brand: "facebook", tag: ""},
  {k: "pinterest", label: "Pinterest", c: "--p-pin", brand: "pinterest", tag: ""},
  {k: "linkedin", label: "LinkedIn", c: "--p-li", brand: "linkedin", tag: ""},
  {k: "instagram_image", label: "IG image", c: "--p-igimg", brand: "instagram", tag: "image"},
  {k: "threads", label: "Threads", c: "--p-threads", brand: "threads", tag: ""},
  {k: "x", label: "X", c: "--p-x", brand: "x", tag: ""},
];

// Platform logos (monochrome, drawn in the text colour so they work in light and dark)
const GLYPH = {
  tiktok: '<path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
  instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="F" stroke-width="2.2"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="F" stroke-width="2.2"/><circle cx="17.6" cy="6.4" r="1.4"/>',
  x: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/>',
  youtube: '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"/>',
  facebook: '<path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/>',
  pinterest: '<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>',
  linkedin: '<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  threads: '<path fill="none" stroke="F" stroke-width="2.2" stroke-linecap="round" d="M16.2 11.2c-.5-2.6-2.3-3.7-4.3-3.7-2.3 0-3.7 1.3-3.9 3 M16.3 12.4c0 3-1.6 4.3-3.9 4.3-1.9 0-3.1-1-3.1-2.4 0-1.7 1.6-2.6 3.8-2.6 3.7 0 6.4 1.4 6.4 4.4 0 3.3-3 5.6-7 5.6-5.3 0-8.3-3.6-8.3-9 0-5.5 3.2-9 8.4-9 4.2 0 6.9 2 7.9 5.6"/>',
};
// Brand colours where the brand has them (TikTok, Instagram, YouTube, Facebook, Pinterest, LinkedIn); X and Threads are black-only marks, so
// they stay in the text colour and follow the theme.
const COLOR_GLYPH = {
  tiktok: fg => `<g transform="translate(-.8 -.6)" fill="#25F4EE">${GLYPH.tiktok}</g>` +
    `<g transform="translate(.8 .6)" fill="#FE2C55">${GLYPH.tiktok}</g><g fill="${fg}">${GLYPH.tiktok}</g>`,
  instagram: () => '<defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/>' +
    '<stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/>' +
    '<stop offset=".9" stop-color="#285aeb"/></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#ig)"/>' +
    '<rect x="5.6" y="5.6" width="12.8" height="12.8" rx="4" fill="none" stroke="#fff" stroke-width="1.9"/>' +
    '<circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="16.4" cy="7.6" r="1.1" fill="#fff"/>',
  facebook: () => '<circle cx="12" cy="12" r="12" fill="#1877f2"/><path fill="#fff" d="M16.7 15.5l.5-3.5h-3.4V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.7 0-4.5 1.7-4.5 4.7V12h-3v3.5h3V24a12 12 0 0 0 3.7 0v-8.5z"/>',
  pinterest: () => '<circle cx="12" cy="12" r="11.4" fill="#fff"/><path fill="#e60023" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>',
  linkedin: () => '<rect x="1" y="1" width="22" height="22" rx="3" fill="#fff"/><path fill="#0a66c2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  youtube: () => '<rect x="0" y="3.6" width="24" height="16.8" rx="4.6" fill="#ff0000"/><path fill="#fff" d="M9.6 15.6V8.4l6.3 3.6z"/>',
};
const logo = brand => {
  const fg = css("--text-primary");
  const body = COLOR_GLYPH[brand] ? COLOR_GLYPH[brand](fg) : GLYPH[brand].replace(/"F"/g, `"${fg}"`);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fg}">${body}</svg>`);
};
// the Instagram image post's mark: a small stack of photos, shown after the Instagram logo instead of the word "image"
const PHOTO = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="#1d1b18" stroke-width="1.4" stroke-linejoin="round">' +
  '<rect x="1.5" y="2.5" width="16" height="12" rx="2.2" fill="#ef5b7b"/><rect x="3.5" y="5" width="16" height="12" rx="2.2" fill="#ffd25e"/>' +
  '<rect x="5.5" y="7.5" width="17" height="13" rx="2.2" fill="#dbeefb"/>' +
  '<path d="M6.2 18.4l5.3-5.2 4.3 4.4 2.1-1.9 4 3.4v.4a1.6 1.6 0 0 1-1.6 1.6H7.6a1.6 1.6 0 0 1-1.4-.8z" fill="#18b4e8"/>' +
  '<circle cx="18.2" cy="11.4" r="1.7" fill="#ffd25e"/></svg>');
const byLabel = label => PLAT.find(p => p.label === label) || FOLLOW_P.find(p => p.label === label);
function richIcons(size = 16) {   // ECharts rich-text styles: {i_tiktok|} draws the TikTok logo
  const r = {tag: {color: css("--text-secondary"), fontSize: 12, padding: [0, 0, 0, 4]},
             i_photo: {backgroundColor: {image: PHOTO}, width: size, height: size, padding: [0, 0, 0, 3]}};
  for (const b of Object.keys(GLYPH)) r["i_" + b] = {backgroundColor: {image: logo(b)}, width: size, height: size};
  return r;
}
const tagText = p => p.tag === "image" ? "{i_photo|}" : p.tag ? `{tag|${p.tag}}` : "";
const iconText = label => { const p = byLabel(label); return p ? `{i_${p.brand}|}` + tagText(p) : label; };
// cartoon numbers: white digits on a blue circle (HTML and ECharts rich text)
const num = (n, cls = "") => `<span class="num${cls ? " " + cls : ""}">${esc(n)}</span>`;
const numRich = (size = 18) => ({backgroundColor: css("--num"), color: "#fff", borderRadius: size / 2, width: size, height: size,
                                 lineHeight: size, align: "center", fontSize: Math.round(size * .6), fontWeight: "bold"});
const iconHtml = p => `<img src="${logo(p.brand)}" alt="${esc(p.label)}" title="${esc(p.label)}" class="pl">` +
  (p.tag === "image" ? `<img src="${PHOTO}" alt="image" title="${esc(p.label)}" class="pl pltag-img">` : p.tag ? `<span class="pltag">${p.tag}</span>` : "");
const FOLLOW = [["tiktok", "TikTok", "--p-tiktok"], ["instagram", "Instagram", "--p-ig"], ["facebook", "Facebook", "--p-fb"], ["pinterest", "Pinterest", "--p-pin"], ["linkedin", "LinkedIn", "--p-li"], ["x", "X", "--p-x"], ["threads", "Threads", "--p-threads"]];
// X and TikTok are both black logos: TikTok's line is solid black, X's is dashed (user, 2026-11-01)
const xDash = p => p.k === "x" ? {type: [7, 5]} : {};
// one look for every line chart, the Views over time one (user, 2026-11-01): 2.5 px, a little see-through so
// crossings show; hovering fades the other lines, nothing else changes
const lineLook = (color, extra = {}) => ({
  lineStyle: {width: 2.5, opacity: .75, color, ...extra}, itemStyle: {color, borderColor: css("--surface-1"), borderWidth: 2},
  // hover keeps the same width and strength: on time charts every pointer move highlights and releases all
  // lines, and a different hover look made them flicker (user, 2026-11-01)
  emphasis: {focus: "series", lineStyle: {width: 2.5, opacity: .75, color, ...extra}}});
const FOLLOW_P = FOLLOW.map(([k, label]) => ({brand: k, label, tag: ""}));
const ENG = [["likes", "Likes", "👍", "--e1"], ["comments", "Comments", "💬", "--e2"], ["shares", "Shares", "↗", "--e3"],
             ["saves", "Saves", "🔖", "--e4"], ["new_followers", "New followers", "👤", "--e5"]];
const RANGE_LABEL = {1: "last 24 h", 7: "last 7 days", 30: "last 30 days", 0: "since tracking began"};
const SESSION_MS = 24 * 60 * 60 * 1000;
const SESSION = "ink-session";

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[ch]));
// 1,000 and up (user, 2026-11-01): 1.2K, 12K, 1.2M, 12M (one decimal only while a single digit)
const fmt = (n, d = 0) => {
  if (n == null) return "–";
  const v = Number(n), a = Math.abs(v);
  // a decimal that comes out as .0 is dropped (user, 2026-11-01): 6 s, 0%, 1K, 2M
  if (a < 1000) return v.toLocaleString(undefined, {maximumFractionDigits: d, minimumFractionDigits: 0});
  const short = (x, unit) => { const r = Math.round(x * 10) / 10; return (Math.abs(r) < 10 ? r.toFixed(1).replace(/\.0$/, "") : String(Math.round(x))) + unit; };
  const m = v / 1e6;
  if (a >= 1e6 || Math.round(Math.abs(v / 1e3)) >= 1000) return short(m, "M");
  return short(v / 1e3, "K");
};
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const b64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
const t = s => new Date(s.updated).getTime();

let DATA = null, charts = {}, fails = 0;
let KEY = null, IV = null, REFRESH = "";   // the unlocked key + which data.json is shown, for live refreshes
const state = {range: 0, off: new Set(), sort: {key: "n", asc: false}, sel: null, tab: "social"};   // newest cartoon first (user, 2026-11-03)

// ---- theme --------------------------------------------------------------------------
try { const th = localStorage.getItem("ink-theme"); if (th) document.documentElement.dataset.theme = th; } catch (e) {}
$("theme").onclick = () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("ink-theme", document.documentElement.dataset.theme); } catch (e) {}
  if (DATA) renderAll();
};

// ---- sign in / lock -----------------------------------------------------------------
const enc = new TextEncoder();
const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

// The encrypted data lives in the Cloudflare Worker (2026-11-07; was data.json in the GitHub repo, whose history kept
// every 10-minute upload). DATA_VER = the version shown, so a refresh only downloads once a new one is there.
const DATA_URL = "https://ink-analytics.inkideaandai.workers.dev/data";
let DATA_VER = "";
async function loadBlob() {
  const r = await fetch(DATA_URL + "?t=" + Date.now(), {cache: "no-store"});
  if (!r.ok) throw new Error("no data");
  DATA_VER = r.headers.get("X-Data-Version") || "";
  return r.json();
}
async function dataVersion() {
  const r = await fetch(DATA_URL + "?version&t=" + Date.now(), {cache: "no-store"});
  return r.ok ? r.text() : "";
}
async function decrypt(key, blob) {
  const plain = await crypto.subtle.decrypt({name: "AES-GCM", iv: b64(blob.iv), additionalData: enc.encode(blob.aad)}, key, b64(blob.ct));
  return JSON.parse(new TextDecoder().decode(plain));
}
function saved() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION) || "null");
    if (s && s.exp > Date.now()) return s;
    localStorage.removeItem(SESSION);
  } catch (e) {}
  return null;
}

// local tests (user, 2026-11-01): on this Mac's own server the page opens without a login, from the plain
// local-data.json that `stats.py --local-dashboard` writes. That file is git-ignored and never published.
const LOCAL = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

(async function resume() {   // still signed in from earlier today? unlock without asking
  if (LOCAL) {
    try {
      const r = await fetch("local-data.json?t=" + Date.now(), {cache: "no-store"});
      if (r.ok) { DATA = await r.json(); start(); return; }
    } catch (e) {}
    $("loginMsg").textContent = "Local test: run python3 Scripts/stats.py --local-dashboard to open without a login.";
  }
  const s = saved();
  if (!s) return;
  try {
    const blob = await loadBlob();
    if (blob.salt !== s.salt) throw new Error("password changed");
    const key = await crypto.subtle.importKey("raw", b64(s.k), {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);
    DATA = await decrypt(key, blob);
    KEY = key; IV = blob.iv;
    start();
  } catch (e) {
    try { localStorage.removeItem(SESSION); } catch (e2) {}
  }
})();

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("signin");
  btn.disabled = true;
  $("loginMsg").textContent = "";
  btn.textContent = "Unlocking…";
  let blob;
  try {
    blob = await loadBlob();
  } catch (err) {
    $("loginMsg").textContent = "Couldn't load the data. Try again in a minute.";
    btn.disabled = false; btn.textContent = "Sign in";
    return;
  }
  let key;
  try {
    const base = await crypto.subtle.importKey("raw", enc.encode($("user").value.trim() + "\n" + $("pass").value), "PBKDF2", false, ["deriveKey"]);
    key = await crypto.subtle.deriveKey({name: "PBKDF2", hash: "SHA-256", salt: b64(blob.salt), iterations: blob.iter},
                                        base, {name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
    DATA = await decrypt(key, blob);
    KEY = key; IV = blob.iv;
  } catch (err) {
    fails++;
    const wait = Math.min(60, 2 ** fails);   // each wrong guess waits longer
    $("loginMsg").textContent = `Wrong username or password. Try again in ${wait} s.`;
    btn.textContent = "Sign in";
    setTimeout(() => { btn.disabled = false; }, wait * 1000);
    return;
  }
  try {
    localStorage.setItem(SESSION, JSON.stringify({k: toB64(await crypto.subtle.exportKey("raw", key)),
                                                  salt: blob.salt, exp: Date.now() + SESSION_MS}));
  } catch (e) {}   // storage blocked: works for this visit only
  $("pass").value = "";
  btn.disabled = false; btn.textContent = "Sign in";
  start();
});

function lock() {   // sign out: forget the saved key, wipe memory, back to sign-in
  try { localStorage.removeItem(SESSION); } catch (e) {}
  DATA = null;
  Object.values(charts).forEach(c => c.dispose());
  location.replace(location.pathname);
}
$("lock").onclick = lock;
setInterval(() => { if (DATA && !saved()) lock(); }, 60 * 1000);   // the day is up

function start() {
  $("login").hidden = true;
  $("app").hidden = false;
  $("range").onclick = e => { const b = e.target.closest("button"); if (!b) return; state.range = +b.dataset.r; renderAll(); };
  $("closeDetail").onclick = () => { state.sel = null; renderAll(); };
  $("tab").onclick = e => { const b = e.target.closest("button"); if (!b) return; state.tab = b.dataset.t; renderAll(); };
  addEventListener("resize", fitCharts);
  $("refresh").onclick = () => askFresh();
  renderAll();
  askFresh();
}

// ---- live refresh -------------------------------------------------------------------
// Opening the page asks the website Worker for fresh numbers; the Mac sees the request within 30 s
// (stats.py --if-asked), collects every platform except X and publishes a new data.json. We poll for it.
const REFRESH_URL = "https://ink-analytics.inkideaandai.workers.dev/refresh";
let asking = false;
async function askFresh() {
  if (asking) return;   // one request at a time (page load or the ↻ button)
  asking = true; $("refresh").classList.add("spin");
  try { await askFreshOnce(); } finally { asking = false; $("refresh").classList.remove("spin"); }
}
async function askFreshOnce() {
  if (LOCAL) return;   // the local page shows the history on disk; refreshes belong to the live dashboard
  try { await fetch(REFRESH_URL, {method: "POST"}); } catch (e) { return; }   // Worker unreachable: keep what we have
  REFRESH = "refreshing…"; renderAll();
  const until = Date.now() + 5 * 60 * 1000;
  while (Date.now() < until) {
    await new Promise(r => setTimeout(r, 15000));
    if (!DATA) return;   // signed out meanwhile
    try {
      const v = await dataVersion();
      if (!v || v === DATA_VER) continue;
      const blob = await loadBlob();
      if (blob.iv !== IV) {
        DATA = await decrypt(KEY, blob); IV = blob.iv;
        REFRESH = "just refreshed"; renderAll();
        setTimeout(() => { if (REFRESH === "just refreshed") { REFRESH = ""; renderAll(); } }, 60000);
        return;
      }
    } catch (e) {}
  }
  REFRESH = "no fresh numbers (is the Mac asleep?)"; renderAll();
}

// ---- data helpers -------------------------------------------------------------------
const snaps = () => DATA.snapshots;
const latest = () => snaps()[snaps().length - 1];
const on = () => PLAT.filter(p => !state.off.has(p.k));
const views = (c, k) => (c && c[k] && c[k].views) || 0;
const inter = d => d ? (d.likes || 0) + (d.comments || 0) + (d.shares || 0) + (d.saves || 0) : 0;
const eng = (c, k) => on().reduce((a, p) => a + ((c && c[p.k] && c[p.k][k]) || 0), 0);   // one kind, enabled platforms
const engAll = (s, k) => Object.values(s.cartoons).reduce((a, c) => a + eng(c, k), 0);

function inRange() {
  const all = snaps();
  if (!state.range) return all;
  const from = t(latest()) - state.range * 864e5;
  const i = all.findIndex(s => t(s) >= from);
  return all.slice(Math.max(0, i - 1));   // keep one snapshot before the window as the baseline
}
function totals(s) {
  const out = {};
  for (const p of PLAT) out[p.k] = Object.values(s.cartoons).reduce((a, c) => a + views(c, p.k), 0);
  return out;
}
const allViews = s => { const tt = totals(s); return on().reduce((a, p) => a + tt[p.k], 0); };
const allInter = s => Object.values(s.cartoons).reduce((a, c) => a + on().reduce((b, p) => b + inter(c[p.k]), 0), 0);
const allFollowers = s => Object.values(s.followers || {}).reduce((a, v) => a + (v || 0), 0);
const cartoonViews = c => on().reduce((a, p) => a + views(c, p.k), 0);
const postedAt = c => ["instagram_image", "instagram_reel"].map(k => c[k] && c[k].posted_at).filter(Boolean).sort()[0];
const rate = c => { const v = cartoonViews(c); const i = on().reduce((a, p) => a + inter(c[p.k]), 0); return v ? i / v * 100 : null; };
const watch = (c, k) => { const v = c[k] && c[k].avg_watch_s; return v > 0 && v < 60 ? v : null; };
const thumb = (n, cls = "thumb") => `<img src="thumbs/${+n}.jpg" data-big="thumbs/${+n}-lg.jpg" class="${cls}" alt="" loading="lazy">`;

// hover a thumbnail: show the cartoon large next to the pointer. The large files are preloaded; until one
// is ready the small thumbnail is shown scaled up, so the box is never empty or showing the previous cartoon.
const preview = document.createElement("img");
preview.className = "ink-zoom"; preview.alt = ""; preview.hidden = true;
document.body.appendChild(preview);
const zoomCap = document.createElement("div");   // title + date under the big picture (Timeline tab, card #155)
zoomCap.className = "ink-zoom-cap"; zoomCap.hidden = true;
document.body.appendChild(zoomCap);
const bigCache = {};
function preloadBig() {
  document.querySelectorAll("img.thumb").forEach(t => {
    const src = t.dataset.big;
    if (src && !bigCache[src]) { const im = new Image(); im.decoding = "async"; im.src = src; bigCache[src] = im; }
  });
}
let hovering = null;
document.addEventListener("mouseover", e => {
  const t = e.target.closest && e.target.closest("img.thumb");
  if (!t || t === hovering) return;
  if (t.closest(".tl-track.editing")) return;   // no zoom while reordering the Timeline (card #163)
  hovering = t;
  const big = bigCache[t.dataset.big];
  if (big && big.complete && big.naturalWidth) {
    preview.src = big.src;
  } else {
    preview.src = t.currentSrc || t.src;           // instant placeholder
    const im = big || (bigCache[t.dataset.big] = Object.assign(new Image(), {src: t.dataset.big}));
    im.addEventListener("load", () => { if (hovering === t) preview.src = im.src; }, {once: true});
  }
  preview.hidden = false;
  zoomCap.hidden = !t.dataset.cap;
  if (t.dataset.cap) zoomCap.innerHTML = `<b>${esc(t.dataset.cap)}</b><span>${esc(t.dataset.when || "")}</span>`;
});
document.addEventListener("mouseout", e => {
  const t = e.target.closest && e.target.closest("img.thumb");
  if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) { hovering = null; preview.hidden = true; zoomCap.hidden = true; }
});
document.addEventListener("mousemove", e => {
  if (preview.hidden) return;
  const w = 270, h = 480, pad = 16;
  let x = e.clientX + pad, y = e.clientY - h / 2;
  if (x + w > innerWidth - 8) x = e.clientX - w - pad;
  y = Math.max(8, Math.min(y, innerHeight - h - 8));
  preview.style.left = x + "px"; preview.style.top = y + "px";
  if (!zoomCap.hidden) { zoomCap.style.left = x + "px"; zoomCap.style.top = (y + h) + "px"; zoomCap.style.width = w + "px"; }
});

function reelWatch(s) {   // median Instagram (Reel) watch time; > 60 s is a looping outlier, not real watching
  const w = Object.values(s.cartoons).map(c => c.instagram_reel && c.instagram_reel.avg_watch_s)
    .filter(v => v > 0 && v < 60).sort((a, b) => a - b);
  return w.length ? w[Math.floor(w.length / 2)] : null;
}

// ---- what changed (last 24 h) --------------------------------------------------------
function renderChanges() {
  const all = snaps(), now = latest(), from = t(now) - 864e5;
  const base = all.find(s => t(s) >= from) || all[0];
  const lines = [];
  if (base === now) { $("changes").innerHTML = `<p class="note">Changes appear after the next refresh.</p>`; return; }
  const dv = allViews(now) - allViews(base);
  const moves = [];
  for (const [n, c] of Object.entries(now.cartoons)) for (const p of on()) {
    const d = views(c, p.k) - views(base.cartoons[n], p.k);
    if (d > 0) moves.push([d, n, p]);
  }
  moves.sort((a, b) => b[0] - a[0]);
  if (dv) lines.push(`👀 <b>${dv > 0 ? "+" : ""}${fmt(dv)} views</b>` +
    (moves.length ? ` · top: ${moves.slice(0, 3).map(([d, n, p]) => `${num(n)} ${iconHtml(p)} <b>+${fmt(d)}</b>`).join(" · ")}` : ""));
  const eng = ENG.filter(([k]) => k !== "new_followers").map(([k, l, ic]) => [ic, engAll(now, k) - engAll(base, k)]).filter(([, d]) => d);
  if (eng.length) lines.push(`💬 Engagement: ${eng.map(([ic, d]) => `${ic} <b>${d > 0 ? "+" : ""}${d}</b>`).join(" · ")}`);
  const df = allFollowers(now) - allFollowers(base);
  if (df) lines.push(`👤 <b>${fmt(allFollowers(base))} → ${fmt(allFollowers(now))}</b>`);
  const fresh = commentList().filter(c => new Date(c.at).getTime() >= t(base));
  if (fresh.length) lines.push(`🗨️ <b>${fresh.length} new comment${fresh.length > 1 ? "s" : ""}</b>: ` +
    fresh.slice(0, 2).map(c => `@${esc(c.user)} on ${num(c.n)} “${esc(c.text.slice(0, 60))}”`).join(" · "));
  const posted = Object.entries(now.cartoons).filter(([, c]) => postedAt(c) && new Date(postedAt(c)).getTime() >= t(base));
  if (posted.length) lines.push(`🆕 Posted: ${posted.map(([n, c]) => `${num(n)} ${esc(c.title)}`).join(", ")}`);
  $("changes").innerHTML = lines.length ? lines.map(l => `<div class="chg">${l}</div>`).join("") : `<p class="note">Quiet: nothing changed in the last 24 hours.</p>`;
}

// ---- tiles --------------------------------------------------------------------------
function delta(now, then, d = 0) {
  if (now == null || then == null) return `<span class="muted">first reading</span>`;
  const x = now - then;
  if (Math.abs(x) < 10 ** -d / 2) return `<span class="muted">no change</span>`;
  return `<span class="${x > 0 ? "up" : "down"}">${x > 0 ? "▲ +" : "▼ −"}${fmt(Math.abs(x), d)}</span>`;
}
function renderTiles() {
  // change since the same time yesterday (user, 2026-11-01): the last reading at or before 24 h ago
  const now = latest(), past = snaps().filter(s => t(s) <= t(now) - 864e5);
  const then = past.length ? past[past.length - 1] : snaps()[0];
  const when = "since yesterday";
  const best = Object.entries(now.cartoons).sort((a, b) => cartoonViews(b[1]) - cartoonViews(a[1]))[0];
  const tiles = [
    ["Views", fmt(allViews(now)), delta(allViews(now), then && allViews(then)) + ` ${when}`],
    ["Interactions", fmt(allInter(now)), delta(allInter(now), then && allInter(then)) + ` ${when}`],
    ["👤", fmt(allFollowers(now)), delta(allFollowers(now), then && allFollowers(then)) + ` ${when}`],
    [`${iconHtml(PLAT.find(p => p.k === "instagram_reel"))} watch time`, reelWatch(now) == null ? "–" : fmt(reelWatch(now), 1) + " s",
     delta(reelWatch(now), then && reelWatch(then), 1) + ` ${when}`],
    ["Top cartoon", best ? num(best[0], "lg") : "–", best ? `${esc(best[1].title)} · ${fmt(cartoonViews(best[1]))} views` : ""],
  ];
  $("tiles").innerHTML = tiles.map(([k, v, d]) =>
    `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join("");
}

// ---- charts -------------------------------------------------------------------------
function fitCharts() {   // only charts on screen: a hidden one has no width to measure
  Object.values(charts).forEach(c => { if (c.getDom().offsetWidth) c.resize(); });
}
// the mouse wheel always scrolls the page, also over a chart with its hover box open (user, 2026-11-01): ECharts'
// zoom swallows wheel events even with wheel zoom off, so stop them before they reach a chart (the browser still scrolls)
document.addEventListener("wheel", e => { if (e.target.closest && e.target.closest("[_echarts_instance_]")) e.stopPropagation(); },
                          {capture: true});
function chart(id) { return charts[id] || (charts[id] = echarts.init($(id), null, {renderer: "canvas"})); }
function base() {
  const muted = css("--text-muted"), grid = css("--grid");
  return {
    animationDuration: 500,
    textStyle: {fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: css("--text-secondary")},
    grid: {left: 8, right: 24, top: 36, bottom: 16, containLabel: true},
    tooltip: {trigger: "axis", order: "valueDesc", backgroundColor: css("--surface-1"), borderColor: css("--border"),
              textStyle: {color: css("--text-primary")}, axisPointer: {type: "line", lineStyle: {color: muted}}},
    legend: {top: 0, left: 0, icon: "circle", itemWidth: 10, itemHeight: 10, itemGap: 16, formatter: iconText,
             textStyle: {color: css("--text-secondary"), rich: richIcons()}},
    xAxis: {axisLine: {lineStyle: {color: grid}}, axisTick: {show: false}, axisLabel: {color: muted}, splitLine: {show: false}},
    yAxis: {axisLine: {show: false}, splitLine: {lineStyle: {color: grid}}, axisLabel: {color: muted, formatter: v => fmt(v)}},
  };
}
// time axes: the date where a day starts (shown bold by ECharts), times of day in between only when zoomed in
const TIME_LABELS = {year: "{yyyy}", month: "{MMM} {d}", day: "{MMM} {d}", hour: "{HH}:{mm}", minute: "{HH}:{mm}", second: "{HH}:{mm}"};
// over more than two days: dates only (one tick per day at most)
const dayTicks = r => r.length > 1 && t(r[r.length - 1]) - t(r[0]) > 2 * 864e5 ? {minInterval: 864e5} : {};

// Line charts name each line with a badge sitting on it instead of a legend. items[i] = {text, rich, w, color} for
// series i. Every visible point is tried above and below its line; the spot farthest from the other lines and the
// badges already placed wins (its own line must not cross it). Redone on zoom and resize, since pixels move.
const BADGE_H = 32, BADGE_GAP = 6;   // badges a bit bigger (user, 2026-11-01)
function lineBadges(ch, items) {
  const opt = ch.getOption(), rect = ch.getModel().getComponent("grid").coordinateSystem.getRect(), surface = css("--surface-1");
  const px = opt.series.map((s, i) => s.type !== "line" ? [] :
    s.data.filter(d => d[1] != null).map(d => ch.convertToPixel({seriesIndex: i}, d)));
  const yAt = (pts, x) => {   // the polyline's pixel y at pixel x, null outside it
    for (let j = 1; j < pts.length; j++) {
      const [a, b] = [pts[j - 1], pts[j]];
      if (x >= a[0] && x <= b[0]) return b[0] === a[0] ? a[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    }
    return pts.length === 1 && Math.abs(pts[0][0] - x) < 1 ? pts[0][1] : null;
  };
  const clear = (pts, box) => {   // vertical clearance between a line and the box over its width (< 0: crosses it)
    let g = Infinity;
    for (let x = box[0]; x <= box[2]; x += 4) {
      const y = yAt(pts, x);
      if (y != null) g = Math.min(g, y < box[1] ? box[1] - y : y > box[3] ? y - box[3] : -1);
    }
    return g;
  };
  const boxGap = (a, b) => Math.max(a[0] - b[2], b[0] - a[2], a[1] - b[3], b[1] - a[3]);
  const placed = opt.series.flatMap(s => ((s.markLine && s.markLine.data) || []).filter(d => d.xAxis != null)
    .map(d => { const x = ch.convertToPixel({xAxisIndex: 0}, d.xAxis); return [x - 12, rect.y - 26, x + 12, rect.y]; }));   // the flags' number circles
  const done = new Set();   // items sharing a group (a line and its dashed lead-in) get one badge between them
  const marks = opt.series.map((s, i) => {
    const it = items[i];
    if (!it || !px[i].length || (it.group && done.has(it.group))) return {data: []};
    let best = null;
    const pts = s.data.filter(d => d[1] != null);
    // where a badge may go: the data points, plus points along the line every 24 px, so a line still gets its
    // badge when zoomed in between two readings
    const spots = px[i].map((p, j) => [p, pts[j]]);
    for (let x = rect.x + 12; x < rect.x + rect.width - 12; x += 24) {
      const y = yAt(px[i], x);
      if (y != null && y >= rect.y && y <= rect.y + rect.height) spots.push([[x, y], ch.convertFromPixel({seriesIndex: i}, [x, y])]);
    }
    spots.forEach(([[x, y], coord]) => {
      if (x < rect.x || x > rect.x + rect.width || y < rect.y - 1 || y > rect.y + rect.height + 1) return;   // zoomed out of view
      // above, below, left or right of the point (user, 2026-11-01): beside a steep stretch the line stays clear
      for (const dir of ["top", "bottom", "left", "right"]) {
        const cx = x + (dir === "left" ? -1 : dir === "right" ? 1 : 0) * (it.w / 2 + BADGE_GAP);
        const cy = y + (dir === "top" ? -1 : dir === "bottom" ? 1 : 0) * (BADGE_H / 2 + BADGE_GAP);
        const box = [cx - it.w / 2, cy - BADGE_H / 2, cx + it.w / 2, cy + BADGE_H / 2];
        if (box[0] < rect.x || box[2] > rect.x + rect.width || box[1] < rect.y - 26 || box[3] > rect.y + rect.height) continue;   // the empty top margin is fair game
        const near = Math.min(Infinity, ...placed.map(b => boxGap(box, b)));
        let score = Math.min(60, near, ...px.map((p, k) => k === i ? Infinity : clear(p, box))) + x / rect.width;   // ties: newer end
        if (clear(px[i], box) < 0) score -= 1000;   // its own line crossing it: only when nothing else fits
        if (near < 0) score -= 2000;                // covering another badge: worse still
        if (!best || score > best.score) best = {score, box, coord, dir};
      }
    });
    if (!best) return {data: []};
    placed.push(best.box);
    if (it.group) done.add(it.group);
    return {silent: true, animation: false, symbol: "circle", symbolSize: 1, itemStyle: {color: "transparent"},
      data: [{coord: best.coord, label: {show: true, position: best.dir, distance: BADGE_GAP,
        formatter: it.text, rich: it.rich, fontSize: it.fontSize || 12, color: css("--text-secondary"), backgroundColor: surface,
        ...(it.ring ? {borderColor: it.color, borderWidth: 2} : {}),   // a ring in the line's colour (pale emoji like 🔖 vanish otherwise)
        borderRadius: BADGE_H / 2, padding: [3, 7], height: BADGE_H - 8, lineHeight: BADGE_H - 8}}]};
  });
  ch.setOption({series: marks.map(markPoint => ({markPoint}))});
}
// zoomed in: the y axis tops out just above the highest point still in view, so low lines spread apart
// (zoomed all the way out: back to ECharts' own scale)
function fitY(ch) {
  const z = ch.getOption().dataZoom, x = ch.getModel().getComponent("xAxis", 0).axis.scale.getExtent();
  if (!z || !z.length || (z[0].start <= 0 && z[0].end >= 100)) { ch.setOption({yAxis: {max: null}}); return; }
  const num = v => typeof v === "number" ? v : new Date(v).getTime();
  let top = 0;
  ch.getOption().series.forEach(s => {
    if (s.type !== "line") return;
    const d = s.data.filter(p => p && p[1] != null).map(p => [num(p[0]), p[1]]);
    d.forEach(([px, py], j) => {
      if (px >= x[0] && px <= x[1]) top = Math.max(top, py);
      const q = d[j + 1];   // a segment crossing a window edge counts at the edge
      if (q) for (const e of x) if (px < e && q[0] > e) top = Math.max(top, py + (q[1] - py) * (e - px) / (q[0] - px));
    });
  });
  if (!top) { ch.setOption({yAxis: {max: null}}); return; }
  const room = top * 1.18;   // headroom above the top line, so its number badge sits inside the chart
  const mag = 10 ** Math.floor(Math.log10(room));
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(s => s * mag >= room);
  ch.setOption({yAxis: {max: step * mag}});
}
function withBadges(id, items) {   // draw now and again whenever the visible window changes
  const ch = chart(id), draw = () => lineBadges(ch, items);
  ch.off("datazoom"); ch.off("finished");
  ch.on("datazoom", () => setTimeout(() => { fitY(ch); draw(); }));
  let w = ch.getWidth();
  ch.on("finished", () => { if (ch.getWidth() !== w) { w = ch.getWidth(); draw(); } });   // after a resize
  draw();
}
const platTip = ps => `<b>${ps[0].axisValueLabel}</b><br>` + ps.filter(x => x.value[1] != null).sort((a, b) => b.value[1] - a.value[1])
  .map(x => `${x.seriesName === TOTAL ? inkImg : byLabel(x.seriesName) ? iconHtml(byLabel(x.seriesName)) : esc(x.seriesName)} <b>${fmt(x.value[1])}</b>`).join("<br>");   // logos, biggest first
const platBadge = p => ({text: iconText(p.label), rich: richIcons(21), color: css(p.c), w: 21 + 14 + (p.tag === "image" ? 24 : p.tag ? p.tag.length * 7 + 4 : 0)});
// the total of all lines, named by the Ink logo (user, 2026-11-03): in the brand gold, a bit thicker than the platform lines
const TOTAL = "Total";
const inkImg = `<img src="logo.png" alt="Total" title="Total" class="pl">`;
const totalLook = () => lineLook(css("--accent"), {width: 3.5, opacity: .95});
const totalBadge = () => ({text: "{ink|}", rich: {ink: {backgroundColor: {image: "logo.png"}, width: 22, height: 22}}, color: css("--accent"), w: 36});
// each chart's Total chip shows its total line, off by default (user, 2026-11-04); remembered per chart in this browser
const yesTotal = new Set((() => { try { return JSON.parse(localStorage.getItem("ink-total-on") || "[]"); } catch (e) { return []; } })());
const showTotal = id => yesTotal.has(id);
const withTotal = (id, list, item) => showTotal(id) ? list.concat(item) : list;
const totalSeries = (data, extra = {}) => ({name: TOTAL, type: "line", data, smooth: .25, symbol: "circle", symbolSize: 8,
  showSymbol: data.length < 30, z: 3, ...totalLook(), ...extra});

// zoom (user, 2026-11-04): drag a box to zoom in, pinch / Ctrl+scroll to zoom, Shift+drag to pan, the slider below to fine-tune;
// double-click or "Reset zoom" shows everything again. Plain scrolling still scrolls the page.
const timeZoom = () => [{type: "inside", filterMode: "none", zoomOnMouseWheel: false, moveOnMouseWheel: false, moveOnMouseMove: "shift"},
  {type: "slider", filterMode: "none", height: 20, bottom: 6, borderColor: "transparent",
   fillerColor: "rgba(200,137,43,.15)", dataBackground: {lineStyle: {color: css("--text-muted")}, areaStyle: {opacity: 0}},
   handleStyle: {color: css("--accent")}, textStyle: {color: css("--text-muted")}}];

// box zoom + reset for a chart with dataZoom; call after its setOption (and after withBadges, which clears datazoom handlers)
function zoomUX(id) {
  const ch = chart(id), el = $(id);
  const zr = ch.getZr();
  // drag a box: mousedown inside the plot, a shaded band follows the pointer, mouseup zooms the x axis to it
  // (Shift+drag pans instead, via the inside dataZoom)
  if (ch.__box) { zr.off("mousedown", ch.__box.down); zr.off("mousemove", ch.__box.move); zr.off("mouseup", ch.__box.up); }
  let x0 = null, band = null;
  const plot = () => ch.getModel().getComponent("grid").coordinateSystem.getRect();
  const clear = () => { if (band) { zr.remove(band); band = null; } x0 = null; };
  ch.__box = {
    down: e => {
      const r = plot();
      if (e.event && e.event.shiftKey) return;
      if (e.offsetX < r.x || e.offsetX > r.x + r.width || e.offsetY < r.y || e.offsetY > r.y + r.height) return;
      x0 = e.offsetX;
    },
    move: e => {
      if (x0 == null) return;
      const r = plot(), x = Math.max(r.x, Math.min(r.x + r.width, e.offsetX));
      if (!band) { band = new echarts.graphic.Rect({shape: {x: x0, y: r.y, width: 0, height: r.height}, silent: true, z: 100,
                    style: {fill: "rgba(200,137,43,.15)", stroke: "rgba(200,137,43,.6)", lineWidth: 1}}); zr.add(band); }
      band.setShape({x: Math.min(x0, x), width: Math.abs(x - x0)});
    },
    up: e => {
      if (x0 == null) return;
      const r = plot(), x = Math.max(r.x, Math.min(r.x + r.width, e.offsetX)), a = Math.min(x0, x), b = Math.max(x0, x);
      clear();
      if (b - a < 8) return;                                   // a click, not a drag
      const v = px => ch.convertFromPixel({xAxisIndex: 0}, px);
      ch.dispatchAction({type: "dataZoom", startValue: v(a), endValue: v(b)});
    },
  };
  zr.on("mousedown", ch.__box.down); zr.on("mousemove", ch.__box.move); zr.on("mouseup", ch.__box.up);
  // pinch on a trackpad (the browser sends it as Ctrl+wheel) or Ctrl/Cmd+scroll: zoom around the pointer; plain scroll = page
  if (!el.__wheel) {
    el.__wheel = e => {
      if ((!e.ctrlKey && !e.metaKey) || !el.contains(e.target)) return;
      const c = chart(id), z = (c.getOption().dataZoom || [])[0];
      if (!z) return;
      e.preventDefault();
      const r = c.getModel().getComponent("grid").coordinateSystem.getRect();
      const fx = Math.max(0, Math.min(1, (e.clientX - el.getBoundingClientRect().left - r.x) / r.width));
      const k = Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.01), span = z.end - z.start;
      const ns = Math.max(0.5, Math.min(100, span * k)), at = z.start + span * fx;
      let a = at - ns * fx, b = a + ns;
      if (a < 0) { b -= a; a = 0; } if (b > 100) { a -= b - 100; b = 100; }
      c.dispatchAction({type: "dataZoom", start: Math.max(0, a), end: Math.min(100, b)});
    };
    // on the document, capture phase: a listener on the chart or its card never saw the event (something stops it on the way)
    document.addEventListener("wheel", el.__wheel, {passive: false, capture: true});
  }
  let btn = el.parentElement.querySelector(".zoom-reset");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "chip zoom-reset"; btn.type = "button"; btn.textContent = "Reset zoom"; btn.hidden = true;
    el.parentElement.style.position = "relative";
    el.parentElement.appendChild(btn);
  }
  const reset = () => ch.dispatchAction({type: "dataZoom", start: 0, end: 100});
  btn.onclick = reset;
  const sync = () => { const z = (ch.getOption().dataZoom || [])[0]; btn.hidden = !z || (z.start <= 0.5 && z.end >= 99.5); };
  if (ch.__zoomSync) ch.off("datazoom", ch.__zoomSync);
  ch.__zoomSync = () => setTimeout(sync);
  ch.on("datazoom", ch.__zoomSync);
  if (ch.__dbl) zr.off("dblclick", ch.__dbl);
  ch.__dbl = reset;
  zr.on("dblclick", ch.__dbl);
  sync();
}

// a dashed, numbered line at each post in range; each chart's Posts chip hides them (user, 2026-11-06), on by default
const noPosts = new Set((() => { try { return JSON.parse(localStorage.getItem("ink-posts-off") || "[]"); } catch (e) { return []; } })());
const showPosts = id => !noPosts.has(id);
function postLines(id, series, r) {
  if (!showPosts(id) || !series.length || !r.length) return;
  const lo = t(r[0]), hi = t(latest());
  const flags = Object.entries(latest().cartoons).map(([n, c]) => [n, postedAt(c)])
    .filter(([, at]) => at && new Date(at).getTime() >= lo && new Date(at).getTime() <= hi);
  if (flags.length) series[0].markLine = {
    symbol: "none", silent: true, animation: false,
    lineStyle: {color: css("--text-muted"), type: "dashed", width: 1},
    label: {formatter: d => `{num|${d.name}}`, position: "end", distance: 4, rich: {num: numRich(18)}},   // upright, above the plot
    data: flags.map(([n, at]) => ({name: n, xAxis: at}))};
}

function renderTrend() {
  const r = inRange(), surface = css("--surface-1");
  const series = on().map(p => {
    const pts = r.map(s => [s.updated, totals(s)[p.k]]);
    return {name: p.label, type: "line", data: pts, smooth: .25, symbol: "circle", symbolSize: 8, showSymbol: pts.length < 30,
            ...lineLook(css(p.c), xDash(p))};
  });
  if (showTotal("cTrend")) series.push(totalSeries(r.map(s => [s.updated, allViews(s)])));
  postLines("cTrend", series, r);
  const o = base();
  chart("cTrend").setOption({
    ...o, series, legend: {...o.legend, show: false},
    grid: {...o.grid, bottom: 52},
    tooltip: {...o.tooltip, formatter: platTip},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    dataZoom: timeZoom(),
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "The trend fills in as refreshes come in (twice a day).", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
  withBadges("cTrend", withTotal("cTrend", on().map(platBadge), totalBadge()));
  zoomUX("cTrend");
}

// views per cartoon by age: each line starts when its cartoon was posted, so old and new cartoons compare fairly
const AGE_LAST = 5;
const ageAll = () => { try { return localStorage.getItem("ink-age-all") === "1"; } catch (e) { return false; } };
function renderAge() {
  const all = snaps(), o = base(), muted = css("--text-muted"), surface = css("--surface-1");
  // the last 5 cartoons by default; "All cartoons" shows every one (user, 2026-11-04), remembered in this browser
  const cs = Object.entries(latest().cartoons).filter(([, c]) => postedAt(c)).sort((a, b) => +a[0] - +b[0])
    .slice(ageAll() ? 0 : -AGE_LAST);
  const days = (s, at) => (t(s) - new Date(at).getTime()) / 864e5;
  const lines = cs.map(([n, c]) => {
    const at = postedAt(c);
    return [n, all.map((s, i) => [s, i]).filter(([s]) => s.cartoons[n] && days(s, at) >= 0)
                  .map(([s, i]) => [days(s, at), cartoonViews(s.cartoons[n]), i])];   // i: the snapshot, for the hover breakdown
  });
  // each cartoon its own hue (golden-angle steps, so neighbours differ), faint until hovered, then it glows in that hue
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const hue = n => `hsl(${(+n * 137.5) % 360}, ${dark ? 70 : 62}%, ${dark ? 62 : 45}%)`;
  const look = n => ({...lineLook(hue(n)), emphasis: {focus: "none"}});   // no fading here: the hover box names the lines (user)
  const series = [
    ...lines.map(([n, data]) => ({name: n, type: "line", data, smooth: .25, showSymbol: false, symbol: "circle", symbolSize: 8, ...look(n)})),
    // posted before tracking began: a dashed line from 0 views at posting to the first reading
    ...lines.filter(([, d]) => d.length && d[0][0] > .1).map(([n, d]) => ({name: n, type: "line", data: [[0, 0], d[0]], silent: true,
      showSymbol: false, tooltip: {show: false}, ...look(n), lineStyle: {...look(n).lineStyle, type: "dashed", width: 1, opacity: .25}}))];
  const title = n => (latest().cartoons[n] || {}).title || "";
  const age = d => d < 2 ? `${fmt(d * 24)} h` : `${fmt(d, 1)} days`;
  const ch = chart("cAge");
  let mouseY = 0;   // the hover box describes only the line nearest the pointer (user, 2026-11-01: one box, not a stack)
  // swap only our own listeners: a bare off("mousemove") also removes the one ECharts drags the zoom handles with
  const zr = ch.getZr(), mine = ch.__ageHandlers || {};
  if (mine.move) zr.off("mousemove", mine.move);
  if (mine.out) zr.off("globalout", mine.out);
  let lit = [];
  ch.__ageHandlers = {move: e => { mouseY = e.offsetY; }, out: () => { lit = []; ch.dispatchAction({type: "downplay"}); }};
  zr.on("mousemove", ch.__ageHandlers.move);
  zr.on("globalout", ch.__ageHandlers.out);
  const at = (d, x) => {   // the line's views at day x (straight between readings), null outside it
    if (!d.length || x < d[0][0] || x > d[d.length - 1][0]) return null;
    const j = d.findIndex(p => p[0] >= x);
    if (j <= 0) return d[0][1];
    const [a, b] = [d[j - 1], d[j]];
    return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
  };
  const hover = ps => {
    const x = ps.length ? ps[0].axisValue : null;
    if (x == null) return "";
    const near = lines.map(([n, d]) => { const v = at(d, x); return v == null ? null : {n, d, px: ch.convertToPixel({xAxisIndex: 0, yAxisIndex: 0}, [x, v])[1]}; })
      .filter(Boolean).map(l => ({...l, gap: Math.abs(l.px - mouseY)})).sort((a, b) => a.gap - b.gap);
    if (!near.length) return "";
    const shown = [near[0]];
    const idx = shown.map(l => lines.findIndex(([n]) => n === l.n));
    lit = idx;   // light up exactly the lines in the box, after ECharts' own pick (the nearest reading) has been drawn
    setTimeout(() => { if (lit === idx) { ch.dispatchAction({type: "downplay"}); ch.dispatchAction({type: "highlight", seriesIndex: idx}); } });
    return shown.map(({n, d}) => {
      const p = d.reduce((best, q) => Math.abs(q[0] - x) < Math.abs(best[0] - x) ? q : best);   // the reading nearest the pointer
      const c = all[p[2]].cartoons[n];
      const rows = on().map(pl => [pl, views(c, pl.k)]).filter(([, v]) => v).sort((a, b) => b[1] - a[1]);
      return `<b>${num(n)} ${esc(title(n))}</b> · ${age(p[0])} after posting<br>` +
        `Total: <b>${fmt(p[1])}</b><br>` +   // the total first (user, 2026-11-01), then each platform
        rows.map(([pl, v]) => `${iconHtml(pl)} <b>${fmt(v)}</b>`).join("<br>");
    }).join("");
  };
  ch.setOption({
    ...o, legend: {show: false},
    grid: {...o.grid, bottom: 52},
    tooltip: {...o.tooltip, formatter: hover},
    xAxis: {...o.xAxis, type: "value", min: 0, minInterval: 1,
            axisLabel: {...o.xAxis.axisLabel, formatter: v => v ? `day ${Number.isInteger(v) ? v : fmt(v, 1)}` : "posted"}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    dataZoom: [{type: "inside", filterMode: "none", zoomOnMouseWheel: false, moveOnMouseWheel: false, moveOnMouseMove: "shift"},   // as on Views over time
               {type: "slider", filterMode: "none", height: 20, bottom: 6, borderColor: "transparent",
               fillerColor: "rgba(200,137,43,.15)", dataBackground: {lineStyle: {color: css("--text-muted")}, areaStyle: {opacity: 0}},
               handleStyle: {color: css("--accent")}, textStyle: {color: css("--text-muted")}, labelFormatter: v => age(v)}],
    series,
    graphic: series.length ? [] : [{type: "text", left: "center", top: "middle",
      style: {text: "No posted cartoons yet.", fill: muted, fontSize: 13}}],
  }, true);
  const badge = n => ({text: `{num|${n}}`, rich: {num: {...numRich(22), backgroundColor: hue(n)}}, w: 28, group: n});   // circle = line colour
  withBadges("cAge", [...lines.map(([n]) => badge(n)),   // the dashed lead-ins badge their cartoon only when its solid line is out of view
                      ...lines.filter(([, d]) => d.length && d[0][0] > .1).map(([n]) => badge(n))]);
  zoomUX("cAge");
}

function renderMix() {
  const tt = totals(latest()), ps = on().slice().sort((a, b) => tt[a.k] - tt[b.k]), all = ps.reduce((a, p) => a + tt[p.k], 0) || 1;
  const o = base();
  chart("cMix").setOption({
    ...o, legend: {show: false}, grid: {...o.grid, top: 8, right: 70},
    tooltip: {...o.tooltip, trigger: "item", formatter: d => `${iconHtml(byLabel(d.name))} <b>${fmt(d.value)}</b> (${fmt(d.value / all * 100)}%)`},
    xAxis: {...o.xAxis, type: "value", splitLine: {lineStyle: {color: css("--grid")}}},
    yAxis: {...o.yAxis, type: "category", data: ps.map(p => p.label), splitLine: {show: false},
            axisLabel: {color: css("--text-secondary"), formatter: iconText, rich: richIcons(18)}},
    series: [{type: "bar", barMaxWidth: 26, data: ps.map(p => ({value: tt[p.k], itemStyle: {color: css(p.c), borderRadius: [0, 4, 4, 0]}})),
              label: {show: true, position: "right", color: css("--text-secondary"), formatter: d => `${fmt(d.value)} · ${fmt(d.value / all * 100)}%`}}],
  }, true);
}

// ---- engagement ------------------------------------------------------------------
function renderEngTrend() {
  const r = inRange(), o = base(), surface = css("--surface-1");
  const engSeries = ENG.map(([k, l, ic, c]) => ({
      name: ic, type: "line", step: "end", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30,
      data: r.map(s => [s.updated, k === "new_followers" ? allFollowers(s) : engAll(s, k)]),
      ...lineLook(css(c))})).concat(
      // all interactions together (👍 💬 ↗ 🔖; new followers are not interactions)
      showTotal("cEngTrend") ? [totalSeries(r.map(s => [s.updated, allInter(s)]), {step: "end", smooth: false})] : []);
  postLines("cEngTrend", engSeries, r);
  chart("cEngTrend").setOption({
    ...o, legend: {show: false},
    grid: {...o.grid, bottom: 52},   // room for the zoom slider, as on Views over time
    dataZoom: timeZoom(),
    tooltip: {...o.tooltip, formatter: ps => `<b>${ps[0].axisValueLabel}</b><br>` +   // icon then number, no gap
      ps.slice().sort((a, b) => b.value[1] - a.value[1]).map(x => `${x.seriesName === TOTAL ? inkImg : x.marker + x.seriesName} <b>${fmt(x.value[1])}</b>`).join("<br>")},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: engSeries,
  }, true);
  withBadges("cEngTrend", withTotal("cEngTrend", ENG.map(([k, l, ic, c]) => ({text: ic, fontSize: 19, color: css(c), w: 40})), totalBadge()));
  zoomUX("cEngTrend");
}

const TOP_N = 15;   // Performance per Cartoon shows this many bars; the Cartoons table shows this many rows before scrolling (card #139)
function renderEngPosts() {
  const total = c => ENG.reduce((a, [k]) => a + eng(c, k), 0);
  const key = perfSort() === "views" ? cartoonViews : total;   // the "Sort by" chips (user, 2026-11-07)
  const all = Object.entries(latest().cartoons).sort((a, b) => key(b[1]) - key(a[1]) || +a[0] - +b[0]),   // highest first
        cs = all.slice(0, TOP_N),   // only the top 15 by the chosen sort, so the chart stays readable as cartoons pile up (card #139)
        o = base(), surface = css("--surface-1");
  const any = cs.some(([, c]) => ENG.some(([k]) => eng(c, k)));
  $("perfCount").textContent = all.length > TOP_N ? `top ${TOP_N} of ${all.length}` : "";
  chart("cEngPosts").setOption({
    ...o, legend: {show: false}, grid: {...o.grid, top: 16},   // no legend: the hover box names each part
    tooltip: {...o.tooltip, trigger: "item",   // the views bar shows views; the stack shows its engagement
              formatter: p => { const [n, c] = cs[p.dataIndex], head = `<b>${num(n)} ${esc(c.title)}</b><br>`;
                return head + (p.seriesName === "👁" ? `👁 <b>${fmt(p.value)}</b>`
                  : ENG.map(([k, , ic, col]) => [ic, eng(c, k), col]).sort((a, b) => b[1] - a[1])   // the hovered part in its bar colour
                      .map(([ic, v, col]) => ic === p.seriesName ? `<span style="background:${css(col)};color:#fff;font-weight:700;border-radius:4px;padding:1px 6px;margin-left:-6px">${ic} ${fmt(v)}</span>` : `${ic} <b>${fmt(v)}</b>`).join("<br>")); }},
    xAxis: {...o.xAxis, type: "category", data: cs.map(([n]) => `{num|${n}}`),   // numbers only; the title is in the tooltip
            axisLabel: {...o.xAxis.axisLabel, interval: 0, fontSize: 11, rich: {num: numRich(16)}}},
    yAxis: [{...o.yAxis, type: "value", minInterval: 1},
            {...o.yAxis, type: "value", minInterval: 1, position: "right", splitLine: {show: false}}],   // total views on the right
    series: [...ENG.map(([k, l, ic, c], i) => ({
      name: ic, type: "bar", stack: "eng", barMaxWidth: 34, data: cs.map(([, cc]) => eng(cc, k)),
      itemStyle: {color: css(c), borderColor: surface, borderWidth: 1,
                  borderRadius: i === ENG.length - 1 ? [4, 4, 0, 0] : 0}, emphasis: {focus: "series"}})),
      {name: "👁", type: "bar", yAxisIndex: 1, barMaxWidth: 34, barGap: "15%", data: cs.map(([, cc]) => cartoonViews(cc)),   // beside the stack
       itemStyle: {color: css("--text-muted"), opacity: 0.55, borderRadius: [4, 4, 0, 0]}, emphasis: {focus: "series"}}],
    graphic: any ? [] : [{type: "text", left: "center", top: "middle",
      style: {text: "No 👍 💬 ↗ 🔖 yet on the selected platforms.", fill: css("--text-muted"), fontSize: 13}}],
  }, true);
}

// ---- comments --------------------------------------------------------------------
const ago = iso => {
  const m = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${Math.round(m)} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};
function commentList(only) {   // newest first, enabled platforms; only = one cartoon id
  const all = [];
  for (const [n, cs] of Object.entries((DATA && DATA.comments) || {}))
    if (!only || +n === only) cs.forEach(c => all.push({...c, n: +n}));
  return all.filter(c => !state.off.has(c.platform)).sort((a, b) => b.at.localeCompare(a.at));
}
function commentHtml(c, withCartoon, reply) {
  const p = PLAT.find(x => x.k === c.platform);
  const thread = (c.thread || []).map(r => commentHtml({...r, n: c.n}, false, true)).join("");
  const needs = !reply && !c.ours && !(c.thread || []).some(r => r.ours);
  const title = withCartoon ? `<span class="cm-cartoon">${num(c.n)} ${esc((latest().cartoons[c.n] || {}).title || "")}</span>` : "";
  const link = c.url && /^https:\/\//.test(c.url) ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">reply ↗</a>` : "";
  return `<div class="cm${reply ? " cm-reply" : ""}${c.ours ? " cm-ours" : ""}"><div class="cm-h">${p ? iconHtml(p) : ""}<b>@${esc(c.user)}</b>${c.ours ? `<span class="badge">you</span>` : ""}${needs ? `<span class="badge cm-needs">needs a reply</span>` : ""}${title}
    <span class="muted">${ago(c.at)}${c.likes ? ` · 👍 ${fmt(c.likes)}` : ""}</span>${link}</div>
    <div class="cm-t">${esc(c.text)}</div>${thread}</div>`;
}
function renderComments() {
  const cs = commentList();
  const nr = cs.reduce((a, c) => a + (c.thread || []).length, 0);
  $("commentCount").textContent = cs.length ? `${cs.length} comment${cs.length === 1 ? "" : "s"}${nr ? ` · ${nr} repl${nr === 1 ? "y" : "ies"}` : ""}` : "";
  $("comments").innerHTML = cs.length ? cs.map(c => commentHtml(c, true)).join("")
    : `<p class="note">No comments yet on the selected platforms. (X replies aren't collected; Threads needs one more permission.)</p>`;
}

// ---- leaderboard --------------------------------------------------------------------
function spark(values) {
  if (values.length < 2) return `<span class="muted">·</span>`;
  const w = 80, h = 22, max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1) * (w - 4) + 2).toFixed(1)},${(h - 2 - (v - min) / span * (h - 4)).toFixed(1)}`);
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <polyline points="${pts.join(" ")}" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length - 1].split(",")[0]}" cy="${pts[pts.length - 1].split(",")[1]}" r="2.5" fill="var(--accent)"/></svg>`;
}
// is cartoon n live on dashboard column k? From links.json via stats.py (DATA.posted, card #88, 2026-11-10)
const posted = (n, k) => ((DATA && DATA.posted || {})[String(n)] || []).includes(k);
function renderBoard() {
  const r = inRange(), now = latest(), ps = on();
  const past = snaps().filter(s => t(s) <= t(now) - 864e5), day = past.length ? past[past.length - 1] : null;
  const rows = Object.entries(now.cartoons).map(([n, c]) => {
    const row = {n: +n, c, total: cartoonViews(c), inter: ps.reduce((a, p) => a + inter(c[p.k]), 0)};
    ENG.forEach(([k]) => { row[k] = eng(c, k); });
    row.rate = rate(c); row.tw = watch(c, "tiktok"); row.rw = watch(c, "instagram_reel");
    row.tc = c.tiktok && c.tiktok.completion_pct != null ? c.tiktok.completion_pct : null;
    // posted but not read yet (X every 3 h, LinkedIn every 4 h) shows 0; "–" only where it was never posted (card #88)
    ps.forEach(p => { row[p.k] = c[p.k] ? c[p.k].views : posted(n, p.k) ? 0 : null; });
    // views since the same time yesterday (user, 2026-11-03), not since the start of the shown range
    row.change = !day ? null : day.cartoons[n] ? row.total - cartoonViews(day.cartoons[n]) : row.total;   // posted within the day: all of it
    row.trend = r.map(s => s.cartoons[n] ? cartoonViews(s.cartoons[n]) : 0);
    return row;
  });
  // column order (user, 2026-11-03): platforms by total views, biggest first; the interaction kinds the same way, by their totals.
  // No Instagram image column (user, 2026-11-09: feed images stopped 2026-11-02), but its views and interactions still
  // count in the Views, Δ (1D), Interactions and per-kind columns
  const sum = k => rows.reduce((a, row) => a + (row[k] || 0), 0);
  const pcols = ps.filter(p => p.k !== "instagram_image").sort((a, b) => sum(b.k) - sum(a.k));
  const ecols = ENG.slice().sort((a, b) => sum(b[0]) - sum(a[0]));
  const {key, asc} = state.sort;
  rows.sort((a, b) => ((key === "n" ? a.n - b.n : (a[key] ?? -1) - (b[key] ?? -1))) * (asc ? 1 : -1));
  const cols = [["n", "Cartoon"], ["total", `<span title="Total views on all platforms">∑</span>`], ["change", `<span title="Views since the same time yesterday">Δ (1D)</span>`], ...pcols.map(p => [p.k, iconHtml(p)]), ["inter", `<span title="Total interactions: likes, comments, shares, saves">∑</span>`], ...ecols.map(([k, l, ic]) => [k, `<span title="${l}">${ic}</span>`]),
                ["rate", `<span title="Engagement rate: interactions per 100 views">Eng %</span>`],
                ["tw", `<span title="TikTok average watch time">⏱ ${iconHtml(PLAT[0])}</span>`],
                ["tc", `<span title="TikTok: watched to the end">✓ ${iconHtml(PLAT[0])}</span>`],
                ["rw", `<span title="Instagram average watch time">⏱ ${iconHtml(PLAT[1])}</span>`],
                [null, "Trend"]];
  $("board").innerHTML = `<thead><tr>${cols.map(([k, l]) =>
      `<th ${k ? `data-k="${k}"` : ""} class="${k === key ? "sorted" + (asc ? " asc" : "") : ""}">${l}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(row => `<tr data-n="${row.n}" class="${row.n === state.sel ? "sel" : ""}">
      <td><div class="cell-cartoon">${thumb(row.n)}<span>${num(row.n)} ${esc(row.c.title)}</span></div></td>
      <td><b>${fmt(row.total)}</b></td>
      <td>${row.change == null ? `<span class="muted">–</span>` : delta(row.total, row.total - row.change)}</td>${pcols.map(p => `<td>${fmt(row[p.k])}</td>`).join("")}
      <td><b>${fmt(row.inter)}</b></td>${ecols.map(([k]) => `<td class="${row[k] ? "" : "muted"}">${fmt(row[k])}</td>`).join("")}
      <td>${row.rate == null ? "–" : fmt(row.rate, 1) + "%"}</td><td>${row.tw == null ? "–" : fmt(row.tw, 1) + " s"}</td>
      <td>${row.tc == null ? "–" : fmt(row.tc, 1) + "%"}</td><td>${row.rw == null ? "–" : fmt(row.rw, 1) + " s"}</td>
      <td>${spark(row.trend)}</td></tr>`).join("") + "</tbody>";
  $("boardCount").textContent = rows.length > TOP_N ? `top ${TOP_N} of ${rows.length} · scroll for the rest` : "";
  fitBoard();
  $("board").querySelector("thead").onclick = e => {
    const th = e.target.closest("th[data-k]"); if (!th) return;
    const k = th.dataset.k;
    state.sort = {key: k, asc: state.sort.key === k ? !state.sort.asc : k === "n"};
    renderBoard();
  };
  $("board").querySelector("tbody").onclick = e => {
    const tr = e.target.closest("tr[data-n]"); if (!tr) return;
    state.sel = +tr.dataset.n === state.sel ? null : +tr.dataset.n;
    renderBoard(); renderDetail(); renderComments();
    if (state.sel) $("detail").scrollIntoView({behavior: "smooth", block: "nearest"});
  };
}

// the table box is as tall as its header plus the first TOP_N rows; the rest scroll inside it, header pinned (card #139)
function fitBoard() {
  const box = $("board").parentElement, trs = $("board").querySelectorAll("tbody tr");
  if (trs.length <= TOP_N) { box.style.maxHeight = "none"; return; }
  const last = trs[TOP_N - 1], h = last.offsetTop + last.offsetHeight;
  box.style.maxHeight = h > 0 ? `${h + 1}px` : "";
}
addEventListener("resize", () => { if (DATA && !$("socialView").hidden) fitBoard(); });

function renderDetail() {
  const n = state.sel, c = n && latest().cartoons[n];
  $("detail").hidden = !c;
  if (!c) return;
  $("detailTitle").innerHTML = `${thumb(n, "thumb lg")}${num(n)} ${esc(c.title)}`;
  // the post's whole life, whatever the page's range buttons say (user, 2026-11-01): from posting to the latest reading
  const r = snaps().filter(s => s.cartoons[n]), o = base(), surface = css("--surface-1");
  const born = postedAt(c), from = born ? Math.min(new Date(born).getTime(), r.length ? t(r[0]) : Infinity) : undefined;
  chart("cDetail").resize();
  const ps = on().filter(p => c[p.k]);
  const lead = p => {   // posted before tracking began: start the line at 0 views when that platform posted
    const at = c[p.k] && c[p.k].posted_at;
    return at && r.length && new Date(at).getTime() < t(r[0]) ? [[at, 0]] : [];
  };
  chart("cDetail").setOption({
    ...o, legend: {show: false},
    tooltip: {...o.tooltip, formatter: platTip},
    xAxis: {...o.xAxis, type: "time", min: from, max: r.length ? t(r[r.length - 1]) : undefined,
            ...dayTicks(born ? [{updated: born}, ...r] : r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ps.map(p => ({
      name: p.label, type: "line", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30, connectNulls: true,
      data: r.map(s => [s.updated, s.cartoons[n] && s.cartoons[n][p.k] ? s.cartoons[n][p.k].views : null]),
      ...lineLook(css(p.c), xDash(p))})).concat(
      showTotal("cDetail") ? [totalSeries(r.map(s => [s.updated, s.cartoons[n] ? cartoonViews(s.cartoons[n]) : null]), {connectNulls: true})] : [],
      // posted before tracking began: a dashed line from 0 at posting to the first reading (after the badged lines)
      ps.map(p => { const l = lead(p), f = r.find(s => s.cartoons[n] && s.cartoons[n][p.k]);
        return l.length && f ? {name: p.label, type: "line", silent: true, showSymbol: false, tooltip: {show: false},
          data: [...l, [f.updated, f.cartoons[n][p.k].views]], lineStyle: {width: 1.5, type: "dashed", opacity: .5, color: css(p.c)}} : null; })
        .filter(Boolean)),
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "History builds up with each refresh.", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
  withBadges("cDetail", withTotal("cDetail", ps.map(platBadge), totalBadge()));
  const line = (label, d, extra = "") => d ? `<div class="row"><span>${label}</span><span>${fmt(d.views)} views${extra}
      ${d.url && /^https:\/\//.test(d.url) ? ` · <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">open ↗</a>` : ""}</span></div>` : "";
  const cms = commentList(n);
  $("detailStats").innerHTML = `<p class="note">“${esc(c.caption)}”</p>` +
    PLAT.map(p => {
      const d = c[p.k]; if (!d) return posted(n, p.k) ? line(iconHtml(p), {views: 0}, ` <span class="muted">· posted, not read yet</span>`) : "";
      const bits = [d.reach != null ? `reach ${fmt(d.reach)}` : "", inter(d) ? ENG.filter(([k]) => d[k]).map(([k, l, ic]) => `${ic} ${fmt(d[k])}`).join(" ") : "",
                    d.avg_watch_s ? `watch ${fmt(Math.min(d.avg_watch_s, 999), 1)} s` : "",
                    d.completion_pct != null ? `${fmt(d.completion_pct, 1)}% watched to the end` : "",
                    d.link_clicks ? `${fmt(d.link_clicks)} link clicks` : ""].filter(Boolean);
      return line(iconHtml(p), d, bits.length ? ` <span class="muted">· ${bits.join(" · ")}</span>` : "");
    }).join("") + (cms.length ? `<h3 class="cm-head">Comments</h3>${cms.map(x => commentHtml(x, false)).join("")}` : "");
}

// ---- everything ---------------------------------------------------------------------
document.querySelectorAll(".total-toggle").forEach(b => {
  const id = b.dataset.chart, sync = () => b.setAttribute("aria-pressed", String(showTotal(id)));
  sync();
  b.onclick = () => {
    showTotal(id) ? yesTotal.delete(id) : yesTotal.add(id);
    try { localStorage.setItem("ink-total-on", JSON.stringify([...yesTotal])); } catch (e) {}
    sync();
    ({cTrend: renderTrend, cEngTrend: renderEngTrend, cDetail: renderDetail})[id]();
  };
});

document.querySelectorAll(".posts-toggle").forEach(b => {
  const id = b.dataset.chart, sync = () => b.setAttribute("aria-pressed", String(showPosts(id)));
  sync();
  b.onclick = () => {
    showPosts(id) ? noPosts.add(id) : noPosts.delete(id);
    try { localStorage.setItem("ink-posts-off", JSON.stringify([...noPosts])); } catch (e) {}
    sync();
    ({cTrend: renderTrend, cEngTrend: renderEngTrend})[id]();
  };
});

const perfSort = () => { try { return localStorage.getItem("ink-perf-sort") || "eng"; } catch (e) { return "eng"; } };
{ const bs = document.querySelectorAll(".perf-sort [data-sort]");
  const sync = () => bs.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.sort === perfSort())));
  sync();
  bs.forEach(b => b.onclick = () => { try { localStorage.setItem("ink-perf-sort", b.dataset.sort); } catch (e) {} sync(); renderEngPosts(); }); }

{ const b = $("ageAll");
  if (b) {
    const sync = () => b.setAttribute("aria-pressed", String(ageAll()));
    sync();
    b.onclick = () => { try { localStorage.setItem("ink-age-all", ageAll() ? "0" : "1"); } catch (e) {} sync(); renderAge(); };
  } }

function renderAll() {
  document.querySelectorAll("#range button").forEach(b => b.classList.toggle("on", +b.dataset.r === state.range));
  const now = latest(), errs = Object.keys(now.errors || {});
  $("updated").textContent = `Updated ${new Date(now.updated).toLocaleString([], {dateStyle: "medium", timeStyle: "short"})}` +
    ` · ${snaps().length} snapshot${snaps().length === 1 ? "" : "s"} since ${new Date(snaps()[0].updated).toLocaleDateString([], {month: "short", day: "numeric"})}` +
    (errs.length ? ` · couldn't refresh: ${errs.join(", ")}` : "") + (REFRESH ? ` · ${REFRESH}` : "");
  const web = state.tab === "web", tl = state.tab === "timeline";
  document.querySelectorAll("#tab button").forEach(b => b.classList.toggle("on", b.dataset.t === state.tab));
  $("socialView").hidden = web || tl; $("webView").hidden = !web; $("tlView").hidden = !tl;
  $("range").hidden = tl;   // the timeline has no time range
  if (tl) { renderTimeline(); return; }
  fitCharts();   // charts sized while their tab was hidden come back squeezed (ECharts falls back to 100 px)
  if (web) { renderWeb(); return; }
  renderChanges(); renderTiles(); renderTrend(); renderAge(); renderEngTrend(); renderEngPosts(); renderMix(); renderBoard(); renderDetail(); renderComments();
  preloadBig();
}

// ---- timeline tab (card #155): the queued videos on a dated line, thumbnails only; hover one for the big picture.
// Image-only cartoons keep their slot as a small hollow dot so every date stays where it really is.
const hourText = h => h === 0 ? "12 am" : h < 12 ? `${h} am` : h === 12 ? "12 pm" : `${h - 12} pm`;
function untilText(ms) {
  if (ms <= 0) return "going out now";
  const m = Math.round(ms / 6e4), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  return d ? `in ${d} d ${h} h` : h ? `in ${h} h ${mm} m` : `in ${mm} min`;
}
// Reorder (card #161): "Change order" turns the line into drag and drop (‹ › buttons on touch screens). The dates stay
// where they are; the cartoons move between them and take the slot's number. Nothing is sent until Save: the live page
// seals {from, to, at} with the dashboard key and hands it to the Worker (POST /queue); the Mac applies it within
// ~30 s (queue_reorder.apply_pending) and publishes fresh data. The local page posts it to Scripts/dashboard_local.py.
const QUEUE_URL = "https://ink-analytics.inkideaandai.workers.dev/queue";
const TL = {edit: false, order: null, drag: null, pending: null, note: "", bad: false, busy: false};
const tlTitles = () => ((DATA.schedule && DATA.schedule.upcoming) || []).map(o => o.title);
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
function tlNote(text, bad = false) { TL.note = text; TL.bad = bad; }
function tlSettle() {   // fresh data in: did the Mac apply our Save (or refuse it)?
  const p = TL.pending, r = DATA.schedule && DATA.schedule.reorder;
  if (!p) return;
  if (r && r.at === p.at) { tlNote(r.msg, !r.ok); TL.pending = null; return; }
  if (sameList(tlTitles(), p.to)) { tlNote("Saved: the new order is live."); TL.pending = null; return; }
  if (!sameList(tlTitles(), p.from)) { tlNote("The queue changed meanwhile; check the order below.", true); TL.pending = null; }
}
async function tlSave() {
  const from = tlTitles(), to = TL.order.slice(), at = Date.now();
  if (sameList(from, to)) { TL.edit = false; tlNote(""); renderTimeline(); return; }
  TL.busy = true; tlNote("Saving…"); renderTimeline();
  try {
    if (LOCAL) {
      const r = await fetch("queue", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({from, to, at})});
      if (!(r.headers.get("Content-Type") || "").includes("json"))
        throw new Error("saving needs the local server: python3 Scripts/dashboard_local.py");
      const res = await r.json();
      const d = await fetch("local-data.json?t=" + Date.now(), {cache: "no-store"});
      if (d.ok) DATA = await d.json();
      TL.edit = !res.ok; tlNote(res.msg, !res.ok);
      if (!res.ok) TL.order = tlTitles();
    } else {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({name: "AES-GCM", iv, additionalData: enc.encode("ink-queue-v1")}, KEY,
                                             enc.encode(JSON.stringify({from, to, at})));
      const r = await fetch(QUEUE_URL, {method: "POST", headers: {"Content-Type": "text/plain"},
                                        body: JSON.stringify({v: 1, iv: toB64(iv), ct: toB64(ct)})});
      if (r.status === 200)   // an old Worker (before /queue) answers 200 "ok": nothing was stored (card #163)
        throw new Error("the website Worker hasn't been updated for saving yet; on the Mac run: python3 Scripts/analytics.py deploy");
      if (r.status !== 204) throw new Error(`the Worker said ${r.status}`);
      TL.edit = false; TL.pending = {from, to, at};
      tlNote("Saved. The Mac puts it in the queue within a minute…");
    }
  } catch (e) {
    tlNote(`Couldn't save (${e.message || e}). Your order is still here; try again.`, true);
  }
  TL.busy = false;
  renderAll();
  if (TL.pending) {
    await askFresh();
    if (TL.pending && DATA) {   // no answer yet: the row waits in the Worker for the Mac's next run
      tlNote("Sent, but the Mac hasn't applied it yet (asleep?). It goes in on its next run.", true); renderAll();
    }
  }
}
function tlMove(title, to) {
  const o = TL.order, from = o.indexOf(title);
  if (from < 0 || to < 0 || to >= o.length || to === from) return;
  o.splice(from, 1); o.splice(to, 0, title);
  renderTimeline();
}
function renderTimeline() {
  const S = DATA.schedule, up = (S && S.upcoming) || [];
  tlSettle();
  if (TL.edit && (!TL.order || !sameList([...TL.order].sort(), tlTitles().sort()))) TL.order = tlTitles();   // the queue changed under us
  const byTitle = Object.fromEntries(up.map(o => [o.title, o]));
  const order = TL.edit ? TL.order : TL.pending ? TL.pending.to : tlTitles();
  // the slots (date, number) stay; the cartoons fill them in the shown order
  const list = order.map((t, i) => ({...byTitle[t], date: up[i].date, n: up[0].n + i, was: byTitle[t].n}));
  const vids = list.filter(o => o.video), changed = TL.edit && !sameList(TL.order, tlTitles());
  $("tlEmpty").hidden = !!vids.length;
  $("tlView").querySelector(".tl-card-box").hidden = !vids.length;
  if (!vids.length) return;
  $("tlEdit").innerHTML = (TL.edit
    ? `<span class="tl-edit-hint">Drag the pictures into the order you want (or use ‹ ›); the dates stay put. Nothing changes until you save.</span>
       <button class="tl-btn" id="tlCancel" ${TL.busy ? "disabled" : ""}>Cancel</button>
       <button class="tl-btn primary" id="tlSave" ${changed && !TL.busy ? "" : "disabled"}>Save order</button>`
    : `<button class="tl-btn" id="tlStart" ${TL.pending ? "disabled" : ""}>⇄ Change order</button>`) +
    (TL.note ? `<span class="tl-note${TL.bad ? " bad" : ""}" role="status">${esc(TL.note)}</span>` : "");
  if ($("tlStart")) $("tlStart").onclick = () => {
    TL.edit = true; TL.order = tlTitles(); tlNote("");
    hovering = null; preview.hidden = true; zoomCap.hidden = true;   // drop a zoom that was open when edit began
    renderTimeline();
  };
  if ($("tlCancel")) $("tlCancel").onclick = () => { TL.edit = false; TL.order = null; tlNote(""); renderTimeline(); };
  if ($("tlSave")) $("tlSave").onclick = tlSave;
  const today = new Date(new Date().toDateString());
  const dayDiff = d => Math.round((new Date(new Date(d).toDateString()) - today) / 864e5);
  const rel = k => k === 0 ? "Tonight" : k === 1 ? "Tomorrow" : k > 1 ? `in ${k} days` : "";
  const first = vids[0], last = vids[vids.length - 1];
  const longDay = d => new Date(d).toLocaleDateString([], {weekday: "short", month: "short", day: "numeric"});
  const tick = () => {
    $("tlNext").innerHTML = `<img src="${first.big || first.thumb}" alt="" class="tl-next-img">
      <div><div class="tl-kicker">Next video</div><div class="tl-next-t">${num(first.n)} ${esc(first.title)}</div>
      <div class="tl-next-when"><b>${esc(untilText(new Date(first.date) - Date.now()))}</b> · ${esc(longDay(first.date))}, ${esc(hourText(new Date(first.date).getHours()))}</div></div>`;
  };
  tick();
  clearInterval(renderTimeline.timer);
  renderTimeline.timer = setInterval(() => { if (state.tab === "timeline") tick(); else clearInterval(renderTimeline.timer); }, 30e3);
  const every = S.every_days === 1 ? "every day" : `every ${S.every_days} days`;
  $("tlFacts").innerHTML = `<div class="tl-fact"><b>${vids.length}</b><span>video${vids.length === 1 ? "" : "s"} queued</span></div>
    <div class="tl-fact"><b>${esc(new Date(last.date).toLocaleDateString([], {month: "short", day: "numeric"}))}</b><span>last one</span></div>
    <div class="tl-fact"><b>${esc(hourText(S.hour))}</b><span>${esc(every)}</span></div>`;

  let html = `<div class="tl-now" title="Today"><span class="tl-now-dot"></span><span class="tl-now-l">Now</span>
    <span class="tl-now-d">${esc(today.toLocaleDateString([], {month: "short", day: "numeric"}))}</span></div>`;
  let month = null, k = 0;
  list.forEach((o, i) => {
    const d = new Date(o.date), when = longDay(o.date), hour = hourText(d.getHours());
    if (d.getMonth() !== month) {
      month = d.getMonth();
      html += `<div class="tl-month"><span>${esc(d.toLocaleDateString([], {month: "long"}))}</span></div>`;
    }
    const moved = (TL.edit || TL.pending) && o.was !== o.n;
    const kd = dayDiff(o.date), cls = [o === first ? "next" : "", [0, 6].includes(d.getDay()) ? "weekend" : "",
                                       o.video ? "" : "img-only", moved ? "moved" : ""].join(" ");
    const card = o.video
      ? `<img class="thumb tl-img" src="${o.big || o.thumb}" data-big="${o.big || o.thumb}" alt="No. ${esc(o.n)} ${esc(o.title)}" draggable="false"
           data-cap="${esc(`No. ${o.n} · ${o.title}`)}" data-when="${esc(`${when} · ${hour}`)}">${num(o.n, "tl-n")}`
      : `<span class="tl-ghost" title="${esc(`No. ${o.n} ${o.title}: image post, no video`)}">image<br>post${TL.edit ? `<small>${esc(o.title)}</small>` : ""}</span>`;
    const arrows = TL.edit ? `<div class="tl-move"><button data-mv="-1" aria-label="Earlier" ${i ? "" : "disabled"}>‹</button>` +
                             `<button data-mv="1" aria-label="Later" ${i < list.length - 1 ? "" : "disabled"}>›</button></div>` : "";
    html += `<div class="tl-item ${cls}" style="--i:${k++}" data-t="${esc(o.title)}"${TL.edit ? ' draggable="true"' : ""}>
      <div class="tl-card">${card}${arrows}</div><div class="tl-stem"></div><div class="tl-node"></div>
      <div class="tl-date"><span class="tl-wd">${esc(d.toLocaleDateString([], {weekday: "short"}))}</span>
        <span class="tl-day">${d.getDate()}</span><span class="tl-mo">${esc(d.toLocaleDateString([], {month: "short"}))}</span>
        ${kd <= 1 ? `<span class="tl-rel">${esc(rel(kd))}</span>` : ""}
        ${moved ? `<span class="tl-was">was No. ${esc(o.was)}</span>` : ""}</div></div>`;
  });
  const track = $("timeline");
  track.innerHTML = html;
  track.classList.toggle("editing", TL.edit);
  track.classList.toggle("pending", !!TL.pending);
  const sc = $("tlScroll");
  if (!sc.dataset.wired) {   // wheel scrolls sideways; arrows page through; arrows hide at the ends
    sc.dataset.wired = "1";
    sc.addEventListener("wheel", e => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || sc.scrollWidth <= sc.clientWidth) return;
      const end = e.deltaY > 0 ? sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 1 : sc.scrollLeft <= 0;
      if (end) return;   // at either end the page scrolls on as usual
      sc.scrollLeft += e.deltaY; e.preventDefault();
    }, {passive: false});
    const page = dir => sc.scrollBy({left: dir * sc.clientWidth * 0.8, behavior: "smooth"});
    $("tlPrev").onclick = () => page(-1); $("tlNextBtn").onclick = () => page(1);
    const ends = () => {
      $("tlPrev").classList.toggle("off", sc.scrollLeft <= 2);
      $("tlNextBtn").classList.toggle("off", sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2);
    };
    sc.addEventListener("scroll", ends, {passive: true}); addEventListener("resize", ends);
    renderTimeline.ends = ends;
    // drag and drop (edit mode): drop before or after the item under the pointer; the line scrolls near its edges
    const item = e => e.target.closest && e.target.closest(".tl-item[data-t]");
    const clearMarks = () => track.querySelectorAll(".drop-before, .drop-after").forEach(x => x.classList.remove("drop-before", "drop-after"));
    track.addEventListener("dragstart", e => {
      const it = item(e);
      if (!TL.edit || !it) return;
      TL.drag = it.dataset.t; it.classList.add("dragging");
      hovering = null; preview.hidden = true; zoomCap.hidden = true;
      e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", TL.drag);
    });
    track.addEventListener("dragend", () => { TL.drag = null; clearMarks(); track.querySelectorAll(".dragging").forEach(x => x.classList.remove("dragging")); });
    track.addEventListener("dragover", e => {
      if (!TL.drag) return;
      e.preventDefault(); e.dataTransfer.dropEffect = "move";
      const r = sc.getBoundingClientRect(), edge = 70;
      if (e.clientX < r.left + edge) sc.scrollLeft -= 14; else if (e.clientX > r.right - edge) sc.scrollLeft += 14;
      const it = item(e);
      clearMarks();
      if (!it || it.dataset.t === TL.drag) return;
      const b = it.getBoundingClientRect();
      it.classList.add(e.clientX < b.left + b.width / 2 ? "drop-before" : "drop-after");
    });
    track.addEventListener("drop", e => {
      if (!TL.drag) return;
      e.preventDefault();
      const it = item(e), t = TL.drag;
      TL.drag = null;
      if (!it || it.dataset.t === t) { clearMarks(); return; }
      const b = it.getBoundingClientRect(), after = e.clientX >= b.left + b.width / 2;
      const o = TL.order.filter(x => x !== t);
      o.splice(o.indexOf(it.dataset.t) + (after ? 1 : 0), 0, t);
      TL.order = o;
      renderTimeline();
    });
    track.addEventListener("click", e => {   // ‹ › one step earlier / later (touch screens, keyboard)
      const btn = e.target.closest && e.target.closest("[data-mv]"), it = btn && item(e);
      if (!TL.edit || !it) return;
      tlMove(it.dataset.t, TL.order.indexOf(it.dataset.t) + +btn.dataset.mv);
      const again = track.querySelector(`.tl-item[data-t="${CSS.escape(it.dataset.t)}"] [data-mv="${btn.dataset.mv}"]`);
      if (again && !again.disabled) again.focus();
    });
  }
  requestAnimationFrame(renderTimeline.ends);
}

// ---- website tab (Cloudflare counter: per-day rows from analytics.report) -------------
const dayKey = d => d.toISOString().slice(0, 10);
function webCut(rows) {   // rows in the chosen range (24 h = today, UTC days like the counter)
  if (!state.range) return rows;
  const from = dayKey(new Date(Date.now() - (state.range - 1) * 864e5));
  return rows.filter(r => r.day >= from);
}
function webSum(rows, keyOf = r => r.k) {   // {key: {views, visitors, dur, timed}}
  const out = {};
  for (const r of rows) {
    const o = out[keyOf(r)] || (out[keyOf(r)] = {views: 0, visitors: 0, dur: 0, timed: 0});
    o.views += r.views; o.visitors += r.visitors; o.dur += r.dur || 0; o.timed += r.timed || 0;
  }
  return out;
}
const avgTime = o => o.timed ? o.dur / o.timed / 1000 : null;
const secs = s => s == null ? "–" : s < 60 ? `${fmt(s, s < 10 ? 1 : 0)} s` : `${Math.floor(s / 60)} m ${String(Math.round(s % 60)).padStart(2, "0")} s`;
function pageName(path) {   // "/ink-idea-and-ai-public/cartoons/3-free-trial/" -> No. 3 circle + title
  const m = /cartoons\/(\d+)-[^/]*\/?$/.exec(path || "");
  if (m) { const c = latest().cartoons[m[1]]; return `${num(m[1])} ${esc(c ? c.title : "")}`; }
  if (/\/(ink-idea-and-ai-public\/?)?$/.test(path || "/")) return "Homepage";
  return esc(path.replace("/ink-idea-and-ai-public", "") || "/");
}
// Website breakdowns as bar charts (biggest on top); the hover box has views, share, visitors and time on page.
const SOURCES = [[/linkedin/, "LinkedIn"], [/facebook|^fb\./, "Facebook"], [/instagram/, "Instagram"], [/threads/, "Threads"],
                 [/^t\.co$|twitter|^x\.com/, "X"], [/pinterest/, "Pinterest"], [/tiktok/, "TikTok"], [/youtube/, "YouTube"],
                 [/google/, "Google"], [/bing|duckduckgo|yahoo/, "Search"], [/chatgpt|openai|claude|perplexity/, "AI chat"]];
const sourceName = k => !k ? "Direct / unknown" : (SOURCES.find(([re]) => re.test(k)) || [null, k])[1];   // LinkedIn app + site = LinkedIn
const REGION = (() => { try { return new Intl.DisplayNames(undefined, {type: "region"}); } catch (e) { return null; } })();
// the name, then its flag (user, 2026-11-02: "country name on the left side of the flag")
const countryName = cc => cc && cc.length === 2
  ? `${REGION ? REGION.of(cc.toUpperCase()) : cc.toUpperCase()} ${String.fromCodePoint(...[...cc.toUpperCase()].map(ch => 127397 + ch.charCodeAt(0)))}` : "Unknown";
const deviceName = k => k ? k[0].toUpperCase() + k.slice(1) : "Unknown";
function pageLabel(path) {   // plain text for chart axes: "3 · Free Trial", "Homepage"
  const m = /cartoons\/(\d+)-[^/]*\/?$/.exec(path || "");
  if (m) { const c = latest().cartoons[m[1]]; return `${m[1]} · ${c ? c.title : ""}`; }
  if (/\/(ink-idea-and-ai-public\/?)?$/.test(path || "/")) return "Homepage";
  return (path || "/").replace("/ink-idea-and-ai-public", "") || "/";
}
function pageLast(path) {   // the bar lists: the title, then its No. circle right before the bar, like the flags (user, 2026-11-02)
  const m = /cartoons\/(\d+)-[^/]*\/?$/.exec(path || "");
  if (!m) return pageName(path);
  const c = latest().cartoons[m[1]];
  return `<span class="hb-t">${esc(c ? c.title : "")}</span>${num(m[1])}`;   // a long title shortens, the circle stays
}
function webTip(name, o, total) {
  return `<b>${esc(name)}</b><br>👁 <b>${fmt(o.views)}</b> views · ${fmt(o.views / total * 100)}%<br>` +
         `👤 <b>${fmt(o.visitors)}</b> visitors<br>⏱ <b>${secs(avgTime(o))}</b> on the page`;
}
// pages, sources and countries as HTML rows, not a canvas chart (user, 2026-11-02: mobile friendly): the name on the
// left (full size emoji flags, truncated with … only when it must), then the bar and the number. A row's details
// (visitors, time on page, share) show on hover as a tooltip and on tap below the row, so phones get them too.
function webBars(id, rows, nameOf, color, max = 12) {
  const keyOf = {}, sum = webSum(webCut(rows), r => { const n = nameOf(r.k); keyOf[n] = r.k; return n; });
  const list = Object.entries(sum).sort((a, b) => b[1].views - a[1].views).slice(0, max);   // biggest first
  const total = Object.values(sum).reduce((a, o) => a + o.views, 0) || 1, top = list.length ? list[0][1].views || 1 : 1;
  if (charts[id]) { charts[id].dispose(); delete charts[id]; }   // was an ECharts chart before 2026-11-02
  const el = $(id);
  el.style.height = "";
  el.style.setProperty("--bar", css(color));
  if (!list.length) { el.innerHTML = `<li class="hb-empty">No visits in this range.</li>`; return; }
  const link = id === "webPages";
  el.innerHTML = list.map(([name, o]) => {
    const more = `👤 ${fmt(o.visitors)} visitor${o.visitors === 1 ? "" : "s"} · ⏱ ${secs(avgTime(o))} on the page · ${fmt(o.views / total * 100)}% of views`;
    const label = link && keyOf[name] && /^\//.test(keyOf[name])
      ? `<a href="${esc("https://alborz-geramifard.com" + keyOf[name])}" target="_blank" rel="noopener">${pageLast(keyOf[name])}</a>`
      : esc(name).replace(/([\u{1F1E6}-\u{1F1FF}]{2})$/u, '<span class="flag">$1</span>');   // flags a little larger
    return `<li class="hb-row" tabindex="0" title="${esc(name)}: ${esc(more)}">` +
      `<span class="hb-name">${label}</span>` +
      `<span class="hb-bar"><i style="width:${Math.max(1.5, o.views / top * 100).toFixed(1)}%"></i></span>` +
      `<span class="hb-num">${fmt(o.views)}</span><span class="hb-more">${more}</span></li>`;
  }).join("");
  el.onclick = e => {   // tap a row: show or hide its details (a tap on the page link just opens it)
    if (e.target.closest("a")) return;
    const row = e.target.closest(".hb-row");
    if (row) row.classList.toggle("open");
  };
  el.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("hb-row")) { e.preventDefault(); e.target.classList.toggle("open"); } };
}
function webDonut(id, rows, nameOf) {
  const sum = webSum(webCut(rows), r => nameOf(r.k)), list = Object.entries(sum).sort((a, b) => b[1].views - a[1].views);
  const total = list.reduce((a, [, o]) => a + o.views, 0) || 1, {xAxis, yAxis, ...o} = base();   // a pie has no axes
  $(id).style.height = "220px";
  const ch = chart(id);
  ch.resize();
  ch.setOption({
    ...o, legend: {show: false},
    tooltip: {...o.tooltip, trigger: "item", formatter: p => webTip(p.name, sum[p.name], total)},
    color: ["--s1", "--s4", "--s6", "--s8"].map(css),
    series: [{type: "pie", radius: ["48%", "75%"], avoidLabelOverlap: true, itemStyle: {borderColor: css("--surface-1"), borderWidth: 2},
              label: {color: css("--text-secondary"), formatter: p => `${p.name}\n${fmt(p.percent)}%`},
              data: list.map(([k, v]) => ({name: k, value: v.views}))}],
    graphic: list.length ? [] : [{type: "text", left: "center", top: "middle", style: {text: "No visits in this range.", fill: css("--text-muted"), fontSize: 13}}],
  }, true);
}
function renderWeb() {
  const W = DATA.web;
  $("webEmpty").hidden = !!(W && W.daily && W.daily.length);
  if (!W || !W.daily) { $("webTiles").innerHTML = ""; return; }
  const days = webCut(W.daily), all = Object.values(webSum(days, () => "all"))[0] || {views: 0, visitors: 0, dur: 0, timed: 0};
  const pages = webSum(webCut(W.path)), top = Object.entries(pages).filter(([k]) => /cartoons\//.test(k)).sort((a, b) => b[1].views - a[1].views)[0];
  const tiles = [
    ["Page views", fmt(all.views), RANGE_LABEL[state.range]],
    ["Visitors", fmt(all.visitors), "unique per day, added up"],
    ["Avg time on page", secs(avgTime(all)), "while the page was on screen"],
    ["Pages per visitor", all.visitors ? fmt(all.views / all.visitors, 1) : "–", ""],
    ["Top cartoon page", top ? pageName(top[0]) : "–", top ? `${fmt(top[1].views)} views · ${secs(avgTime(top[1]))}` : ""],
  ];
  $("webTiles").innerHTML = tiles.map(([k, v, d]) => `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join("");
  const o = base(), dayLabel = d => new Date(d + "T12:00:00Z").toLocaleDateString([], {month: "short", day: "numeric"});
  const bar = (name, c, key) => ({name, type: "bar", barMaxWidth: 26, barGap: "15%", data: days.map(r => r[key]),
    itemStyle: {color: css(c), borderRadius: [4, 4, 0, 0]}, emphasis: {focus: "series"}});
  chart("cWeb").setOption({   // one pair of bars per day: page views and visitors
    ...o, legend: {...o.legend, formatter: n => n},
    tooltip: {...o.tooltip, axisPointer: {type: "shadow"}, valueFormatter: v => fmt(v)},
    xAxis: {...o.xAxis, type: "category", data: days.map(r => dayLabel(r.day))},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: [bar("👁 Page views", "--s4", "views"), bar("👤 Visitors", "--s1", "visitors")],
  }, true);
  webBars("webPages", W.path, pageLabel, "--s4", 15);
  webBars("webRefs", W.ref, sourceName, "--s1");
  webBars("webCountries", W.country, countryName, "--s6");
  webDonut("webDevices", W.device, deviceName);
  chart("cWeb").resize();
}
