// Metin buffer'ı (piece table) testleri: basit metin modeline karşı rastgele (fuzz) düzenleme, atomiklik, geri alma/yineleme, satır düzenleme.
// Çalıştırma: node scripts/tests/textbuffer.test.cjs
const path = require('path');
const { TextBuffer } = require(path.join(__dirname, '..', '..', 'electron-textbuffer.cjs'));

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };

// Basit referans model
const refLines = (s) => {
  const out = [];
  let cur = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\n' || s[i] === '\r') {
      if (s[i] === '\r' && s[i + 1] === '\n') i++;
      out.push(s.slice(cur, i + 1).replace(/(\r\n|\n|\r)$/, ''));
      cur = i + 1;
    }
  }
  out.push(s.slice(cur));
  return out;
};

// xorshift: yinelenebilir rastgelelik
let seed = 123456789;
const rnd = (n) => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return Math.abs(seed) % n; };
const ALPHA = ['a', 'b', 'c', ' ', '\n', '\r', '\r\n', 'ğ', '🙂', 'xyz'];
const randText = (max) => { let t = ''; const k = rnd(max + 1); for (let i = 0; i < k; i++) t += ALPHA[rnd(ALPHA.length)]; return t; };

// --- 1) fuzz: ekleme/silme/değiştirme + satır indeksi ---
let fuzzOk = true;
for (let round = 0; round < 60 && fuzzOk; round++) {
  const init = randText(30);
  const buf = new TextBuffer(init);
  let ref = init;
  for (let step = 0; step < 120 && fuzzOk; step++) {
    const a = rnd(ref.length + 1);
    const b = Math.min(ref.length, a + rnd(6));
    const t = randText(5);
    buf.replace(a, b, t);
    ref = ref.slice(0, a) + t + ref.slice(b);
    if (buf.getText() !== ref) { fuzzOk = false; console.log('metin farklı', round, step); break; }
    const rl = refLines(ref);
    if (buf.lineCount !== rl.length) { fuzzOk = false; console.log('satır sayısı farklı', round, step, buf.lineCount, rl.length, JSON.stringify(ref)); break; }
    for (let l = 1; l <= rl.length; l++) if (buf.getLine(l) !== rl[l - 1]) { fuzzOk = false; console.log('satır farklı', round, step, l, JSON.stringify(ref)); break; }
    // ofset <-> konum gidiş-dönüş
    const o = rnd(ref.length + 1);
    const p = buf.positionAt(o);
    if (buf.offsetAt(p.line, p.column) !== o) {
      // \r\n ortasında (satır sonu karakterleri arasında) sütun sıkıştırılır; bu durum kabul
      const inEol = ref[o - 1] === '\r' && ref[o] === '\n';
      if (!inEol && o !== ref.length) { fuzzOk = false; console.log('konum gidiş-dönüş', round, step, o, p); }
    }
  }
}
ok(fuzzOk, 'fuzz: 60 tur × 120 düzenleme, metin ve satır indeksi basit modelle aynı');

// --- 2) geri alma / yineleme ---
{
  const b = new TextBuffer('merhaba dünya');
  b.replace(0, 7, 'selam');
  b.insert(b.length, '!');
  ok(b.getText() === 'selam dünya!', 'iki düzenleme');
  ok(b.undo() && b.getText() === 'selam dünya', 'geri al (1)');
  ok(b.undo() && b.getText() === 'merhaba dünya', 'geri al (2)');
  ok(!b.undo(), 'geri alınacak kalmadı');
  ok(b.redo() && b.redo() && b.getText() === 'selam dünya!', 'yinele ×2');
  b.undo();
  b.insert(0, 'X');
  ok(!b.canRedo, 'yeni düzenleme yineleme yığınını temizler');
}

// --- 3) atomik çoklu düzenleme ---
{
  const b = new TextBuffer('satır1\nsatır2\nsatır3\n');
  const v0 = b.getText();
  let threw = false;
  try { b.applyOffsetEdits([{ start: 0, end: 5, text: 'A' }, { start: 3, end: 8, text: 'B' }]); } catch { threw = true; }
  ok(threw && b.getText() === v0, 'çakışan düzenlemeler reddedilir, metin değişmez');
  threw = false;
  try { b.applyOffsetEdits([{ start: 0, end: 1, text: 'Z' }, { start: 99, end: 100, text: 'Q' }]); } catch { threw = true; }
  ok(threw && b.getText() === v0, 'geçersiz aralık reddedilir, ilk düzenleme de uygulanmaz');
  b.applyOffsetEdits([{ start: 0, end: 5, text: 'bir' }, { start: 7, end: 12, text: 'iki' }, { start: 14, end: 19, text: 'üç' }]);
  ok(b.getText() === 'bir1\niki2\nüç3\n', 'birden çok düzenleme özgün konumlara göre uygulanır: ' + JSON.stringify(b.getText()));
  ok(b.undo() && b.getText() === v0, 'çoklu düzenleme tek adımda geri alınır');
}

// --- 4) satır tabanlı düzenleme (ajan aracı) ---
{
  const b = new TextBuffer('a\nb\nc\nd\n');
  b.applyLineEdits([{ startLine: 2, endLine: 3, text: 'X\nY\nZ' }]);
  ok(b.getText() === 'a\nX\nY\nZ\nd\n', 'satır aralığı değiştirildi, satır sonu korundu');
  b.applyLineEdits([{ startLine: 1, endLine: 0, text: 'başlık' }]);
  ok(b.getText() === 'başlık\na\nX\nY\nZ\nd\n', 'başa ekleme (endLine = startLine - 1)');
  b.applyLineEdits([{ startLine: 7, endLine: 6, text: 'son' }]);
  ok(b.getText() === 'başlık\na\nX\nY\nZ\nd\nson\n', 'sondaki boş satırdan önce ekleme');
  b.applyLineEdits([{ startLine: 2, endLine: 2, text: '' }, { startLine: 5, endLine: 5, text: 'Q' }]);
  ok(b.getText() === 'başlık\nX\nY\nQ\nd\nson\n', 'iki ayrı satır düzenlemesi özgün numaralara göre: ' + JSON.stringify(b.getText()));
  const noEol = new TextBuffer('a\nb');
  noEol.applyLineEdits([{ startLine: 3, endLine: 2, text: 'c' }]);
  ok(noEol.getText() === 'a\nb\nc', 'satır sonu olmayan dosyanın sonuna ekleme');
  let threw = false;
  try { b.applyLineEdits([{ startLine: 99, endLine: 99, text: '' }]); } catch { threw = true; }
  ok(threw, 'aralık dışı satır reddedilir');
  const crlf = new TextBuffer('a\r\nb\r\nc');
  crlf.applyLineEdits([{ startLine: 2, endLine: 2, text: 'B1\nB2' }]);
  ok(crlf.getText() === 'a\r\nB1\r\nB2\r\nc', 'CRLF dosyada eklenen satır sonları CRLF olur: ' + JSON.stringify(crlf.getText()));
}

// --- 5) konum API'si ve satır sonu ---
{
  const b = new TextBuffer('ab\r\ncd\nef');
  ok(b.lineCount === 3 && b.getLine(1) === 'ab' && b.getLine(2) === 'cd' && b.getLine(3) === 'ef', 'karışık satır sonları');
  const p = b.positionAt(5);
  ok(p.line === 2 && p.column === 2, 'positionAt: ' + JSON.stringify(p));
  ok(b.offsetAt(3, 2) === 8, 'offsetAt');
  ok(b.detectEol() === '\r\n', 'baskın satır sonu ilk bulunan');
  b.normalizeEol('\n');
  ok(b.getText() === 'ab\ncd\nef' && b.undo() && b.getText() === 'ab\r\ncd\nef', 'satır sonu normalleştirme geri alınabilir');
  b.applyEdits([{ startLine: 1, startColumn: 1, endLine: 1, endColumn: 3, text: 'XY' }, { startLine: 3, startColumn: 3, endLine: 3, endColumn: 3, text: '!' }]);
  ok(b.getText() === 'XY\r\ncd\nef!', 'konum tabanlı çoklu düzenleme');
}

// --- 6) büyük metin ve çok parça ---
{
  const big = ('x'.repeat(79) + '\n').repeat(20000);
  const t0 = Date.now();
  const b = new TextBuffer(big);
  for (let i = 0; i < 2000; i++) b.insert((i * 7919) % b.length, 'ab');
  const lc = b.lineCount;
  ok(lc === 20001 && Date.now() - t0 < 8000, `1,6 MB metinde 2000 ekleme ${Date.now() - t0} ms, satır sayısı ${lc}`);
  ok(b.getText().length === big.length + 4000, 'uzunluk doğru');
}

console.log(fails ? `\n${fails} test başarısız` : '\ntüm metin buffer testleri geçti');
