/* ======================================================
   chart-renderer.js — ESAS-r-J レーダーチャート描画
   Canvas 2D API のみ使用（外部ライブラリなし）
   ====================================================== */
'use strict';

var ChartRenderer = (function () {

  var labels = [
    '痛み', 'だるさ', '眠気', '吐き気', '食欲不振',
    '息苦しさ', '気分の落ち込み', '不安', 'その他', '全体的な調子'
  ];
  var keys = [
    'pain', 'fatigue', 'drowsiness', 'nausea', 'appetite',
    'dyspnea', 'depression', 'anxiety', 'other', 'wellbeing'
  ];

  var AXIS_COUNT = 10;
  var MAX_SCORE = 10;
  var CANVAS_SIZE = 300;

  /* --------------------------------------------------
     renderRadar — メイン描画
     scores = { pain:3, fatigue:5, ... }
     -------------------------------------------------- */
  function renderRadar(canvasId, scores) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = CANVAS_SIZE + 'px';
    canvas.style.height = CANVAS_SIZE + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var cx = CANVAS_SIZE / 2;
    var cy = CANVAS_SIZE / 2;
    var radius = 100; // データ描画用の最大半径

    // 各軸の角度（12時方向を0として時計回り）
    var angles = [];
    for (var i = 0; i < AXIS_COUNT; i++) {
      angles.push((Math.PI * 2 * i / AXIS_COUNT) - Math.PI / 2);
    }

    // --- 背景: 同心円（スコア3, 6, 10に対応） ---
    _drawConcentricCircles(ctx, cx, cy, radius);

    // --- 軸線 ---
    _drawAxes(ctx, cx, cy, radius, angles);

    // --- データ多角形 ---
    _drawDataPolygon(ctx, cx, cy, radius, angles, scores);

    // --- 各頂点の点 ---
    _drawDataPoints(ctx, cx, cy, radius, angles, scores);

    // --- ラベル ---
    _drawLabels(ctx, cx, cy, radius, angles);
  }

  /* --------------------------------------------------
     同心円描画（スコア 3, 6, 10 に対応）
     -------------------------------------------------- */
  function _drawConcentricCircles(ctx, cx, cy, radius) {
    var levels = [3, 6, 10];
    ctx.save();
    ctx.strokeStyle = '#D5D8DC';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);

    for (var li = 0; li < levels.length; li++) {
      var r = (levels[li] / MAX_SCORE) * radius;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // スコア値をラベルとして小さく表示（右側）
      ctx.save();
      ctx.setLineDash([]);
      ctx.fillStyle = '#B2BEC3';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(levels[li]), cx + r + 2, cy);
      ctx.restore();
    }

    ctx.restore();
  }

  /* --------------------------------------------------
     軸線描画
     -------------------------------------------------- */
  function _drawAxes(ctx, cx, cy, radius, angles) {
    ctx.save();
    ctx.strokeStyle = '#DFE6E9';
    ctx.lineWidth = 0.6;
    ctx.setLineDash([]);

    for (var i = 0; i < AXIS_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angles[i]) * radius,
        cy + Math.sin(angles[i]) * radius
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  /* --------------------------------------------------
     データ多角形描画
     -------------------------------------------------- */
  function _drawDataPolygon(ctx, cx, cy, radius, angles, scores) {
    ctx.save();

    ctx.beginPath();
    for (var i = 0; i < AXIS_COUNT; i++) {
      var val = (scores[keys[i]] || 0);
      var r = (val / MAX_SCORE) * radius;
      var x = cx + Math.cos(angles[i]) * r;
      var y = cy + Math.sin(angles[i]) * r;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // 塗り
    ctx.fillStyle = 'rgba(46, 139, 106, 0.2)';
    ctx.fill();

    // 線
    ctx.strokeStyle = 'rgba(46, 139, 106, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /* --------------------------------------------------
     データ頂点の点描画
     -------------------------------------------------- */
  function _drawDataPoints(ctx, cx, cy, radius, angles, scores) {
    ctx.save();

    for (var i = 0; i < AXIS_COUNT; i++) {
      var val = (scores[keys[i]] || 0);
      var r = (val / MAX_SCORE) * radius;
      var x = cx + Math.cos(angles[i]) * r;
      var y = cy + Math.sin(angles[i]) * r;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);

      if (val >= 7) {
        // 値7以上は赤丸
        ctx.fillStyle = '#E74C3C';
      } else {
        // それ以外は緑丸
        ctx.fillStyle = 'rgba(46, 139, 106, 0.9)';
      }
      ctx.fill();

      // 白い縁取り
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  /* --------------------------------------------------
     ラベル描画（各軸の外側に日本語表示）
     -------------------------------------------------- */
  function _drawLabels(ctx, cx, cy, radius, angles) {
    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#2D3436';

    var labelOffset = 18; // 軸端からのオフセット

    for (var i = 0; i < AXIS_COUNT; i++) {
      var angle = angles[i];
      var lx = cx + Math.cos(angle) * (radius + labelOffset);
      var ly = cy + Math.sin(angle) * (radius + labelOffset);

      // テキスト配置の調整
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);

      // 水平位置
      if (cosA > 0.3) {
        ctx.textAlign = 'left';
      } else if (cosA < -0.3) {
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }

      // 垂直位置
      if (sinA > 0.3) {
        ctx.textBaseline = 'top';
      } else if (sinA < -0.3) {
        ctx.textBaseline = 'bottom';
      } else {
        ctx.textBaseline = 'middle';
      }

      ctx.fillText(labels[i], lx, ly);
    }

    ctx.restore();
  }

  /* --------------------------------------------------
     Public API
     -------------------------------------------------- */
  return {
    renderRadar: renderRadar
  };

})();
