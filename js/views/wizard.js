/* ======================================================
   wizard.js — ウィザード画面ビュー（Step 1-5）
   基本情報 → ESAS-r-J → SARC-F → 運動中止基準 → 確認
   ====================================================== */
'use strict';

var WizardView = (function () {

  /* ── 永続データ ── */
  var _data = {
    /* Step 1: 基本情報 */
    age: '',
    sex: '',
    height: '',
    weight: '',
    recorder: '',
    /* Step 2: ESAS-r-J */
    esas: { pain:0, fatigue:0, drowsiness:0, nausea:0, appetite:0,
            dyspnea:0, depression:0, anxiety:0, other:0, wellbeing:0 },
    /* Step 3: SARC-F */
    sarcf: { strength:'', walking:'', rising:'', stairs:'', falls:'' },
    calfCircumference: '',
    /* Step 4: 運動中止基準 */
    vitals: { hr:'', sbp:'', dbp:'', spo2:'', temp:'' },
    blood: { hb:'', plt:'', wbc:'' },
    symptoms: [],
    /* ボディダイアグラム */
    painLocations: []
  };

  var TOTAL_STEPS = 5;

  /* ── ステップ名 ── */
  var STEP_LABELS = [
    '基本情報',
    'ESAS-r-J（症状評価）',
    'SARC-F（サルコペニア）',
    '運動中止基準',
    '入力確認'
  ];

  /* ================================================================
     共通ヘルパー
     ================================================================ */

  function _progressBar(step) {
    var html = '<div class="wizard-header">' +
      '<div class="wizard-progress">';
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var cls = 'wizard-progress-step';
      if (i < step) cls += ' done';
      else if (i === step) cls += ' active';
      html += '<div class="' + cls + '"></div>';
    }
    html += '</div>' +
      '<div class="wizard-step-label">Step ' + step + ' / ' + TOTAL_STEPS + '</div>' +
      '<div class="wizard-step-title">' + STEP_LABELS[step - 1] + '</div>' +
      '</div>';
    return html;
  }

  function _nav(step) {
    var html = '<div class="wizard-nav">';
    if (step > 1) {
      html += '<button class="btn btn-outline" id="wizard-prev">&#x2190; 戻る</button>';
    }
    if (step < TOTAL_STEPS) {
      html += '<button class="btn btn-primary" id="wizard-next">次へ &#x2192;</button>';
    } else {
      html += '<button class="btn btn-primary" id="wizard-generate">&#x1F4C4; プログラムを生成する</button>';
    }
    html += '</div>';
    return html;
  }

  function _bindNav(step) {
    var prev = document.getElementById('wizard-prev');
    var next = document.getElementById('wizard-next');
    var gen  = document.getElementById('wizard-generate');

    if (prev) {
      prev.addEventListener('click', function () {
        Router.navigate('wizard', { step: String(step - 1) });
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        Router.navigate('wizard', { step: String(step + 1) });
      });
    }
    if (gen) {
      gen.addEventListener('click', function () {
        Router.navigate('result');
      });
    }
  }

  function _nrsColorClass(val) {
    if (val <= 3) return 'nrs-low';
    if (val <= 6) return 'nrs-mid';
    return 'nrs-high';
  }

  function _esasTotalColorClass(total) {
    if (total <= 30) return 'nrs-low';
    if (total <= 60) return 'nrs-mid';
    if (total <= 80) return 'nrs-mid'; // 橙を黄と同じCSSクラスで代用
    return 'nrs-high';
  }

  function _esasTotalLabel(total) {
    if (total <= 30) return '軽度';
    if (total <= 60) return '中等度';
    if (total <= 80) return '重度';
    return '最重度';
  }

  function _calcBMI(h, w) {
    if (!h || !w || h <= 0 || w <= 0) return null;
    var hm = h / 100;
    return w / (hm * hm);
  }

  function _bmiCategory(bmi) {
    if (bmi < 18.5) return { label: 'やせ', cls: 'bmi-underweight' };
    if (bmi < 25)   return { label: '標準', cls: 'bmi-normal' };
    if (bmi < 30)   return { label: '過体重', cls: 'bmi-overweight' };
    return { label: '肥満', cls: 'bmi-obese' };
  }

  /* ================================================================
     Step 1 — 基本情報
     ================================================================ */

  function _renderStep1() {
    var html = '<div class="card">' +
      '<div class="card-title">&#x1F464; 患者情報</div>' +

      /* 年代 */
      '<div class="form-group">' +
        '<label class="form-label">年代</label>' +
        '<select class="form-select" id="inp-age">' +
          '<option value="">選択してください</option>' +
          '<option value="40">40代</option>' +
          '<option value="50">50代</option>' +
          '<option value="60">60代</option>' +
          '<option value="70">70代</option>' +
          '<option value="80">80代</option>' +
          '<option value="90">90代以上</option>' +
        '</select>' +
      '</div>' +

      /* 性別 */
      '<div class="form-group">' +
        '<label class="form-label">性別</label>' +
        '<div class="radio-group" id="rg-sex">' +
          '<label class="radio-chip' + (_data.sex === 'male' ? ' selected' : '') + '">' +
            '<input type="radio" name="sex" value="male"' + (_data.sex === 'male' ? ' checked' : '') + '> 男性' +
          '</label>' +
          '<label class="radio-chip' + (_data.sex === 'female' ? ' selected' : '') + '">' +
            '<input type="radio" name="sex" value="female"' + (_data.sex === 'female' ? ' checked' : '') + '> 女性' +
          '</label>' +
        '</div>' +
      '</div>' +

      /* 身長・体重 */
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label class="form-label">身長 <span class="form-label-sub">cm</span></label>' +
          '<input type="number" class="form-input" id="inp-height" placeholder="160" step="0.1" min="100" max="220" value="' + (_data.height || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">体重 <span class="form-label-sub">kg</span></label>' +
          '<input type="number" class="form-input" id="inp-weight" placeholder="55" step="0.1" min="20" max="200" value="' + (_data.weight || '') + '">' +
        '</div>' +
      '</div>' +

      /* BMI表示 */
      '<div class="form-group" id="bmi-display"></div>' +

      /* 記入者 */
      '<div class="form-group">' +
        '<label class="form-label">記入者</label>' +
        '<div class="radio-group" id="rg-recorder">' +
          _recorderChip('patient', '患者本人') +
          _recorderChip('family', '家族') +
          _recorderChip('hcp', '医療従事者') +
          _recorderChip('assisted', '手伝い+患者記入') +
        '</div>' +
      '</div>' +

    '</div>';
    return html;
  }

  function _recorderChip(val, label) {
    var sel = _data.recorder === val;
    return '<label class="radio-chip' + (sel ? ' selected' : '') + '">' +
      '<input type="radio" name="recorder" value="' + val + '"' + (sel ? ' checked' : '') + '> ' + label +
    '</label>';
  }

  function _bindStep1() {
    /* 年代 */
    var ageEl = document.getElementById('inp-age');
    if (ageEl) {
      ageEl.value = _data.age || '';
      ageEl.addEventListener('change', function () { _data.age = this.value; });
    }

    /* 性別ラジオチップ */
    _bindRadioChips('rg-sex', function (val) { _data.sex = val; });

    /* 記入者ラジオチップ */
    _bindRadioChips('rg-recorder', function (val) { _data.recorder = val; });

    /* 身長・体重 → BMI */
    var hEl = document.getElementById('inp-height');
    var wEl = document.getElementById('inp-weight');
    function updateBMI() {
      _data.height = hEl.value;
      _data.weight = wEl.value;
      var bmi = _calcBMI(parseFloat(hEl.value), parseFloat(wEl.value));
      var disp = document.getElementById('bmi-display');
      if (bmi && disp) {
        var cat = _bmiCategory(bmi);
        disp.innerHTML = '<span class="bmi-badge ' + cat.cls + '">BMI ' + bmi.toFixed(1) + '（' + cat.label + '）</span>';
      } else if (disp) {
        disp.innerHTML = '';
      }
    }
    if (hEl) hEl.addEventListener('input', updateBMI);
    if (wEl) wEl.addEventListener('input', updateBMI);
    updateBMI();
  }

  /* ── ラジオチップ共通バインダー ── */
  function _bindRadioChips(groupId, onChange) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var chips = group.querySelectorAll('.radio-chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('selected'); });
        chip.classList.add('selected');
        var radio = chip.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          if (onChange) onChange(radio.value);
        }
      });
    });
  }

  /* ================================================================
     Step 2 — ESAS-r-J
     ================================================================ */

  var ESAS_ITEMS = [
    { key: 'pain',       label: '痛み' },
    { key: 'fatigue',    label: 'だるさ（倦怠感）' },
    { key: 'drowsiness', label: '眠気' },
    { key: 'nausea',     label: '吐き気' },
    { key: 'appetite',   label: '食欲不振' },
    { key: 'dyspnea',    label: '息苦しさ' },
    { key: 'depression', label: '気分の落ち込み' },
    { key: 'anxiety',    label: '不安' },
    { key: 'other',      label: 'その他の症状' },
    { key: 'wellbeing',  label: '全体的な調子' }
  ];

  /* ── ボディダイアグラム（痛み部位図） ── */

  var BODY_SVG_W = 600, BODY_SVG_H = 400;

  function _renderBodyDiagram() {
    var show = (_data.esas.pain || 0) >= 1;
    return '<div class="body-diagram-wrap" id="body-diagram-wrap"' +
      (show ? '' : ' style="display:none;"') + '>' +
      '<div class="body-diagram-label">図の中で痛みのあるところに印を付けて下さい。</div>' +
      '<div id="body-diagram-svg-area"></div>' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem;">' +
        '<button class="btn btn-sm btn-outline" id="body-diagram-clear">クリア</button>' +
        '<span class="form-hint" id="body-diagram-count"></span>' +
      '</div>' +
    '</div>';
  }

  function _updateBodySVG() {
    var area = document.getElementById('body-diagram-svg-area');
    if (!area) return;

    /* マーカー描画 */
    var locs = _data.painLocations || [];
    var markers = '';
    for (var i = 0; i < locs.length; i++) {
      markers += '<circle cx="' + (locs[i].x * BODY_SVG_W) + '" cy="' + (locs[i].y * BODY_SVG_H) +
        '" r="8" class="pain-marker"/>';
    }

    area.innerHTML =
      '<svg viewBox="0 0 ' + BODY_SVG_W + ' ' + BODY_SVG_H + '" class="body-diagram-svg" id="body-svg">' +
      '<image href="img/body-diagram.png" x="0" y="0" width="' + BODY_SVG_W + '" height="' + BODY_SVG_H + '"/>' +
      markers + '</svg>';

    /* クリックイベント */
    var svg = document.getElementById('body-svg');
    if (svg) {
      svg.addEventListener('click', function (e) {
        if (e.target.classList && e.target.classList.contains('pain-marker')) {
          var mcx = parseFloat(e.target.getAttribute('cx')) / BODY_SVG_W;
          var mcy = parseFloat(e.target.getAttribute('cy')) / BODY_SVG_H;
          _data.painLocations = _data.painLocations.filter(function (loc) {
            return Math.abs(loc.x - mcx) > 0.001 || Math.abs(loc.y - mcy) > 0.001;
          });
          _updateBodySVG();
          return;
        }
        var pt = new DOMPoint(e.clientX, e.clientY);
        var svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        _data.painLocations.push({ x: svgPt.x / BODY_SVG_W, y: svgPt.y / BODY_SVG_H });
        _updateBodySVG();
      });
    }

    /* マーカー数表示 */
    var countEl = document.getElementById('body-diagram-count');
    if (countEl) {
      var total = _data.painLocations.length;
      countEl.textContent = total > 0 ? total + '箇所マーク済み' : '';
    }
  }

  function _toggleBodyDiagram(painValue) {
    var wrap = document.getElementById('body-diagram-wrap');
    if (!wrap) return;
    if (painValue >= 1) {
      wrap.style.display = '';
    } else {
      wrap.style.display = 'none';
      _data.painLocations = [];
      _updateBodySVG();
    }
  }

  function _initBodyDiagram() {
    var clearBtn = document.getElementById('body-diagram-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        _data.painLocations = [];
        _updateBodySVG();
      });
    }
    _updateBodySVG();
  }

  function _renderStep2() {
    var html = '<div class="card">' +
      '<div class="card-title">&#x1F4CB; ESAS-r-J（Edmonton Symptom Assessment System）</div>' +
      '<p class="form-hint" style="margin-bottom:1rem;">各症状の強さを0（なし）〜10（最悪）で評価してください。</p>';

    ESAS_ITEMS.forEach(function (item) {
      var val = _data.esas[item.key] || 0;
      var colorCls = _nrsColorClass(val);
      html += '<div class="nrs-item">' +
        '<div class="nrs-header">' +
          '<span class="nrs-label">' + item.label + '</span>' +
          '<span class="nrs-value ' + colorCls + '" id="nrs-val-' + item.key + '">' + val + '</span>' +
        '</div>' +
        '<input type="range" class="nrs-slider" id="nrs-' + item.key + '" min="0" max="10" value="' + val + '">' +
        '<div class="nrs-scale"><span>0 なし</span><span>10 最悪</span></div>' +
      '</div>';
    });

    /* 合計 */
    var total = _esasTotal();
    html += '<div class="esas-total-bar" id="esas-total-bar">' +
      '<div class="esas-total-label">ESAS Total Symptom Distress Score</div>' +
      '<div class="esas-total-score ' + _esasTotalColorClass(total) + '" id="esas-total-score">' + total + ' / 100</div>' +
      '<div class="esas-total-hint" id="esas-total-hint">重症度: ' + _esasTotalLabel(total) + '</div>' +
    '</div>';

    /* ボディダイアグラム（ESAS合計の下、カード内末尾） */
    html += _renderBodyDiagram();

    html += '</div>';
    return html;
  }

  function _esasTotal() {
    var sum = 0;
    ESAS_ITEMS.forEach(function (item) {
      sum += (_data.esas[item.key] || 0);
    });
    return sum;
  }

  function _bindStep2() {
    ESAS_ITEMS.forEach(function (item) {
      var slider = document.getElementById('nrs-' + item.key);
      var valEl  = document.getElementById('nrs-val-' + item.key);
      if (!slider) return;
      slider.addEventListener('input', function () {
        var v = parseInt(this.value, 10);
        _data.esas[item.key] = v;
        if (valEl) {
          valEl.textContent = v;
          valEl.className = 'nrs-value ' + _nrsColorClass(v);
        }
        _updateEsasTotal();
        if (item.key === 'pain') {
          _toggleBodyDiagram(v);
        }
      });
    });
    /* ボディダイアグラム初期化 */
    _initBodyDiagram();
  }

  function _updateEsasTotal() {
    var total = _esasTotal();
    var scoreEl = document.getElementById('esas-total-score');
    var hintEl  = document.getElementById('esas-total-hint');
    if (scoreEl) {
      scoreEl.textContent = total + ' / 100';
      scoreEl.className = 'esas-total-score ' + _esasTotalColorClass(total);
    }
    if (hintEl) {
      hintEl.textContent = '重症度: ' + _esasTotalLabel(total);
    }
  }

  /* ================================================================
     Step 3 — SARC-F
     ================================================================ */

  var SARCF_QUESTIONS = [
    {
      key: 'strength',
      label: '筋力',
      question: '4.5kgの荷物を持ち上げて運ぶのは困難ですか？',
      options: [
        { value: 0, label: 'なし' },
        { value: 1, label: 'いくらか困難' },
        { value: 2, label: 'とても困難、または不可能' }
      ]
    },
    {
      key: 'walking',
      label: '歩行',
      question: '部屋の中を歩くのは困難ですか？',
      options: [
        { value: 0, label: 'なし' },
        { value: 1, label: 'いくらか困難' },
        { value: 2, label: 'とても困難、補助具使用、または不可能' }
      ]
    },
    {
      key: 'rising',
      label: '椅子からの立ち上がり',
      question: '椅子やベッドから立ち上がるのは困難ですか？',
      options: [
        { value: 0, label: 'なし' },
        { value: 1, label: 'いくらか困難' },
        { value: 2, label: 'とても困難、不可能、または手で支えないと立てない' }
      ]
    },
    {
      key: 'stairs',
      label: '階段',
      question: '10段の階段を上るのは困難ですか？',
      options: [
        { value: 0, label: 'なし' },
        { value: 1, label: 'いくらか困難' },
        { value: 2, label: 'とても困難、または不可能' }
      ]
    },
    {
      key: 'falls',
      label: '転倒',
      question: '過去1年間に何回転倒しましたか？',
      options: [
        { value: 0, label: 'なし' },
        { value: 1, label: '1〜3回' },
        { value: 2, label: '4回以上' }
      ]
    }
  ];

  function _renderStep3() {
    var html = '<div class="card">' +
      '<div class="card-title">&#x1F4AA; SARC-F（サルコペニアスクリーニング）</div>' +
      '<p class="form-hint" style="margin-bottom:1rem;">各項目で最も当てはまるものを選択してください。</p>';

    SARCF_QUESTIONS.forEach(function (q, qi) {
      html += '<div class="form-group">' +
        '<label class="form-label">' + (qi + 1) + '. ' + q.label + '</label>' +
        '<p class="form-hint" style="margin-bottom:0.4rem;">' + q.question + '</p>';

      q.options.forEach(function (opt) {
        var sel = _data.sarcf[q.key] === String(opt.value);
        html += '<div class="sarcf-option' + (sel ? ' selected' : '') + '" data-q="' + q.key + '" data-v="' + opt.value + '">' +
          '<input type="radio" name="sarcf-' + q.key + '" value="' + opt.value + '"' + (sel ? ' checked' : '') + '>' +
          '<span>' + opt.label + '（' + opt.value + '点）</span>' +
        '</div>';
      });

      html += '</div>';
    });

    /* 合計 */
    var total = _sarcfTotal();
    var isRisk = total >= 4;
    html += '<div class="sarcf-total" id="sarcf-total-area">' +
      '<div style="font-size:0.82rem;color:#636E72;margin-bottom:0.3rem;">SARC-F 合計スコア</div>' +
      '<div style="font-size:1.5rem;font-weight:700;" id="sarcf-total-score">' + total + ' / 10</div>' +
      '<div class="sarcf-result ' + (isRisk ? 'sarcf-risk' : 'sarcf-ok') + '" id="sarcf-result">' +
        (isRisk ? '&#x26A0;&#xFE0F; サルコペニアの可能性あり（AWGS 2019）' : '&#x2705; サルコペニアの可能性は低い') +
      '</div>' +
    '</div>';

    /* 補足: 下腿周囲長 */
    html += '<div class="form-group" style="margin-top:1rem;">' +
      '<label class="form-label">下腿周囲長 <span class="form-label-sub">cm（任意）</span></label>' +
      '<input type="number" class="form-input" id="inp-calf" placeholder="30" step="0.1" min="15" max="60" value="' + (_data.calfCircumference || '') + '">' +
      '<div class="form-hint">男性: 34cm未満、女性: 33cm未満でサルコペニアリスク上昇</div>' +
    '</div>';

    html += '</div>';
    return html;
  }

  function _sarcfTotal() {
    var sum = 0;
    SARCF_QUESTIONS.forEach(function (q) {
      var v = _data.sarcf[q.key];
      if (v !== '' && v !== undefined) sum += parseInt(v, 10);
    });
    return sum;
  }

  function _bindStep3() {
    /* SARC-Fオプション選択 */
    var options = document.querySelectorAll('.sarcf-option');
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var qKey = this.getAttribute('data-q');
        var val  = this.getAttribute('data-v');
        _data.sarcf[qKey] = val;

        /* 同じ質問グループの選択解除 */
        document.querySelectorAll('.sarcf-option[data-q="' + qKey + '"]').forEach(function (o) {
          o.classList.remove('selected');
          var radio = o.querySelector('input[type="radio"]');
          if (radio) radio.checked = false;
        });
        this.classList.add('selected');
        var radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        _updateSarcfTotal();
      });
    });

    /* 下腿周囲長 */
    var calfEl = document.getElementById('inp-calf');
    if (calfEl) {
      calfEl.addEventListener('input', function () {
        _data.calfCircumference = this.value;
      });
    }
  }

  function _updateSarcfTotal() {
    var total = _sarcfTotal();
    var isRisk = total >= 4;
    var scoreEl = document.getElementById('sarcf-total-score');
    var resultEl = document.getElementById('sarcf-result');
    if (scoreEl) scoreEl.textContent = total + ' / 10';
    if (resultEl) {
      resultEl.className = 'sarcf-result ' + (isRisk ? 'sarcf-risk' : 'sarcf-ok');
      resultEl.innerHTML = isRisk
        ? '&#x26A0;&#xFE0F; サルコペニアの可能性あり（AWGS 2019）'
        : '&#x2705; サルコペニアの可能性は低い';
    }
  }

  /* ================================================================
     Step 4 — 運動中止基準チェック
     ================================================================ */

  var SYMPTOM_CHECKLIST = [
    { id: 'restDyspnea',   label: '安静時の呼吸困難' },
    { id: 'chestPain',     label: '胸痛・胸部圧迫感' },
    { id: 'consciousness', label: '意識障害・見当識障害' },
    { id: 'severeFatigue', label: '起き上がれないほどの倦怠感' },
    { id: 'dizziness',     label: 'めまい・ふらつき' },
    { id: 'nausea',        label: '嘔気・嘔吐' },
    { id: 'boneMetastasis',label: '骨転移部の疼痛増悪' },
    { id: 'lowFever',      label: '微熱（37.5℃以上）' }
  ];

  function _renderStep4() {
    var html = '';

    /* A) バイタルサイン */
    html += '<div class="card">' +
      '<div class="criteria-section">' +
        '<div class="criteria-section-title">&#x1F4C8; A) バイタルサイン</div>' +
        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label">心拍数 <span class="form-label-sub">bpm</span></label>' +
            '<input type="number" class="form-input" id="inp-hr" placeholder="70" min="30" max="220" value="' + (_data.vitals.hr || '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">SpO2 <span class="form-label-sub">%</span></label>' +
            '<input type="number" class="form-input" id="inp-spo2" placeholder="98" min="50" max="100" value="' + (_data.vitals.spo2 || '') + '">' +
          '</div>' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label">収縮期血圧 <span class="form-label-sub">mmHg</span></label>' +
            '<input type="number" class="form-input" id="inp-sbp" placeholder="120" min="50" max="300" value="' + (_data.vitals.sbp || '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">拡張期血圧 <span class="form-label-sub">mmHg</span></label>' +
            '<input type="number" class="form-input" id="inp-dbp" placeholder="80" min="30" max="200" value="' + (_data.vitals.dbp || '') + '">' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">体温 <span class="form-label-sub">&#x2103;</span></label>' +
          '<input type="number" class="form-input" id="inp-temp" placeholder="36.5" step="0.1" min="34" max="42" value="' + (_data.vitals.temp || '') + '">' +
        '</div>' +
      '</div>' +
    '</div>';

    /* B) 血液データ（任意） */
    html += '<div class="card">' +
      '<div class="criteria-section">' +
        '<div class="criteria-section-title">&#x1FA78; B) 血液データ（任意）</div>' +
        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label">Hb <span class="form-label-sub">g/dL</span></label>' +
            '<input type="number" class="form-input" id="inp-hb" placeholder="12.0" step="0.1" min="1" max="25" value="' + (_data.blood.hb || '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">血小板数 <span class="form-label-sub">万/&#xB5;L</span></label>' +
            '<input type="number" class="form-input" id="inp-plt" placeholder="15" step="0.1" min="0" max="100" value="' + (_data.blood.plt || '') + '">' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">白血球数 <span class="form-label-sub">/&#xB5;L</span></label>' +
          '<input type="number" class="form-input" id="inp-wbc" placeholder="5000" min="0" max="100000" value="' + (_data.blood.wbc || '') + '">' +
        '</div>' +
      '</div>' +
    '</div>';

    /* C) 自覚症状チェックリスト */
    html += '<div class="card">' +
      '<div class="criteria-section">' +
        '<div class="criteria-section-title">&#x1F6A8; C) 自覚症状チェックリスト</div>';

    SYMPTOM_CHECKLIST.forEach(function (item) {
      var checked = _data.symptoms.indexOf(item.id) !== -1;
      html += '<label class="checkbox-item">' +
        '<input type="checkbox" data-symptom-id="' + item.id + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="checkbox-label">' + item.label + '</span>' +
      '</label>';
    });

    html += '</div></div>';

    /* 判定結果エリア */
    html += '<div id="criteria-result-area"></div>';

    return html;
  }

  function _bindStep4() {
    var fields = ['hr', 'sbp', 'dbp', 'spo2', 'temp'];
    fields.forEach(function (key) {
      var el = document.getElementById('inp-' + key);
      if (el) {
        el.addEventListener('input', function () {
          _data.vitals[key] = this.value;
          _evaluateCriteria();
        });
      }
    });

    var bfields = ['hb', 'plt', 'wbc'];
    bfields.forEach(function (key) {
      var el = document.getElementById('inp-' + key);
      if (el) {
        el.addEventListener('input', function () {
          _data.blood[key] = this.value;
          _evaluateCriteria();
        });
      }
    });

    /* 自覚症状チェックボックス */
    document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var sid = this.getAttribute('data-symptom-id');
        if (this.checked) {
          if (_data.symptoms.indexOf(sid) === -1) _data.symptoms.push(sid);
        } else {
          _data.symptoms = _data.symptoms.filter(function (v) { return v !== sid; });
        }
        _evaluateCriteria();
      });
    });

    /* 初回判定 */
    _evaluateCriteria();
  }

  /** vitals/blood/symptoms をフラットオブジェクトに変換（CriteriaEngine用） */
  function _flattenCriteriaData() {
    var v = _data.vitals || {};
    var b = _data.blood || {};
    var evalData = { symptoms: _data.symptoms || [] };
    if (v.hr)   evalData.hr   = parseFloat(v.hr);
    if (v.sbp)  evalData.sbp  = parseFloat(v.sbp);
    if (v.dbp)  evalData.dbp  = parseFloat(v.dbp);
    if (v.spo2) evalData.spo2 = parseFloat(v.spo2);
    if (v.temp) evalData.temp = parseFloat(v.temp);
    if (b.hb)   evalData.hb   = parseFloat(b.hb);
    if (b.plt)  evalData.plt  = parseFloat(b.plt);
    if (b.wbc)  evalData.wbc  = parseFloat(b.wbc);
    return evalData;
  }

  function _evaluateCriteria() {
    var area = document.getElementById('criteria-result-area');
    if (!area) return;

    /* CriteriaEngine が存在すれば使用、なければローカル簡易判定 */
    var result;
    if (typeof CriteriaEngine !== 'undefined' && CriteriaEngine.evaluate) {
      result = CriteriaEngine.evaluate(_flattenCriteriaData());
    } else {
      result = _localEvaluate();
    }

    var badgeCls, badgeLabel, badgeIcon;
    if (result.level === 'stop') {
      badgeCls = 'criteria-stop';
      badgeLabel = '運動中止';
      badgeIcon = '&#x1F6D1;';
    } else if (result.level === 'caution') {
      badgeCls = 'criteria-caution';
      badgeLabel = '軽運動のみ可';
      badgeIcon = '&#x26A0;&#xFE0F;';
    } else {
      badgeCls = 'criteria-ok';
      badgeLabel = '通常運動 OK';
      badgeIcon = '&#x2705;';
    }

    var html = '<div class="card">' +
      '<div class="criteria-badge ' + badgeCls + '">' + badgeIcon + ' ' + badgeLabel + '</div>';

    if (result.reasons && result.reasons.length > 0) {
      html += '<ul class="criteria-reasons">';
      result.reasons.forEach(function (r) {
        var cls = r.level === 'stop' ? 'reason-stop' : 'reason-caution';
        html += '<li class="' + cls + '">' + r.text + '</li>';
      });
      html += '</ul>';
    }

    html += '</div>';
    area.innerHTML = html;
  }

  /* ── ローカル簡易判定（CriteriaEngine未ロード時のフォールバック） ── */
  function _localEvaluate() {
    var reasons = [];
    var v = _data.vitals;
    var b = _data.blood;

    /* 中止基準 */
    if (v.hr && parseInt(v.hr) > 120)
      reasons.push({ level: 'stop', text: '安静時心拍数 > 120 bpm' });
    if (v.hr && parseInt(v.hr) < 40)
      reasons.push({ level: 'stop', text: '安静時心拍数 < 40 bpm' });
    if (v.sbp && parseInt(v.sbp) > 200)
      reasons.push({ level: 'stop', text: '収縮期血圧 > 200 mmHg' });
    if (v.sbp && parseInt(v.sbp) < 80)
      reasons.push({ level: 'stop', text: '収縮期血圧 < 80 mmHg' });
    if (v.spo2 && parseFloat(v.spo2) < 88)
      reasons.push({ level: 'stop', text: 'SpO2 < 88%' });
    if (v.temp && parseFloat(v.temp) >= 38.5)
      reasons.push({ level: 'stop', text: '体温 ≧ 38.5℃' });
    if (b.hb && parseFloat(b.hb) < 7)
      reasons.push({ level: 'stop', text: 'Hb < 7 g/dL' });
    if (b.plt && parseFloat(b.plt) < 2)
      reasons.push({ level: 'stop', text: '血小板数 < 2万/μL' });

    /* 中止: 自覚症状（安静時呼吸困難, 胸痛, 意識障害, 起き上がれない倦怠感） */
    ['restDyspnea', 'chestPain', 'consciousness', 'severeFatigue'].forEach(function (sid) {
      if (_data.symptoms.indexOf(sid) !== -1) {
        var item = SYMPTOM_CHECKLIST.find(function (s) { return s.id === sid; });
        reasons.push({ level: 'stop', text: item ? item.label : sid });
      }
    });

    /* 注意基準 */
    if (v.hr && parseInt(v.hr) > 100 && parseInt(v.hr) <= 120)
      reasons.push({ level: 'caution', text: '安静時心拍数 100-120 bpm' });
    if (v.spo2 && parseFloat(v.spo2) >= 88 && parseFloat(v.spo2) < 93)
      reasons.push({ level: 'caution', text: 'SpO2 88-92%' });
    if (v.temp && parseFloat(v.temp) >= 37.5 && parseFloat(v.temp) < 38.5)
      reasons.push({ level: 'caution', text: '体温 37.5-38.4℃' });
    if (b.hb && parseFloat(b.hb) >= 7 && parseFloat(b.hb) < 8)
      reasons.push({ level: 'caution', text: 'Hb 7-8 g/dL' });
    if (b.plt && parseFloat(b.plt) >= 2 && parseFloat(b.plt) < 5)
      reasons.push({ level: 'caution', text: '血小板数 2-5万/μL' });
    if (b.wbc && parseInt(b.wbc) < 2000)
      reasons.push({ level: 'caution', text: '白血球数 < 2000/μL' });

    /* 注意: 自覚症状 */
    ['dizziness', 'nausea', 'boneMetastasis', 'lowFever'].forEach(function (sid) {
      if (_data.symptoms.indexOf(sid) !== -1) {
        var item = SYMPTOM_CHECKLIST.find(function (s) { return s.id === sid; });
        reasons.push({ level: 'caution', text: item ? item.label : sid });
      }
    });

    /* 判定レベル */
    var hasStop = reasons.some(function (r) { return r.level === 'stop'; });
    var hasCaution = reasons.some(function (r) { return r.level === 'caution'; });
    var level = hasStop ? 'stop' : hasCaution ? 'caution' : 'ok';

    return { level: level, reasons: reasons };
  }

  /* ================================================================
     Step 5 — 確認画面
     ================================================================ */

  function _renderStep5() {
    var html = '';

    /* ── Step 1: 基本情報 ── */
    html += '<div class="card confirm-section">' +
      '<div class="confirm-section-header">' +
        '<div class="confirm-section-title">&#x1F464; 基本情報</div>' +
        '<button class="confirm-edit-btn" data-step="1">編集</button>' +
      '</div>' +
      _confirmRow('年代', _ageLabel(_data.age)) +
      _confirmRow('性別', _sexLabel(_data.sex)) +
      _confirmRow('身長', _data.height ? _data.height + ' cm' : '未入力') +
      _confirmRow('体重', _data.weight ? _data.weight + ' kg' : '未入力') +
      _confirmRow('BMI', _bmiDisplay()) +
      _confirmRow('記入者', _recorderLabel(_data.recorder)) +
    '</div>';

    /* ── Step 2: ESAS-r-J ── */
    html += '<div class="card confirm-section">' +
      '<div class="confirm-section-header">' +
        '<div class="confirm-section-title">&#x1F4CB; ESAS-r-J</div>' +
        '<button class="confirm-edit-btn" data-step="2">編集</button>' +
      '</div>';

    ESAS_ITEMS.forEach(function (item) {
      var v = _data.esas[item.key] || 0;
      html += _confirmRow(item.label, '<span class="' + _nrsColorClass(v) + '">' + v + '</span>');
    });

    var esasT = _esasTotal();
    html += _confirmRow('<strong>合計</strong>', '<strong class="' + _esasTotalColorClass(esasT) + '">' + esasT + ' / 100（' + _esasTotalLabel(esasT) + '）</strong>');
    if (_data.painLocations.length > 0) {
      html += _confirmRow('痛みの部位', _data.painLocations.length + '箇所マーク済み');
    }
    html += '</div>';

    /* ── Step 3: SARC-F ── */
    html += '<div class="card confirm-section">' +
      '<div class="confirm-section-header">' +
        '<div class="confirm-section-title">&#x1F4AA; SARC-F</div>' +
        '<button class="confirm-edit-btn" data-step="3">編集</button>' +
      '</div>';

    SARCF_QUESTIONS.forEach(function (q) {
      var v = _data.sarcf[q.key];
      var label = v !== '' && v !== undefined ? v + '点' : '未回答';
      html += _confirmRow(q.label, label);
    });

    var sarcfT = _sarcfTotal();
    var isRisk = sarcfT >= 4;
    html += _confirmRow('<strong>合計</strong>', '<strong>' + sarcfT + ' / 10</strong>');
    if (isRisk) {
      html += '<div class="notice notice-danger" style="margin-top:0.5rem;">&#x26A0;&#xFE0F; サルコペニアの可能性あり</div>';
    }
    if (_data.calfCircumference) {
      html += _confirmRow('下腿周囲長', _data.calfCircumference + ' cm');
    }
    html += '</div>';

    /* ── Step 4: 運動中止基準 ── */
    html += '<div class="card confirm-section">' +
      '<div class="confirm-section-header">' +
        '<div class="confirm-section-title">&#x1F6A8; 運動中止基準</div>' +
        '<button class="confirm-edit-btn" data-step="4">編集</button>' +
      '</div>';

    /* バイタル */
    html += _confirmRow('心拍数', _data.vitals.hr ? _data.vitals.hr + ' bpm' : '未入力');
    html += _confirmRow('収縮期血圧', _data.vitals.sbp ? _data.vitals.sbp + ' mmHg' : '未入力');
    html += _confirmRow('拡張期血圧', _data.vitals.dbp ? _data.vitals.dbp + ' mmHg' : '未入力');
    html += _confirmRow('SpO2', _data.vitals.spo2 ? _data.vitals.spo2 + '%' : '未入力');
    html += _confirmRow('体温', _data.vitals.temp ? _data.vitals.temp + '℃' : '未入力');

    /* 血液データ */
    if (_data.blood.hb || _data.blood.plt || _data.blood.wbc) {
      html += '<div style="margin-top:0.5rem;margin-bottom:0.3rem;font-size:0.82rem;color:#636E72;font-weight:600;">血液データ</div>';
      if (_data.blood.hb) html += _confirmRow('Hb', _data.blood.hb + ' g/dL');
      if (_data.blood.plt) html += _confirmRow('血小板数', _data.blood.plt + ' 万/μL');
      if (_data.blood.wbc) html += _confirmRow('白血球数', _data.blood.wbc + ' /μL');
    }

    /* 自覚症状 */
    if (_data.symptoms.length > 0) {
      html += '<div style="margin-top:0.5rem;margin-bottom:0.3rem;font-size:0.82rem;color:#636E72;font-weight:600;">自覚症状</div>';
      _data.symptoms.forEach(function (sid) {
        var item = SYMPTOM_CHECKLIST.find(function (s) { return s.id === sid; });
        html += _confirmRow('', '&#x26A0;&#xFE0F; ' + (item ? item.label : sid));
      });
    }

    /* 判定バッジ */
    var cResult;
    if (typeof CriteriaEngine !== 'undefined' && CriteriaEngine.evaluate) {
      cResult = CriteriaEngine.evaluate(_flattenCriteriaData());
    } else {
      cResult = _localEvaluate();
    }

    var badgeCls, badgeLabel, badgeIcon;
    if (cResult.level === 'stop') {
      badgeCls = 'criteria-stop'; badgeLabel = '運動中止'; badgeIcon = '&#x1F6D1;';
    } else if (cResult.level === 'caution') {
      badgeCls = 'criteria-caution'; badgeLabel = '軽運動のみ可'; badgeIcon = '&#x26A0;&#xFE0F;';
    } else {
      badgeCls = 'criteria-ok'; badgeLabel = '通常運動 OK'; badgeIcon = '&#x2705;';
    }
    html += '<div class="criteria-badge ' + badgeCls + '" style="margin-top:0.75rem;">' + badgeIcon + ' ' + badgeLabel + '</div>';
    html += '</div>';

    /* 注意事項 */
    html += '<div class="notice notice-info">&#x2139;&#xFE0F; 入力内容に誤りがないか確認してください。各セクションの「編集」ボタンから修正できます。</div>';

    return html;
  }

  function _bindStep5() {
    document.querySelectorAll('.confirm-edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = this.getAttribute('data-step');
        Router.navigate('wizard', { step: step });
      });
    });
  }

  /* ── 確認画面ヘルパー ── */
  function _confirmRow(label, value) {
    return '<div class="confirm-row">' +
      '<span class="confirm-row-label">' + label + '</span>' +
      '<span class="confirm-row-value">' + (value || '—') + '</span>' +
    '</div>';
  }

  function _ageLabel(v) {
    if (!v) return '未選択';
    return v === '90' ? '90代以上' : v + '代';
  }

  function _sexLabel(v) {
    if (v === 'male') return '男性';
    if (v === 'female') return '女性';
    return '未選択';
  }

  function _recorderLabel(v) {
    var map = { patient: '患者本人', family: '家族', hcp: '医療従事者', assisted: '手伝い+患者記入' };
    return map[v] || '未選択';
  }

  function _bmiDisplay() {
    var bmi = _calcBMI(parseFloat(_data.height), parseFloat(_data.weight));
    if (!bmi) return '—';
    var cat = _bmiCategory(bmi);
    return bmi.toFixed(1) + '（' + cat.label + '）';
  }

  /* ================================================================
     メインrender
     ================================================================ */

  function render(params) {
    var step = parseInt((params && params.step) || '1', 10);
    if (step < 1) step = 1;
    if (step > TOTAL_STEPS) step = TOTAL_STEPS;

    var app = document.getElementById('app');
    app.classList.remove('result-mode');

    var body = '';
    switch (step) {
      case 1: body = _renderStep1(); break;
      case 2: body = _renderStep2(); break;
      case 3: body = _renderStep3(); break;
      case 4: body = _renderStep4(); break;
      case 5: body = _renderStep5(); break;
    }

    app.innerHTML =
      '<div class="fade-in">' +
        _progressBar(step) +
        body +
        _nav(step) +
      '</div>';

    /* スクロールトップ */
    window.scrollTo(0, 0);

    /* ステップ別バインド */
    switch (step) {
      case 1: _bindStep1(); break;
      case 2: _bindStep2(); break;
      case 3: _bindStep3(); break;
      case 4: _bindStep4(); break;
      case 5: _bindStep5(); break;
    }

    /* ナビゲーション共通バインド */
    _bindNav(step);
  }

  return {
    render: render,
    _data: _data
  };
})();
