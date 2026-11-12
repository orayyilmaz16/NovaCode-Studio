'use strict';
// NovaCode metin buffer'ı: piece table + artımlı satır indeksi + geri alma/yineleme.
//
// Kapsam: ana süreçteki düzenleme işleri (ajanın satır tabanlı düzenleme aracı gibi). Editördeki metin modeli Monaco'nun
// kendi buffer'ında kalır; bu motor onun yerine geçmez. Bağımlılık yok, saf JS.
//
// Konum kuralları: satır ve sütun 1 tabanlıdır (Monaco ile aynı); sütun, satır başından UTF-16 birimi + 1'dir.
// Satır sonu: \n, \r\n ve tek \r satır sonu sayılır; metin olduğu gibi saklanır (otomatik dönüştürme yalnızca normalizeEol ile).

const MAX_HISTORY = 200;

class TextBuffer {
  constructor(text = '') {
    this._orig = String(text);
    this._add = '';
    this._pieces = this._orig.length ? [{ buf: 0, start: 0, len: this._orig.length }] : [];
    this._length = this._orig.length;
    this._lineStarts = null; // tembel: ilk sorguda kurulur, sonra artımlı güncellenir
    this._undo = [];
    this._redo = [];
    this.version = 1;
  }

  // ---------- Okuma ----------
  get length() { return this._length; }

  _slice(p, a, b) { return (p.buf === 0 ? this._orig : this._add).slice(p.start + a, p.start + b); }

  getText() { return this.getTextInRange(0, this._length); }

  getTextInRange(start, end) {
    start = Math.max(0, Math.min(start, this._length));
    end = Math.max(start, Math.min(end, this._length));
    let out = '';
    let pos = 0;
    for (const p of this._pieces) {
      const pEnd = pos + p.len;
      if (pEnd > start && pos < end) out += this._slice(p, Math.max(start, pos) - pos, Math.min(end, pEnd) - pos);
      if (pEnd >= end) break;
      pos = pEnd;
    }
    return out;
  }

  // ---------- Satır indeksi ----------
  static _scanStarts(text, base) {
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c === 10) out.push(base + i + 1);
      else if (c === 13) {
        if (text.charCodeAt(i + 1) === 10) i++;
        out.push(base + i + 1);
      }
    }
    return out;
  }

  _starts() {
    if (!this._lineStarts) this._lineStarts = [0, ...TextBuffer._scanStarts(this.getText(), 0)];
    return this._lineStarts;
  }

  get lineCount() { return this._starts().length; }

  /** Satırın metni (satır sonu hariç). 1 tabanlı. */
  getLine(n) {
    const s = this._starts();
    if (n < 1 || n > s.length) return '';
    const a = s[n - 1];
    let b = n < s.length ? s[n] : this._length;
    let t = this.getTextInRange(a, b);
    return t.replace(/(\r\n|\n|\r)$/, '');
  }

  /** Satır sonu dahil, [a,b) ofset aralığı. */
  lineRange(n) {
    const s = this._starts();
    return [s[n - 1], n < s.length ? s[n] : this._length];
  }

  positionAt(offset) {
    offset = Math.max(0, Math.min(offset, this._length));
    const s = this._starts();
    let lo = 0, hi = s.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (s[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return { line: lo + 1, column: offset - s[lo] + 1 };
  }

  offsetAt(line, column) {
    const s = this._starts();
    if (line < 1) return 0;
    if (line > s.length) return this._length;
    const a = s[line - 1];
    const lineEnd = (line < s.length ? s[line] : this._length);
    // sütun satır sonu karakterlerinin içine taşamaz
    const text = this.getTextInRange(a, lineEnd).replace(/(\r\n|\n|\r)$/, '');
    return a + Math.max(0, Math.min(column - 1, text.length));
  }

  // ---------- Düzenleme çekirdeği ----------
  _locate(offset) {
    let pos = 0;
    for (let i = 0; i < this._pieces.length; i++) {
      const p = this._pieces[i];
      if (offset < pos + p.len || (offset === pos + p.len && i === this._pieces.length - 1)) return { i, inner: offset - pos };
      pos += p.len;
    }
    return { i: this._pieces.length, inner: 0 };
  }

  _rawReplace(start, end, text) {
    // 1) silinecek aralığı kes
    if (end > start) {
      const a = this._locate(start);
      const b = this._locate(end);
      const next = [];
      for (let i = 0; i < this._pieces.length; i++) {
        const p = this._pieces[i];
        if (i === a.i && i === b.i) {
          if (a.inner > 0) next.push({ buf: p.buf, start: p.start, len: a.inner });
          if (b.inner < p.len) next.push({ buf: p.buf, start: p.start + b.inner, len: p.len - b.inner });
        } else if (i === a.i) {
          if (a.inner > 0) next.push({ buf: p.buf, start: p.start, len: a.inner });
        } else if (i === b.i) {
          if (b.inner < p.len) next.push({ buf: p.buf, start: p.start + b.inner, len: p.len - b.inner });
        } else if (i < a.i || i > b.i) next.push(p);
      }
      this._pieces = next;
      this._length -= end - start;
    }
    // 2) eklenecek metni ekle
    if (text.length) {
      const piece = { buf: 1, start: this._add.length, len: text.length };
      this._add += text;
      const at = this._locate(start);
      if (at.i >= this._pieces.length) this._pieces.push(piece);
      else {
        const p = this._pieces[at.i];
        if (at.inner === 0) this._pieces.splice(at.i, 0, piece);
        else if (at.inner >= p.len) this._pieces.splice(at.i + 1, 0, piece);
        else this._pieces.splice(at.i, 1, { buf: p.buf, start: p.start, len: at.inner }, piece, { buf: p.buf, start: p.start + at.inner, len: p.len - at.inner });
      }
      this._length += text.length;
    }
    // 3) satır indeksini artımlı güncelle (kurulmuşsa)
    if (this._lineStarts) this._updateStarts(start, end, text);
    this.version++;
    this._compact();
  }

  _updateStarts(start, end, text) {
    const s = this._lineStarts;
    const delta = text.length - (end - start);
    // \r\n çiftinin ortasından bölünme/birleşme ihtimali için sınır satırları yeniden taranır
    const first = Math.max(0, this._firstAtOrAfter(Math.max(0, start - 1)) - 1);
    let lastIdx = this._firstAtOrAfter(end + 2);
    const before = s.slice(0, first);
    const after = s.slice(lastIdx).map((x) => x + delta);
    const scanFrom = first === 0 ? 0 : s[first - 1];
    const scanTo = (after.length ? after[0] : this._length);
    const middle = TextBuffer._scanStarts(this.getTextInRange(scanFrom, scanTo), scanFrom).filter((x) => x < scanTo || x === scanTo);
    const merged = [0];
    const seen = new Set([0]);
    for (const v of [...before, ...middle, ...after]) if (!seen.has(v) && v <= this._length) { seen.add(v); merged.push(v); }
    merged.sort((x, y) => x - y);
    this._lineStarts = merged;
  }

  _firstAtOrAfter(offset) {
    const s = this._lineStarts;
    let lo = 0, hi = s.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (s[mid] < offset) lo = mid + 1; else hi = mid; }
    return lo;
  }

  _compact() {
    // çok parçalanınca (ör. çok sayıda tek karakterlik ekleme) tek parçaya indir
    if (this._pieces.length > 4096) {
      const text = this.getText();
      this._orig = text;
      this._add = '';
      this._pieces = text.length ? [{ buf: 0, start: 0, len: text.length }] : [];
    }
  }

  // ---------- Genel düzenleme API'si ----------
  /** Tek düzenleme (ofset). Geri alma kaydı tutar. */
  replace(start, end, text) { return this.applyOffsetEdits([{ start, end, text }]); }
  insert(offset, text) { return this.replace(offset, offset, text); }
  delete(start, end) { return this.replace(start, end, ''); }

  /**
   * Birden çok düzenlemeyi **atomik** uygular: hepsi özgün metne göre konumlanır, çakışmamalıdır.
   * Geçersiz aralık/çakışma varsa hiçbir şey değişmez ve hata fırlatır.
   */
  applyOffsetEdits(edits, { record = true } = {}) {
    const list = edits.map((e) => ({ start: e.start, end: e.end, text: String(e.text ?? '') }));
    for (const e of list) {
      if (!Number.isInteger(e.start) || !Number.isInteger(e.end) || e.start < 0 || e.end < e.start || e.end > this._length) throw new RangeError('Geçersiz düzenleme aralığı');
    }
    list.sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 1; i < list.length; i++) if (list[i].start < list[i - 1].end) throw new RangeError('Düzenlemeler çakışıyor');
    const inverse = [];
    // sondan başa uygula: önceki ofsetler bozulmaz
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      const removed = this.getTextInRange(e.start, e.end);
      this._rawReplace(e.start, e.end, e.text);
      inverse.push({ start: e.start, end: e.start + e.text.length, text: removed });
    }
    if (record && list.length) {
      this._undo.push(inverse);
      if (this._undo.length > MAX_HISTORY) this._undo.shift();
      this._redo = [];
    }
    return this.version;
  }

  /** Konum (satır/sütun) tabanlı atomik düzenleme. Konumlar özgün metne göredir. */
  applyEdits(edits) {
    const off = edits.map((e) => ({
      start: this.offsetAt(e.startLine, e.startColumn),
      end: this.offsetAt(e.endLine, e.endColumn),
      text: e.text
    }));
    return this.applyOffsetEdits(off);
  }

  /**
   * Satır aralığını değiştirir (1 tabanlı, uçlar dahil). endLine = startLine - 1 → startLine'dan önce ekleme.
   * text sonunda satır sonu yoksa ve aralık satırları kapsıyorsa satır sonu korunur (belge sonu hariç).
   */
  static linesEdit(buf, { startLine, endLine, text }) {
    const n = buf.lineCount;
    if (!Number.isInteger(startLine) || !Number.isInteger(endLine) || startLine < 1 || startLine > n + 1 || endLine < startLine - 1 || endLine > n) {
      throw new RangeError(`Geçersiz satır aralığı ${startLine}-${endLine} (dosya ${n} satır)`);
    }
    const eol = buf.detectEol();
    const body = String(text ?? '').replace(/\r\n|\r|\n/g, eol);
    // Son satırın ardına ekleme (startLine = n + 1): son satır boş değilse araya satır sonu girer, sonda eklenmez
    if (startLine === n + 1 && endLine < startLine) {
      return { start: buf.length, end: buf.length, text: (buf.length ? eol : '') + body };
    }
    const startOff = buf.lineRange(startLine)[0];
    const endOff = endLine < startLine ? startOff : buf.lineRange(endLine)[1];
    const replacingTail = endOff === buf.length && endLine >= startLine;
    const needsEol = body.length > 0 && !replacingTail && !/(\r\n|\n|\r)$/.test(body);
    return { start: startOff, end: endOff, text: body + (needsEol ? eol : '') };
  }

  /** Satır tabanlı düzenlemelerin hepsini atomik uygular (satır numaraları özgün metne göre). */
  applyLineEdits(lineEdits) {
    const edits = lineEdits.map((e) => TextBuffer.linesEdit(this, e));
    return this.applyOffsetEdits(edits);
  }

  // ---------- Geri alma / yineleme ----------
  get canUndo() { return this._undo.length > 0; }
  get canRedo() { return this._redo.length > 0; }

  undo() {
    const op = this._undo.pop();
    if (!op) return false;
    this._redo.push(this._applyInverse(op));
    return true;
  }

  redo() {
    const op = this._redo.pop();
    if (!op) return false;
    this._undo.push(this._applyInverse(op));
    return true;
  }

  _applyInverse(inverse) {
    // Kayıt, düzenlemelerin uygulandığı sırayla tutulur ve her öğenin konumu o anki belge durumuna göredir.
    // Geri almak için kayıt TERS sırayla uygulanır; sonuçta karşıt (yineleme) kaydı aynı kuralla oluşur.
    const redo = [];
    for (let i = inverse.length - 1; i >= 0; i--) {
      const e = inverse[i];
      const removed = this.getTextInRange(e.start, e.end);
      this._rawReplace(e.start, e.end, e.text);
      redo.push({ start: e.start, end: e.start + e.text.length, text: removed });
    }
    return redo;
  }

  // ---------- Satır sonu ----------
  /** Baskın satır sonu: ilk bulunan; yoksa \n. */
  detectEol() {
    const m = /\r\n|\n|\r/.exec(this.getText().slice(0, 1 << 16));
    return m ? m[0] : '\n';
  }

  /** Tüm satır sonlarını verilen biçime çevirir (geri alınabilir). */
  normalizeEol(eol = '\n') {
    const text = this.getText();
    const next = text.replace(/\r\n|\r|\n/g, eol);
    if (next === text) return false;
    this.replace(0, this._length, next);
    return true;
  }
}

module.exports = { TextBuffer };
