/* ======================================================
   history.js — 履歴画面ビュー
   評価履歴の一覧表示・詳細閲覧・全削除
   ====================================================== */
'use strict';

var HistoryView = (function () {

  /* ── バッジスタイルマップ ── */
  var BADGE_STYLES = {
    ok:      { bg: '#E8F5E9', color: '#2E7D32', label: '通常運動 OK',   icon: '&#x2705;' },
    caution: { bg: '#FFF3E0', color: '#E65100', label: '軽運動のみ可',  icon: '&#x26A0;&#xFE0F;' },
    stop:    { bg: '#FFEBEE', color: '#C62828', label: '運動中止',       icon: '&#x1F6D1;' }
  };

  /* ── ESAS合計スコア算出 ── */
  function _esasTotal(esasData) {
    if (!esasData) return 0;
    var keys = ['pain', 'fatigue', 'drowsiness', 'nausea', 'appetite',
                'dyspnea', 'depression', 'anxiety', 'other', 'wellbeing'];
    var sum = 0;
    for (var i = 0; i < keys.length; i++) {
      sum += (esasData[keys[i]] || 0);
    }
    return sum;
  }

  /* ── SARC-F合計スコア算出 ── */
  function _sarcfTotal(sarcfData) {
    if (!sarcfData) return 0;
    var keys = ['strength', 'walking', 'rising', 'stairs', 'falls'];
    var sum = 0;
    for (var i = 0; i < keys.length; i++) {
      var v = sarcfData[keys[i]];
      if (v !== '' && v !== undefined) sum += parseInt(v, 10);
    }
    return sum;
  }

  /* ── バッジHTML生成 ── */
  function _badgeHtml(level) {
    var style = BADGE_STYLES[level] || BADGE_STYLES.ok;
    return '<span class="history-badge" style="background:' + style.bg + ';color:' + style.color + ';">' +
      style.icon + ' ' + style.label +
    '</span>';
  }

  /* ── 空状態の描画 ── */
  function _renderEmpty() {
    return '<div class="empty-state">' +
      '<div class="empty-state-icon">&#x1F4CB;</div>' +
      '<p>まだ評価履歴がありません</p>' +
      '<p style="font-size:0.85rem;color:#636E72;margin-top:0.5rem;">評価を実施すると、ここに履歴が表示されます。</p>' +
      '<button class="btn btn-primary" id="empty-back-btn" style="margin-top:1.5rem;">' +
        '&#x1F3E0; トップに戻る' +
      '</button>' +
    '</div>';
  }

  /* ── 履歴リストの描画 ── */
  function _renderList(list) {
    var html = '';

    /* ヘッダー */
    html += '<div class="card">' +
      '<div class="card-title">&#x1F4C5; 評価履歴</div>' +
      '<p style="font-size:0.85rem;color:#636E72;margin-top:-0.25rem;">' +
        list.length + '件の評価記録' +
      '</p>' +
    '</div>';

    /* 一覧 */
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      var esasT = _esasTotal(entry.data && entry.data.esas);
      var sarcfT = _sarcfTotal(entry.data && entry.data.sarcf);

      html += '<div class="card history-item" data-id="' + entry.id + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">' +
          '<span class="history-date">' + (entry.date || '日付不明') + '</span>' +
          _badgeHtml(entry.overallLevel) +
        '</div>' +
        '<div style="display:flex;gap:1rem;margin-top:0.5rem;font-size:0.85rem;color:#636E72;">' +
          '<span class="history-label">ESAS合計: <strong>' + esasT + '</strong>/100</span>' +
          '<span class="history-label">SARC-F: <strong>' + sarcfT + '</strong>/10</span>' +
        '</div>' +
      '</div>';
    }

    /* アクションボタン */
    html += '<div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.75rem;">' +
      '<button class="btn btn-outline btn-block" id="history-back-btn">' +
        '&#x1F3E0; トップに戻る' +
      '</button>' +
      '<button class="btn btn-danger btn-sm btn-block" id="history-clear-btn">' +
        '&#x1F5D1; 履歴を全て削除' +
      '</button>' +
    '</div>';

    return html;
  }

  /* ── メインrender ── */
  function render(params) {
    var app = document.getElementById('app');
    app.classList.remove('result-mode');

    var list = AssessmentStore.getAll();

    var content;
    if (list.length === 0) {
      content = _renderEmpty();
    } else {
      content = _renderList(list);
    }

    app.innerHTML = '<div class="fade-in">' + content + '</div>';

    /* スクロールトップ */
    window.scrollTo(0, 0);

    /* ── イベントリスナー ── */

    /* 空状態: トップに戻る */
    var emptyBackBtn = document.getElementById('empty-back-btn');
    if (emptyBackBtn) {
      emptyBackBtn.addEventListener('click', function () {
        Router.navigate('top');
      });
    }

    /* トップに戻る */
    var backBtn = document.getElementById('history-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        Router.navigate('top');
      });
    }

    /* 全削除 */
    var clearBtn = document.getElementById('history-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('全ての評価履歴を削除しますか？\nこの操作は取り消せません。')) {
          AssessmentStore.clearAll();
          Router.navigate('history');
        }
      });
    }

    /* 履歴アイテムタップ → 結果画面へ */
    var items = document.querySelectorAll('.history-item');
    items.forEach(function (item) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var entry = AssessmentStore.getById(id);
        if (!entry) return;

        /* WizardView._data に保存データを復元 */
        if (typeof WizardView !== 'undefined' && WizardView._data && entry.data) {
          var keys = Object.keys(entry.data);
          for (var i = 0; i < keys.length; i++) {
            WizardView._data[keys[i]] = entry.data[keys[i]];
          }
        }

        /* 結果画面を表示 */
        Router.navigate('result');
      });
    });
  }

  return { render: render };
})();
