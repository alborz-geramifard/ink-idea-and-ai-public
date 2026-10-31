// Visit counter: page, referrer and the time the page was visible. No cookies, nothing stored on this device.
(() => {
  const URL_ = "ANALYTICS_URL/hit";
  if (!/alborz-geramifard\.com$/.test(location.hostname)) return;   // never count local previews
  if (URL_.startsWith("ANALYTICS_URL")) return;   // not set up yet (analytics.py setup fills it in)
  const id = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random()).slice(2) + Date.now();
  let shown = 0, since = document.visibilityState === "visible" ? Date.now() : 0;
  const send = t => navigator.sendBeacon(URL_, JSON.stringify({
    t, id, p: location.pathname, r: document.referrer, d: shown + (since ? Date.now() - since : 0)}));
  send("pv");
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") { if (since) { shown += Date.now() - since; since = 0; } send("end"); }
    else since = Date.now();
  });
})();
