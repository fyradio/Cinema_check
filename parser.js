/* 開眼電影網 戲院場次頁解析器
 * 不依賴網頁的 class/id，只看內容順序：
 *   日期標題 → 片名連結(/movie/xxx/) → 分級圖 cer_X → 片長 → 版本 → 場次時間 → 「其他戲院」連結
 * 瀏覽器與 Node 共用。
 */
(function (root) {
  'use strict';

  var TIME_RE = /(\d{1,2})\s*[：:]\s*(\d{2})/g;
  var RATING = { G: '普', P: '護', PG: '輔12', F2: '輔12', PG15: '輔15', F5: '輔15', R: '限' };

  function decode(s) {
    return s
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); })
      .replace(/&#x([0-9a-f]+);/gi, function (m, n) { return String.fromCharCode(parseInt(n, 16)); })
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }

  function onlyTimes(t) {
    TIME_RE.lastIndex = 0;
    if (!TIME_RE.test(t)) return null;
    if (t.replace(TIME_RE, '').replace(/[\s,、|/]/g, '') !== '') return null;
    var out = [], m;
    TIME_RE.lastIndex = 0;
    while ((m = TIME_RE.exec(t))) out.push(('0' + m[1]).slice(-2) + ':' + m[2]);
    return out;
  }

  function parse(html) {
    html = String(html)
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(script|style|noscript|iframe|select|textarea)\b[\s\S]*?<\/\1\s*>/gi, '');

    var re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)/g;
    var m, date = null, updated = null, cur = null, link = null, list = [];

    function finish() {
      if (cur && cur.times.length) list.push(cur);
      cur = null;
    }

    function onText(t) {
      if (/更新時間/.test(t)) {
        var u = /(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/.exec(t);
        if (u) updated = u[1] + '-' + ('0' + u[2]).slice(-2) + '-' + ('0' + u[3]).slice(-2) + ' ' + ('0' + u[4]).slice(-2) + ':' + u[5];
        finish();
        return;
      }
      var d = /^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(t);
      if (d) {
        finish();
        date = d[1] + '-' + ('0' + d[2]).slice(-2) + '-' + ('0' + d[3]).slice(-2);
        return;
      }
      if (!cur) return;
      var rt = /片長\s*[：:]\s*(\d+)/.exec(t);
      if (rt) { cur.runtime = +rt[1]; return; }
      var ts = onlyTimes(t);
      if (ts) { Array.prototype.push.apply(cur.times, ts); return; }
      if (!cur.times.length && t.length <= 24 && cur.versions.indexOf(t) < 0) cur.versions.push(t);
    }

    function onLink(href, text) {
      if (/^其他戲院/.test(text)) { finish(); return; }
      var mv = /\/movie\/([a-z0-9]+)\/?/i.exec(href);
      if (mv && text) {
        if (cur && cur.id === mv[1] && !cur.times.length && !cur.versions.length) return;
        finish();
        cur = { id: mv[1], title: text, date: date, rating: '', runtime: 0, versions: [], times: [] };
        return;
      }
      if (cur && text) {
        var ts = onlyTimes(text);
        if (ts) Array.prototype.push.apply(cur.times, ts);
      }
    }

    while ((m = re.exec(html))) {
      if (m[4] !== undefined) {
        var t = decode(m[4]).replace(/\s+/g, ' ').trim();
        if (!t) continue;
        if (link) link.text += (link.text ? ' ' : '') + t;
        else onText(t);
        continue;
      }
      var closing = m[1] === '/', tag = m[2].toLowerCase(), attrs = m[3] || '';
      if (tag === 'a') {
        if (!closing) {
          if (link) onLink(link.href, link.text.trim());
          var h = /href\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
          link = { href: h ? decode(h[1]) : '', text: '' };
        } else if (link) {
          onLink(link.href, link.text.trim());
          link = null;
        }
      } else if (tag === 'img' && cur) {
        var s = /src\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
        var r = s && /cer_([A-Za-z0-9]+)\./.exec(s[1]);
        if (r) cur.rating = r[1].toUpperCase();
      }
    }
    finish();

    var movies = list.map(function (b) {
      return {
        id: b.id,
        title: b.title,
        date: b.date,
        rating: b.rating,
        ratingLabel: RATING[b.rating] || '',
        runtime: b.runtime,
        version: b.versions.join(' '),
        times: b.times
      };
    });
    return { date: date, updated: updated, movies: movies };
  }

  var api = { parse: parse };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtParser = api;
})(typeof self !== 'undefined' ? self : this);
