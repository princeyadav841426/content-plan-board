/* Swatti content plan — app logic.
   Works with no setup at all (saves on this device).
   Fill in config.js and it shares live between Prince and Swatti. */

(function () {
  'use strict';

  var PLAN = window.PLAN || [];
  var META = window.PLAN_META || { storeKey: 'plan' };
  var LKEY = 'swatti-' + META.storeKey;

  var S = {};                 // flat key -> value
  var cur = 0, editing = false, openSet = {};
  var recorder = null, chunks = [], recTimer = null, recWeek = null;
  var pickTarget = null;

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

  function localSave() { try { localStorage.setItem(LKEY, JSON.stringify(S)); } catch (e) {} }
  function localLoad() { try { return JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { return {}; } }

  function put(key, val) { S[key] = val; localSave(); Store.put(key, val); }
  function get(key, dflt) { return S[key] !== undefined ? S[key] : dflt; }

  function isTyping() {
    var a = document.activeElement;
    return !!(a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT'));
  }
  function syncBadge() {
    var el = document.getElementById('sync');
    if (!el) return;
    el.innerHTML = Store.mode === 'live'
      ? '<span class="dotlive"></span>Live &mdash; everything you change shows up on <b>both</b> your screens.'
      : 'Saving on <b>this device</b>. Ticks and notes stay here until live sync is switched on.';
  }

  /* ───────────────── helpers ───────────────── */

  function esc(s) { return String(s == null ? '' : s).replace(/</g, '&lt;'); }
  function F(p, f) { var e = get('edit:' + p.id, {}); return e[f] !== undefined ? e[f] : p[f]; }
  function allPosts() { var a = []; PLAN.forEach(function (w) { a = a.concat(w.posts); }); return a; }
  function findPost(id) { return allPosts().filter(function (p) { return p.id === id; })[0]; }

  function flash(msg) {
    var s = document.getElementById('wksaved');
    if (!s) return;
    s.textContent = msg || 'Saved.';
    clearTimeout(s.__t);
    s.__t = setTimeout(function () { s.textContent = ''; }, 1800);
  }

  /* ───────────────── render ───────────────── */

  function refsHTML(p) {
    var imgs = get('refs:' + p.id, []);
    var h = '';
    imgs.forEach(function (src, i) {
      h += '<div class="ref"><img src="' + src + '" alt="Reference ' + (i + 1) + '" loading="lazy">' +
           '<button class="del ed" data-del="' + p.id + '" data-i="' + i + '" aria-label="Remove">&times;</button></div>';
    });
    h += '<div class="ref add ed" data-add="' + p.id + '"><span class="plus">+</span>Add a shot</div>';
    if (!imgs.length) h += '<div class="ref empty noed">Reference shots<br>go here</div>';
    return h;
  }

  function postHTML(p) {
    var done = !!get('tick:' + p.id, false), open = !!openSet[p.id];
    var tags = '';
    if (p.vo) tags += '<span class="tag">Voiceover</span>';
    if (p.kids) tags += '<span class="tag">Kids &mdash; partial</span>';
    var steps = F(p, 'steps') || [];
    var say = F(p, 'say');
    return '<article class="card' + (done ? ' is-done' : '') + (open ? ' open' : '') + '" id="card-' + p.id + '">' +
      '<div class="head" data-open="' + p.id + '">' +
        '<span class="tick"><input type="checkbox" ' + (done ? 'checked' : '') +
          ' aria-label="Filmed" data-tick="' + p.id + '"></span>' +
        '<span class="htext">' +
          '<span class="eyebrow"><span class="date">' + p.date + '</span><span class="dot">&bull;</span>' +
            '<span>' + p.type + '</span><span class="dot">&bull;</span><span>' + p.series + '</span>' + tags + '</span>' +
          '<h3>' + esc(F(p, 'title')) + '</h3>' +
          '<p class="one">' + esc(F(p, 'what')) + '</p>' +
        '</span>' +
        '<span class="chev">' + (open ? 'CLOSE' : 'OPEN') + '</span>' +
      '</div>' +
      '<div class="body">' +
        '<div class="dates">' +
          '<div><span class="k">Film</span><span class="v">' + p.film + '</span></div>' +
          '<div><span class="k">Edit</span><span class="v">' + p.edit + '</span></div>' +
          '<div><span class="k">Posts</span><span class="v">' + p.date + '</span></div>' +
        '</div>' +
        '<div class="refs"><p class="label">Reference shots</p>' +
          '<div class="refzone" data-zone="' + p.id + '">' +
            '<div class="refstrip" id="refs-' + p.id + '">' + refsHTML(p) + '</div></div>' +
          '<p class="drophint ed"><b>Drag photos straight onto the strip</b> — several at once is fine — or tap <b>+</b> to browse. On a Mac you can also copy an image and press &#8984;V.</p>' +
        '</div>' +
        '<p class="label">What to film</p>' +
        '<ol class="film noed">' + steps.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ol>' +
        '<div class="ed"><p class="edlabel">Shot list &mdash; one step per line</p>' +
          '<textarea style="min-height:140px" data-edit="' + p.id + '" data-field="steps">' +
            esc(steps.join('\n')) + '</textarea></div>' +
        (say ? '<div class="saytxt noed"><p class="label">' + (p.vo ? 'What to say' : 'Text on screen') +
               '</p><p>' + esc(say) + '</p></div>' : '') +
        '<div class="ed">' +
          '<p class="edlabel">Title</p><textarea style="min-height:46px" data-edit="' + p.id + '" data-field="title">' + esc(F(p, 'title')) + '</textarea>' +
          '<p class="edlabel">One-line description</p><textarea style="min-height:46px" data-edit="' + p.id + '" data-field="what">' + esc(F(p, 'what')) + '</textarea>' +
          '<p class="edlabel">' + (p.vo ? 'Voiceover' : 'Text on screen') + '</p><textarea style="min-height:74px" data-edit="' + p.id + '" data-field="say">' + esc(say || '') + '</textarea>' +
        '</div>' +
        (p.note ? '<details class="why noed"><summary>Why this one works</summary><p>' + p.note + '</p></details>' : '') +
        '<div class="pnote"><p class="label">Your note on this one</p>' +
          '<textarea placeholder="Couldn\'t get this shot, did it differently, don\'t like the idea…" data-note="' + p.id + '">' +
            esc(get('note:' + p.id, '')) + '</textarea></div>' +
      '</div></article>';
  }

  function renderWeekNav() {
    document.getElementById('weeknav').innerHTML = PLAN.map(function (w, i) {
      return '<button role="tab" aria-selected="' + (i === cur) + '" data-week="' + i + '">' + w.head + '</button>';
    }).join('');
  }

  function renderWeek() {
    var w = PLAN[cur];
    if (!w) return;
    var done = w.posts.filter(function (p) { return get('tick:' + p.id, false); }).length;
    var au = get('audio:' + w.w, '');
    document.getElementById('weekbody').innerHTML =
      '<div class="weekhead"><h2>' + w.head + ' &middot; ' + w.sub + '</h2>' +
        '<span class="meta">' + done + ' of ' + w.posts.length + ' filmed</span></div>' +
      '<p class="wknote">' + w.note + '</p>' +
      '<div class="shootbar"><span class="cam">SHOOT</span><span>' + w.shoot + '</span></div>' +
      '<div class="wkplan">' +
        '<h3>What does your week look like?</h3>' +
        '<p class="sub">Tell us before the week starts and Prince plans the filming around your real days.</p>' +
        '<textarea placeholder="e.g. Tuesday I\'m out all day, Thursday we\'re going to the desert, Saturday morning works but I need to be done by 10…" data-weekplan="' + w.w + '">' +
          esc(get('week:' + w.w, '')) + '</textarea>' +
        '<div class="rec">' +
          '<button class="btn" id="recbtn" data-rec="' + w.w + '">Record a voice note</button>' +
          '<button class="linkbtn" id="pickaudio" data-audiopick="' + w.w + '">or choose an audio file</button>' +
          '<span class="recmsg" id="recmsg"></span>' +
        '</div>' +
        '<div id="auwrap">' + (au ? '<audio controls preload="none" src="' + au + '"></audio>' : '') + '</div>' +
        '<p class="saved" id="wksaved"></p>' +
      '</div>' +
      w.posts.map(postHTML).join('');
    renderWeekNav();
    if (editing) w.posts.forEach(function (p) { if (!openSet[p.id]) setOpen(p.id, true); });
  }

  function renderMonth() {
    var reels = 0, cars = 0, doneN = 0, totalN = 0;
    PLAN.forEach(function (w) {
      w.posts.forEach(function (p) {
        if (p.type === 'REEL') reels++;
        if (p.type === 'CAROUSEL') cars++;
        if (p.type === 'REEL' || p.type === 'CAROUSEL') {
          totalN++; if (get('tick:' + p.id, false)) doneN++;
        }
      });
    });
    document.getElementById('counts').innerHTML =
      '<div class="count"><span class="n">' + reels + '</span><span class="l">Reels</span></div>' +
      '<div class="count"><span class="n">' + cars + '</span><span class="l">Carousels</span></div>' +
      '<div class="count"><span class="n">' + doneN + '/' + totalN + '</span><span class="l">Filmed</span></div>' +
      '<div class="count"><span class="n">2</span><span class="l">Shoot days / week</span></div>' +
      '<div class="count"><span class="n">2</span><span class="l">Posts with kids</span></div>';

    var rows = '<thead><tr><th>Posts</th><th>Type</th><th>Post</th><th>Series</th><th>Film</th><th>Edit</th></tr></thead><tbody>';
    PLAN.forEach(function (w) {
      rows += '<tr class="wkrow"><td colspan="6">' + w.head + ' &middot; ' + w.sub + '</td></tr>';
      w.posts.forEach(function (p) {
        rows += '<tr class="' + (get('tick:' + p.id, false) ? 'is-done' : '') + '">' +
          '<td class="d">' + p.date + '</td><td class="t">' + p.type + '</td>' +
          '<td class="n">' + esc(F(p, 'title')) + '</td><td class="t">' + p.series + '</td>' +
          '<td class="dim">' + p.film + '</td><td class="dim">' + p.edit + '</td></tr>';
      });
    });
    document.getElementById('monthtable').innerHTML = rows + '</tbody>';
  }

  function rerender() {
    if (document.getElementById('monthview').hidden) renderWeek();
    else renderMonth();
  }

  /* ───────────────── interactions ───────────────── */

  function setOpen(id, val) {
    openSet[id] = val;
    var c = document.getElementById('card-' + id);
    if (!c) return;
    c.classList.toggle('open', val);
    var ch = c.querySelector('.chev');
    if (ch) ch.textContent = val ? 'CLOSE' : 'OPEN';
  }

  document.addEventListener('click', function (e) {
    var t = e.target;

    var week = t.closest('[data-week]');
    if (week) { cur = +week.getAttribute('data-week'); openSet = {}; renderWeek();
      window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    var del = t.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      var did = del.getAttribute('data-del'), di = +del.getAttribute('data-i');
      var arr = (get('refs:' + did, []) || []).slice();
      arr.splice(di, 1); put('refs:' + did, arr);
      var strip = document.getElementById('refs-' + did);
      if (strip) strip.innerHTML = refsHTML(findPost(did));
      return;
    }

    var add = t.closest('[data-add]');
    if (add) { e.stopPropagation(); pickTarget = add.getAttribute('data-add');
      document.getElementById('filepick').click(); return; }

    if (t.matches('[data-tick]')) { e.stopPropagation(); return; }

    var rec = t.closest('[data-rec]');
    if (rec) { toggleRec(+rec.getAttribute('data-rec')); return; }

    var ap = t.closest('[data-audiopick]');
    if (ap) { recWeek = +ap.getAttribute('data-audiopick');
      document.getElementById('audiopick').click(); return; }

    var head = t.closest('[data-open]');
    if (head) { var id = head.getAttribute('data-open'); setOpen(id, !openSet[id]); return; }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-tick]')) {
      var id = t.getAttribute('data-tick');
      put('tick:' + id, t.checked);
      var c = document.getElementById('card-' + id);
      if (c) c.classList.toggle('is-done', t.checked);
      var w = PLAN[cur];
      var done = w.posts.filter(function (p) { return get('tick:' + p.id, false); }).length;
      var m = document.querySelector('.weekhead .meta');
      if (m) m.textContent = done + ' of ' + w.posts.length + ' filmed';
    }
  });

  var typeTimer = null;
  document.addEventListener('input', function (e) {
    var t = e.target;
    var act = null;
    if (t.matches('[data-note]'))      act = ['note:' + t.getAttribute('data-note'), t.value];
    else if (t.matches('[data-weekplan]')) act = ['week:' + t.getAttribute('data-weekplan'), t.value];
    else if (t.matches('[data-edit]')) {
      var pid = t.getAttribute('data-edit'), field = t.getAttribute('data-field');
      var e2 = Object.assign({}, get('edit:' + pid, {}));
      e2[field] = field === 'steps'
        ? t.value.split('\n').filter(function (x) { return x.trim(); })
        : t.value;
      act = ['edit:' + pid, e2];
      var card = document.getElementById('card-' + pid);
      if (card && (field === 'title' || field === 'what')) {
        var el = card.querySelector(field === 'title' ? 'h3' : '.one');
        if (el) el.textContent = t.value;
      }
    }
    if (!act) return;
    S[act[0]] = act[1]; localSave();
    clearTimeout(typeTimer);
    typeTimer = setTimeout(function () { Store.put(act[0], act[1]); flash(); }, 700);
  });

  document.getElementById('v-week').addEventListener('click', function () { setView('week'); });
  document.getElementById('v-month').addEventListener('click', function () { setView('month'); });
  document.getElementById('editbtn').addEventListener('click', function () {
    editing = !editing;
    document.body.classList.toggle('editing', editing);
    this.classList.toggle('on', editing);
    this.textContent = editing ? 'Done editing' : 'Prince: edit';
    var w = PLAN[cur];
    if (editing) {
      w.posts.forEach(function (p) { setOpen(p.id, true); });
    } else {
      // back to the clean view: everything closed except the next thing to film
      var next = w.posts.filter(function (p) { return !get('tick:' + p.id, false); })[0];
      w.posts.forEach(function (p) { setOpen(p.id, !!(next && p.id === next.id)); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function setView(v) {
    var isWeek = v === 'week';
    document.getElementById('weekview').hidden = !isWeek;
    document.getElementById('monthview').hidden = isWeek;
    document.getElementById('v-week').setAttribute('aria-selected', isWeek);
    document.getElementById('v-month').setAttribute('aria-selected', !isWeek);
    if (!isWeek) renderMonth();
    window.scrollTo({ top: 0 });
  }

  /* ───────────────── image upload ───────────────── */

  // shrink one image file and return a URL (Supabase storage, or inline as fallback)
  function processOne(id, file) {
    return new Promise(function (resolve) {
      if (!file || !/^image\//.test(file.type)) return resolve(null);
      var fr = new FileReader();
      fr.onerror = function () { resolve(null); };
      fr.onload = function () {
        var img = new Image();
        img.onerror = function () { resolve(null); };
        img.onload = function () {
          var max = 900, sc = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * sc);
          cv.height = Math.round(img.height * sc);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(async function (blob) {
            var url = blob
              ? await Store.upload('refs/' + id + '-' + Date.now() + '-' +
                  Math.random().toString(36).slice(2, 7) + '.jpg', blob, 'image/jpeg')
              : null;
            resolve(url || cv.toDataURL('image/jpeg', 0.7));
          }, 'image/jpeg', 0.78);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  // the single entry point for browse, drop and paste
  async function addImages(id, files) {
    var list = Array.prototype.slice.call(files || [])
      .filter(function (f) { return f && /^image\//.test(f.type); });
    if (!id || !list.length) return;

    var strip = document.getElementById('refs-' + id);
    if (strip) {
      strip.insertAdjacentHTML('beforeend',
        '<div class="ref busy" id="busy-' + id + '">Adding ' + list.length + '…</div>');
    }
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      var url = await processOne(id, list[i]);
      if (url) { put('refs:' + id, (get('refs:' + id, []) || []).concat([url])); added++; }
    }
    var s2 = document.getElementById('refs-' + id);
    if (s2) s2.innerHTML = refsHTML(findPost(id));
    flash(added ? (added === 1 ? 'Reference added.' : added + ' references added.')
                : 'Those files could not be read.');
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
      e.dataTransfer.dropEffect = 'copy';
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
    addImages(k, e.dataTransfer && e.dataTransfer.files);
  });
  // stop a stray drop elsewhere from navigating away from the page
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) {
    if (!(e.target.closest && e.target.closest('[data-zone]'))) e.preventDefault();
  });

  /* paste an image into the open card */
  document.addEventListener('paste', function (e) {
    if (isTyping()) return;
    var items = (e.clipboardData && e.clipboardData.files) || [];
    if (!items.length) return;
    var openCard = document.querySelector('.card.open');
    if (!openCard) return;
    e.preventDefault();
    addImages(openCard.id.replace('card-', ''), items);
  });

  /* ───────────────── audio ───────────────── */

  function recMsg(txt) { var m = document.getElementById('recmsg'); if (m) m.textContent = txt; }

  async function saveAudio(blob, w, type) {
    var ext = (type && type.indexOf('mp4') > -1) ? 'm4a' : 'webm';
    var url = await Store.upload('voice/week-' + w + '-' + Date.now() + '.' + ext, blob, type || 'audio/webm');
    if (url) {
      put('audio:' + w, url);
      document.getElementById('auwrap').innerHTML = '<audio controls src="' + url + '"></audio>';
      recMsg('Saved. Prince can play it from his side.');
      return;
    }
    if (blob.size > 3.5 * 1024 * 1024) {
      recMsg('That recording is too big to keep here — send it on WhatsApp instead.');
      return;
    }
    var fr = new FileReader();
    fr.onload = function () {
      put('audio:' + w, fr.result);
      document.getElementById('auwrap').innerHTML = '<audio controls src="' + fr.result + '"></audio>';
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
    var btn = document.getElementById('recbtn');
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
    recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onerror = function () {
      clearInterval(recTimer);
      stream.getTracks().forEach(function (t) { t.stop(); });
      btn.classList.remove('rec-on'); btn.textContent = 'Record a voice note';
      recMsg('Recording stopped unexpectedly. Try “choose an audio file”.');
    };
    recorder.onstop = function () {
      clearInterval(recTimer);
      stream.getTracks().forEach(function (t) { t.stop(); });
      btn.classList.remove('rec-on'); btn.textContent = 'Record a voice note';
      if (!chunks.length) { recMsg('Nothing was recorded — try once more.'); return; }
      var type = recorder.mimeType || (chunks[0] && chunks[0].type) || 'audio/webm';
      recMsg('Saving…');
      saveAudio(new Blob(chunks, { type: type }), w, type);
    };

    recorder.start();
    var left = 90;
    btn.classList.add('rec-on');
    btn.textContent = 'Stop · ' + left + 's';
    recMsg('Recording… speak normally.');
    recTimer = setInterval(function () {
      left--;
      btn.textContent = 'Stop · ' + left + 's';
      if (left <= 0 && recorder.state === 'recording') recorder.stop();
    }, 1000);
  }

  /* ───────────────── boot ───────────────── */

  S = localLoad();

  (function pickCurrentWeek() {
    var t = new Date();
    var b = [new Date(2026, 8, 22), new Date(2026, 8, 29), new Date(2026, 9, 6), new Date(2026, 9, 13)];
    var i = 0;
    for (var k = 0; k < b.length; k++) if (t >= b[k]) i = k + 1;
    cur = Math.min(i, PLAN.length - 1);
    var w = PLAN[cur];
    if (w) {
      var first = w.posts.filter(function (p) { return !get('tick:' + p.id, false); })[0] || w.posts[0];
      if (first) openSet[first.id] = true;
    }
  })();

  renderWeek();
  syncBadge();
  Store.init().then(function () { if (!isTyping()) rerender(); });
})();
