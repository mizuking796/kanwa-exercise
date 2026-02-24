/**
 * ExerciseRegistry — エクササイズ集約管理
 */
var ExerciseRegistry = (function () {
  var _exercises = [];
  var _byId = {};
  var _byCategory = {};

  function register(list) {
    list.forEach(function (ex) {
      if (_byId[ex.id]) return;
      _exercises.push(ex);
      _byId[ex.id] = ex;
      if (!_byCategory[ex.category]) _byCategory[ex.category] = [];
      _byCategory[ex.category].push(ex);
    });
  }

  function all() { return _exercises; }
  function count() { return _exercises.length; }
  function byId(id) { return _byId[id] || null; }
  function byCategory(cat) { return _byCategory[cat] || []; }
  function categories() { return Object.keys(_byCategory); }

  function filter(opts) {
    var pool = _exercises;
    if (opts.category) pool = pool.filter(function (e) { return e.category === opts.category; });
    if (opts.maxIntensity != null) pool = pool.filter(function (e) { return e.intensity <= opts.maxIntensity; });
    if (opts.chairOnly) pool = pool.filter(function (e) { return e.position === 'seated' || e.position === 'any'; });
    else if (opts.position) pool = pool.filter(function (e) { return e.position === opts.position || e.position === 'any'; });
    if (opts.excludeCategories) {
      pool = pool.filter(function (e) { return opts.excludeCategories.indexOf(e.category) === -1; });
    }
    if (opts.positionPreferred) {
      pool.sort(function (a, b) {
        var aM = (a.position === opts.positionPreferred || a.position === 'any') ? 0 : 1;
        var bM = (b.position === opts.positionPreferred || b.position === 'any') ? 0 : 1;
        return aM - bM;
      });
    }
    return pool;
  }

  return { register: register, all: all, count: count, byId: byId, byCategory: byCategory, categories: categories, filter: filter };
})();
