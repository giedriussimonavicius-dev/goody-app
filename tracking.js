/**
 * Goody intent event tracker — vanilla JS, no external dependencies.
 * Fire-and-forget: never throws to callers, all errors are console.debug only.
 */
(function (global) {
  'use strict';

  var API_EVENTS = (global.GOODY_API_BASE || '') + '/api/events';
  var MAX_QUEUE  = 100;
  var FLUSH_INTERVAL_MS = 10000;
  var FLUSH_BATCH_SIZE  = 10;

  // ── identity ──────────────────────────────────────────────────────────────

  function _uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // fallback: RFC 4122 v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getAnonymousUserId() {
    try {
      var id = localStorage.getItem('goody_uid');
      if (!id) { id = _uuid(); localStorage.setItem('goody_uid', id); }
      return id;
    } catch (e) { return _uuid(); }
  }

  function getSessionId() {
    try {
      var id = sessionStorage.getItem('goody_sid');
      if (!id) { id = _uuid(); sessionStorage.setItem('goody_sid', id); }
      return id;
    } catch (e) { return _uuid(); }
  }

  function _isInternal() {
    try { return localStorage.getItem('goody_internal') === '1'; } catch (e) { return false; }
  }

  function _internalToken() {
    try { return localStorage.getItem('goody_internal_token') || ''; } catch (e) { return ''; }
  }

  // ── queue ─────────────────────────────────────────────────────────────────

  var _queue = [];

  function trackEvent(type, payload, productCanonical) {
    try {
      _queue.push({
        event_type:        type,
        anonymous_user_id: getAnonymousUserId(),
        session_id:        getSessionId(),
        product_canonical: productCanonical || null,
        payload:           payload || {},
        client_ts:         new Date().toISOString(),
      });
      // Trim old events if queue overflows
      if (_queue.length > MAX_QUEUE) {
        _queue = _queue.slice(_queue.length - MAX_QUEUE);
      }
      // Flush immediately when batch threshold is reached
      if (_queue.length >= FLUSH_BATCH_SIZE) {
        _flush();
      }
    } catch (e) {
      console.debug('[goody-track] enqueue error', e);
    }
  }

  // ── flush ─────────────────────────────────────────────────────────────────

  function _flush() {
    if (!_queue.length) return;
    var batch = _queue.slice();
    _queue = [];
    _send(batch);
  }

  function _send(batch) {
    if (!batch.length) return;
    var headers = { 'Content-Type': 'application/json' };
    if (_isInternal()) {
      var tok = _internalToken();
      if (tok) headers['X-Goody-Internal'] = tok;
    }
    var body = JSON.stringify(batch);

    // Prefer sendBeacon for visibility-change flushes (reliable on page hide)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon && !_isInternal()) {
      try {
        var blob = new Blob([body], { type: 'application/json' });
        var sent = navigator.sendBeacon(API_EVENTS, blob);
        if (sent) return;
      } catch (e) { console.debug('[goody-track] sendBeacon error', e); }
    }

    // Fallback: fetch with keepalive
    try {
      fetch(API_EVENTS, {
        method:    'POST',
        headers:   headers,
        body:      body,
        keepalive: true,
      }).then(function (r) {
        if (!r.ok) console.debug('[goody-track] server rejected', r.status);
      }).catch(function (e) {
        // Re-enqueue if flush fails (keep max cap)
        console.debug('[goody-track] fetch error, re-queuing', e);
        _queue = batch.concat(_queue).slice(0, MAX_QUEUE);
      });
    } catch (e) {
      console.debug('[goody-track] fetch exception', e);
      _queue = batch.concat(_queue).slice(0, MAX_QUEUE);
    }
  }

  // ── auto-flush on interval and page exit ──────────────────────────────────

  setInterval(_flush, FLUSH_INTERVAL_MS);

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') _flush();
    });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', _flush);
  }

  // ── public API ────────────────────────────────────────────────────────────

  global.GoodyTrack = {
    trackEvent:         trackEvent,
    getAnonymousUserId: getAnonymousUserId,
    getSessionId:       getSessionId,
    flush:              _flush,
  };

}(typeof window !== 'undefined' ? window : this));
