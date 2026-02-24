/* ======================================================
   router.js — ハッシュベースSPAルーター
   #top / #wizard?step=1 / #result / #history
   ====================================================== */
'use strict';

var Router = (function () {

  var _routes = {};
  var _current = { path: '', params: {} };
  var _defaultRoute = 'top';

  function on(path, handler) {
    _routes[path] = handler;
  }

  function navigate(path, params) {
    var hash = '#' + path;
    if (params) {
      var qs = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }).join('&');
      if (qs) hash += '?' + qs;
    }
    window.location.hash = hash;
  }

  function back() {
    window.history.back();
  }

  function current() {
    return { path: _current.path, params: _current.params };
  }

  function _parseHash() {
    var hash = window.location.hash.replace(/^#\/?/, '');
    var parts = hash.split('?');
    var path = parts[0] || _defaultRoute;
    var params = {};
    if (parts[1]) {
      parts[1].split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return { path: path, params: params };
  }

  function _dispatch() {
    var parsed = _parseHash();
    _current = parsed;
    var handler = _routes[parsed.path];
    if (handler) {
      handler(parsed.params);
    } else if (_routes[_defaultRoute]) {
      _current = { path: _defaultRoute, params: {} };
      _routes[_defaultRoute]({});
    }
  }

  function start() {
    window.addEventListener('hashchange', _dispatch);
    _dispatch();
  }

  return {
    on: on,
    navigate: navigate,
    back: back,
    current: current,
    start: start
  };
})();
