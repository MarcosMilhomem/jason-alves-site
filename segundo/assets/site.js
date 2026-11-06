/* Jason Alves — JavaScript compartilhado pelas páginas.
   Monta os cards a partir de assets/trabalhos.js, abre o player, monta a mensagem do WhatsApp
   e só deixa tocar os vídeos que estão na tela. */
(function(){
  var WHATSAPP = '5511999999999';   // número único do site (com DDI e DDD, só dígitos)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIST = window.TRABALHOS || [];
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3.5v17l14-8.5z"/></svg>';
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------- cards ---------- */
  function card(w, opts){
    var media = '<video class="loop" muted loop playsinline preload="none" poster="' + esc(w.poster) + '" data-src="' + esc(w.loop || '') + '" aria-hidden="true"></video>';
    var badge = w.video ? '<span class="badge">' + PLAY + 'Assistir</span>' : (w.exemplo ? '<span class="badge soon">Exemplo</span>' : '');
    var label = esc(w.titulo) + ' · ' + esc(w.cliente);
    var box = w.video
      ? '<button class="work-media" type="button" data-play="' + esc(w.video) + '" data-title="' + label + '" aria-label="Assistir ' + esc(w.titulo) + '">' + media + badge + '</button>'
      : '<div class="work-media">' + media + badge + '</div>';
    var info = '<div class="work-info"><h3>' + esc(w.titulo) + '</h3><p>' + esc(w.cliente) + ' · ' + esc(w.formato) + '</p></div>';
    return '<' + (opts && opts.tag || 'li') + ' class="work" data-cat="' + esc(w.categoria) + '"' + (opts && opts.hidden ? ' aria-hidden="true"' : '') + '>' + box + info + '</' + (opts && opts.tag || 'li') + '>';
  }

  // Home: duas linhas que rodam em sentidos opostos. Cada linha leva a lista duas vezes para o loop não ter emenda.
  var rows = document.querySelectorAll('[data-reel-row]');
  rows.forEach(function(row, r){
    var items = r % 2 ? LIST.slice().reverse() : LIST.slice(Math.ceil(LIST.length / 2)).concat(LIST.slice(0, Math.ceil(LIST.length / 2)));
    items = items.concat(items); // cada metade leva a lista duas vezes, para cobrir telas largas
    var set = function(hidden){ return '<ul class="reel-set"' + (hidden ? ' aria-hidden="true"' : '') + '>' + items.map(function(w){ return card(w, {hidden:hidden}); }).join('') + '</ul>'; };
    row.querySelector('.reel-track').innerHTML = set(false) + set(true);
    if (r % 2) row.classList.add('rev');
  });
  // Rolar a página acelera as linhas; quando a rolagem para, elas voltam ao ritmo normal
  var tracks = [].slice.call(document.querySelectorAll('.reel-track,.seg-track'));
  if (tracks.length && !reduce && document.getAnimations){
    var rate = 1, target = 1, lastY = window.scrollY, lastT = performance.now(), ticking = false;
    var anims = function(){ var a = []; tracks.forEach(function(t){ a = a.concat(t.getAnimations()); }); return a; };
    var loop = function(){
      target += (1 - target) * 0.06;
      rate += (target - rate) * 0.18;
      anims().forEach(function(a){ a.playbackRate = rate; });
      if (Math.abs(rate - 1) > 0.01 || Math.abs(target - 1) > 0.01) requestAnimationFrame(loop);
      else { anims().forEach(function(a){ a.playbackRate = 1; }); rate = target = 1; ticking = false; }
    };
    window.addEventListener('scroll', function(){
      var now = performance.now(), dy = Math.abs(window.scrollY - lastY), dt = Math.max(16, now - lastT);
      lastY = window.scrollY; lastT = now;
      target = Math.max(target, Math.min(7, 1 + dy / dt * 2.2));
      if (!ticking){ ticking = true; requestAnimationFrame(loop); }
    }, {passive:true});
  }

  // nos cards repetidos, os botões não entram na navegação por teclado
  document.querySelectorAll('.reel-set[aria-hidden="true"] button').forEach(function(b){ b.tabIndex = -1; });

  // Página /trabalhos: grade completa com filtro por categoria
  var grid = document.getElementById('portfolio');
  if (grid){
    grid.innerHTML = LIST.map(function(w){ return card(w); }).join('');
    var filters = document.getElementById('filters');
    var cats = ['Todos'].concat(LIST.map(function(w){ return w.categoria; }).filter(function(c, i, a){ return a.indexOf(c) === i; }));
    filters.innerHTML = cats.map(function(c, i){ return '<button type="button" class="filter' + (i ? '' : ' on') + '" data-filter="' + esc(c) + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + esc(c) + '</button>'; }).join('');
    var count = document.getElementById('count');
    var show = function(c){
      var n = 0;
      grid.querySelectorAll('.work').forEach(function(li){ var on = c === 'Todos' || li.getAttribute('data-cat') === c; li.hidden = !on; if (on) n++; });
      filters.querySelectorAll('.filter').forEach(function(b){ var on = b.getAttribute('data-filter') === c; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      if (count) count.textContent = n + (n === 1 ? ' trabalho' : ' trabalhos');
      watchVideos();
    };
    filters.addEventListener('click', function(e){ var b = e.target.closest('[data-filter]'); if (b) show(b.getAttribute('data-filter')); });
    show('Todos');
  }

  /* ---------- só tocam os vídeos que estão na tela ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting){
        if (!v.getAttribute('src') && v.getAttribute('data-src')) v.setAttribute('src', v.getAttribute('data-src'));
        if (!reduce){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
      } else if (!v.paused) v.pause();
    });
  }, {rootMargin:'120px'}) : null;
  function watchVideos(){
    document.querySelectorAll('video.loop').forEach(function(v){
      if (v.__watched) return; v.__watched = true;
      if (io) io.observe(v); else if (v.getAttribute('data-src')) v.setAttribute('src', v.getAttribute('data-src'));
    });
  }
  watchVideos();

  var hero = document.getElementById('heroVideo');
  if (reduce && hero){ hero.removeAttribute('autoplay'); hero.pause(); }

  /* ---------- player ---------- */
  var dlg = document.getElementById('player'), pv = document.getElementById('playerVideo'), pt = document.getElementById('playerTitle');
  function openPlayer(src, title){
    pt.textContent = title || '';
    pv.src = src;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    if (hero) hero.pause();
    var p = pv.play(); if (p && p.catch) p.catch(function(){});
  }
  function closePlayer(){
    pv.pause(); pv.removeAttribute('src'); pv.load();
    if (dlg.open) dlg.close();
    if (hero && !reduce){ var p = hero.play(); if (p && p.catch) p.catch(function(){}); }
  }
  if (dlg){
    document.addEventListener('click', function(e){ var b = e.target.closest('[data-play]'); if (b) openPlayer(b.getAttribute('data-play'), b.getAttribute('data-title')); });
    document.getElementById('playerClose').addEventListener('click', closePlayer);
    dlg.addEventListener('close', function(){ if (pv.getAttribute('src')) closePlayer(); });
    dlg.addEventListener('click', function(e){ if (e.target === dlg) closePlayer(); });
  }

  /* ---------- WhatsApp ---------- */
  document.querySelectorAll('[data-wa]').forEach(function(a){ a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(a.getAttribute('data-wa')); });

  var brief = document.getElementById('brief'), send = document.getElementById('send');
  function txtOf(id){ var s = document.getElementById(id); return s.options[s.selectedIndex].text; }
  function upd(){
    if (!brief) return;
    var v = function(id){ return document.getElementById(id).value.trim(); };
    var txt = 'Olá, Jason!' + (v('f-name') ? ' Meu nome é ' + v('f-name') + (v('f-brand') ? ', da ' + v('f-brand') : '') + '.' : (v('f-brand') ? ' Falo pela ' + v('f-brand') + '.' : ''))
      + ' Quero fazer ' + txtOf('f-tipo') + ' na área de ' + txtOf('f-seg') + (v('f-when') ? ', para ' + v('f-when') : '') + '.'
      + (v('f-msg') ? '\n\nA ideia: ' + v('f-msg') : '');
    send.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(txt);
  }
  if (brief){
    brief.addEventListener('input', upd); brief.addEventListener('change', upd);
    brief.addEventListener('submit', function(e){ e.preventDefault(); }); upd();
    // Clicar num serviço ou num segmento já preenche essa parte da frase
    document.addEventListener('click', function(e){
      var a = e.target.closest('[data-tipo],[data-seg]'); if (!a) return;
      if (a.hasAttribute('data-tipo')) document.getElementById('f-tipo').value = a.getAttribute('data-tipo');
      if (a.hasAttribute('data-seg')) document.getElementById('f-seg').value = a.getAttribute('data-seg');
      upd();
    });
  }

  /* ---------- botões vermelhos: o branco entra pelo ponto onde o mouse entrou e sai por onde ele saiu ---------- */
  document.querySelectorAll('.fx').forEach(function(b){
    var at = function(e){ var r = b.getBoundingClientRect(); b.style.setProperty('--x', (e.clientX - r.left) + 'px'); b.style.setProperty('--y', (e.clientY - r.top) + 'px'); b.style.setProperty('--d', (Math.hypot(r.width, r.height) * 2.1) + 'px'); };
    b.addEventListener('mouseenter', function(e){ at(e); b.classList.add('in'); });
    b.addEventListener('mouseleave', function(e){ at(e); b.classList.remove('in'); });
  });

  // Barra de WhatsApp no celular some quando o contato está na tela
  var mbar = document.getElementById('mbar'), contato = document.getElementById('contato');
  if (mbar && contato && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){ mbar.hidden = es[0].isIntersecting; }, {threshold:.15}).observe(contato);
  }

  /* ---------- copiar e-mail ---------- */
  var copy = document.getElementById('copyMail');
  if (copy) copy.addEventListener('click', function(){
    var el = document.getElementById('mail');
    function sel(){ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'Selecionado, use Ctrl+C'; }
    try { navigator.clipboard.writeText(el.textContent).then(function(){ copy.textContent = 'Copiado'; setTimeout(function(){ copy.textContent = 'Copiar e-mail'; }, 2000); }, sel); } catch(_){ sel(); }
  });

  /* ---------- nome do rodapé ocupa a largura exata ---------- */
  var wm = document.getElementById('wordmark');
  function fit(){
    if (!wm) return;
    var box = wm.parentElement, cs = getComputedStyle(box);
    var w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    wm.style.display = 'inline-block'; wm.style.fontSize = '100px';
    wm.style.fontSize = (100 * w / wm.scrollWidth).toFixed(2) + 'px'; wm.style.display = 'block';
  }
  fit(); window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
