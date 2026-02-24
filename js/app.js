/* ======================================================
   app.js — SPA ブートストラップ
   ルーター登録 + 初期化
   ====================================================== */
'use strict';

(function () {
  Router.on('top', TopView.render);
  Router.on('wizard', WizardView.render);
  Router.on('result', ResultView.render);
  Router.on('history', HistoryView.render);
  Router.start();
})();
