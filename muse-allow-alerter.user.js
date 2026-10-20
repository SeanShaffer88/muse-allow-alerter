// ==UserScript==
// @name         Muse Allow-Button Alerter (alert-only)
// @namespace    sean.muse.allow-alerter
// @version      1.0.0
// @description  Grabs your attention when a Muse approval card appears: flashes the tab title, pings softly, and outlines the Allow button. ALERT-ONLY — it never clicks anything. The approval decision is always yours.
// @author       SEAN (via Muse)
// @match        https://muse.ai/*
// @match        https://*.muse.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ---------- Settings (edit these) ----------
  const ENABLE_SOUND = true;        // soft ping while an approval is waiting
  const PING_EVERY_MS = 6000;       // how often the ping repeats
  const FLASH_TITLE = true;         // alternate the tab title
  const SHOW_BADGE = true;          // small "Approval waiting" badge, bottom-right
  const OUTLINE_BUTTON = true;      // pulsing outline around the Allow button
  // -------------------------------------------

  const ALERT_TITLE = '🔔 Approval needed — Muse';
  const originalTitle = document.title;
  let alerting = false;
  let titleTimer = null;
  let pingTimer = null;
  let audioCtx = null;
  let badgeEl = null;
  let outlinedEl = null;
  let titleShowingAlert = false;

  // Browsers block audio before the first user gesture; unlock on interaction.
  function unlockAudio() {
    if (!ENABLE_SOUND) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { /* audio unavailable — visual alerts still work */ }
  }
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio);

  function ping() {
    if (!ENABLE_SOUND || !audioCtx || audioCtx.state !== 'running') return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) { /* ignore */ }
  }

  const style = document.createElement('style');
  style.textContent = `
    .muse-allow-outline {
      outline: 3px solid #ff9800 !important;
      outline-offset: 2px !important;
      animation: muse-allow-pulse 1s ease-in-out infinite !important;
    }
    @keyframes muse-allow-pulse {
      0%, 100% { outline-color: #ff9800; }
      50% { outline-color: #ffd54f; }
    }
    #muse-allow-badge {
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
      background: #b26a00; color: #fff; font: 600 13px/1.4 system-ui, sans-serif;
      padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.35);
      pointer-events: none; user-select: none;
    }`;
  document.documentElement.appendChild(style);

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function findAllowButton() {
    const candidates = document.querySelectorAll('button, [role="button"]');
    for (const el of candidates) {
      if (el.id === 'muse-allow-badge') continue;
      const label = (el.textContent || '').trim().replace(/\s+/g, ' ');
      // Matches "Allow", "Allow once", "Allow always", "Always allow", etc.
      if (/^allow\b/i.test(label) || /^always allow\b/i.test(label)) {
        if (isVisible(el)) return el;
      }
    }
    return null;
  }

  function startAlert(btn) {
    if (alerting) return;
    alerting = true;
    if (FLASH_TITLE) {
      titleTimer = setInterval(() => {
        titleShowingAlert = !titleShowingAlert;
        document.title = titleShowingAlert ? ALERT_TITLE : (document.title === ALERT_TITLE ? originalTitle : document.title);
      }, 900);
      document.title = ALERT_TITLE;
      titleShowingAlert = true;
    }
    if (OUTLINE_BUTTON && btn) {
      outlinedEl = btn;
      btn.classList.add('muse-allow-outline');
    }
    if (SHOW_BADGE && !badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.id = 'muse-allow-badge';
      badgeEl.textContent = '🔔 Approval waiting in Muse';
      document.body.appendChild(badgeEl);
    }
    ping();
    if (ENABLE_SOUND) pingTimer = setInterval(ping, PING_EVERY_MS);
  }

  function stopAlert() {
    if (!alerting) return;
    alerting = false;
    if (titleTimer) { clearInterval(titleTimer); titleTimer = null; }
    if (document.title === ALERT_TITLE) document.title = originalTitle;
    titleShowingAlert = false;
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    if (outlinedEl) { outlinedEl.classList.remove('muse-allow-outline'); outlinedEl = null; }
    if (badgeEl) { badgeEl.remove(); badgeEl = null; }
  }

  let scheduled = false;
  function check() {
    scheduled = false;
    const btn = findAllowButton();
    if (btn) {
      if (outlinedEl && outlinedEl !== btn) {
        outlinedEl.classList.remove('muse-allow-outline');
        outlinedEl = null;
      }
      startAlert(btn);
      if (OUTLINE_BUTTON && outlinedEl !== btn) {
        outlinedEl = btn;
        btn.classList.add('muse-allow-outline');
      }
    } else {
      stopAlert();
    }
  }
  function scheduleCheck() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(check);
  }

  const observer = new MutationObserver(scheduleCheck);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: false });
  scheduleCheck();
})();
