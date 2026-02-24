/* ======================================================
   criteria-engine.js — 運動中止基準判定エンジン
   アンダーソン・土肥基準 + がんリハビリテーションガイドライン
   ====================================================== */
'use strict';

var CriteriaEngine = (function () {

  /* --------------------------------------------------
     閾値定義
     -------------------------------------------------- */
  var STOP_RULES = [
    // 心拍数
    { key: 'hr', test: function (v) { return v >= 120; }, text: '心拍数が120以上' },
    { key: 'hr', test: function (v) { return v <= 40; },  text: '心拍数が40以下' },
    // 血圧
    { key: 'sbp', test: function (v) { return v >= 200; }, text: '収縮期血圧が200以上' },
    { key: 'sbp', test: function (v) { return v < 70; },   text: '収縮期血圧が70未満' },
    { key: 'dbp', test: function (v) { return v >= 120; }, text: '拡張期血圧が120以上' },
    // SpO2
    { key: 'spo2', test: function (v) { return v < 88; }, text: 'SpO2が88%未満' },
    // 体温
    { key: 'temp', test: function (v) { return v >= 38.3; }, text: '体温が38.3℃以上' },
    // 血液検査
    { key: 'hb',  test: function (v) { return v < 7.5; },  text: 'Hbが7.5g/dL未満' },
    { key: 'plt', test: function (v) { return v < 5; },    text: '血小板数が5万/μL未満' },
    { key: 'wbc', test: function (v) { return v < 3000; }, text: '白血球数が3000/μL未満' }
  ];

  var STOP_SYMPTOMS = {
    restDyspnea:   '安静時呼吸困難',
    chestPain:     '胸痛',
    consciousness: '意識障害',
    severeFatigue: '起き上がれない倦怠感'
  };

  var CAUTION_RULES = [
    { key: 'hr',  test: function (v) { return v >= 100; }, text: '心拍数が100以上' },
    { key: 'sbp', test: function (v) { return v >= 180; }, text: '収縮期血圧が180以上' },
    { key: 'sbp', test: function (v) { return v < 90; },   text: '収縮期血圧が90未満' },
    { key: 'dbp', test: function (v) { return v >= 100; }, text: '拡張期血圧が100以上' },
    { key: 'spo2', test: function (v) { return v < 92; },  text: 'SpO2が92%未満' },
    { key: 'hb',  test: function (v) { return v < 10; },   text: 'Hbが10g/dL未満' },
    { key: 'plt', test: function (v) { return v < 10; },   text: '血小板数が10万/μL未満' }
  ];

  var CAUTION_SYMPTOMS = {
    dizziness:     'めまい',
    nausea:        '嘔気',
    boneMetastasis: '骨転移痛',
    lowFever:      '微熱'
  };

  /* --------------------------------------------------
     evaluate — メイン判定
     -------------------------------------------------- */
  function evaluate(data) {
    var reasons = [];
    var hasStop = false;
    var hasCaution = false;

    // --- 絶対中止 (stop) ---
    STOP_RULES.forEach(function (rule) {
      var val = data[rule.key];
      if (val != null && rule.test(val)) {
        reasons.push({ text: rule.text, level: 'stop' });
        hasStop = true;
      }
    });

    // 自覚症状 — stop
    var symptoms = data.symptoms || [];
    symptoms.forEach(function (sid) {
      if (STOP_SYMPTOMS[sid]) {
        reasons.push({ text: STOP_SYMPTOMS[sid], level: 'stop' });
        hasStop = true;
      }
    });

    // --- 相対的禁忌 (caution) ---
    CAUTION_RULES.forEach(function (rule) {
      var val = data[rule.key];
      if (val != null && rule.test(val)) {
        // stop で既に同キー・同方向がヒットしていても caution は独立して記録
        reasons.push({ text: rule.text, level: 'caution' });
        hasCaution = true;
      }
    });

    // 自覚症状 — caution
    symptoms.forEach(function (sid) {
      if (CAUTION_SYMPTOMS[sid]) {
        reasons.push({ text: CAUTION_SYMPTOMS[sid], level: 'caution' });
        hasCaution = true;
      }
    });

    var level = hasStop ? 'stop' : hasCaution ? 'caution' : 'ok';

    return {
      level: level,
      reasons: reasons
    };
  }

  /* --------------------------------------------------
     ユーティリティ
     -------------------------------------------------- */
  function levelLabel(level) {
    switch (level) {
      case 'stop':    return '中止';
      case 'caution': return '軽運動のみ';
      default:        return '通常OK';
    }
  }

  function levelClass(level) {
    switch (level) {
      case 'stop':    return 'criteria-stop';
      case 'caution': return 'criteria-caution';
      default:        return 'criteria-ok';
    }
  }

  /* --------------------------------------------------
     Public API
     -------------------------------------------------- */
  return {
    evaluate:   evaluate,
    levelLabel: levelLabel,
    levelClass: levelClass
  };

})();
