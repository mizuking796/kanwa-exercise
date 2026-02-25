/* ======================================================
   result.js — 結果画面ビュー
   WizardView._data + ProgramEngine.generate() の結果を表示
   ====================================================== */
'use strict';

var ResultView = (function () {

  /* ================================================================
     ヘルパー
     ================================================================ */

  /** ESAS合計の重症度ラベル */
  function _esasSeverity(total) {
    if (total <= 30) return { label: '軽度', cls: 'nrs-low' };
    if (total <= 60) return { label: '中等度', cls: 'nrs-mid' };
    if (total <= 80) return { label: '重度', cls: 'nrs-mid' };
    return { label: '最重度', cls: 'nrs-high' };
  }

  /** SARC-F判定 */
  function _sarcfJudgment(total) {
    if (total >= 4) return { label: 'サルコペニアリスクあり', cls: 'notice-warn' };
    return { label: 'リスク低い', cls: 'notice-info' };
  }

  /** BMI算出 */
  function _calcBMI(h, w) {
    if (!h || !w || h <= 0 || w <= 0) return null;
    var hm = h / 100;
    return w / (hm * hm);
  }

  /** BMIカテゴリ */
  function _bmiCategory(bmi) {
    if (bmi < 18.5) return 'やせ';
    if (bmi < 25)   return '標準';
    if (bmi < 30)   return '過体重';
    return '肥満';
  }

  /** overallLevel → バッジ情報 */
  function _levelBadge(level) {
    switch (level) {
      case 'stop':
        return { label: '運動は中止', cls: 'result-badge-stop', icon: '\uD83D\uDED1' };
      case 'caution':
        return { label: '軽めで実施', cls: 'result-badge-caution', icon: '\u26A0\uFE0F' };
      default:
        return { label: '通常OK', cls: 'result-badge-ok', icon: '\u2705' };
    }
  }

  /** overallLevel → 説明文 */
  function _levelDescription(level) {
    switch (level) {
      case 'stop':
        return '運動中止基準に該当するため、運動プログラムの実施は推奨されません。代替活動を提案します。';
      case 'caution':
        return '相対的禁忌に該当します。軽い運動のみとし、症状悪化時は直ちに中止してください。';
      default:
        return '評価結果に基づき、安全に運動を実施できる状態です。以下のプログラムを参考にしてください。';
    }
  }

  /** 強度バッジ */
  function _intensityBadge(intensity) {
    var cls, label;
    switch (intensity) {
      case 1: cls = 'intensity-1'; label = '軽い'; break;
      case 2: cls = 'intensity-2'; label = '中程度'; break;
      case 3: cls = 'intensity-3'; label = '高い'; break;
      default: cls = 'intensity-1'; label = '—'; break;
    }
    return '<span class="exercise-intensity ' + cls + '">' + label + '</span>';
  }

  /** エクササイズの回数/時間表示 */
  function _exerciseVolume(ex) {
    var sets = ex.sets || ex.defaultSets;
    var reps = ex.reps || ex.defaultReps;
    var duration = ex.duration || ex.defaultDuration;

    if (duration) {
      var min = Math.floor(duration / 60);
      var sec = duration % 60;
      var timeStr = '';
      if (min > 0) timeStr += min + '分';
      if (sec > 0) timeStr += sec + '秒';
      if (sets && sets > 1) timeStr += ' x ' + sets + 'セット';
      return timeStr || '—';
    }
    if (reps) {
      var str = reps + '回';
      if (sets && sets > 1) str += ' x ' + sets + 'セット';
      return str;
    }
    return '—';
  }

  /** SARC-F合計算出 */
  function _calcSarcfTotal(sarcf) {
    var sum = 0;
    var keys = ['strength', 'walking', 'rising', 'stairs', 'falls'];
    keys.forEach(function (k) {
      var v = sarcf[k];
      if (v !== '' && v !== undefined) sum += parseInt(v, 10);
    });
    return sum;
  }

  /** 中止基準レベルを取得（フラットデータに変換して渡す） */
  function _getCriteriaLevel(data) {
    if (typeof CriteriaEngine !== 'undefined' && CriteriaEngine.evaluate) {
      var evalData = { symptoms: data.symptoms || [] };
      var v = data.vitals || {};
      if (v.hr)   evalData.hr   = parseFloat(v.hr);
      if (v.sbp)  evalData.sbp  = parseFloat(v.sbp);
      if (v.dbp)  evalData.dbp  = parseFloat(v.dbp);
      if (v.spo2) evalData.spo2 = parseFloat(v.spo2);
      if (v.temp) evalData.temp = parseFloat(v.temp);
      var b = data.blood || {};
      if (b.hb)   evalData.hb   = parseFloat(b.hb);
      if (b.plt)  evalData.plt  = parseFloat(b.plt);
      if (b.wbc)  evalData.wbc  = parseFloat(b.wbc);
      var result = CriteriaEngine.evaluate(evalData);
      return result.level;
    }
    return 'ok';
  }

  /* ================================================================
     HTML 構築
     ================================================================ */

  /** 1. 結果ヘッダー */
  function _buildHeader(level) {
    var badge = _levelBadge(level);
    var desc = _levelDescription(level);

    return '<div class="result-header fade-in">' +
      '<div class="result-badge ' + badge.cls + '">' + badge.icon + ' ' + badge.label + '</div>' +
      '<div class="result-summary">' + desc + '</div>' +
    '</div>';
  }

  /** 2. ESAS-r-J レーダーチャート */
  function _buildChart() {
    return '<div class="card chart-wrap fade-in">' +
      '<div class="card-title">\uD83D\uDCCA ESAS-r-J 症状プロフィール</div>' +
      '<div style="text-align:center;">' +
        '<canvas id="esas-radar" width="300" height="300"></canvas>' +
      '</div>' +
    '</div>';
  }

  /** 3. 評価サマリーカード */
  function _buildSummary(data) {
    var esasTotal = data.esasScores ? data.esasScores.total : 0;
    var severity = _esasSeverity(esasTotal);
    var sarcfTotal = _calcSarcfTotal(data.sarcf || {});
    var sarcfJudge = _sarcfJudgment(sarcfTotal);
    var bmi = _calcBMI(parseFloat(data.height), parseFloat(data.weight));
    var criteriaLevel = data.criteriaLevel;

    var critBadge = _levelBadge(criteriaLevel);

    var html = '<div class="card fade-in">' +
      '<div class="card-title">\uD83D\uDCCB \u8A55\u4FA1\u30B5\u30DE\u30EA\u30FC</div>';

    // ESAS-r-J 合計
    html += '<div class="confirm-row">' +
      '<span class="confirm-row-label">ESAS-r-J 合計</span>' +
      '<span class="confirm-row-value"><strong class="' + severity.cls + '">' + esasTotal + ' / 100</strong>(' + severity.label + ')</span>' +
    '</div>';

    // 痛みの部位
    var painLocs = data.painLocations || [];
    if (painLocs.length > 0) {
      html += '<div class="confirm-row">' +
        '<span class="confirm-row-label">痛みの部位</span>' +
        '<span class="confirm-row-value">' + painLocs.length + '箇所</span>' +
      '</div>';
    }

    // SARC-F 合計
    html += '<div class="confirm-row">' +
      '<span class="confirm-row-label">SARC-F 合計</span>' +
      '<span class="confirm-row-value"><strong>' + sarcfTotal + ' / 10</strong>(' + sarcfJudge.label + ')</span>' +
    '</div>';

    // 中止基準判定
    html += '<div class="confirm-row">' +
      '<span class="confirm-row-label">中止基準判定</span>' +
      '<span class="confirm-row-value"><span class="result-badge ' + critBadge.cls + '" style="font-size:0.82rem;padding:0.15rem 0.5rem;">' + critBadge.icon + ' ' + critBadge.label + '</span></span>' +
    '</div>';

    // BMI
    if (bmi) {
      html += '<div class="confirm-row">' +
        '<span class="confirm-row-label">BMI</span>' +
        '<span class="confirm-row-value">' + bmi.toFixed(1) + '(' + _bmiCategory(bmi) + ')</span>' +
      '</div>';
    }

    html += '</div>';
    return html;
  }

  /** 4. 運動プログラム */
  function _buildProgram(program) {
    var html = '';

    if (program.overallLevel === 'stop') {
      // 代替活動カードのみ表示
      html += _buildAlternatives(program.alternatives);
      return html;
    }

    // 3フェーズ表示
    var phaseIcons = ['\uD83D\uDD25', '\uD83D\uDCAA', '\uD83E\uDDD8'];
    var phases = program.phases || [];

    for (var pi = 0; pi < phases.length; pi++) {
      var phase = phases[pi];
      html += '<div class="card program-phase fade-in">';

      // フェーズヘッダー
      html += '<div class="program-phase-header">' +
        '<span class="program-phase-icon">' + phaseIcons[pi] + '</span>' +
        '<span class="program-phase-name">' + phase.name + '</span>' +
        '<span class="program-phase-time">' + phase.duration + '</span>' +
      '</div>';

      // エクササイズ一覧
      if (phase.exercises && phase.exercises.length > 0) {
        for (var ei = 0; ei < phase.exercises.length; ei++) {
          var ex = phase.exercises[ei];
          html += '<div class="exercise-item">' +
            '<div class="exercise-name">' +
              ex.name +
              _intensityBadge(ex.intensity) +
            '</div>' +
            '<div class="exercise-detail">' + (ex.description || '') + '</div>' +
            '<div class="exercise-detail" style="color:#636E72;font-size:0.82rem;">' + _exerciseVolume(ex) + '</div>' +
          '</div>';
        }
      } else {
        html += '<div class="exercise-item" style="color:#B2BEC3;text-align:center;">該当する運動はありません</div>';
      }

      html += '</div>';
    }

    return html;
  }

  /** 代替活動カード */
  function _buildAlternatives(alternatives) {
    if (!alternatives || alternatives.length === 0) return '';

    var html = '<div class="card fade-in">' +
      '<div class="card-title">\uD83C\uDF3F \u4EE3\u66FF\u6D3B\u52D5</div>' +
      '<p style="font-size:0.88rem;color:#636E72;margin-bottom:0.75rem;">運動中止基準に該当するため、以下の活動を提案します。</p>';

    for (var i = 0; i < alternatives.length; i++) {
      var alt = alternatives[i];
      html += '<div class="alt-activity">' +
        '<div class="alt-activity-name">' + alt.name + '</div>' +
        '<div class="alt-activity-desc">' + alt.description + '</div>' +
      '</div>';
    }

    html += '</div>';
    return html;
  }

  /** 5. 調整情報 */
  function _buildAdjustments(program) {
    var html = '';

    // 適用された調整
    if (program.adjustments && program.adjustments.length > 0) {
      html += '<div class="notice notice-info fade-in">' +
        '<strong>\u2699\uFE0F \u9069\u7528\u3055\u308C\u305F\u8ABF\u6574</strong><br>';
      for (var i = 0; i < program.adjustments.length; i++) {
        html += '\u2022 ' + program.adjustments[i] + '<br>';
      }
      html += '</div>';
    }

    // 栄養指導
    if (program.nutritionAdvice) {
      html += '<div class="notice notice-warn fade-in">' +
        '<strong>\uD83C\uDF5E \u6804\u990A\u6307\u5C0E</strong><br>' +
        program.nutritionAdvice +
      '</div>';
    }

    // タンパク質指導
    if (program.proteinAdvice) {
      html += '<div class="notice notice-info fade-in">' +
        '<strong>\uD83E\uDD69 \u30BF\u30F3\u30D1\u30AF\u8CEA\u6307\u5C0E</strong><br>' +
        program.proteinAdvice +
      '</div>';
    }

    return html;
  }

  /** 6. 注意メッセージ */
  function _buildMessages(messages) {
    if (!messages || messages.length === 0) return '';

    var html = '';
    for (var i = 0; i < messages.length; i++) {
      html += '<div class="notice notice-warn fade-in">' +
        '\u26A0\uFE0F ' + messages[i] +
      '</div>';
    }
    return html;
  }

  /** 7. 免責事項 */
  function _buildDisclaimer() {
    return '<div class="disclaimer fade-in">' +
      '<div class="disclaimer-title">\u26A0\uFE0F \u514D\u8CAC\u4E8B\u9805</div>' +
      '<p>\u672C\u30D7\u30ED\u30B0\u30E9\u30E0\u306F\u53C2\u8003\u60C5\u5831\u3067\u3059\u3002\u5FC5\u305A\u4E3B\u6CBB\u533B\u30FB\u62C5\u5F53\u30BB\u30E9\u30D4\u30B9\u30C8\u306B\u3054\u76F8\u8AC7\u304F\u3060\u3055\u3044\u3002</p>' +
    '</div>';
  }

  /** 8. アクションバー */
  function _buildActions() {
    return '<div class="result-actions fade-in">' +
      '<button class="btn btn-primary" id="btn-print">\uD83D\uDDA8\uFE0F \u5370\u5237\u3059\u308B</button>' +
      '<button class="btn btn-secondary" id="btn-save">\uD83D\uDCBE \u5C65\u6B74\u306B\u4FDD\u5B58</button>' +
      '<button class="btn btn-outline" id="btn-restart">\uD83D\uDD04 \u6700\u521D\u304B\u3089</button>' +
    '</div>';
  }

  /* ================================================================
     データ組み立て
     ================================================================ */

  function _prepareData() {
    var data = WizardView._data;

    // ESAS スコアオブジェクト構築
    var esasKeys = ['pain', 'fatigue', 'drowsiness', 'nausea', 'appetite',
                    'dyspnea', 'depression', 'anxiety', 'other', 'wellbeing'];
    var esasScores = {};
    var esasTotal = 0;
    esasKeys.forEach(function (k) {
      var v = data.esas[k] || 0;
      esasScores[k] = v;
      esasTotal += v;
    });
    esasScores.total = esasTotal;

    // SARC-F 合計
    var sarcfTotal = _calcSarcfTotal(data.sarcf || {});

    // BMI
    var bmi = _calcBMI(parseFloat(data.height), parseFloat(data.weight));

    // 中止基準レベル
    var criteriaLevel = _getCriteriaLevel(data);

    // 下腿周囲長
    var calfCircumference = data.calfCircumference ? parseFloat(data.calfCircumference) : null;

    return {
      ageGroup: data.age,
      sex: data.sex,
      height: data.height,
      weight: data.weight,
      bmi: bmi,
      esasScores: esasScores,
      sarcf: data.sarcf,
      sarcfTotal: sarcfTotal,
      criteriaLevel: criteriaLevel,
      calfCircumference: calfCircumference,
      vitals: data.vitals,
      blood: data.blood,
      symptoms: data.symptoms,
      painLocations: data.painLocations || []
    };
  }

  /* ================================================================
     メイン render
     ================================================================ */

  function render(params) {
    var app = document.getElementById('app');
    app.classList.add('result-mode');

    // データ準備
    var data = _prepareData();

    // プログラム生成
    var program = ProgramEngine.generate({
      ageGroup: data.ageGroup,
      sex: data.sex,
      bmi: data.bmi,
      esasScores: data.esasScores,
      sarcfTotal: data.sarcfTotal,
      criteriaLevel: data.criteriaLevel,
      calfCircumference: data.calfCircumference
    });

    // HTML 構築
    var html = '<div class="fade-in">';

    // 1. 結果ヘッダー
    html += _buildHeader(program.overallLevel);

    // 2. ESAS-r-J レーダーチャート
    html += _buildChart();

    // 3. 評価サマリーカード
    html += _buildSummary(data);

    // 4. 運動プログラム
    html += _buildProgram(program);

    // 5. 調整情報
    html += _buildAdjustments(program);

    // 6. 注意メッセージ
    html += _buildMessages(program.messages);

    // 7. 免責事項
    html += _buildDisclaimer();

    // 8. アクションバー
    html += _buildActions();

    html += '</div>';

    app.innerHTML = html;

    // スクロールトップ
    window.scrollTo(0, 0);

    // レーダーチャート描画
    if (typeof ChartRenderer !== 'undefined') {
      ChartRenderer.renderRadar('esas-radar', data.esasScores);
    }

    // イベントリスナー
    _bindEvents(data, program);
  }

  /* ================================================================
     イベントバインド
     ================================================================ */

  function _bindEvents(data, program) {
    // 印刷
    var btnPrint = document.getElementById('btn-print');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () {
        window.print();
      });
    }

    // 履歴に保存
    var btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        if (typeof AssessmentStore !== 'undefined' && AssessmentStore.save) {
          AssessmentStore.save(
            JSON.parse(JSON.stringify(WizardView._data)),
            program
          );
          if (confirm('\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\u5C65\u6B74\u753B\u9762\u3092\u958B\u304D\u307E\u3059\u304B\uFF1F')) {
            Router.navigate('history');
          }
        } else {
          alert('\u4FDD\u5B58\u6A5F\u80FD\u304C\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002');
        }
      });
    }

    // 最初から
    var btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', function () {
        // WizardView._data をリセット
        var d = WizardView._data;
        d.age = '';
        d.sex = '';
        d.height = '';
        d.weight = '';
        d.recorder = '';
        d.esas = { pain:0, fatigue:0, drowsiness:0, nausea:0, appetite:0,
                   dyspnea:0, depression:0, anxiety:0, other:0, wellbeing:0 };
        d.sarcf = { strength:'', walking:'', rising:'', stairs:'', falls:'' };
        d.calfCircumference = '';
        d.vitals = { hr:'', sbp:'', dbp:'', spo2:'', temp:'' };
        d.blood = { hb:'', plt:'', wbc:'' };
        d.symptoms = [];
        d.painLocations = [];

        // result-mode 除去
        document.getElementById('app').classList.remove('result-mode');

        Router.navigate('top');
      });
    }
  }

  /* ================================================================
     Public API
     ================================================================ */

  return {
    render: render
  };

})();
