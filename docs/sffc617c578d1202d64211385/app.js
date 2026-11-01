"use strict";
// Ink Stats: data.json is AES-256-GCM; the key is PBKDF2-SHA256(username + "\n" + password), derived in the
// browser. Nothing readable is on the server. After sign-in the derived key (never the password) is kept in
// this browser's storage for SESSION_MS so reloads don't ask again; Lock signs out and deletes it.

const PLAT = [
  {k: "tiktok", label: "TikTok", c: "--s1", brand: "tiktok", tag: ""},
  {k: "instagram_reel", label: "Instagram", c: "--s2", brand: "instagram", tag: ""},   // the Reel: shown as plain Instagram
  {k: "youtube", label: "YouTube", c: "--s6", brand: "youtube", tag: ""},
  {k: "facebook", label: "Facebook", c: "--s7", brand: "facebook", tag: ""},
  {k: "pinterest", label: "Pinterest", c: "--s8", brand: "pinterest", tag: ""},
  {k: "linkedin", label: "LinkedIn", c: "--s9", brand: "linkedin", tag: ""},
  {k: "instagram_image", label: "IG image", c: "--s3", brand: "instagram", tag: "image"},
  {k: "threads", label: "Threads", c: "--s5", brand: "threads", tag: ""},
  {k: "x", label: "X", c: "--s4", brand: "x", tag: ""},
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
const FOLLOW = [["tiktok", "TikTok", "--s1"], ["instagram", "Instagram", "--s2"], ["facebook", "Facebook", "--s7"], ["pinterest", "Pinterest", "--s8"], ["linkedin", "LinkedIn", "--s9"], ["x", "X", "--s4"], ["threads", "Threads", "--s5"]];
const FOLLOW_P = FOLLOW.map(([k, label]) => ({brand: k, label, tag: ""}));
const ENG = [["likes", "Likes", "👍", "--e1"], ["comments", "Comments", "💬", "--e2"], ["shares", "Shares", "↗", "--e3"],
             ["saves", "Saves", "🔖", "--e4"], ["new_followers", "New followers", "👤", "--e5"]];
const RANGE_LABEL = {1: "last 24 h", 7: "last 7 days", 30: "last 30 days", 0: "since tracking began"};
const SESSION_MS = 24 * 60 * 60 * 1000;
const SESSION = "ink-session";

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[ch]));
const fmt = (n, d = 0) => n == null ? "–" : Number(n).toLocaleString(undefined, {maximumFractionDigits: d, minimumFractionDigits: d});
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const b64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
const t = s => new Date(s.updated).getTime();

let DATA = null, charts = {}, fails = 0;
let KEY = null, IV = null, REFRESH = "";   // the unlocked key + which data.json is shown, for live refreshes
const state = {range: 0, off: new Set(), sort: {key: "total", asc: false}, sel: null, tab: "social"};

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

async function loadBlob() {
  const r = await fetch("data.json?t=" + Date.now(), {cache: "no-store"});
  if (!r.ok) throw new Error("no data");
  return r.json();
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

(async function resume() {   // still signed in from earlier today? unlock without asking
  const s = saved();
  if (!s) return;
  try {
    const blob = await loadBlob();
    if (blob.salt !== s.salt) throw new Error("password changed");
    const key = await crypto.subtle.importKey("raw", b64(s.k), {name: "AES-GCM"}, false, ["decrypt"]);
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
                                        base, {name: "AES-GCM", length: 256}, true, ["decrypt"]);
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
  try { await fetch(REFRESH_URL, {method: "POST"}); } catch (e) { return; }   // Worker unreachable: keep what we have
  REFRESH = "refreshing…"; renderAll();
  const until = Date.now() + 5 * 60 * 1000;
  while (Date.now() < until) {
    await new Promise(r => setTimeout(r, 15000));
    if (!DATA) return;   // signed out meanwhile
    try {
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
});
document.addEventListener("mouseout", e => {
  const t = e.target.closest && e.target.closest("img.thumb");
  if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) { hovering = null; preview.hidden = true; }
});
document.addEventListener("mousemove", e => {
  if (preview.hidden) return;
  const w = 270, h = 480, pad = 16;
  let x = e.clientX + pad, y = e.clientY - h / 2;
  if (x + w > innerWidth - 8) x = e.clientX - w - pad;
  y = Math.max(8, Math.min(y, innerHeight - h - 8));
  preview.style.left = x + "px"; preview.style.top = y + "px";
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
  const r = inRange(), now = latest(), then = r.length > 1 ? r[0] : null, when = RANGE_LABEL[state.range];
  const best = Object.entries(now.cartoons).sort((a, b) => cartoonViews(b[1]) - cartoonViews(a[1]))[0];
  const tiles = [
    ["Views", fmt(allViews(now)), delta(allViews(now), then && allViews(then)) + ` ${when}`],
    ["Interactions", fmt(allInter(now)), delta(allInter(now), then && allInter(then)) + " · 👍 💬 ↗ 🔖"],
    ["👤", fmt(allFollowers(now)), delta(allFollowers(now), then && allFollowers(then)) + " · all platforms"],
    [`${iconHtml(PLAT.find(p => p.k === "instagram_reel"))} watch time`, reelWatch(now) == null ? "–" : fmt(reelWatch(now), 1) + " s",
     delta(reelWatch(now), then && reelWatch(then), 1) + " · median per video"],
    ["Top cartoon", best ? num(best[0], "lg") : "–", best ? `${esc(best[1].title)} · ${fmt(cartoonViews(best[1]))} views` : ""],
  ];
  $("tiles").innerHTML = tiles.map(([k, v, d]) =>
    `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join("");
}

// ---- charts -------------------------------------------------------------------------
function fitCharts() {   // only charts on screen: a hidden one has no width to measure
  Object.values(charts).forEach(c => { if (c.getDom().offsetWidth) c.resize(); });
}
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
    yAxis: {axisLine: {show: false}, splitLine: {lineStyle: {color: grid}}, axisLabel: {color: muted}},
  };
}
// time axes: the date where a day starts (shown bold by ECharts), times of day in between only when zoomed in
const TIME_LABELS = {year: "{yyyy}", month: "{MMM} {d}", day: "{MMM} {d}", hour: "{HH}:{mm}", minute: "{HH}:{mm}", second: "{HH}:{mm}"};
// over more than two days: dates only (one tick per day at most)
const dayTicks = r => r.length > 1 && t(r[r.length - 1]) - t(r[0]) > 2 * 864e5 ? {minInterval: 864e5} : {};

// Line charts name each line with a badge sitting on it instead of a legend. items[i] = {text, rich, w, color} for
// series i. Every visible point is tried above and below its line; the spot farthest from the other lines and the
// badges already placed wins (its own line must not cross it). Redone on zoom and resize, since pixels move.
const BADGE_H = 26, BADGE_GAP = 6;
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
      for (const dir of [-1, 1]) {
        const cy = y + dir * (BADGE_H / 2 + BADGE_GAP), box = [x - it.w / 2, cy - BADGE_H / 2, x + it.w / 2, cy + BADGE_H / 2];
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
      data: [{coord: best.coord, label: {show: true, position: best.dir < 0 ? "top" : "bottom", distance: BADGE_GAP,
        formatter: it.text, rich: it.rich, color: css("--text-secondary"), backgroundColor: surface,
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
  .map(x => `${byLabel(x.seriesName) ? iconHtml(byLabel(x.seriesName)) : esc(x.seriesName)} <b>${fmt(x.value[1])}</b>`).join("<br>");   // logos, biggest first
const platBadge = p => ({text: iconText(p.label), rich: richIcons(16), color: css(p.c), w: 16 + 14 + (p.tag === "image" ? 19 : p.tag ? p.tag.length * 7 + 4 : 0)});

function renderTrend() {
  const r = inRange(), surface = css("--surface-1");
  const series = on().map(p => {
    const pts = r.map(s => [s.updated, totals(s)[p.k]]);
    return {name: p.label, type: "line", data: pts, smooth: .25, symbol: "circle", symbolSize: 8, showSymbol: pts.length < 30,
            lineStyle: {width: 2}, itemStyle: {color: css(p.c), borderColor: surface, borderWidth: 2},
            emphasis: {focus: "series"}};
  });
  const lo = t(r[0]), hi = t(latest());
  const flags = Object.entries(latest().cartoons).map(([n, c]) => [n, postedAt(c)])
    .filter(([, at]) => at && new Date(at).getTime() >= lo && new Date(at).getTime() <= hi);
  if (series.length && flags.length) series[0].markLine = {
    symbol: "none", silent: true, animation: false,
    lineStyle: {color: css("--text-muted"), type: "dashed", width: 1},
    label: {formatter: d => `{num|${d.name}}`, position: "end", distance: 4, rich: {num: numRich(18)}},   // upright, above the plot
    data: flags.map(([n, at]) => ({name: n, xAxis: at}))};
  const o = base();
  chart("cTrend").setOption({
    ...o, series, legend: {...o.legend, show: false},
    grid: {...o.grid, bottom: 52},
    tooltip: {...o.tooltip, formatter: platTip},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    dataZoom: [{type: "inside", filterMode: "none", zoomOnMouseWheel: false, moveOnMouseWheel: false},   // the wheel scrolls the page
               {type: "slider", filterMode: "none", height: 20, bottom: 6, borderColor: "transparent",
               fillerColor: "rgba(200,137,43,.15)", dataBackground: {lineStyle: {color: css("--text-muted")}, areaStyle: {opacity: 0}},
               handleStyle: {color: css("--accent")}, textStyle: {color: css("--text-muted")}}],
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "The trend fills in as refreshes come in (twice a day).", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
  withBadges("cTrend", on().map(platBadge));
}

// views per cartoon by age: each line starts when its cartoon was posted, so old and new cartoons compare fairly
function renderAge() {
  const all = snaps(), o = base(), muted = css("--text-muted"), surface = css("--surface-1");
  const cs = Object.entries(latest().cartoons).filter(([, c]) => postedAt(c)).sort((a, b) => +a[0] - +b[0]);
  const days = (s, at) => (t(s) - new Date(at).getTime()) / 864e5;
  const lines = cs.map(([n, c]) => {
    const at = postedAt(c);
    return [n, all.map((s, i) => [s, i]).filter(([s]) => s.cartoons[n] && days(s, at) >= 0)
                  .map(([s, i]) => [days(s, at), cartoonViews(s.cartoons[n]), i])];   // i: the snapshot, for the hover breakdown
  });
  const look = {lineStyle: {width: 2, color: muted, opacity: .55}, itemStyle: {color: muted, borderColor: surface, borderWidth: 2},
                emphasis: {focus: "series", lineStyle: {width: 3, color: css("--num"), opacity: 1}, itemStyle: {color: css("--num")}},
                blur: {lineStyle: {opacity: .15}}};
  const series = [
    ...lines.map(([n, data]) => ({name: n, type: "line", data, smooth: .25, showSymbol: false, symbol: "circle", symbolSize: 8, ...look})),
    // posted before tracking began: a dashed line from 0 views at posting to the first reading
    ...lines.filter(([, d]) => d.length && d[0][0] > .1).map(([n, d]) => ({name: n, type: "line", data: [[0, 0], d[0]], silent: true,
      showSymbol: false, tooltip: {show: false}, ...look, lineStyle: {...look.lineStyle, type: "dashed", width: 1, opacity: .35}}))];
  const title = n => (latest().cartoons[n] || {}).title || "";
  const age = d => d < 2 ? `${fmt(d * 24)} h` : `${fmt(d, 1)} days`;
  const ch = chart("cAge");
  let mouseY = 0;   // the hover box describes the line under the pointer, and any line running close to it
  // swap only our own listeners: a bare off("mousemove") also removes the one ECharts drags the zoom handles with
  const zr = ch.getZr(), mine = ch.__ageHandlers || {};
  if (mine.move) zr.off("mousemove", mine.move);
  if (mine.out) zr.off("globalout", mine.out);
  const CLOSE_PX = 16;   // lines this close to the nearest one (in pixels) are listed too
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
    const shown = near.filter(l => Math.abs(l.px - near[0].px) <= CLOSE_PX);
    const idx = shown.map(l => lines.findIndex(([n]) => n === l.n));
    lit = idx;   // light up exactly the lines in the box, after ECharts' own pick (the nearest reading) has been drawn
    setTimeout(() => { if (lit === idx) { ch.dispatchAction({type: "downplay"}); ch.dispatchAction({type: "highlight", seriesIndex: idx}); } });
    return shown.map(({n, d}) => {
      const p = d.reduce((best, q) => Math.abs(q[0] - x) < Math.abs(best[0] - x) ? q : best);   // the reading nearest the pointer
      const c = all[p[2]].cartoons[n];
      const rows = on().map(pl => [pl, views(c, pl.k)]).filter(([, v]) => v).sort((a, b) => b[1] - a[1]);
      return `<b>${num(n)} ${esc(title(n))}</b> · ${age(p[0])} after posting<br>` +
        (shown.length > 1   // several lines: one row of numbers each, so the box stays short
          ? rows.map(([pl, v]) => `${iconHtml(pl)} <b>${fmt(v)}</b>`).join("&nbsp;&nbsp;") + `<br>Total: <b>${fmt(p[1])}</b>`
          : rows.map(([pl, v]) => `${iconHtml(pl)} <b>${fmt(v)}</b>`).join("<br>") + `<br>Total: <b>${fmt(p[1])}</b>`);
    }).join(`<hr style="border:0;border-top:1px solid ${css("--border")};margin:6px 0">`);
  };
  ch.setOption({
    ...o, legend: {show: false},
    grid: {...o.grid, bottom: 52},
    tooltip: {...o.tooltip, formatter: hover},
    xAxis: {...o.xAxis, type: "value", min: 0, minInterval: 1,
            axisLabel: {...o.xAxis.axisLabel, formatter: v => v ? `day ${Number.isInteger(v) ? v : fmt(v, 1)}` : "posted"}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    dataZoom: [{type: "inside", filterMode: "none", zoomOnMouseWheel: false, moveOnMouseWheel: false},   // as on Views over time
               {type: "slider", filterMode: "none", height: 20, bottom: 6, borderColor: "transparent",
               fillerColor: "rgba(200,137,43,.15)", dataBackground: {lineStyle: {color: css("--text-muted")}, areaStyle: {opacity: 0}},
               handleStyle: {color: css("--accent")}, textStyle: {color: css("--text-muted")}, labelFormatter: v => age(v)}],
    series,
    graphic: series.length ? [] : [{type: "text", left: "center", top: "middle",
      style: {text: "No posted cartoons yet.", fill: muted, fontSize: 13}}],
  }, true);
  const badge = n => ({text: `{num|${n}}`, rich: {num: numRich(16)}, w: 22, group: n});
  withBadges("cAge", [...lines.map(([n]) => badge(n)),   // the dashed lead-ins badge their cartoon only when its solid line is out of view
                      ...lines.filter(([, d]) => d.length && d[0][0] > .1).map(([n]) => badge(n))]);
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
  chart("cEngTrend").setOption({
    ...o, legend: {show: false},
    tooltip: {...o.tooltip, formatter: ps => `<b>${ps[0].axisValueLabel}</b><br>` +   // icon then number, no gap
      ps.slice().sort((a, b) => b.value[1] - a.value[1]).map(x => `${x.marker}${x.seriesName} <b>${fmt(x.value[1])}</b>`).join("<br>")},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ENG.map(([k, l, ic, c]) => ({
      name: ic, type: "line", step: "end", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30,
      data: r.map(s => [s.updated, k === "new_followers" ? allFollowers(s) : engAll(s, k)]),
      lineStyle: {width: 2}, itemStyle: {color: css(c), borderColor: surface, borderWidth: 2}, emphasis: {focus: "series"}})),
  }, true);
  withBadges("cEngTrend", ENG.map(([k, l, ic, c]) => ({text: ic, color: css(c), w: 34})));
}

function renderEngPosts() {
  const total = c => ENG.reduce((a, [k]) => a + eng(c, k), 0);
  const cs = Object.entries(latest().cartoons).sort((a, b) => total(b[1]) - total(a[1]) || +a[0] - +b[0]),   // most engaged first
        o = base(), surface = css("--surface-1");
  const any = cs.some(([, c]) => ENG.some(([k]) => eng(c, k)));
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
function renderBoard() {
  const r = inRange(), now = latest(), first = r.length > 1 ? r[0] : null, ps = on();
  const rows = Object.entries(now.cartoons).map(([n, c]) => {
    const row = {n: +n, c, total: cartoonViews(c), inter: ps.reduce((a, p) => a + inter(c[p.k]), 0)};
    ENG.forEach(([k]) => { row[k] = eng(c, k); });
    row.rate = rate(c); row.tw = watch(c, "tiktok"); row.rw = watch(c, "instagram_reel");
    row.tc = c.tiktok && c.tiktok.completion_pct != null ? c.tiktok.completion_pct : null;
    ps.forEach(p => { row[p.k] = c[p.k] ? c[p.k].views : null; });
    row.change = first && first.cartoons[n] ? row.total - cartoonViews(first.cartoons[n]) : null;
    row.trend = r.map(s => s.cartoons[n] ? cartoonViews(s.cartoons[n]) : 0);
    return row;
  });
  const {key, asc} = state.sort;
  rows.sort((a, b) => ((key === "n" ? a.n - b.n : (a[key] ?? -1) - (b[key] ?? -1))) * (asc ? 1 : -1));
  const cols = [["n", "Cartoon"], ...ps.map(p => [p.k, iconHtml(p)]), ["total", "Total"], ...ENG.map(([k, l, ic]) => [k, `<span title="${l}">${ic}</span>`]),
                ["rate", `<span title="Engagement rate: interactions per 100 views">Eng %</span>`],
                ["tw", `<span title="TikTok average watch time">⏱ ${iconHtml(PLAT[0])}</span>`],
                ["tc", `<span title="TikTok: watched to the end">✓ ${iconHtml(PLAT[0])}</span>`],
                ["rw", `<span title="Instagram average watch time">⏱ ${iconHtml(PLAT[1])}</span>`],
                ["change", "Change"], [null, "Trend"]];
  $("board").innerHTML = `<thead><tr>${cols.map(([k, l]) =>
      `<th ${k ? `data-k="${k}"` : ""} class="${k === key ? "sorted" + (asc ? " asc" : "") : ""}">${l}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(row => `<tr data-n="${row.n}" class="${row.n === state.sel ? "sel" : ""}">
      <td><div class="cell-cartoon">${thumb(row.n)}<span>${num(row.n)} ${esc(row.c.title)}${row.c.format ? `<span class="badge ${row.c.format}">${row.c.format}</span>` : ""}</span></div></td>
      ${ps.map(p => `<td>${fmt(row[p.k])}</td>`).join("")}
      <td><b>${fmt(row.total)}</b></td>${ENG.map(([k]) => `<td class="${row[k] ? "" : "muted"}">${fmt(row[k])}</td>`).join("")}
      <td>${row.rate == null ? "–" : fmt(row.rate, 1) + "%"}</td><td>${row.tw == null ? "–" : fmt(row.tw, 1) + " s"}</td>
      <td>${row.tc == null ? "–" : fmt(row.tc, 1) + "%"}</td><td>${row.rw == null ? "–" : fmt(row.rw, 1) + " s"}</td>
      <td>${row.change == null ? `<span class="muted">–</span>` : delta(row.total, row.total - row.change)}</td>
      <td>${spark(row.trend)}</td></tr>`).join("") + "</tbody>";
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

function renderDetail() {
  const n = state.sel, c = n && latest().cartoons[n];
  $("detail").hidden = !c;
  if (!c) return;
  $("detailTitle").innerHTML = `${thumb(n, "thumb lg")}${num(n)} ${esc(c.title)}`;
  const r = inRange(), o = base(), surface = css("--surface-1");
  chart("cDetail").resize();
  const ps = on().filter(p => c[p.k]);
  chart("cDetail").setOption({
    ...o, legend: {show: false},
    tooltip: {...o.tooltip, formatter: platTip},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ps.map(p => ({
      name: p.label, type: "line", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30, connectNulls: true,
      data: r.map(s => [s.updated, s.cartoons[n] && s.cartoons[n][p.k] ? s.cartoons[n][p.k].views : null]),
      lineStyle: {width: 2}, itemStyle: {color: css(p.c), borderColor: surface, borderWidth: 2}})),
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "History builds up with each refresh.", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
  withBadges("cDetail", ps.map(platBadge));
  const line = (label, d, extra = "") => d ? `<div class="row"><span>${label}</span><span>${fmt(d.views)} views${extra}
      ${d.url && /^https:\/\//.test(d.url) ? ` · <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">open ↗</a>` : ""}</span></div>` : "";
  const cms = commentList(n);
  $("detailStats").innerHTML = `<p class="note">“${esc(c.caption)}”${c.format ? ` · ${c.format} video` : ""}</p>` +
    PLAT.map(p => {
      const d = c[p.k]; if (!d) return "";
      const bits = [d.reach != null ? `reach ${fmt(d.reach)}` : "", inter(d) ? ENG.filter(([k]) => d[k]).map(([k, l, ic]) => `${ic} ${fmt(d[k])}`).join(" ") : "",
                    d.avg_watch_s ? `watch ${fmt(Math.min(d.avg_watch_s, 999), 1)} s` : "",
                    d.completion_pct != null ? `${fmt(d.completion_pct, 1)}% watched to the end` : "",
                    d.link_clicks ? `${fmt(d.link_clicks)} link clicks` : ""].filter(Boolean);
      return line(iconHtml(p), d, bits.length ? ` <span class="muted">· ${bits.join(" · ")}</span>` : "");
    }).join("") + (cms.length ? `<h3 class="cm-head">Comments</h3>${cms.map(x => commentHtml(x, false)).join("")}` : "");
}

// ---- everything ---------------------------------------------------------------------
function renderAll() {
  document.querySelectorAll("#range button").forEach(b => b.classList.toggle("on", +b.dataset.r === state.range));
  const now = latest(), errs = Object.keys(now.errors || {});
  $("updated").textContent = `Updated ${new Date(now.updated).toLocaleString([], {dateStyle: "medium", timeStyle: "short"})}` +
    ` · ${snaps().length} snapshot${snaps().length === 1 ? "" : "s"} since ${new Date(snaps()[0].updated).toLocaleDateString([], {month: "short", day: "numeric"})}` +
    (errs.length ? ` · couldn't refresh: ${errs.join(", ")}` : "") + (REFRESH ? ` · ${REFRESH}` : "");
  const web = state.tab === "web";
  document.querySelectorAll("#tab button").forEach(b => b.classList.toggle("on", b.dataset.t === state.tab));
  $("socialView").hidden = web; $("webView").hidden = !web;
  fitCharts();   // charts sized while their tab was hidden come back squeezed (ECharts falls back to 100 px)
  if (web) { renderWeb(); return; }
  renderChanges(); renderTiles(); renderTrend(); renderAge(); renderEngTrend(); renderEngPosts(); renderMix(); renderBoard(); renderDetail(); renderComments();
  preloadBig();
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
const countryName = cc => cc && cc.length === 2
  ? `${String.fromCodePoint(...[...cc.toUpperCase()].map(ch => 127397 + ch.charCodeAt(0)))} ${REGION ? REGION.of(cc.toUpperCase()) : cc}` : "Unknown";
const deviceName = k => k ? k[0].toUpperCase() + k.slice(1) : "Unknown";
function pageLabel(path) {   // plain text for chart axes: "3 · Free Trial", "Homepage"
  const m = /cartoons\/(\d+)-[^/]*\/?$/.exec(path || "");
  if (m) { const c = latest().cartoons[m[1]]; return `${m[1]} · ${c ? c.title : ""}`; }
  if (/\/(ink-idea-and-ai-public\/?)?$/.test(path || "/")) return "Homepage";
  return (path || "/").replace("/ink-idea-and-ai-public", "") || "/";
}
function webTip(name, o, total) {
  return `<b>${esc(name)}</b><br>👁 <b>${fmt(o.views)}</b> views · ${fmt(o.views / total * 100)}%<br>` +
         `👤 <b>${fmt(o.visitors)}</b> visitors<br>⏱ <b>${secs(avgTime(o))}</b> on the page`;
}
function webBars(id, rows, nameOf, color, max = 12) {
  const keyOf = {}, sum = webSum(webCut(rows), r => { const n = nameOf(r.k); keyOf[n] = r.k; return n; });
  const list = Object.entries(sum).sort((a, b) => b[1].views - a[1].views);
  const total = list.reduce((a, [, o]) => a + o.views, 0) || 1, shown = list.slice(0, max).reverse();   // biggest on top
  const o = base(), muted = css("--text-muted");
  $(id).style.height = `${Math.max(140, shown.length * 30 + 36)}px`;
  const ch = chart(id);
  ch.resize();
  ch.setOption({
    ...o, legend: {show: false}, grid: {...o.grid, top: 4, right: 44, bottom: 4},
    tooltip: {...o.tooltip, trigger: "item", formatter: p => webTip(p.name, sum[p.name], total)},
    xAxis: {type: "value", show: false},
    yAxis: {type: "category", data: shown.map(([k]) => k), axisLine: {show: false}, axisTick: {show: false},
            axisLabel: {color: css("--text-secondary"), width: 150, overflow: "truncate", fontSize: 12}},
    series: [{type: "bar", data: shown.map(([, v]) => v.views), barMaxWidth: 18, cursor: id === "webPages" ? "pointer" : "default",
              itemStyle: {color: css(color), borderRadius: [0, 4, 4, 0]},
              label: {show: true, position: "right", color: muted, formatter: p => fmt(p.value)}}],
    graphic: shown.length ? [] : [{type: "text", left: "center", top: "middle", style: {text: "No visits in this range.", fill: muted, fontSize: 13}}],
  }, true);
  ch.off("click");
  if (id === "webPages") ch.on("click", p => { const k = keyOf[p.name]; if (k) open(k, "_blank", "noopener"); });
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
