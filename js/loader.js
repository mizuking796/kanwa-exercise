/* ======================================================
   loader.js — 動的スクリプトローダー（進捗表示付き）
   ====================================================== */
'use strict';

(function () {
  var scripts = [
    'js/exercises/_registry.js',
    'js/exercises/warmup.js',
    'js/exercises/aerobic.js',
    'js/exercises/resistance.js',
    'js/exercises/balance.js',
    'js/exercises/flexibility.js',
    'js/exercises/breathing.js',
    'js/exercises/relaxation.js',
    'js/exercises/adl.js',
    'js/criteria-engine.js',
    'js/program-engine.js',
    'js/assessment-store.js',
    'js/chart-renderer.js',
    'js/router.js',
    'js/views/top.js',
    'js/views/wizard.js',
    'js/views/result.js',
    'js/views/history.js',
    'js/app.js'
  ];

  var total = scripts.length;
  var barEl = document.getElementById('loading-bar');
  var pctEl = document.getElementById('loading-pct');

  function update(loaded) {
    var pct = Math.round((loaded / total) * 100);
    if (barEl) barEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load: ' + src)); };
      document.body.appendChild(s);
    });
  }

  async function loadAll() {
    for (var i = 0; i < total; i++) {
      await loadScript(scripts[i]);
      update(i + 1);
    }
    var overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('fade-out');
      setTimeout(function () { overlay.remove(); }, 300);
    }
  }

  update(0);
  loadAll().catch(function (err) {
    var titleEl = document.querySelector('.loading-title');
    if (titleEl) titleEl.textContent = '読み込みエラー: ' + err.message;
  });
})();
