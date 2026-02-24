/* ======================================================
   assessment-store.js — 評価履歴の保存・管理
   localStorage を使用して最大50件の評価データを保持
   ====================================================== */
'use strict';

var AssessmentStore = (function () {
  var STORAGE_KEY = 'kanwa_exercise_history';

  // 全履歴を取得（新しい順）
  function getAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return list.sort(function(a, b) { return b.timestamp - a.timestamp; });
    } catch (e) {
      return [];
    }
  }

  // 保存（WizardView._data + ProgramEngine結果を保存）
  // entry = { data: WizardView._data, program: ProgramEngine結果, timestamp: Date.now() }
  function save(data, program) {
    var list = getAll();
    var entry = {
      id: 'assess_' + Date.now(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('ja-JP'),
      data: data,
      program: program,
      overallLevel: program.overallLevel
    };
    list.unshift(entry);
    // 最大50件
    if (list.length > 50) list = list.slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // storage full
    }
    return entry;
  }

  // ID で1件取得
  function getById(id) {
    var list = getAll();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  // 1件削除
  function remove(id) {
    var list = getAll().filter(function(e) { return e.id !== id; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // 全削除
  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // 件数
  function count() {
    return getAll().length;
  }

  return {
    getAll: getAll,
    save: save,
    getById: getById,
    remove: remove,
    clearAll: clearAll,
    count: count
  };
})();
