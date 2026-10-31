"use strict";
// Ink Stats: data.json is AES-256-GCM; the key is PBKDF2-SHA256(username + "\n" + password), derived in the
// browser. Nothing readable is on the server. After sign-in the derived key (never the password) is kept in
// this browser's storage for SESSION_MS so reloads don't ask again; Lock signs out and deletes it.

const PLAT = [
  {k: "tiktok", label: "TikTok", c: "--s1", brand: "tiktok", tag: ""},
  {k: "instagram_reel", label: "Instagram", c: "--s2", brand: "instagram", tag: ""},   // the Reel: shown as plain Instagram
  {k: "youtube", label: "YouTube", c: "--s6", brand: "youtube", tag: ""},
  {k: "facebook", label: "Facebook", c: "--s7", brand: "facebook", tag: ""},
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
  threads: '<path fill="none" stroke="F" stroke-width="2.2" stroke-linecap="round" d="M16.2 11.2c-.5-2.6-2.3-3.7-4.3-3.7-2.3 0-3.7 1.3-3.9 3 M16.3 12.4c0 3-1.6 4.3-3.9 4.3-1.9 0-3.1-1-3.1-2.4 0-1.7 1.6-2.6 3.8-2.6 3.7 0 6.4 1.4 6.4 4.4 0 3.3-3 5.6-7 5.6-5.3 0-8.3-3.6-8.3-9 0-5.5 3.2-9 8.4-9 4.2 0 6.9 2 7.9 5.6"/>',
};
// Brand colours where the brand has them (TikTok, Instagram, YouTube); X and Threads are black-only marks, so
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
  youtube: () => '<rect x="0" y="3.6" width="24" height="16.8" rx="4.6" fill="#ff0000"/><path fill="#fff" d="M9.6 15.6V8.4l6.3 3.6z"/>',
};
const logo = brand => {
  const fg = css("--text-primary");
  const body = COLOR_GLYPH[brand] ? COLOR_GLYPH[brand](fg) : GLYPH[brand].replace(/"F"/g, `"${fg}"`);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fg}">${body}</svg>`);
};
const byLabel = label => PLAT.find(p => p.label === label) || FOLLOW_P.find(p => p.label === label);
function richIcons(size = 16) {   // ECharts rich-text styles: {i_tiktok|} draws the TikTok logo
  const r = {tag: {color: css("--text-secondary"), fontSize: 12, padding: [0, 0, 0, 4]}};
  for (const b of Object.keys(GLYPH)) r["i_" + b] = {backgroundColor: {image: logo(b)}, width: size, height: size};
  return r;
}
const iconText = label => { const p = byLabel(label); return p ? `{i_${p.brand}|}` + (p.tag ? `{tag|${p.tag}}` : "") : label; };
// cartoon numbers: white digits on a blue circle (HTML and ECharts rich text)
const num = (n, cls = "") => `<span class="num${cls ? " " + cls : ""}">${esc(n)}</span>`;
const numRich = (size = 18) => ({backgroundColor: css("--num"), color: "#fff", borderRadius: size / 2, width: size, height: size,
                                 lineHeight: size, align: "center", fontSize: Math.round(size * .6), fontWeight: "bold"});
const iconHtml = p => `<img src="${logo(p.brand)}" alt="${esc(p.label)}" title="${esc(p.label)}" class="pl">` +
  (p.tag ? `<span class="pltag">${p.tag}</span>` : "");
const FOLLOW = [["tiktok", "TikTok", "--s1"], ["instagram", "Instagram", "--s2"], ["facebook", "Facebook", "--s7"], ["x", "X", "--s4"], ["threads", "Threads", "--s5"]];
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
const state = {range: 0, off: new Set(), mode: "total", sort: {key: "total", asc: false}, sel: null};

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
  $("platformChips").onclick = e => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.off.has(b.dataset.k) ? state.off.delete(b.dataset.k) : state.off.add(b.dataset.k);
    if (state.off.size === PLAT.length) state.off.delete(b.dataset.k);   // keep at least one
    renderAll();
  };
  $("range").onclick = e => { const b = e.target.closest("button"); if (!b) return; state.range = +b.dataset.r; renderAll(); };
  $("viewMode").onclick = e => { const b = e.target.closest("button"); if (!b) return; state.mode = b.dataset.m; renderAll(); };
  $("closeDetail").onclick = () => { state.sel = null; renderAll(); };
  addEventListener("resize", () => Object.values(charts).forEach(c => c.resize()));
  renderAll();
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
  if (df) lines.push(`👤 Followers <b>${fmt(allFollowers(base))} → ${fmt(allFollowers(now))}</b>`);
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
    ["Interactions", fmt(allInter(now)), delta(allInter(now), then && allInter(then)) + ` · likes, comments, shares, saves`],
    ["Followers", fmt(allFollowers(now)), delta(allFollowers(now), then && allFollowers(then)) + " · all platforms"],
    ["Instagram watch time", reelWatch(now) == null ? "–" : fmt(reelWatch(now), 1) + " s",
     delta(reelWatch(now), then && reelWatch(then), 1) + " · median per video"],
    ["Top cartoon", best ? num(best[0], "lg") : "–", best ? `${esc(best[1].title)} · ${fmt(cartoonViews(best[1]))} views` : ""],
  ];
  $("tiles").innerHTML = tiles.map(([k, v, d]) =>
    `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join("");
}

// ---- charts -------------------------------------------------------------------------
function chart(id) { return charts[id] || (charts[id] = echarts.init($(id), null, {renderer: "canvas"})); }
function base() {
  const muted = css("--text-muted"), grid = css("--grid");
  return {
    animationDuration: 500,
    textStyle: {fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: css("--text-secondary")},
    grid: {left: 8, right: 24, top: 36, bottom: 16, containLabel: true},
    tooltip: {trigger: "axis", backgroundColor: css("--surface-1"), borderColor: css("--border"),
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
  const marks = opt.series.map((s, i) => {
    const it = items[i];
    if (!it || !px[i].length) return {data: []};
    let best = null;
    const pts = s.data.filter(d => d[1] != null);
    px[i].forEach(([x, y], j) => {
      if (x < rect.x || x > rect.x + rect.width) return;   // zoomed out of view
      for (const dir of [-1, 1]) {
        const cy = y + dir * (BADGE_H / 2 + BADGE_GAP), box = [x - it.w / 2, cy - BADGE_H / 2, x + it.w / 2, cy + BADGE_H / 2];
        if (box[0] < rect.x || box[2] > rect.x + rect.width || box[1] < rect.y - 26 || box[3] > rect.y + rect.height) continue;   // the empty top margin is fair game
        const near = Math.min(Infinity, ...placed.map(b => boxGap(box, b)));
        let score = Math.min(60, near, ...px.map((p, k) => k === i ? Infinity : clear(p, box))) + x / rect.width;   // ties: newer end
        if (clear(px[i], box) < 0) score -= 1000;   // its own line crossing it: only when nothing else fits
        if (near < 0) score -= 2000;                // covering another badge: worse still
        if (!best || score > best.score) best = {score, box, coord: pts[j], dir};
      }
    });
    if (!best) return {data: []};
    placed.push(best.box);
    return {silent: true, animation: false, symbol: "circle", symbolSize: 1, itemStyle: {color: "transparent"},
      data: [{coord: best.coord, label: {show: true, position: best.dir < 0 ? "top" : "bottom", distance: BADGE_GAP,
        formatter: it.text, rich: it.rich, color: css("--text-secondary"), backgroundColor: surface,
        borderRadius: BADGE_H / 2, padding: [3, 7], height: BADGE_H - 8, lineHeight: BADGE_H - 8}}]};
  });
  ch.setOption({series: marks.map(markPoint => ({markPoint}))});
}
function withBadges(id, items) {   // draw now and again whenever the visible window changes
  const ch = chart(id), draw = () => lineBadges(ch, items);
  ch.off("datazoom"); ch.off("finished");
  ch.on("datazoom", () => setTimeout(draw));
  let w = ch.getWidth();
  ch.on("finished", () => { if (ch.getWidth() !== w) { w = ch.getWidth(); draw(); } });   // after a resize
  draw();
}
const platBadge = p => ({text: iconText(p.label), rich: richIcons(16), color: css(p.c), w: 16 + 14 + (p.tag ? p.tag.length * 7 + 4 : 0)});

function renderTrend() {
  const r = inRange(), gain = state.mode === "gain", surface = css("--surface-1");
  document.querySelectorAll("#viewMode button").forEach(b => b.classList.toggle("on", b.dataset.m === state.mode));
  const series = on().map(p => {
    const pts = r.map(s => [s.updated, totals(s)[p.k]]);
    const data = gain ? pts.slice(1).map((pt, i) => [pt[0], pt[1] - pts[i][1]]) : pts;
    return gain
      ? {name: p.label, type: "bar", stack: "gain", data, barMaxWidth: 28,
         itemStyle: {color: css(p.c), borderColor: surface, borderWidth: 1}, emphasis: {focus: "series"}}
      : {name: p.label, type: "line", data, smooth: .25, symbol: "circle", symbolSize: 8, showSymbol: data.length < 30,
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
    ...o, series, legend: {...o.legend, show: gain},
    grid: {...o.grid, bottom: 52},
    tooltip: {...o.tooltip, valueFormatter: v => fmt(v)},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    dataZoom: [{type: "inside", filterMode: "none"}, {type: "slider", filterMode: "none", height: 20, bottom: 6, borderColor: "transparent",
               fillerColor: "rgba(200,137,43,.15)", dataBackground: {lineStyle: {color: css("--text-muted")}, areaStyle: {opacity: 0}},
               handleStyle: {color: css("--accent")}, textStyle: {color: css("--text-muted")}}],
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "The trend fills in as refreshes come in (twice a day).", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
  if (!gain) withBadges("cTrend", on().map(platBadge));
}

function renderMix() {
  const tt = totals(latest()), ps = on().slice().sort((a, b) => tt[a.k] - tt[b.k]), all = ps.reduce((a, p) => a + tt[p.k], 0) || 1;
  const o = base();
  chart("cMix").setOption({
    ...o, legend: {show: false}, grid: {...o.grid, top: 8, right: 70},
    tooltip: {...o.tooltip, trigger: "item", formatter: d => `${d.name}: <b>${fmt(d.value)}</b> views (${fmt(d.value / all * 100)}%)`},
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
    tooltip: {...o.tooltip, valueFormatter: v => fmt(v)},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ENG.map(([k, l, ic, c]) => ({
      name: k === "new_followers" ? `${ic} Followers (all platforms)` : `${ic} ${l}`, type: "line", step: "end", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30,
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
    ...o, legend: {...o.legend, formatter: n => n},
    tooltip: {...o.tooltip, axisPointer: {type: "shadow"},
              formatter: ps => `<b>${ps[0].axisValueLabel}</b><br>` + ps.map(x => `${x.marker}${x.seriesName}: <b>${fmt(x.value)}</b>`).join("<br>")},
    xAxis: {...o.xAxis, type: "category", data: cs.map(([n, c]) => `{num|${n}}\n${c.title}`),
            axisLabel: {...o.xAxis.axisLabel, interval: 0, fontSize: 11, lineHeight: 16, rich: {num: numRich(16)}}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ENG.map(([k, l, ic, c], i) => ({
      name: `${ic} ${l}`, type: "bar", stack: "eng", barMaxWidth: 34, data: cs.map(([, cc]) => eng(cc, k)),
      itemStyle: {color: css(c), borderColor: surface, borderWidth: 1,
                  borderRadius: i === ENG.length - 1 ? [4, 4, 0, 0] : 0}, emphasis: {focus: "series"}})),
    graphic: any ? [] : [{type: "text", left: "center", top: "middle",
      style: {text: "No likes, comments, shares or saves yet on the selected platforms.", fill: css("--text-muted"), fontSize: 13}}],
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
    tooltip: {...o.tooltip, valueFormatter: v => fmt(v)},
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
  $("platformChips").innerHTML = PLAT.map(p =>   // rebuilt each time so the logos follow the theme
    `<button class="chip" data-k="${p.k}" aria-pressed="true" aria-label="${p.label}"><i style="background:var(${p.c})"></i>${iconHtml(p)}</button>`).join("");
  document.querySelectorAll("#range button").forEach(b => b.classList.toggle("on", +b.dataset.r === state.range));
  document.querySelectorAll("#platformChips .chip").forEach(b => {
    b.classList.toggle("off", state.off.has(b.dataset.k)); b.setAttribute("aria-pressed", !state.off.has(b.dataset.k));
  });
  const now = latest(), errs = Object.keys(now.errors || {});
  $("updated").textContent = `Updated ${new Date(now.updated).toLocaleString([], {dateStyle: "medium", timeStyle: "short"})}` +
    ` · ${snaps().length} snapshot${snaps().length === 1 ? "" : "s"} since ${new Date(snaps()[0].updated).toLocaleDateString([], {month: "short", day: "numeric"})}` +
    (errs.length ? ` · couldn't refresh: ${errs.join(", ")}` : "");
  renderChanges(); renderTiles(); renderTrend(); renderEngTrend(); renderEngPosts(); renderMix(); renderBoard(); renderDetail(); renderComments();
  preloadBig();
}
