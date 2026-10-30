"use strict";
// Ink Stats: data.json is AES-256-GCM; the key is PBKDF2-SHA256(username + "\n" + password), derived in the
// browser. Nothing readable is on the server. After sign-in the derived key (never the password) is kept in
// this browser's storage for SESSION_MS so reloads don't ask again; Lock signs out and deletes it.

const PLAT = [
  {k: "tiktok", label: "TikTok", c: "--s1", brand: "tiktok", tag: ""},
  {k: "instagram_reel", label: "IG Reel", c: "--s2", brand: "instagram", tag: "Reel"},
  {k: "instagram_image", label: "IG image", c: "--s3", brand: "instagram", tag: "image"},
  {k: "x", label: "X", c: "--s4", brand: "x", tag: ""},
  {k: "threads", label: "Threads", c: "--s5", brand: "threads", tag: ""},
];

// Platform logos (monochrome, drawn in the text colour so they work in light and dark)
const GLYPH = {
  tiktok: '<path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
  instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="F" stroke-width="2.2"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="F" stroke-width="2.2"/><circle cx="17.6" cy="6.4" r="1.4"/>',
  x: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/>',
  threads: '<path fill="none" stroke="F" stroke-width="2.2" stroke-linecap="round" d="M16.2 11.2c-.5-2.6-2.3-3.7-4.3-3.7-2.3 0-3.7 1.3-3.9 3 M16.3 12.4c0 3-1.6 4.3-3.9 4.3-1.9 0-3.1-1-3.1-2.4 0-1.7 1.6-2.6 3.8-2.6 3.7 0 6.4 1.4 6.4 4.4 0 3.3-3 5.6-7 5.6-5.3 0-8.3-3.6-8.3-9 0-5.5 3.2-9 8.4-9 4.2 0 6.9 2 7.9 5.6"/>',
};
const logo = brand => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${css("--text-primary")}">${GLYPH[brand].replace(/"F"/g, `"${css("--text-primary")}"`)}</svg>`);
const byLabel = label => PLAT.find(p => p.label === label) || FOLLOW_P.find(p => p.label === label);
function richIcons(size = 16) {   // ECharts rich-text styles: {i_tiktok|} draws the TikTok logo
  const r = {tag: {color: css("--text-secondary"), fontSize: 12, padding: [0, 0, 0, 4]}};
  for (const b of Object.keys(GLYPH)) r["i_" + b] = {backgroundColor: {image: logo(b)}, width: size, height: size};
  return r;
}
const iconText = label => { const p = byLabel(label); return p ? `{i_${p.brand}|}` + (p.tag ? `{tag|${p.tag}}` : "") : label; };
const iconHtml = p => `<img src="${logo(p.brand)}" alt="${esc(p.label)}" title="${esc(p.label)}" class="pl">` +
  (p.tag ? `<span class="pltag">${p.tag}</span>` : "");
const FOLLOW = [["tiktok", "TikTok", "--s1"], ["instagram", "Instagram", "--s2"], ["x", "X", "--s4"], ["threads", "Threads", "--s5"]];
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
function reelWatch(s) {   // median Reel watch time; > 60 s is a looping outlier, not real watching
  const w = Object.values(s.cartoons).map(c => c.instagram_reel && c.instagram_reel.avg_watch_s)
    .filter(v => v > 0 && v < 60).sort((a, b) => a - b);
  return w.length ? w[Math.floor(w.length / 2)] : null;
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
    ["Reel watch time", reelWatch(now) == null ? "–" : fmt(reelWatch(now), 1) + " s",
     delta(reelWatch(now), then && reelWatch(then), 1) + " · median per Reel"],
    ["Top cartoon", best ? `No. ${esc(best[0])}` : "–", best ? `${esc(best[1].title)} · ${fmt(cartoonViews(best[1]))} views` : ""],
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
  const o = base();
  chart("cTrend").setOption({
    ...o, series,
    grid: {...o.grid, bottom: 52},
    tooltip: {...o.tooltip, valueFormatter: v => fmt(v)},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    dataZoom: [{type: "inside"}, {type: "slider", height: 20, bottom: 6, borderColor: "transparent",
               fillerColor: "rgba(200,137,43,.15)", dataBackground: {lineStyle: {color: css("--text-muted")}, areaStyle: {opacity: 0}},
               handleStyle: {color: css("--accent")}, textStyle: {color: css("--text-muted")}}],
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "The trend fills in as refreshes come in (twice a day).", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
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

function renderFormat() {
  const cs = Object.values(latest().cartoons);
  const groups = {living: cs.filter(c => c.format === "living"), drawing: cs.filter(c => c.format === "drawing")};
  const avg = (list, k) => list.length ? list.reduce((a, c) => a + views(c, k), 0) / list.length : 0;
  const metrics = [["tiktok", "TikTok views"], ["instagram_reel", "IG Reel views"]];
  const o = base();
  chart("cFormat").setOption({
    ...o, grid: {...o.grid, top: 36}, legend: {...o.legend, formatter: n => n},
    tooltip: {...o.tooltip, trigger: "axis", axisPointer: {type: "shadow"}, valueFormatter: v => fmt(v) + " per cartoon"},
    xAxis: {...o.xAxis, type: "category", data: metrics.map(m => m[1]),
            axisLabel: {...o.xAxis.axisLabel, rich: richIcons(18),
                        formatter: v => v.startsWith("TikTok") ? "{i_tiktok|}" : "{i_instagram|}{tag|Reel}"}},
    yAxis: {...o.yAxis, type: "value"},
    series: [["living", "Living", "--living"], ["drawing", "Drawing", "--drawing"]].map(([k, label, c]) => ({
      name: `${label} (${groups[k].length})`, type: "bar", barMaxWidth: 40, barGap: "8%",
      data: metrics.map(m => Math.round(avg(groups[k], m[0]))),
      itemStyle: {color: css(c), borderRadius: [4, 4, 0, 0]},
      label: {show: true, position: "top", color: css("--text-secondary")}})),
  }, true);
  const mean = (k, plat, field, unit, d) => {
    const v = groups[k].map(c => c[plat] && c[plat][field]).filter(v => v != null && !(field === "avg_watch_s" && v >= 60));   // > 60 s = looping outlier
    return v.length ? fmt(v.reduce((a, b) => a + b, 0) / v.length, d) + unit : "–";
  };
  $("formatNote").textContent =
    `Avg watch time: TikTok living ${mean("living", "tiktok", "avg_watch_s", " s", 1)} vs drawing ${mean("drawing", "tiktok", "avg_watch_s", " s", 1)}; ` +
    `IG Reel living ${mean("living", "instagram_reel", "avg_watch_s", " s", 1)} vs drawing ${mean("drawing", "instagram_reel", "avg_watch_s", " s", 1)}. ` +
    `Watched to the end on TikTok: living ${mean("living", "tiktok", "completion_pct", "%", 1)} vs drawing ${mean("drawing", "tiktok", "completion_pct", "%", 1)}. ` +
    `Newer posts have had less time to collect views.`;
}

// ---- engagement ------------------------------------------------------------------
function renderEngTrend() {
  const r = inRange(), o = base(), surface = css("--surface-1");
  chart("cEngTrend").setOption({
    ...o, legend: {...o.legend, formatter: n => n},
    tooltip: {...o.tooltip, valueFormatter: v => fmt(v)},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ENG.map(([k, l, ic, c]) => ({
      name: k === "new_followers" ? `${ic} Followers (all platforms)` : `${ic} ${l}`, type: "line", step: "end", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30,
      data: r.map(s => [s.updated, k === "new_followers" ? allFollowers(s) : engAll(s, k)]),
      lineStyle: {width: 2}, itemStyle: {color: css(c), borderColor: surface, borderWidth: 2}, emphasis: {focus: "series"}})),
  }, true);
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
    xAxis: {...o.xAxis, type: "category", data: cs.map(([n, c]) => `No. ${n}\n${c.title}`),
            axisLabel: {...o.xAxis.axisLabel, interval: 0, fontSize: 11, lineHeight: 14}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: ENG.map(([k, l, ic, c], i) => ({
      name: `${ic} ${l}`, type: "bar", stack: "eng", barMaxWidth: 34, data: cs.map(([, cc]) => eng(cc, k)),
      itemStyle: {color: css(c), borderColor: surface, borderWidth: 1,
                  borderRadius: i === ENG.length - 1 ? [4, 4, 0, 0] : 0}, emphasis: {focus: "series"}})),
    graphic: any ? [] : [{type: "text", left: "center", top: "middle",
      style: {text: "No likes, comments, shares or saves yet on the selected platforms.", fill: css("--text-muted"), fontSize: 13}}],
  }, true);
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
    ps.forEach(p => { row[p.k] = c[p.k] ? c[p.k].views : null; });
    row.change = first && first.cartoons[n] ? row.total - cartoonViews(first.cartoons[n]) : null;
    row.trend = r.map(s => s.cartoons[n] ? cartoonViews(s.cartoons[n]) : 0);
    return row;
  });
  const {key, asc} = state.sort;
  rows.sort((a, b) => ((key === "n" ? a.n - b.n : (a[key] ?? -1) - (b[key] ?? -1))) * (asc ? 1 : -1));
  const cols = [["n", "Cartoon"], ...ps.map(p => [p.k, iconHtml(p)]), ["total", "Total"], ...ENG.map(([k, l, ic]) => [k, `<span title="${l}">${ic}</span>`]),
                ["change", "Change"], [null, "Trend"]];
  $("board").innerHTML = `<thead><tr>${cols.map(([k, l]) =>
      `<th ${k ? `data-k="${k}"` : ""} class="${k === key ? "sorted" + (asc ? " asc" : "") : ""}">${l}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(row => `<tr data-n="${row.n}" class="${row.n === state.sel ? "sel" : ""}">
      <td>No. ${row.n} · ${esc(row.c.title)}${row.c.format ? `<span class="badge ${row.c.format}">${row.c.format}</span>` : ""}</td>
      ${ps.map(p => `<td>${fmt(row[p.k])}</td>`).join("")}
      <td><b>${fmt(row.total)}</b></td>${ENG.map(([k]) => `<td class="${row[k] ? "" : "muted"}">${fmt(row[k])}</td>`).join("")}
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
    renderBoard(); renderDetail();
    if (state.sel) $("detail").scrollIntoView({behavior: "smooth", block: "nearest"});
  };
}

function renderDetail() {
  const n = state.sel, c = n && latest().cartoons[n];
  $("detail").hidden = !c;
  if (!c) return;
  $("detailTitle").textContent = `No. ${n} · ${c.title}`;
  const r = inRange(), o = base(), surface = css("--surface-1");
  chart("cDetail").resize();
  chart("cDetail").setOption({
    ...o,
    tooltip: {...o.tooltip, valueFormatter: v => fmt(v)},
    xAxis: {...o.xAxis, type: "time", ...dayTicks(r), axisLabel: {...o.xAxis.axisLabel, formatter: TIME_LABELS, hideOverlap: true}},
    yAxis: {...o.yAxis, type: "value", minInterval: 1},
    series: on().filter(p => c[p.k]).map(p => ({
      name: p.label, type: "line", symbol: "circle", symbolSize: 8, showSymbol: r.length < 30, connectNulls: true,
      data: r.map(s => [s.updated, s.cartoons[n] && s.cartoons[n][p.k] ? s.cartoons[n][p.k].views : null]),
      lineStyle: {width: 2}, itemStyle: {color: css(p.c), borderColor: surface, borderWidth: 2}})),
    graphic: r.length < 2 ? [{type: "text", left: "center", top: "middle",
      style: {text: "History builds up with each refresh.", fill: css("--text-muted"), fontSize: 13}}] : [],
  }, true);
  const line = (label, d, extra = "") => d ? `<div class="row"><span>${label}</span><span>${fmt(d.views)} views${extra}
      ${d.url && /^https:\/\//.test(d.url) ? ` · <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">open ↗</a>` : ""}</span></div>` : "";
  $("detailStats").innerHTML = `<p class="note">“${esc(c.caption)}”${c.format ? ` · ${c.format} video` : ""}</p>` +
    PLAT.map(p => {
      const d = c[p.k]; if (!d) return "";
      const bits = [d.reach != null ? `reach ${fmt(d.reach)}` : "", inter(d) ? ENG.filter(([k]) => d[k]).map(([k, l, ic]) => `${ic} ${fmt(d[k])}`).join(" ") : "",
                    d.avg_watch_s ? `watch ${fmt(Math.min(d.avg_watch_s, 999), 1)} s` : "",
                    d.completion_pct != null ? `${fmt(d.completion_pct, 1)}% watched to the end` : "",
                    d.link_clicks ? `${fmt(d.link_clicks)} link clicks` : ""].filter(Boolean);
      return line(iconHtml(p), d, bits.length ? ` <span class="muted">· ${bits.join(" · ")}</span>` : "");
    }).join("");
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
  renderTiles(); renderTrend(); renderEngTrend(); renderEngPosts(); renderMix(); renderFormat(); renderBoard(); renderDetail();
}
