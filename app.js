/* Swatti content plan — app logic.
   Works with no setup at all (saves on this device).
   Fill in config.js and it shares live between Prince and Swatti.

   Two interfaces, one page:
     role "creator" — Swatti. What to film this week, tick it, leave a note.
     role "studio"  — Prince. Everything above, plus the production pipeline,
                      reference-shot uploads, inline editing and her inbox.
   The role is remembered per device and is never synced, so switching on
   Prince's laptop can't change what she sees on her phone. */

(function () {
  'use strict';

  var PLAN = window.PLAN || [];
  var META = window.PLAN_META || { storeKey: 'plan' };
  var LKEY = 'swatti-' + META.storeKey;
  var RKEY = 'swatti-role';

  var STAGES = ['Planned', 'Filmed', 'Edited', 'Approved', 'Posted'];
  var DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MON = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  var S = {};                     // flat key -> value, shared
  var cur = 0, role = 'creator', view = 'week', openSet = {};
  var recorder = null, chunks = [], recTimer = null, recWeek = null, discarding = false;
  var pickTarget = null, lsFull = false;

  /* ───────────────── storage ───────────────── */

  var Store = {
    mode: 'local',
    sb: null,

    async init() {
      var cfg = window.SWATTI_CONFIG || {};
      if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) return;
      try {
        this.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
        var res = await this.sb.from('entries').select('id,data');
        if (res.error) throw res.error;
        (res.data || []).forEach(function (r) {
          if (r && r.id && r.data && 'v' in r.data) S[r.id] = r.data.v;
        });
        this.mode = 'live';
        localSave();
        this.sb.channel('entries-live')
          .on('postgres_changes',
              { event: '*', schema: 'public', table: 'entries' },
              function (payload) {
                var r = payload.new;
                if (!r || !r.id) return;
                var v = (r.data && 'v' in r.data) ? r.data.v : undefined;
                if (JSON.stringify(S[r.id]) === JSON.stringify(v)) return;
                S[r.id] = v;
                localSave();
                if (!isTyping()) rerender();
              })
          .subscribe();
      } catch (e) {
        this.mode = 'local';
        console.warn('Supabase unavailable, saving on this device only:', e.message || e);
      }
      syncBadge();
    },

    async put(key, val) {
      if (this.mode !== 'live') return;
      try {
        await this.sb.from('entries')
          .upsert({ id: key, data: { v: val }, updated_at: new Date().toISOString() });
      } catch (e) { console.warn('save failed', e); }
    },

    // returns a public URL, or null if we should fall back to inline data
    async upload(path, blob, contentType) {
      if (this.mode !== 'live') return null;
      try {
        var up = await this.sb.storage.from('media')
          .upload(path, blob, { contentType: contentType, upsert: true });
        if (up.error) throw up.error;
        return this.sb.storage.from('media').getPublicUrl(path).data.publicUrl;
      } catch (e) { console.warn('upload failed', e); return null; }
    }
  };

  /* ───────────────── media store (IndexedDB) ─────────────────
     Photos and clips are kept as real blobs in IndexedDB, not as base64 in
     localStorage — that is what makes 15-second video possible before live
     sync exists, and it is why photos no longer blow the 5MB quota.
     A reference entry is a string:
       https://…            uploaded to Supabase (shared)
       idb:<k> / idbv:<k>   this device only, photo / video
       data:…               legacy, still rendered                         */

  var Media = (function () {
    var dbp = null, cache = {};
    function db() {
      if (dbp) return dbp;
      dbp = new Promise(function (res, rej) {
        if (!window.indexedDB) return rej(new Error('no indexeddb'));
        var r = indexedDB.open('swatti-media', 1);
        r.onupgradeneeded = function () {
          if (!r.result.objectStoreNames.contains('m')) r.result.createObjectStore('m', { keyPath: 'k' });
        };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
      return dbp;
    }
    function bare(tok) { return String(tok).replace(/^idbv?:/, ''); }
    return {
      async save(blob, isVid) {
        var d = await db();
        var k = 'm' + Date.now() + Math.random().toString(36).slice(2, 7);
        await new Promise(function (res, rej) {
          var tx = d.transaction('m', 'readwrite');
          tx.objectStore('m').put({ k: k, b: blob });
          tx.oncomplete = res;
          tx.onerror = function () { rej(tx.error); };
          tx.onabort = function () { rej(tx.error || new Error('aborted')); };
        });
        return (isVid ? 'idbv:' : 'idb:') + k;
      },
      async url(tok) {
        if (cache[tok]) return cache[tok];
        var d = await db(), k = bare(tok);
        var rec = await new Promise(function (res, rej) {
          var tx = d.transaction('m', 'readonly'), q = tx.objectStore('m').get(k);
          q.onsuccess = function () { res(q.result); };
          q.onerror = function () { rej(q.error); };
        });
        if (!rec || !rec.b) return null;
        cache[tok] = URL.createObjectURL(rec.b);
        return cache[tok];
      },
      async del(tok) {
        try {
          var d = await db();
          d.transaction('m', 'readwrite').objectStore('m').delete(bare(tok));
        } catch (e) {}
        if (cache[tok]) { URL.revokeObjectURL(cache[tok]); delete cache[tok]; }
      }
    };
  })();

  function isIdb(t) { return /^idbv?:/.test(String(t)); }
  function isVideoRef(t) {
    return /^idbv:/.test(String(t)) || /\.(mp4|mov|m4v|webm|qt)(\?|$)/i.test(String(t));
  }

  function localSave() {
    try { localStorage.setItem(LKEY, JSON.stringify(S)); lsFull = false; return true; }
    catch (e) { lsFull = true; return false; }
  }
  function localLoad() { try { return JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { return {}; } }

  function put(key, val) { S[key] = val; var ok = localSave(); Store.put(key, val); return ok; }
  function get(key, dflt) { return S[key] !== undefined ? S[key] : dflt; }

  function isTyping() {
    var a = document.activeElement;
    return !!(a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT'));
  }

  function syncBadge() {
    var el = document.getElementById('sync');
    if (!el) return;
    if (lsFull && Store.mode !== 'live') {
      el.innerHTML = '<b>This device is full.</b> Switch live sync on to keep adding photos.';
      return;
    }
    el.innerHTML = Store.mode === 'live'
      ? '<span class="dotlive"></span>Live &mdash; changes show up on <b>both</b> screens.'
      : 'Saving on <b>this device</b>. Ticks and notes stay here until live sync is on.';
  }

  /* ───────────────── dates ───────────────── */

  function iso(d) { return new Date(d + 'T00:00:00'); }
  var MSTART = iso(META.start || '2026-09-15');
  var MEND = iso(META.end || '2026-10-14');

  function dayIdx(d) { return (d.getDay() + 6) % 7; }        // Mon = 0
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function sameDay(a, b) { return key(a) === key(b); }

  // "Tue 15" -> the real date inside this month's window
  function postDate(p) {
    var n = parseInt(String(p.date).replace(/\D+/g, ''), 10);
    if (!n) return null;
    var d = new Date(MSTART.getFullYear(), MSTART.getMonth(), n);
    if (d < MSTART) d = new Date(MSTART.getFullYear(), MSTART.getMonth() + 1, n);
    return d;
  }

  // pull "<b>Sat 19 Sept</b>" out of a week's shoot line
  function shootDates(w) {
    var out = [], re = /<b>\s*[A-Z][a-z]{2}\s+(\d{1,2})\s+([A-Za-z]{3,9})\s*<\/b>/g, m;
    while ((m = re.exec(w.shoot || ''))) {
      var mi = MON.indexOf(m[2].slice(0, 3).toLowerCase());
      if (mi < 0) continue;
      var y = MSTART.getFullYear() + (mi < MSTART.getMonth() ? 1 : 0);
      out.push(new Date(y, mi, +m[1]));
    }
    return out;
  }

  var SHOOTMAP = (function () {
    var m = {};
    PLAN.forEach(function (w) { shootDates(w).forEach(function (d) { m[key(d)] = true; }); });
    return m;
  })();

  var POSTMAP = (function () {
    var m = {};
    PLAN.forEach(function (w, wi) {
      w.posts.forEach(function (p) {
        var d = postDate(p);
        if (!d) return;
        p.__wi = wi; p.__d = d;
        (m[key(d)] = m[key(d)] || []).push(p);
      });
    });
    return m;
  })();

  function weekIdxOf(d) {
    for (var i = 0; i < PLAN.length; i++) {
      var hit = PLAN[i].posts.some(function (p) { return p.__d && sameDay(p.__d, d); });
      if (hit) return i;
    }
    return -1;
  }

  /* ───────────────── helpers ───────────────── */

  function esc(s) { return String(s == null ? '' : s).replace(/</g, '&lt;'); }

  /* The plan text carries <b> tags so the shot list can emphasise the thing
     that matters. Nobody should have to type angle brackets to edit it, so the
     edit boxes speak stars instead and it is converted on the way in and out. */
  function toPlain(s) { return String(s == null ? '' : s).replace(/<\/?b>/gi, '*').replace(/<[^>]+>/g, ''); }
  function toRich(s) { return String(s == null ? '' : s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>'); }

  /* One shot per line in the edit box:
       WIDE | tripod | what she does | 15
     Two fields means angle and action; one field is a step that isn't a shot
     (the voiceover instructions, for instance). */
  function shotsToText(shots) {
    return shots.map(function (s) {
      var bits = [];
      if (s.a) bits.push(s.a);
      if (s.a && s.h) bits.push(s.h);
      bits.push(toPlain(s.do || ''));
      if (s.s) bits.push(String(s.s));
      return bits.join(' | ');
    }).join('\n');
  }
  function textToShots(txt) {
    return String(txt || '').split('\n').filter(function (l) { return l.trim(); })
      .map(function (line) {
        var parts = line.split('|').map(function (x) { return x.trim(); });
        if (parts.length === 1) return { do: toRich(parts[0]) };
        var o = { a: parts[0].toUpperCase() };
        if (parts.length === 2) { o.do = toRich(parts[1]); return o; }
        // three or more: angle | hold | action | seconds
        o.h = /hand/i.test(parts[1]) ? 'hand' : 'tripod';
        o.do = toRich(parts[2]);
        var s = parseInt(parts[3], 10);
        if (s) o.s = s;
        return o;
      });
  }
  function F(p, f) { var e = get('edit:' + p.id, {}); return e[f] !== undefined ? e[f] : p[f]; }

  /* Every shot owns its own media slot, so a reference lives against the shot it
     belongs to rather than in one pile at the top of the post.
       storage key   refs:r2#3
       element id    refs-r2__3
     A bare post id with no # is the old post-level pile, still read and rendered
     so nothing anybody has already uploaded disappears. */
  function slotKey(pid, i) { return pid + '#' + i; }
  function slotDom(k) { return 'refs-' + String(k).replace('#', '__'); }
  function slotPost(k) { return String(k).split('#')[0]; }
  function shotsOf(p) {
    var s = F(p, 'shots');
    return Array.isArray(s) ? s : [];
  }
  function shotSeconds(p) {
    return shotsOf(p).reduce(function (a, s) { return a + (parseInt(s.s, 10) || 0); }, 0);
  }
  function holdWords(h) {
    return h === 'hand' ? 'In your hand' : h === 'tripod' ? 'On the tripod' : '';
  }
  function allPosts() { var a = []; PLAN.forEach(function (w) { a = a.concat(w.posts); }); return a; }
  function findPost(id) { return allPosts().filter(function (p) { return p.id === id; })[0]; }

  function stageOf(p) {
    var s = S['stage:' + p.id];
    if (s === undefined) s = get('tick:' + p.id, false) ? 1 : 0;
    s = parseInt(s, 10) || 0;
    return Math.max(0, Math.min(STAGES.length - 1, s));
  }
  function setStage(p, n) {
    n = Math.max(0, Math.min(STAGES.length - 1, n));
    put('stage:' + p.id, n);
    put('tick:' + p.id, n >= 1);
  }
  function isDone(p) { return stageOf(p) >= 1; }
  function isPosted(p) { return stageOf(p) >= 4; }

  function monthStats() {
    var st = { total: 0, filmed: 0, edited: 0, posted: 0, reels: 0, cars: 0 };
    allPosts().forEach(function (p) {
      if (p.type === 'REEL') st.reels++;
      if (p.type === 'CAROUSEL') st.cars++;
      st.total++;
      var s = stageOf(p);
      if (s >= 1) st.filmed++;
      if (s >= 2) st.edited++;
      if (s >= 4) st.posted++;
    });
    return st;
  }

  function flash(msg) {
    var s = document.getElementById('wksaved');
    if (!s) return;
    s.textContent = msg || 'Saved.';
    clearTimeout(s.__t);
    s.__t = setTimeout(function () { s.textContent = ''; }, 2400);
  }

  /* ───────────────── rail ───────────────── */

  function miniCal() {
    var start = addDays(MSTART, -dayIdx(MSTART));
    var end = addDays(MEND, 6 - dayIdx(MEND));
    var today = new Date();
    var h = DOW.map(function (d) { return '<span class="dw">' + d[0] + '</span>'; }).join('');
    for (var d = start; d <= end; d = addDays(d, 1)) {
      var out = d < MSTART || d > MEND;
      var ps = POSTMAP[key(d)] || [];
      var cls = (out ? 'out' : '') + (SHOOTMAP[key(d)] ? ' shootday' : '');
      if (!ps.length) { h += '<span class="' + cls + '">' + d.getDate() + '</span>'; continue; }
      var done = ps.every(isDone), post = ps.every(isPosted);
      h += '<button class="' + cls + (post ? ' posted' : done ? ' done' : '') +
           (ps[0].__wi === cur ? ' inwk' : '') + '" data-goto="' + ps[0].id + '" title="' +
           esc(F(ps[0], 'title')) + '">' + d.getDate() + '<b></b></button>';
    }
    return '<div class="minical">' + h + '</div>';
  }

  function weekList() {
    return '<ul class="wklist">' + PLAN.map(function (w, i) {
      var dots = w.posts.map(function (p) {
        return '<i class="' + (isPosted(p) ? 'on posted' : isDone(p) ? 'on' : '') + '"></i>';
      }).join('');
      return '<li><button data-week="' + i + '" aria-current="' + (i === cur) + '">' +
        '<span class="wk-n">' + w.head + '<small>' + w.sub + '</small></span>' +
        '<span class="wk-dots">' + dots + '</span></button></li>';
    }).join('') + '</ul>';
  }

  function inboxHTML() {
    var items = [];
    PLAN.forEach(function (w, i) {
      var t = get('week:' + w.w, '');
      if (t && t.trim()) items.push([i, null, w.head + ' &middot; the week ahead', t]);
      if (get('audio:' + w.w, '')) items.push([i, null, w.head + ' &middot; voice note', 'Tap to listen.']);
    });
    allPosts().forEach(function (p) {
      var n = get('note:' + p.id, '');
      if (n && n.trim()) items.push([p.__wi, p.id, F(p, 'title'), n]);
    });
    if (!items.length) return '<div class="inbox"><p class="none">Nothing from Swatti yet. Her week notes, voice notes and per-post comments land here.</p></div>';
    return '<div class="inbox">' + items.map(function (it) {
      return '<button class="ib" data-week="' + it[0] + '"' +
        (it[1] ? ' data-goto="' + it[1] + '"' : '') + '>' +
        '<span class="ib-k">' + it[2] + '</span>' +
        '<span class="ib-v">' + esc(it[3]) + '</span></button>';
    }).join('') + '</div>';
  }

  function renderRail() {
    var st = monthStats();
    var pct = st.total ? Math.round(st.filmed / st.total * 100) : 0;
    var h =
      '<div class="railsec">' +
        '<p class="eyebrow">' + esc(META.label || 'This month') + '</p>' +
        '<div class="bigstat"><span class="n">' + st.filmed + '</span>' +
          '<span class="of">of ' + st.total + ' filmed</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<p class="barnote">' + (role === 'studio'
          ? st.edited + ' edited &middot; ' + st.posted + ' posted'
          : (PLAN[cur] ? PLAN[cur].head + ' of ' + PLAN.length : '')) + '</p>' +
      '</div>' +
      '<div class="railsec"><p class="eyebrow">The month</p>' + miniCal() +
        '<p class="barnote">A dot is a post. A mark in the corner is a filming morning.</p></div>' +
      '<div class="railsec"><p class="eyebrow">Weeks</p>' + weekList() + '</div>';

    h += role === 'studio'
      ? '<div class="railsec"><p class="eyebrow">From Swatti</p>' + inboxHTML() + '</div>'
      : '<div class="railsec"><p class="railtip"><b>Every Sunday</b>, tell us what your week looks like ' +
        'in the box at the top. Prince plans the filming around your real days.</p></div>';

    document.getElementById('rail').innerHTML = h;
  }

  /* ───────────────── post card ───────────────── */

  function refsHTML(k) {
    var refs = get('refs:' + k, []) || [];
    var h = '';
    refs.forEach(function (src, i) {
      var vid = isVideoRef(src), lazy = isIdb(src);
      var media = vid
        ? '<video ' + (lazy ? 'data-tok="' + src + '"' : 'src="' + src + '"') +
          ' controls muted playsinline preload="metadata"></video>'
        : '<img ' + (lazy ? 'data-tok="' + src + '"' : 'src="' + src + '"') +
          ' alt="Reference ' + (i + 1) + '" loading="lazy">';
      h += '<div class="ref">' + media +
           (lazy ? '<span class="loading">…</span>' : '') +
           (vid ? '<span class="clip">CLIP</span>' : '') +
           '<button class="del" data-del="' + k + '" data-i="' + i + '" aria-label="Remove this reference">&times;</button></div>';
    });
    h += '<div class="ref add" data-add="' + k + '" role="button" tabindex="0" ' +
         'aria-label="Add a reference photo or clip">' +
         '<span class="plus">+</span>' + (refs.length ? 'Add another'
           : 'Photo or clip<small>Drag it here, or tap</small>') + '</div>';
    return h;
  }

  function shotHTML(p, sh, i) {
    var k = slotKey(p.id, i), dom = slotDom(k);
    var meta = '<span class="s-n">' + (i + 1) + '</span>';
    if (sh.a) meta += '<span class="ang">' + esc(sh.a) + '</span>';
    var hw = holdWords(sh.h);
    if (hw) meta += '<span class="hold">' + hw + '</span>';
    if (sh.s) meta += '<span class="secs">' + sh.s + 's</span>';
    return '<li class="shot">' +
      '<div class="s-txt"><div class="s-meta">' + meta + '</div>' +
        '<p class="s-do">' + (sh.do || '') + '</p></div>' +
      '<div class="s-med" data-zone="' + k + '">' +
        '<div class="refstrip" id="' + dom + '">' + refsHTML(k) + '</div>' +
        '<p class="smsg" id="smsg-' + dom + '"></p>' +
      '</div></li>';
  }

  // anything uploaded against the whole post before the shot table existed
  function legacyHTML(p) {
    var old = get('refs:' + p.id, []) || [];
    if (!old.length) return '';
    return '<p class="label">Other references on this post</p>' +
      '<div class="s-med" data-zone="' + p.id + '" style="max-width:100%">' +
        '<div class="refstrip" id="' + slotDom(p.id) + '">' + refsHTML(p.id) + '</div>' +
        '<p class="smsg" id="smsg-' + slotDom(p.id) + '"></p></div>';
  }

  // fill in anything held on this device; called after any strip is written
  function hydrateRefs(root) {
    var els = (root || document).querySelectorAll('[data-tok]');
    Array.prototype.forEach.call(els, function (el) {
      var tok = el.getAttribute('data-tok');
      el.removeAttribute('data-tok');
      Media.url(tok).then(function (u) {
        var box = el.closest('.ref'), spin = box && box.querySelector('.loading');
        if (spin) spin.remove();
        if (u) el.src = u;
        else if (box) box.innerHTML = '<span class="loading">Not on this device</span>';
      }).catch(function () {
        var spin = el.closest('.ref') && el.closest('.ref').querySelector('.loading');
        if (spin) spin.textContent = 'Could not load';
      });
    });
  }

  function pipeHTML(p) {
    var s = stageOf(p);
    return '<div class="pipe studio-only"><p class="label">Where it is</p>' +
      '<div class="pipesteps studio-only">' + STAGES.map(function (nm, i) {
        return '<button data-stage="' + p.id + '" data-n="' + i + '" class="' +
          (i < s ? 'on' : (i === s ? 'at' : '')) + '">' + nm + '</button>';
      }).join('') + '</div></div>';
  }

  function postHTML(p) {
    var done = isDone(p), open = !!openSet[p.id], s = stageOf(p);
    var d = p.__d, dw = d ? DOW[dayIdx(d)] : '', dn = d ? d.getDate() : p.date;
    var flags = '';
    if (p.vo) flags += '<span class="flag">Voiceover</span>';
    if (p.kids) flags += '<span class="flag">Kids &mdash; partial</span>';
    var shots = shotsOf(p);
    var say = F(p, 'say');
    var note = get('note:' + p.id, '');
    var secs = shotSeconds(p);
    var camShots = shots.filter(function (s) { return !!s.a; }).length;
    if (isPosted(p)) flags += '<span class="posted">Posted</span>';

    return '<article class="card' + (done ? ' is-done' : '') + (isPosted(p) ? ' is-posted' : '') +
      (open ? ' open' : '') + '" id="card-' + p.id + '">' +
      '<div class="head" data-open="' + p.id + '">' +
        '<span class="daycol"><span class="dw">' + dw + '</span><span class="dn">' + dn + '</span></span>' +
        '<span class="htext">' +
          '<span class="tagline"><span class="type">' + p.type + '</span><i class="sep"></i>' +
            '<span>' + p.series + '</span>' + flags + '</span>' +
          '<h4>' + esc(F(p, 'title')) + '</h4>' +
          '<p class="one">' + esc(F(p, 'what')) + '</p>' +
        '</span>' +
        '<span class="hright">' +
          '<span class="stagepill" data-s="' + s + '">' + STAGES[s] + '</span>' +
          '<span class="tick"><input type="checkbox" ' + (done ? 'checked' : '') +
            ' aria-label="Filmed" data-tick="' + p.id + '"></span>' +
        '</span>' +
      '</div>' +
      '<div class="body">' +
        '<div class="dates">' +
          '<div><span class="k">Film</span><span class="v">' + p.film + '</span></div>' +
          '<div><span class="k">Edit</span><span class="v">' + p.edit + '</span></div>' +
          '<div><span class="k">Posts</span><span class="v">' + p.date + '</span></div>' +
        '</div>' +
        pipeHTML(p) +
        '<div class="shothead"><p class="label">What to film</p>' +
          '<p class="label">Shot to copy</p></div>' +
        '<ol class="shots">' +
          shots.map(function (sh, i) { return shotHTML(p, sh, i); }).join('') + '</ol>' +
        '<p class="shotsum">' +
          (camShots ? '<b>' + camShots + (camShots === 1 ? ' shot' : ' shots') + '</b>' +
            (secs ? ' &middot; about <b>' + secs + ' seconds</b> of footage in total. ' : '. ')
            : '') +
          'Drop a photo or a clip (up to ' + CLIP_SECONDS + ' seconds) into any row so Swatti can ' +
          'see the shot instead of reading it. It stays there until somebody deletes it.</p>' +
        legacyHTML(p) +
        (say ? '<div class="saytxt"><p class="label">' + (p.vo ? 'What to say' : 'Text on screen') +
               '</p><p>' + esc(say) + '</p></div>' : '') +
        (p.note ? '<details class="why"><summary>Why this one works</summary><p>' + p.note + '</p></details>' : '') +
        '<div class="edwrap studio-only" id="ed-' + p.id + '">' +
          '<button class="edtoggle" data-edtoggle="' + p.id + '">Edit the words</button>' +
          '<div class="edfields">' +
            '<p class="edlabel">Title</p><textarea style="min-height:48px" data-edit="' + p.id + '" data-field="title">' + esc(F(p, 'title')) + '</textarea>' +
            '<p class="edlabel">One-line description</p><textarea style="min-height:48px" data-edit="' + p.id + '" data-field="what">' + esc(F(p, 'what')) + '</textarea>' +
            '<p class="edlabel">Shot list &mdash; one shot per line</p>' +
            '<p class="edtip">Format: <b>ANGLE | tripod or hand | what she does | seconds</b>. ' +
              'Angles: WIDE, MEDIUM, CLOSE, MIRROR, POV, PHOTO. A line with no bars is a step ' +
              'that isn&rsquo;t a shot. Put *stars* around anything that should come out bold. ' +
              'Adding or removing a line shifts the reference frames below it.</p>' +
            '<textarea style="min-height:180px" data-edit="' + p.id + '" data-field="shots">' +
              esc(shotsToText(shots)) + '</textarea>' +
            '<p class="edlabel">' + (p.vo ? 'Voiceover' : 'Text on screen') + '</p><textarea style="min-height:78px" data-edit="' + p.id + '" data-field="say">' + esc(say || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="pnote">' +
          '<p class="label">' + (role === 'studio' ? 'Swatti&rsquo;s note on this one' : 'Your note on this one') + '</p>' +
          (role === 'studio' && !note ? '<p class="from">Nothing from Swatti on this post yet.</p>' : '') +
          '<textarea placeholder="Couldn\'t get this shot, did it differently, don\'t like the idea…" data-note="' + p.id + '">' +
            esc(note) + '</textarea></div>' +
      '</div></article>';
  }

  /* ───────────────── week view ───────────────── */

  function renderWeekNav() {
    document.getElementById('weeknav').innerHTML = PLAN.map(function (w, i) {
      return '<button role="tab" aria-selected="' + (i === cur) + '" data-week="' + i + '">' + w.head + '</button>';
    }).join('');
  }

  function audioHTML(w) {
    var au = get('audio:' + w, '');
    if (!au) return '';
    var at = get('audioat:' + w, '');
    var when = '';
    if (at) { var d = new Date(at); if (!isNaN(d)) when = 'Recorded ' + DOW[dayIdx(d)] + ' ' + d.getDate() + ', ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
    return '<div class="player">' +
      (when ? '<p class="pmeta">' + when + '</p>' : '') +
      '<audio controls preload="metadata" src="' + au + '"></audio>' +
      '<div class="pacts">' +
        '<button class="btn quiet" data-rec="' + w + '">Record again</button>' +
        '<button class="btn quiet" data-delaudio="' + w + '">Delete</button>' +
      '</div></div>';
  }

  function renderWeek() {
    var w = PLAN[cur];
    if (!w) return;
    var done = w.posts.filter(isDone).length;
    var studio = role === 'studio';

    document.getElementById('weekbody').innerHTML =
      '<div class="wkhead">' +
        '<p class="kick">' + (studio ? 'Production week' : 'This week') + '</p>' +
        '<h2>' + w.head + ' <span>&middot; ' + w.sub + '</span></h2>' +
        '<p class="wknote">' + w.note + '</p>' +
      '</div>' +
      '<div class="shootbar"><span class="cam">SHOOT</span><span>' + w.shoot + '</span></div>' +
      '<div class="checkin">' +
        '<div class="checkin-h">' +
          '<h3>' + (studio ? 'Swatti&rsquo;s week' : 'What does your week look like?') + '</h3>' +
          '<p class="sub">' + (studio
            ? 'What Swatti typed or recorded for this week. Plan the filming around it.'
            : 'Tell us before the week starts and Prince plans the filming around your real days.') + '</p>' +
        '</div>' +
        '<div class="checkin-b">' +
          '<textarea placeholder="e.g. Tuesday I\'m out all day, Thursday we\'re going to the desert, Saturday morning works but I need to be done by 10…" data-weekplan="' + w.w + '">' +
            esc(get('week:' + w.w, '')) + '</textarea>' +
          '<div class="rec">' +
            '<button class="btn" id="recbtn" data-rec="' + w.w + '"><i class="mic"></i>' +
              (get('audio:' + w.w, '') ? 'Record again' : 'Record a voice note') + '</button>' +
            '<button class="linkbtn" data-audiopick="' + w.w + '">or choose an audio file</button>' +
            '<span class="recmsg" id="recmsg"></span>' +
          '</div>' +
          '<div id="auwrap">' + audioHTML(w.w) + '</div>' +
          '<p class="saved" id="wksaved"></p>' +
        '</div>' +
      '</div>' +
      '<div class="listhead"><h3>' + (studio ? 'The posts' : 'What you film this week') + '</h3>' +
        '<span class="meta" id="wkmeta">' + done + ' of ' + w.posts.length + ' filmed</span></div>' +
      w.posts.map(postHTML).join('') +
      (studio ? '' :
        '<p class="hint">Tap any post to open it. Tick it once you\'ve filmed it.</p>' +
        '<details class="how"><summary>How this works</summary><ol>' +
        '<li>Each Sunday, <b>tell us what your week looks like</b> in the box above &mdash; type it or record it.</li>' +
        '<li>You film on <b>two mornings a week</b>. Saturday is the main one; the course morning is free footage.</li>' +
        '<li>Every post is a list of shots. Each one says <b>how close to stand</b> ' +
        '(wide, medium, close), whether the phone is on the tripod or in your hand, ' +
        '<b>what you actually do</b>, and how many seconds to film. Nothing to set up.</li>' +
        '<li>Next to each shot there\'s a small frame. When Prince drops a photo or a clip ' +
        'in it, <b>that\'s the shot to copy</b> — you can watch it instead of reading it.</li>' +
        '<li>A post turns <b>green</b> once it\'s live on your page.</li>' +
        '<li>Send the clips to Prince. We edit, caption and schedule. <b>Nothing goes live without you seeing it first.</b></li>' +
        '<li>Went somewhere, did something? <b>Just film it.</b> We\'ll find a place for it.</li>' +
        '</ol></details>');

    renderWeekNav();
    renderRail();
    hydrateRefs(document.getElementById('weekbody'));
  }

  function refreshWeekMeta() {
    var w = PLAN[cur], m = document.getElementById('wkmeta');
    if (w && m) m.textContent = w.posts.filter(isDone).length + ' of ' + w.posts.length + ' filmed';
  }

  /* ───────────────── month view ───────────────── */

  function calendarHTML() {
    var start = addDays(MSTART, -dayIdx(MSTART));
    var end = addDays(MEND, 6 - dayIdx(MEND));
    var today = new Date();
    var h = DOW.map(function (d) { return '<div class="dw">' + d + '</div>'; }).join('');
    for (var d = start; d <= end; d = addDays(d, 1)) {
      var out = d < MSTART || d > MEND;
      var ps = POSTMAP[key(d)] || [];
      h += '<div class="cell' + (out ? ' out' : '') + (sameDay(d, today) ? ' today' : '') + '">' +
        '<span class="dnum">' + d.getDate() +
          (SHOOTMAP[key(d)] ? '<em>Shoot</em>' : '') + '</span>' +
        ps.map(function (p) {
          return '<button class="chip' + (isPosted(p) ? ' posted' : isDone(p) ? ' done' : '') +
            '" data-goto="' + p.id + '">' +
            '<span class="ct">' + p.type + '</span>' +
            '<span class="cn">' + esc(F(p, 'title')) + '</span></button>';
        }).join('') +
        '</div>';
    }
    return '<div class="cal">' + h + '</div>';
  }

  function scheduleTable() {
    var studio = role === 'studio';
    var rows = '<thead><tr><th>Posts</th><th>Type</th><th>Post</th><th>Series</th>' +
      (studio ? '<th>Stage</th>' : '') + '<th>Film</th><th>Edit</th></tr></thead><tbody>';
    PLAN.forEach(function (w) {
      rows += '<tr class="wkrow"><td colspan="' + (studio ? 7 : 6) + '">' + w.head + ' &middot; ' + w.sub + '</td></tr>';
      w.posts.forEach(function (p) {
        rows += '<tr class="' + (isDone(p) ? 'is-done' : '') + '">' +
          '<td class="d">' + p.date + '</td><td class="t">' + p.type + '</td>' +
          '<td class="n"><button data-goto="' + p.id + '">' + esc(F(p, 'title')) + '</button></td>' +
          '<td class="t">' + p.series + '</td>' +
          (studio ? '<td class="st">' + STAGES[stageOf(p)] + '</td>' : '') +
          '<td class="dim">' + p.film + '</td><td class="dim">' + p.edit + '</td></tr>';
      });
    });
    return '<div class="tablewrap"><table>' + rows + '</tbody></table></div>';
  }

  var RHYTHM =
    '<div class="block"><h3>The weekly rhythm &mdash; the same every week</h3><ol class="rhythm">' +
    '<li><b>Sunday</b> &mdash; Swatti writes or records her week ahead.</li>' +
    '<li><b>Monday</b> &mdash; Prince finalises that week\'s shots against her real days.</li>' +
    '<li><b>Tuesday morning</b> &mdash; course footage, filmed while she\'s already there.</li>' +
    '<li><b>Saturday morning</b> &mdash; the main block, roughly two hours. Covers <b>next</b> week\'s posts.</li>' +
    '<li><b>Sunday to Tuesday</b> &mdash; edit, captions, hashtags.</li>' +
    '<li><b>Wednesday</b> &mdash; Swatti approves the cuts. <b>Thursday</b> &mdash; scheduled.</li>' +
    '</ol><p class="hint">Everything is filmed <b>a week before it goes out</b>. That gap is what stops ' +
    'this turning into a panic, and means a bad week costs us nothing.</p></div>';

  var PILLARS =
    '<div class="block"><h3>The 15 reels</h3>' +
    '<div class="pil"><span class="c">5</span><span class="nm">6AM</span><span class="ds">Morning and home routine. Real sound, no music, no talking.</span></div>' +
    '<div class="pil"><span class="c">3</span><span class="nm">Getting Ready</span><span class="ds">Skincare, makeup, getting dressed. Hands and mirrors, no face needed.</span></div>' +
    '<div class="pil"><span class="c">2</span><span class="nm">Strong Body</span><span class="ds">The gym. Her own bio line, and the half of it the page has never shown.</span></div>' +
    '<div class="pil"><span class="c">2</span><span class="nm">Soft Life Notes</span><span class="ds">One honest line of text over quiet footage. The line does the work.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Fashion</span><span class="ds">One outfit, one take. Deliberately the shortest shot list in the month.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Fragrance</span><span class="ds">The category brands pay for. One properly-lit reel, built to be shown to them.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Studio Days</span><span class="ds">The interior design course. One reel, because she is on the page as a person, not a student.</span></div>' +
    '</div><div class="block"><h3>The 5 carousels</h3>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Who she is</span><span class="ds">Built entirely from photos already on her phone.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Beauty</span><span class="ds">The real bathroom shelf. Saved and sent on, and the first thing a brand reads.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Travel</span><span class="ds">Dubai without the malls. Place posts keep working for months.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Personal growth</span><span class="ds">The reflection post that replaces quote graphics.</span></div>' +
    '<div class="pil"><span class="c">1</span><span class="nm">Month one recap</span><span class="ds">Course progress. Milestones beat ordinary days.</span></div>' +
    '</div><div class="block"><h3>Where the month sits &mdash; her own list of niches</h3>' +
    '<div class="pil"><span class="c">6</span><span class="nm">Beauty &amp; fragrance</span><span class="ds">Skincare, everyday makeup, the shelf, the three perfumes.</span></div>' +
    '<div class="pil"><span class="c">6</span><span class="nm">Lifestyle &amp; home</span><span class="ds">Mornings, the reset, the school run, the quiet house.</span></div>' +
    '<div class="pil"><span class="c">3</span><span class="nm">Fitness</span><span class="ds">Two gym reels and the line that carries the whole page.</span></div>' +
    '<div class="pil"><span class="c">3</span><span class="nm">Fashion &amp; travel</span><span class="ds">One outfit reel, Dubai, and the flexible photo slot.</span></div>' +
    '<div class="pil"><span class="c">2</span><span class="nm">Interior design</span><span class="ds">One reel and one recap. Kept small on purpose &mdash; she can&rsquo;t film in class.</span></div>' +
    '</div>';

  function renderMonth() {
    var studio = role === 'studio';
    var st = monthStats();
    document.getElementById('mtitle').textContent = studio ? 'The month, end to end' : 'The month at a glance';
    document.getElementById('msub').innerHTML = studio
      ? 'Every post, where it is in the pipeline, and which mornings the filming happens on. Tap anything to open it.'
      : 'Everything that goes out this month. Tap any post to see what to film.';
    document.getElementById('calwrap').innerHTML = calendarHTML();

    var extra = '';
    if (studio) {
      extra += '<div class="counts">' +
        '<div class="count"><span class="n">' + st.reels + '</span><span class="l">Reels</span></div>' +
        '<div class="count"><span class="n">' + st.cars + '</span><span class="l">Carousels</span></div>' +
        '<div class="count"><span class="n">' + st.filmed + '/' + st.total + '</span><span class="l">Filmed</span></div>' +
        '<div class="count"><span class="n">' + st.edited + '</span><span class="l">Edited</span></div>' +
        '<div class="count"><span class="n">' + st.posted + '</span><span class="l">Posted</span></div>' +
        '</div>';
      extra += '<div class="block"><h3>Schedule</h3>' + scheduleTable() + '</div>';
      extra += PILLARS + RHYTHM;
    } else {
      extra += '<div class="block"><h3>Schedule</h3>' + scheduleTable() + '</div>' + RHYTHM;
    }
    document.getElementById('monthextra').innerHTML = extra;
    renderRail();
  }

  function rerender() { if (view === 'week') renderWeek(); else renderMonth(); }

  /* ───────────────── view + role ───────────────── */

  function setView(v) {
    view = v;
    var isWeek = v === 'week';
    document.body.setAttribute('data-view', v);
    document.getElementById('weekview').hidden = !isWeek;
    document.getElementById('monthview').hidden = isWeek;
    document.getElementById('v-week').setAttribute('aria-selected', isWeek);
    document.getElementById('v-month').setAttribute('aria-selected', !isWeek);
    rerender();
    window.scrollTo({ top: 0 });
  }

  function setRole(r, silent) {
    role = (r === 'studio') ? 'studio' : 'creator';
    document.body.setAttribute('data-role', role);
    try { localStorage.setItem(RKEY, role); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('.roleswitch button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-role') === role);
    });
    if (!silent) rerender();
  }

  function goTo(id) {
    var p = findPost(id);
    if (!p) return;
    if (view !== 'week' || cur !== p.__wi) {
      cur = p.__wi;
      openSet = {};
      openSet[id] = true;
      setView('week');
    } else {
      openSet[id] = true;
      setOpen(id, true);
    }
    var el = document.getElementById('card-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setOpen(id, val) {
    openSet[id] = val;
    var c = document.getElementById('card-' + id);
    if (c) c.classList.toggle('open', val);
  }

  /* ───────────────── events ───────────────── */

  document.addEventListener('click', function (e) {
    var t = e.target;

    var rb = t.closest('.roleswitch [data-role]');
    if (rb) { setRole(rb.getAttribute('data-role')); window.scrollTo({ top: 0 }); return; }

    var gt = t.closest('[data-goto]');
    if (gt) {
      var wk = gt.getAttribute('data-week');
      if (wk !== null && wk !== undefined && wk !== '') cur = +wk;
      goTo(gt.getAttribute('data-goto'));
      return;
    }

    var week = t.closest('[data-week]');
    if (week) {
      cur = +week.getAttribute('data-week');
      openSet = {};
      setView('week');
      return;
    }

    var del = t.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      var dk = del.getAttribute('data-del'), di = +del.getAttribute('data-i');
      var arr = (get('refs:' + dk, []) || []).slice();
      var gone = arr.splice(di, 1)[0];
      if (gone && isIdb(gone)) Media.del(gone);
      put('refs:' + dk, arr);
      redrawSlot(dk);
      slotMsg(dk, 'Deleted. Nothing else was touched.');
      return;
    }

    var add = t.closest('[data-add]');
    if (add) {
      e.stopPropagation();
      pickTarget = add.getAttribute('data-add');
      document.getElementById('filepick').click();
      return;
    }

    var stg = t.closest('[data-stage]');
    if (stg) {
      e.stopPropagation();
      var sp = findPost(stg.getAttribute('data-stage'));
      if (sp) {
        setStage(sp, +stg.getAttribute('data-n'));
        renderWeek();
        setOpen(sp.id, true);
      }
      return;
    }

    var edt = t.closest('[data-edtoggle]');
    if (edt) {
      e.stopPropagation();
      var box = document.getElementById('ed-' + edt.getAttribute('data-edtoggle'));
      if (box) {
        var on = box.classList.toggle('open');
        edt.textContent = on ? 'Done editing' : 'Edit the words';
      }
      return;
    }

    if (t.matches('[data-tick]')) { e.stopPropagation(); return; }

    var rec = t.closest('[data-rec]');
    if (rec) { e.stopPropagation(); toggleRec(+rec.getAttribute('data-rec')); return; }

    var da = t.closest('[data-delaudio]');
    if (da) {
      e.stopPropagation();
      var dw = +da.getAttribute('data-delaudio');
      put('audio:' + dw, ''); put('audioat:' + dw, '');
      document.getElementById('auwrap').innerHTML = '';
      var rb2 = document.getElementById('recbtn');
      if (rb2) rb2.innerHTML = '<i class="mic"></i>Record a voice note';
      recMsg('Deleted.');
      return;
    }

    var ap = t.closest('[data-audiopick]');
    if (ap) {
      e.stopPropagation();
      recWeek = +ap.getAttribute('data-audiopick');
      document.getElementById('audiopick').click();
      return;
    }

    var head = t.closest('[data-open]');
    if (head) { var id = head.getAttribute('data-open'); setOpen(id, !openSet[id]); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var add = e.target.closest && e.target.closest('[data-add]');
    if (!add) return;
    e.preventDefault();
    pickTarget = add.getAttribute('data-add');
    document.getElementById('filepick').click();
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.matches('[data-tick]')) return;
    var p = findPost(t.getAttribute('data-tick'));
    if (!p) return;
    setStage(p, t.checked ? Math.max(1, stageOf(p)) : 0);
    var c = document.getElementById('card-' + p.id);
    if (c) {
      c.classList.toggle('is-done', t.checked);
      var pill = c.querySelector('.stagepill');
      if (pill) { pill.textContent = STAGES[stageOf(p)]; pill.setAttribute('data-s', stageOf(p)); }
      var steps = c.querySelectorAll('[data-stage]');
      Array.prototype.forEach.call(steps, function (b, i) {
        b.className = i < stageOf(p) ? 'on' : (i === stageOf(p) ? 'at' : '');
      });
    }
    refreshWeekMeta();
    renderRail();
  });

  var typeTimer = null;
  document.addEventListener('input', function (e) {
    var t = e.target, act = null;
    if (t.matches('[data-note]')) act = ['note:' + t.getAttribute('data-note'), t.value];
    else if (t.matches('[data-weekplan]')) act = ['week:' + t.getAttribute('data-weekplan'), t.value];
    else if (t.matches('[data-edit]')) {
      var pid = t.getAttribute('data-edit'), field = t.getAttribute('data-field');
      var e2 = Object.assign({}, get('edit:' + pid, {}));
      e2[field] = field === 'shots' ? textToShots(t.value) : t.value;
      act = ['edit:' + pid, e2];
      var card = document.getElementById('card-' + pid);
      if (card && (field === 'title' || field === 'what')) {
        var el = card.querySelector(field === 'title' ? 'h4' : '.one');
        if (el) el.textContent = t.value;
      }
    }
    if (!act) return;
    S[act[0]] = act[1];
    if (!localSave()) { flash('This device is full — switch live sync on.'); syncBadge(); }
    clearTimeout(typeTimer);
    typeTimer = setTimeout(function () { Store.put(act[0], act[1]); flash(); }, 700);
  });

  document.getElementById('v-week').addEventListener('click', function () { setView('week'); });
  document.getElementById('v-month').addEventListener('click', function () { setView('month'); });

  /* ───────────────── image upload ───────────────── */

  var CLIP_SECONDS = 15;
  var CLIP_MAX_MB = 90;

  function shrinkImage(file) {
    return new Promise(function (resolve) {
      var fr = new FileReader();
      fr.onerror = function () { resolve(null); };
      fr.onload = function () {
        var img = new Image();
        img.onerror = function () { resolve(null); };
        img.onload = function () {
            /* Everything lands in a 9:16 frame, so nothing needs to be bigger than
             720×1280. Scale by whichever side hits the limit first — the shape of
             the picture is never touched, it just stops being oversized. */
          var sc = Math.min(1, 720 / img.width, 1280 / img.height);
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * sc);
          cv.height = Math.round(img.height * sc);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(function (blob) { resolve(blob || null); }, 'image/jpeg', 0.85);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  function videoSeconds(file) {
    return new Promise(function (resolve) {
      var v = document.createElement('video'), u = URL.createObjectURL(file);
      var done = function (d) { URL.revokeObjectURL(u); resolve(d); };
      v.preload = 'metadata';
      v.muted = true;
      // Some recordings (webm especially) report Infinity until the browser is
      // forced to seek to the end, so ask for it rather than giving up.
      v.onloadedmetadata = function () {
        if (isFinite(v.duration) && v.duration > 0) return done(v.duration);
        v.ontimeupdate = function () {
          v.ontimeupdate = null;
          done(isFinite(v.duration) && v.duration > 0 ? v.duration : null);
        };
        try { v.currentTime = 1e101; } catch (e) { done(null); }
      };
      v.onerror = function () { done(null); };
      setTimeout(function () { done(null); }, 9000);
      v.src = u;
    });
  }

  function ext(t) { return /mp4/.test(t) ? 'mp4' : /quicktime|mov/.test(t) ? 'mov' : /webm/.test(t) ? 'webm' : 'mp4'; }

  // one file in, one reference token out (or a reason it was refused)
  async function processOne(id, file) {
    var vid = /^video\//.test(file.type);

    if (vid) {
      if (file.size > CLIP_MAX_MB * 1024 * 1024) {
        return { err: file.name + ' is ' + Math.round(file.size / 1048576) + 'MB — too big to keep here. Send that one on WhatsApp.' };
      }
      var secs = await videoSeconds(file);
      if (secs !== null && secs > CLIP_SECONDS + 0.6) {
        return { err: file.name + ' is ' + Math.round(secs) + ' seconds. Reference clips are capped at ' + CLIP_SECONDS + ' — trim it first.' };
      }
      var vurl = await Store.upload('refs/' + id + '-' + Date.now() + '-' +
        Math.random().toString(36).slice(2, 7) + '.' + ext(file.type), file, file.type);
      if (vurl) return { tok: vurl };
      try { return { tok: await Media.save(file, true) }; }
      catch (e) { return { err: 'This device would not store ' + file.name + '. Switch live sync on.' }; }
    }

    // Canvas can't decode every format a phone produces (HEIC above all), so a
    // failed shrink falls back to keeping the original file rather than refusing it.
    var blob = await shrinkImage(file), type = 'image/jpeg', xt = 'jpg';
    if (!blob) {
      if (file.size > CLIP_MAX_MB * 1024 * 1024) return { err: file.name + ' is too big to keep here.' };
      blob = file; type = file.type || 'image/jpeg';
      xt = (file.name.split('.').pop() || 'jpg').toLowerCase().slice(0, 5);
    }
    var url = await Store.upload('refs/' + id + '-' + Date.now() + '-' +
      Math.random().toString(36).slice(2, 7) + '.' + xt, blob, type);
    if (url) return { tok: url };
    try { return { tok: await Media.save(blob, false) }; }
    catch (e) { return { err: 'This device would not store ' + file.name + '. Switch live sync on.' }; }
  }

  function slotMsg(k, html, kind) {
    var el = document.getElementById('smsg-' + slotDom(k));
    if (!el) return;
    el.innerHTML = html || '';
    el.className = 'smsg' + (kind ? ' ' + kind : '');
  }

  function redrawSlot(k) {
    var s = document.getElementById(slotDom(k));
    if (s) { s.innerHTML = refsHTML(k); hydrateRefs(s); }
  }

  /* A phone, Finder and the Photos app all hand a drop over differently. Read
     dataTransfer.files first, then fall back to walking the items list, which is
     the only place the file shows up in some builds. */
  function filesFrom(dt) {
    if (!dt) return [];
    if (dt.files && dt.files.length) return Array.prototype.slice.call(dt.files);
    var out = [];
    if (dt.items) {
      for (var i = 0; i < dt.items.length; i++) {
        if (dt.items[i].kind === 'file') {
          var f = dt.items[i].getAsFile();
          if (f) out.push(f);
        }
      }
    }
    return out;
  }

  // the single entry point for browse, drop and paste
  async function addImages(k, files) {
    if (!k) return;
    var all = Array.prototype.slice.call(files || []);
    var list = all.filter(function (f) {
      return f && (/^(image|video)\//.test(f.type) ||
        /\.(jpe?g|png|heic|heif|webp|gif|mp4|mov|m4v|webm|avi)$/i.test(f.name || ''));
    });
    var skipped = all.length - list.length;

    if (!list.length) {
      slotMsg(k, all.length
        ? '<b>Photos and clips only.</b> That file was neither.'
        : '<b>Nothing came through.</b> Some apps hand over a link instead of the ' +
          'file &mdash; tap the box and pick it from your phone or Finder instead.', 'warn');
      return;
    }

    var strip = document.getElementById(slotDom(k));
    if (strip) {
      strip.insertAdjacentHTML('beforeend',
        '<div class="ref busy">Saving ' + list.length + '…</div>');
    }
    slotMsg(k, 'Saving…');

    var added = 0, errs = [];
    for (var i = 0; i < list.length; i++) {
      var r = await processOne(slotPost(k), list[i]);
      if (r && r.tok) {
        put('refs:' + k, (get('refs:' + k, []) || []).concat([r.tok]));
        added++;
      } else if (r && r.err) errs.push(r.err);
    }

    redrawSlot(k);

    var kept = (get('refs:' + k, []) || []).length;
    var msg = '', kind = added ? 'ok' : 'warn';
    if (added) {
      msg += '<b>Saved.</b> ' + kept + (kept === 1 ? ' reference' : ' references') +
        ' on this shot &mdash; ' + (Store.mode === 'live'
          ? 'Swatti can see it now.' : 'it stays here until you delete it.') + ' ';
    }
    if (skipped) msg += skipped + ' file' + (skipped > 1 ? 's were' : ' was') +
      ' neither a photo nor a clip. ';
    if (errs.length) msg += errs.join(' ');
    if (!added && !errs.length && !skipped) msg = '<b>That file couldn\'t be read.</b> Try a JPG, PNG or MP4.';
    slotMsg(k, msg, kind);
    if (added) flash(added === 1 ? 'Reference saved.' : added + ' references saved.');
    syncBadge();
  }

  document.getElementById('filepick').addEventListener('change', function () {
    var files = this.files, id = pickTarget;
    this.value = '';
    addImages(id, files);
  });

  /* drag and drop onto any reference strip */
  var dragDepth = {};
  document.addEventListener('dragenter', function (e) {
    var z = e.target.closest && e.target.closest('[data-zone]');
    if (!z) return;
    e.preventDefault();
    var k = z.getAttribute('data-zone');
    dragDepth[k] = (dragDepth[k] || 0) + 1;
    z.classList.add('dragover');
  });
  document.addEventListener('dragover', function (e) {
    if (e.target.closest && e.target.closest('[data-zone]')) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }
  });
  document.addEventListener('dragleave', function (e) {
    var z = e.target.closest && e.target.closest('[data-zone]');
    if (!z) return;
    var k = z.getAttribute('data-zone');
    dragDepth[k] = Math.max(0, (dragDepth[k] || 0) - 1);
    if (!dragDepth[k]) z.classList.remove('dragover');
  });
  document.addEventListener('drop', function (e) {
    var z = e.target.closest && e.target.closest('[data-zone]');
    if (!z) return;
    e.preventDefault();
    var k = z.getAttribute('data-zone');
    dragDepth[k] = 0;
    z.classList.remove('dragover');
    var got = filesFrom(e.dataTransfer);
    if (!got.length) {
      slotMsg(k, '<b>That arrived as a link, not a file.</b> Dragging out of a browser tab ' +
        'or a chat window often does that. Save the file first, then drag it from Finder ' +
        '&mdash; or just tap the box.', 'warn');
      return;
    }
    addImages(k, got);
  });
  // stop a stray drop elsewhere from navigating away from the page
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) {
    if (!(e.target.closest && e.target.closest('[data-zone]'))) e.preventDefault();
  });

  /* paste an image straight into whichever shot the pointer is over */
  var lastZone = null;
  document.addEventListener('pointerover', function (e) {
    var z = e.target.closest && e.target.closest('[data-zone]');
    if (z) lastZone = z.getAttribute('data-zone');
  });
  document.addEventListener('paste', function (e) {
    if (isTyping()) return;
    var got = filesFrom(e.clipboardData);
    if (!got.length) return;
    var target = lastZone;
    if (!target) {
      var openCard = document.querySelector('.card.open');
      if (!openCard) return;
      target = slotKey(openCard.id.replace('card-', ''), 0);
    }
    e.preventDefault();
    addImages(target, got);
  });

  /* ───────────────── audio ───────────────── */

  function recMsg(txt) { var m = document.getElementById('recmsg'); if (m) m.textContent = txt || ''; }
  function recButton() { return document.getElementById('recbtn'); }

  function resetRecButton(w) {
    var b = recButton();
    if (!b) return;
    b.classList.remove('rec-on');
    b.innerHTML = '<i class="mic"></i>' + (get('audio:' + w, '') ? 'Record again' : 'Record a voice note');
    var d = document.getElementById('discardbtn');
    if (d) d.remove();
  }

  function showAudio(w) {
    var wrap = document.getElementById('auwrap');
    if (wrap) wrap.innerHTML = audioHTML(w);
    resetRecButton(w);
    renderRail();
  }

  async function saveAudio(blob, w, type) {
    var ext = (type && type.indexOf('mp4') > -1) ? 'm4a' : 'webm';
    var url = await Store.upload('voice/week-' + w + '-' + Date.now() + '.' + ext, blob, type || 'audio/webm');
    if (url) {
      put('audio:' + w, url);
      put('audioat:' + w, new Date().toISOString());
      showAudio(w);
      recMsg('Saved. Prince can play it from his side.');
      return;
    }
    if (blob.size > 3.5 * 1024 * 1024) {
      recMsg('That recording is too long to keep on this device — send it on WhatsApp instead.');
      resetRecButton(w);
      return;
    }
    var fr = new FileReader();
    fr.onload = function () {
      var ok = put('audio:' + w, fr.result);
      put('audioat:' + w, new Date().toISOString());
      if (!ok) { recMsg('This device is full — the note could not be kept. Send it on WhatsApp.'); syncBadge(); resetRecButton(w); return; }
      showAudio(w);
      recMsg(Store.mode === 'live' ? 'Saved.' : 'Saved on this device.');
    };
    fr.readAsDataURL(blob);
  }

  document.getElementById('audiopick').addEventListener('change', function () {
    var f = this.files && this.files[0]; this.value = '';
    if (!f || recWeek == null) return;
    recMsg('Saving…');
    saveAudio(f, recWeek, f.type || 'audio/mpeg');
  });

  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    var types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < types.length; i++) if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    return '';
  }

  async function toggleRec(w) {
    if (recorder && recorder.state === 'recording') { recorder.stop(); return; }

    if (window.self !== window.top) {
      recMsg('Recording needs the real page, not this preview. Open the link directly, or use “choose an audio file”.');
      return;
    }
    if (!window.isSecureContext) {
      recMsg('Recording needs a secure (https) link. Use “choose an audio file” instead.');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      recMsg('This browser can’t record. Use “choose an audio file”, or send it on WhatsApp.');
      return;
    }

    var stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      var n = err && err.name;
      if (n === 'NotAllowedError' || n === 'SecurityError') {
        recMsg('Microphone is blocked. Allow it for this site in your browser settings, then tap again.');
      } else if (n === 'NotFoundError') {
        recMsg('No microphone found on this device.');
      } else {
        recMsg('Couldn’t start recording (' + (n || 'unknown') + '). Use “choose an audio file” instead.');
      }
      return;
    }

    try {
      var mime = pickMime();
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch (e) {
      try { recorder = new MediaRecorder(stream); }
      catch (e2) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        recMsg('This browser can’t record. Use “choose an audio file” instead.');
        return;
      }
    }

    chunks = [];
    discarding = false;
    recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onerror = function () {
      clearInterval(recTimer);
      stream.getTracks().forEach(function (t) { t.stop(); });
      resetRecButton(w);
      recMsg('Recording stopped unexpectedly. Try “choose an audio file”.');
    };
    recorder.onstop = function () {
      clearInterval(recTimer);
      stream.getTracks().forEach(function (t) { t.stop(); });
      var btn = recButton();
      if (btn) btn.classList.remove('rec-on');
      if (discarding) { resetRecButton(w); recMsg('Thrown away. Nothing was saved.'); return; }
      if (!chunks.length) { resetRecButton(w); recMsg('Nothing was recorded — try once more.'); return; }
      var type = recorder.mimeType || (chunks[0] && chunks[0].type) || 'audio/webm';
      recMsg('Saving…');
      saveAudio(new Blob(chunks, { type: type }), w, type);
    };

    recorder.start();
    var left = 120;
    var btn = recButton();
    if (btn) {
      btn.classList.add('rec-on');
      btn.innerHTML = '<i class="live"></i>Stop &middot; ' + left + 's';
      if (!document.getElementById('discardbtn')) {
        btn.insertAdjacentHTML('afterend',
          '<button class="linkbtn" id="discardbtn">throw this one away</button>');
      }
    }
    recMsg('Recording… speak normally. You can record it again as many times as you like.');
    recTimer = setInterval(function () {
      left--;
      var b = recButton();
      if (b) b.innerHTML = '<i class="live"></i>Stop &middot; ' + left + 's';
      if (left <= 0 && recorder.state === 'recording') recorder.stop();
    }, 1000);
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('#discardbtn')) return;
    e.stopPropagation();
    if (recorder && recorder.state === 'recording') { discarding = true; recorder.stop(); }
  }, true);

  /* ───────────────── boot ───────────────── */

  S = localLoad();
  try { role = localStorage.getItem(RKEY) === 'studio' ? 'studio' : 'creator'; } catch (e) {}
  if (/[?#]studio/i.test(location.href)) role = 'studio';
  setRole(role, true);

  (function pickCurrentWeek() {
    var t = new Date(), i = 0;
    for (var k = 0; k < PLAN.length; k++) {
      var first = PLAN[k].posts[0];
      if (first && first.__d && t >= addDays(first.__d, -1)) i = k;
    }
    cur = Math.min(Math.max(i, 0), PLAN.length - 1);
    var w = PLAN[cur];
    if (w) {
      var next = w.posts.filter(function (p) { return !isDone(p); })[0] || w.posts[0];
      if (next) openSet[next.id] = true;
    }
  })();

  renderWeek();
  syncBadge();
  Store.init().then(function () { if (!isTyping()) rerender(); });
})();
