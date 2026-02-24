/* ======================================================
   top.js — トップ画面ビュー
   ヒーロー + 特徴カード + アクション + 免責事項
   ====================================================== */
'use strict';

var TopView = (function () {

  function render() {
    var app = document.getElementById('app');
    app.classList.remove('result-mode');

    app.innerHTML =
      '<div class="fade-in">' +

        /* ── ヒーローセクション ── */
        '<div class="top-hero">' +
          '<div class="top-hero-icon">&#x1F3CB;&#xFE0F;</div>' +
          '<h1>緩和ケア運動プログラム支援</h1>' +
          '<p>症状評価・身体機能スクリーニング・<br>運動中止基準に基づいて、<br>個別化された安全な運動プログラムを自動生成します。</p>' +
        '</div>' +

        /* ── 特徴カード ── */
        '<div class="top-features">' +

          '<div class="top-feature">' +
            '<div class="top-feature-icon">&#x1F4CB;</div>' +
            '<div>' +
              '<h3>症状評価（ESAS-r-J）</h3>' +
              '<p>痛み・倦怠感・息苦しさなど10項目の症状を0〜10で評価。重症度を可視化します。</p>' +
            '</div>' +
          '</div>' +

          '<div class="top-feature">' +
            '<div class="top-feature-icon">&#x1F4AA;</div>' +
            '<div>' +
              '<h3>サルコペニアスクリーニング（SARC-F）</h3>' +
              '<p>筋力・歩行・立ち上がり・階段・転倒の5項目で筋肉減少リスクを判定します。</p>' +
            '</div>' +
          '</div>' +

          '<div class="top-feature">' +
            '<div class="top-feature-icon">&#x1F4C4;</div>' +
            '<div>' +
              '<h3>個別化プログラム自動生成</h3>' +
              '<p>評価結果と運動中止基準を統合し、安全かつ効果的な運動メニューを提案します。</p>' +
            '</div>' +
          '</div>' +

        '</div>' +

        /* ── アクションボタン ── */
        '<div class="top-actions">' +
          '<button class="btn btn-primary btn-block" id="btn-start">' +
            '&#x1F4DD; 評価を始める' +
          '</button>' +
          '<button class="btn btn-secondary btn-block" id="btn-history">' +
            '&#x1F4C5; 履歴を見る' +
          '</button>' +
        '</div>' +

        /* ── 免責事項 ── */
        '<div class="disclaimer">' +
          '<div class="disclaimer-title">&#x26A0;&#xFE0F; 免責事項</div>' +
          '<p>本ツールは医療従事者の臨床判断を補助する目的で作成されています。' +
          '生成されるプログラムは一般的なガイドラインに基づく参考情報であり、' +
          '個々の患者への適用は担当医師・理学療法士等の専門的判断に基づいて行ってください。' +
          '本ツールの使用による結果について、開発者は一切の責任を負いません。</p>' +
        '</div>' +

      '</div>';

    /* ── イベントリスナー ── */
    document.getElementById('btn-start').addEventListener('click', function () {
      Router.navigate('wizard', { step: '1' });
    });

    document.getElementById('btn-history').addEventListener('click', function () {
      Router.navigate('history');
    });
  }

  return { render: render };
})();
