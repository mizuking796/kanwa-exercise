/* ======================================================
   program-engine.js — 運動プログラム生成エンジン
   ESAS-r-J / SARC-F / 年代・性別・BMI を統合して
   個別化プログラムを自動生成
   ====================================================== */
'use strict';

var ProgramEngine = (function () {

  /* --------------------------------------------------
     定数
     -------------------------------------------------- */
  var PHASE_ICONS = { warmup: '\uD83D\uDD25', main: '\uD83C\uDFCB', cooldown: '\uD83C\uDF3F' };
  // warmup: 🔥  main: 🏋  cooldown: 🌿

  /* --------------------------------------------------
     ESAS-r-J → 強度上限 & 除外カテゴリ
     -------------------------------------------------- */
  function _esasAdjust(esasScores) {
    var result = {
      maxIntensity: 3,
      excludeCategories: [],
      addRelaxation: false,
      stopRecommended: false,
      messages: []
    };

    var total = (esasScores && esasScores.total != null) ? esasScores.total : 0;

    // 合計スコアによる強度調整
    if (total >= 81) {
      result.maxIntensity = 0;
      result.stopRecommended = true;
      result.messages.push('ESAS合計' + total + '点: 運動中止を推奨');
    } else if (total >= 61) {
      result.maxIntensity = 1;
      result.messages.push('ESAS合計' + total + '点: ごく軽い運動のみ');
    } else if (total >= 31) {
      result.maxIntensity = 2;
      result.messages.push('ESAS合計' + total + '点: 軽めの運動');
    }

    if (!esasScores) return result;

    // 個別症状 >= 7 → カテゴリ除外
    if (esasScores.pain >= 7) {
      result.excludeCategories.push('resistance');
      result.messages.push('疼痛' + esasScores.pain + '点: 筋力トレーニング除外');
    }
    if (esasScores.fatigue >= 7) {
      result.excludeCategories.push('aerobic');
      result.messages.push('倦怠感' + esasScores.fatigue + '点: 有酸素運動除外');
    }
    if (esasScores.dyspnea >= 7) {
      if (result.excludeCategories.indexOf('aerobic') === -1) {
        result.excludeCategories.push('aerobic');
      }
      result.messages.push('呼吸困難' + esasScores.dyspnea + '点: 有酸素運動除外');
    }
    if (esasScores.nausea >= 7) {
      if (result.excludeCategories.indexOf('aerobic') === -1) {
        result.excludeCategories.push('aerobic');
      }
      if (result.excludeCategories.indexOf('resistance') === -1) {
        result.excludeCategories.push('resistance');
      }
      result.messages.push('嘔気' + esasScores.nausea + '点: 有酸素・筋トレ除外');
    }
    if (esasScores.depression >= 7 || esasScores.anxiety >= 7) {
      result.addRelaxation = true;
      result.messages.push('精神症状高値: リラクセーション追加');
    }

    return result;
  }

  /* --------------------------------------------------
     年代・性別・BMI・SARC-F → 調整パラメータ
     -------------------------------------------------- */
  function _demographicAdjust(input) {
    var adj = {
      repsMul: 1.0,
      setsAdj: 0,
      maxIntensityCap: 3,
      chairOnly: false,
      supportRecommended: false,
      seatPreferred: false,
      weightBearingCaution: false,
      nutritionAdvice: null,
      proteinAdvice: null,
      strengthRatioBoost: false,
      messages: []
    };

    var age = parseInt(input.ageGroup, 10) || 60;

    // --- 年代 ---
    if (age >= 90) {
      adj.repsMul *= 0.5;
      adj.setsAdj -= 1;
      adj.maxIntensityCap = Math.min(adj.maxIntensityCap, 1);
      adj.chairOnly = true;
      adj.messages.push('90代以上: 回数50%・セット-1・座位のみ・強度上限1');
    } else if (age >= 80) {
      adj.repsMul *= 0.6;
      adj.setsAdj -= 1;
      adj.maxIntensityCap = Math.min(adj.maxIntensityCap, 2);
      adj.chairOnly = true;
      adj.messages.push('80代: 回数60%・セット-1・座位推奨・強度上限2');
    } else if (age >= 70) {
      adj.repsMul *= 0.8;
      adj.supportRecommended = true;
      adj.messages.push('70代: 回数80%・支持物推奨');
    }

    // --- 性別 ---
    // 女性の筋トレ補正は reps 適用時に別途掛ける
    // ここではフラグのみ

    // --- BMI ---
    if (input.bmi != null) {
      if (input.bmi < 18.5) {
        adj.repsMul *= 0.8;
        adj.nutritionAdvice = '低体重（BMI ' + input.bmi.toFixed(1) + '）: 運動前後の栄養補給を推奨。高エネルギー・高タンパク食を心がけましょう。';
        adj.messages.push('低BMI: 回数さらに80%・有酸素短縮・栄養指導');
      }
      if (input.bmi >= 30) {
        adj.seatPreferred = true;
        adj.weightBearingCaution = true;
        adj.messages.push('BMI30以上: 座位優先・荷重注意');
      }
    }

    // --- SARC-F ---
    if (input.sarcfTotal != null && input.sarcfTotal >= 4) {
      adj.strengthRatioBoost = true;
      adj.proteinAdvice = 'サルコペニアリスク（SARC-F ' + input.sarcfTotal + '点）: タンパク質摂取を意識しましょう（体重1kgあたり1.2〜1.5g/日目標）。';
      adj.messages.push('SARC-F≧4: 筋トレ比率増・タンパク質摂取指導');
    }

    return adj;
  }

  /* --------------------------------------------------
     ExerciseRegistry からの選択ヘルパー
     -------------------------------------------------- */
  function _pickExercises(category, maxIntensity, count, options) {
    options = options || {};
    var filters = { category: category, maxIntensity: maxIntensity };
    if (options.chairOnly) filters.chairOnly = true;
    if (options.seatPreferred) filters.positionPreferred = 'seated';

    var pool = (typeof ExerciseRegistry !== 'undefined')
      ? ExerciseRegistry.filter(filters)
      : [];

    // シャッフル（Fisher-Yates）
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }

    return pool.slice(0, count);
  }

  /* --------------------------------------------------
     回数・セット数の調整適用
     -------------------------------------------------- */
  function _adjustExercise(ex, repsMul, setsAdj, isFemaleResistance) {
    var adjusted = {};
    // 浅いコピー
    for (var k in ex) {
      if (ex.hasOwnProperty(k)) adjusted[k] = ex[k];
    }

    // 女性の筋トレは追加で ×0.85
    var effectiveMul = repsMul;
    if (isFemaleResistance) {
      effectiveMul *= 0.85;
    }

    // reps 調整
    if (adjusted.reps != null) {
      adjusted.reps = Math.max(1, Math.ceil(adjusted.reps * effectiveMul));
    }

    // sets 調整
    if (adjusted.sets != null) {
      adjusted.sets = Math.max(1, adjusted.sets + setsAdj);
    }

    // duration（有酸素）— 低BMI時短縮は repsMul < 1 で簡易的に反映
    if (adjusted.duration != null && typeof adjusted.duration === 'number') {
      adjusted.duration = Math.max(1, Math.ceil(adjusted.duration * effectiveMul));
    }

    return adjusted;
  }

  /* --------------------------------------------------
     代替活動（stop時）
     -------------------------------------------------- */
  function _buildAlternatives() {
    return [
      {
        name: '腹式呼吸',
        description: '鼻から4秒吸い、口から8秒かけてゆっくり吐く。5〜10回繰り返す。'
      },
      {
        name: '漸進的筋弛緩法',
        description: '手→腕→肩→顔→腹→脚の順に、5秒力を入れて10秒脱力。各部位1回ずつ。'
      },
      {
        name: 'ボディスキャン瞑想',
        description: '目を閉じ、つま先から頭頂まで順に注意を向け、力を抜いていく。5〜10分。'
      },
      {
        name: '軽いストレッチ（ベッド上）',
        description: '仰向けで膝を左右にゆっくり倒す。首を左右に傾ける。各30秒。'
      }
    ];
  }

  /* --------------------------------------------------
     フェーズ構築
     -------------------------------------------------- */
  function _buildWarmup(maxIntensity, options, repsMul, setsAdj, isFemale) {
    var exercises = _pickExercises('warmup', maxIntensity, 3, options);
    exercises = exercises.map(function (ex) {
      return _adjustExercise(ex, repsMul, setsAdj, false);
    });
    return {
      name: '準備運動',
      icon: PHASE_ICONS.warmup,
      duration: '5\u201310分',
      exercises: exercises
    };
  }

  function _buildMain(maxIntensity, criteriaLevel, options, repsMul, setsAdj, isFemale, excludeCategories, addRelaxation, strengthRatioBoost) {
    var exercises = [];

    if (criteriaLevel === 'stop') {
      // stop: メイン運動なし（代替活動のみ）
      return {
        name: 'メイン運動',
        icon: PHASE_ICONS.main,
        duration: '—',
        exercises: []
      };
    }

    // カテゴリごとの選択数
    var counts;
    if (criteriaLevel === 'caution') {
      counts = {
        aerobic: 1,
        resistance: 2,
        balance: 1,
        flexibility: 1
      };
    } else {
      // ok
      counts = {
        aerobic: 2,
        resistance: strengthRatioBoost ? 4 : 3,
        balance: 2,
        flexibility: 1,
        adl: 1
      };
    }

    // 除外カテゴリ適用
    excludeCategories.forEach(function (cat) {
      delete counts[cat];
    });

    // リラクセーション追加
    if (addRelaxation) {
      counts.relaxation = 1;
    }

    // 各カテゴリから選択
    var categoryOrder = ['aerobic', 'resistance', 'balance', 'flexibility', 'adl', 'relaxation'];
    categoryOrder.forEach(function (cat) {
      if (counts[cat] == null) return;
      var picked = _pickExercises(cat, maxIntensity, counts[cat], options);
      picked.forEach(function (ex) {
        var isResistance = (cat === 'resistance');
        exercises.push(_adjustExercise(ex, repsMul, setsAdj, isFemale && isResistance));
      });
    });

    var dur = criteriaLevel === 'caution' ? '10\u201320分' : '15\u201330分';

    return {
      name: 'メイン運動',
      icon: PHASE_ICONS.main,
      duration: dur,
      exercises: exercises
    };
  }

  function _buildCooldown(maxIntensity, options, repsMul, setsAdj) {
    var flexExercises = _pickExercises('flexibility', maxIntensity, 2, options);
    var breathExercises = _pickExercises('breathing', maxIntensity, 1, options);
    var exercises = flexExercises.concat(breathExercises);
    exercises = exercises.map(function (ex) {
      return _adjustExercise(ex, repsMul, setsAdj, false);
    });
    return {
      name: '整理運動',
      icon: PHASE_ICONS.cooldown,
      duration: '5\u201310分',
      exercises: exercises
    };
  }

  /* --------------------------------------------------
     generate — メイン生成
     -------------------------------------------------- */
  function generate(input) {
    var criteriaLevel = input.criteriaLevel || 'ok';

    // 1) ESAS 調整
    var esas = _esasAdjust(input.esasScores);

    // 2) 年代・性別・BMI・SARC-F 調整
    var demo = _demographicAdjust(input);

    // 3) 総合 maxIntensity（最も厳しい制限を採用）
    var maxIntensity = esas.maxIntensity;
    maxIntensity = Math.min(maxIntensity, demo.maxIntensityCap);
    if (criteriaLevel === 'caution') {
      maxIntensity = Math.min(maxIntensity, 2);
    }
    if (criteriaLevel === 'stop' || esas.stopRecommended) {
      maxIntensity = 0;
      criteriaLevel = 'stop';
    }

    // 4) 回数倍率・セット調整
    var repsMul = demo.repsMul;
    var setsAdj = demo.setsAdj;
    var isFemale = input.sex === 'female';

    // 5) オプション統合
    var pickOptions = {
      chairOnly: demo.chairOnly,
      seatPreferred: demo.seatPreferred
    };

    // 6) 調整理由一覧
    var adjustments = [].concat(demo.messages, esas.messages);

    // 7) 注意メッセージ
    var messages = [];
    if (demo.supportRecommended) {
      messages.push('支持物（椅子の背もたれ等）を近くに用意してください。');
    }
    if (demo.weightBearingCaution) {
      messages.push('荷重負荷の大きい運動は避け、座位中心で行ってください。');
    }
    if (demo.chairOnly) {
      messages.push('安全のため座位で行える運動を選択しています。');
    }
    if (criteriaLevel === 'stop') {
      messages.push('運動中止基準に該当するため、代替活動のみ提案します。主治医に相談してください。');
    }
    if (criteriaLevel === 'caution') {
      messages.push('相対的禁忌に該当します。軽い運動のみとし、症状悪化時は中止してください。');
    }

    // 8) フェーズ構築
    var phases;
    var alternatives = null;

    if (criteriaLevel === 'stop') {
      // stop: 全フェーズ空、代替活動のみ
      phases = [
        { name: '準備運動', icon: PHASE_ICONS.warmup, duration: '—', exercises: [] },
        { name: 'メイン運動', icon: PHASE_ICONS.main, duration: '—', exercises: [] },
        { name: '整理運動', icon: PHASE_ICONS.cooldown, duration: '—', exercises: [] }
      ];
      alternatives = _buildAlternatives();
    } else {
      phases = [
        _buildWarmup(Math.min(maxIntensity, 1), pickOptions, repsMul, setsAdj, isFemale),
        _buildMain(maxIntensity, criteriaLevel, pickOptions, repsMul, setsAdj, isFemale,
                   esas.excludeCategories, esas.addRelaxation, demo.strengthRatioBoost),
        _buildCooldown(Math.min(maxIntensity, 2), pickOptions, repsMul, setsAdj)
      ];
      alternatives = [];
    }

    return {
      overallLevel: criteriaLevel,
      maxIntensity: maxIntensity,
      adjustments: adjustments,
      phases: phases,
      alternatives: alternatives,
      nutritionAdvice: demo.nutritionAdvice,
      proteinAdvice: demo.proteinAdvice,
      messages: messages
    };
  }

  /* --------------------------------------------------
     Public API
     -------------------------------------------------- */
  return {
    generate: generate
  };

})();
